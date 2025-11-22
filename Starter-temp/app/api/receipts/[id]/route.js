import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: Fetch single receipt
export async function GET(request, { params }) {
    try {
        const { id } = await params;
        const receipt = await prisma.transaction.findUnique({
            where: { id },
            include: {
                items: {
                    include: {
                        product: true,
                        toWarehouse: true,
                        toLocation: true,
                    },
                },
            },
        });

        if (!receipt) {
            return NextResponse.json(
                { error: "Receipt not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(receipt);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch receipt" },
            { status: 500 }
        );
    }
}

// PUT: Update or Validate Receipt
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
            return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
        }

        // VALIDATION LOGIC: Execute Receipt (DRAFT -> DONE)
        if (status === "DONE" && currentTransaction.status !== "DONE") {
            
            const result = await prisma.$transaction(async (tx) => {
                for (const item of currentTransaction.items) {
                    // Increment Stock (Upsert: Create if not exists, otherwise increment)
                    await tx.stock.upsert({
                        where: {
                            productId_warehouseId_locationId: {
                                productId: item.productId,
                                warehouseId: item.toWarehouseId,
                                locationId: item.toLocationId || null,
                            },
                        },
                        update: {
                            quantity: { increment: item.quantity },
                        },
                        create: {
                            productId: item.productId,
                            warehouseId: item.toWarehouseId,
                            locationId: item.toLocationId || null,
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
                                toWarehouse: true,
                                toLocation: true,
                            },
                        },
                    },
                });
            });

            return NextResponse.json(result);
        }

        // Allow status changes (DRAFT -> READY, READY -> DONE, CANCELLED, etc.)
        if (currentTransaction.status !== "DONE") {
            const updated = await prisma.transaction.update({
                where: { id },
                data: { status },
                include: {
                    items: {
                        include: {
                            product: true,
                            toWarehouse: true,
                            toLocation: true,
                        },
                    },
                },
            });
            return NextResponse.json(updated);
        }

        return NextResponse.json({ error: "Cannot modify completed receipt" }, { status: 400 });

    } catch (error) {
        console.error("Error updating receipt:", error);
        return NextResponse.json(
            { error: "Failed to update receipt" },
            { status: 500 }
        );
    }
}

// DELETE: Remove Draft Receipt
export async function DELETE(request, { params }) {
    try {
        const { id } = await params;
        
        const transaction = await prisma.transaction.findUnique({ where: { id } });
        
        if (!transaction || transaction.status !== "DRAFT") {
             return NextResponse.json({ error: "Cannot delete processed receipt" }, { status: 400 });
        }

        await prisma.$transaction([
            prisma.transactionItem.deleteMany({ where: { transactionId: id } }),
            prisma.transaction.delete({ where: { id } }),
        ]);

        return NextResponse.json({ message: "Receipt deleted" });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
    }
}
