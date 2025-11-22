import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: Fetch a single transfer
export async function GET(request, { params }) {
    try {
        const { id } = await params;
        const transfer = await prisma.transaction.findUnique({
            where: { id },
            include: {
                items: {
                    include: {
                        product: true,
                        fromWarehouse: true,
                        toWarehouse: true,
                        fromLocation: true,
                        toLocation: true,
                    },
                },
            },
        });

        if (!transfer) {
            return NextResponse.json(
                { error: "Transfer not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(transfer);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch transfer" },
            { status: 500 }
        );
    }
}

// PUT: Update status or Validate (Execute Transfer)
export async function PUT(request, { params }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { status } = body;

        const currentTransaction = await prisma.transaction.findUnique({
            where: { id },
            include: { items: true },
        });

        if (!currentTransaction) {
            return NextResponse.json({ error: "Transfer not found" }, { status: 404 });
        }

        // Execute Transfer (DRAFT -> DONE)
        if (status === "DONE" && currentTransaction.status !== "DONE") {
            // 1. Validate Source Stock
            for (const item of currentTransaction.items) {
                // Properly handle null locationId (convert "null" string to actual null)
                const fromLocationId = item.fromLocationId === "null" || !item.fromLocationId ? null : item.fromLocationId;
                
                const sourceStock = await prisma.stock.findUnique({
                    where: {
                        productId_warehouseId_locationId: {
                            productId: item.productId,
                            warehouseId: item.fromWarehouseId,
                            locationId: fromLocationId,
                        },
                    },
                });

                if (!sourceStock || sourceStock.quantity < item.quantity) {
                    return NextResponse.json(
                        {
                            error: `Insufficient stock for product ID ${item.productId} in source warehouse/location. Available: ${sourceStock?.quantity || 0}, Required: ${item.quantity}`,
                        },
                        { status: 400 }
                    );
                }
            }

            // 2. Execute Atomic Transaction
            const result = await prisma.$transaction(async (tx) => {
                for (const item of currentTransaction.items) {
                    // Properly handle null locationId
                    const fromLocationId = item.fromLocationId === "null" || !item.fromLocationId ? null : item.fromLocationId;
                    const toLocationId = item.toLocationId === "null" || !item.toLocationId ? null : item.toLocationId;
                    
                    // Decrement Source
                    await tx.stock.update({
                        where: {
                            productId_warehouseId_locationId: {
                                productId: item.productId,
                                warehouseId: item.fromWarehouseId,
                                locationId: fromLocationId,
                            },
                        },
                        data: {
                            quantity: { decrement: item.quantity },
                        },
                    });

                    // Increment Destination (Upsert: Create if not exists)
                    await tx.stock.upsert({
                        where: {
                            productId_warehouseId_locationId: {
                                productId: item.productId,
                                warehouseId: item.toWarehouseId,
                                locationId: toLocationId,
                            },
                        },
                        update: {
                            quantity: { increment: item.quantity },
                        },
                        create: {
                            productId: item.productId,
                            warehouseId: item.toWarehouseId,
                            locationId: toLocationId,
                            quantity: item.quantity,
                        },
                    });
                }

                // Update Transaction Status
                return await tx.transaction.update({
                    where: { id },
                    data: { status: "DONE" },
                    include: {
                        items: {
                            include: {
                                product: true,
                                fromWarehouse: true,
                                toWarehouse: true,
                                fromLocation: true,
                                toLocation: true,
                            },
                        },
                    },
                });
            });

            return NextResponse.json(result);
        }

        // Normal Status Update
        if (status && ["DRAFT", "CANCELLED"].includes(status)) {
            const updated = await prisma.transaction.update({
                where: { id },
                data: { status },
            });
            return NextResponse.json(updated);
        }

        return NextResponse.json({ error: "Invalid status update" }, { status: 400 });

    } catch (error) {
        console.error("Error updating transfer:", error);
        return NextResponse.json(
            { error: "Failed to update transfer" },
            { status: 500 }
        );
    }
}

// DELETE: Remove Draft
export async function DELETE(request, { params }) {
    try {
        const { id } = await params;
        
        const transaction = await prisma.transaction.findUnique({ where: { id } });
        
        if (!transaction || transaction.status !== "DRAFT") {
             return NextResponse.json({ error: "Cannot delete processed transfer" }, { status: 400 });
        }

        await prisma.$transaction([
            prisma.transactionItem.deleteMany({ where: { transactionId: id } }),
            prisma.transaction.delete({ where: { id } }),
        ]);

        return NextResponse.json({ message: "Transfer deleted" });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
    }
}
