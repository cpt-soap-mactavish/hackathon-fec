import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: Fetch a single delivery
export async function GET(request, { params }) {
    try {
        const { id } = await params;
        const delivery = await prisma.transaction.findUnique({
            where: { id },
            include: {
                items: {
                    include: {
                        product: true,
                        fromWarehouse: true,
                        fromLocation: true,
                    },
                },
            },
        });

        if (!delivery) {
            return NextResponse.json(
                { error: "Delivery not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(delivery);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch delivery" },
            { status: 500 }
        );
    }
}

// PUT: Update delivery status or Validate
export async function PUT(request, { params }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { status } = body;

        // Fetch current transaction to check status
        const currentTransaction = await prisma.transaction.findUnique({
            where: { id },
            include: { items: true },
        });

        if (!currentTransaction) {
            return NextResponse.json({ error: "Delivery not found" }, { status: 404 });
        }

        // Check if this is a validation (final step with stock deduction)
        if (status === "DONE" && currentTransaction.status !== "DONE") {
            // 1. Validate Stock
            for (const item of currentTransaction.items) {
                const stock = await prisma.stock.findUnique({
                    where: {
                        productId_warehouseId_locationId: {
                            productId: item.productId,
                            warehouseId: item.fromWarehouseId,
                            locationId: item.fromLocationId || null,
                        },
                    },
                });

                if (!stock || stock.quantity < item.quantity) {
                    return NextResponse.json(
                        {
                            error: `Insufficient stock for product ID ${item.productId}. Available: ${stock?.quantity || 0}, Required: ${item.quantity}`,
                        },
                        { status: 400 }
                    );
                }
            }

            // 2. Deduct Stock and Update Transaction
            const result = await prisma.$transaction(async (tx) => {
                // Deduct stock for each item
                for (const item of currentTransaction.items) {
                    await tx.stock.update({
                        where: {
                            productId_warehouseId_locationId: {
                                productId: item.productId,
                                warehouseId: item.fromWarehouseId,
                                locationId: item.fromLocationId || null,
                            },
                        },
                        data: {
                            quantity: {
                                decrement: item.quantity,
                            },
                        },
                    });
                }

                // Update transaction status
                return await tx.transaction.update({
                    where: { id },
                    data: {
                        status: "DONE",
                    },
                    include: {
                        items: {
                            include: {
                                product: true,
                                fromWarehouse: true,
                            },
                        },
                    },
                });
            });

            return NextResponse.json(result);
        }

        // Manual status update (DRAFT → WAITING, WAITING → READY, etc.)
        if (status && ["DRAFT", "WAITING", "READY", "CANCELLED"].includes(status)) {
            const updatedTransaction = await prisma.transaction.update({
                where: { id },
                data: { status },
                include: {
                    items: {
                        include: {
                            product: true,
                            fromWarehouse: true,
                        },
                    },
                },
            });
            return NextResponse.json(updatedTransaction);
        }

        return NextResponse.json({ error: "Invalid status update" }, { status: 400 });
    } catch (error) {
        console.error("Error updating delivery:", error);
        return NextResponse.json(
            { error: "Failed to update delivery" },
            { status: 500 }
        );
    }
}

// DELETE: Delete a draft delivery
export async function DELETE(request, { params }) {
    try {
        const { id } = await params;

        const transaction = await prisma.transaction.findUnique({
            where: { id },
        });

        if (!transaction) {
            return NextResponse.json({ error: "Delivery not found" }, { status: 404 });
        }

        if (transaction.status !== "DRAFT") {
            return NextResponse.json(
                { error: "Cannot delete a processed delivery" },
                { status: 400 }
            );
        }

        // Delete items and transaction in a single transaction to ensure data integrity
        await prisma.$transaction([
            prisma.transactionItem.deleteMany({
                where: { transactionId: id },
            }),
            prisma.transaction.delete({
                where: { id },
            }),
        ]);

        return NextResponse.json({ message: "Delivery deleted successfully" });
    } catch (error) {
        console.error("Error deleting delivery:", error);
        return NextResponse.json(
            { error: "Failed to delete delivery" },
            { status: 500 }
        );
    }
}
