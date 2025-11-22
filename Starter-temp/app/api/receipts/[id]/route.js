import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: Fetch a single receipt
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
                    }
                }
            }
        });

        if (!receipt || receipt.type !== "INBOUND") {
            return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
        }

        return NextResponse.json(receipt);
    } catch (error) {
        console.error("Error fetching receipt:", error);
        return NextResponse.json(
            { error: "Failed to fetch receipt" },
            { status: 500 }
        );
    }
}

// PUT: Update receipt status or Validate
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

        if (!currentTransaction || currentTransaction.type !== "INBOUND") {
            return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
        }

        // Check if this is a validation (final step with stock addition)
        if (status === "DONE" && currentTransaction.status !== "DONE") {
            // Validate: Add stock to warehouses
            const result = await prisma.$transaction(async (tx) => {
                // Add stock for each item
                for (const item of currentTransaction.items) {
                    // Find existing stock record
                    const existingStock = await tx.stock.findFirst({
                        where: {
                            productId: item.productId,
                            warehouseId: item.toWarehouseId,
                        },
                    });

                    if (existingStock) {
                        // Update existing stock
                        await tx.stock.update({
                            where: { id: existingStock.id },
                            data: {
                                quantity: {
                                    increment: item.quantity,
                                },
                            },
                        });
                    } else {
                        // Create new stock record
                        await tx.stock.create({
                            data: {
                                productId: item.productId,
                                warehouseId: item.toWarehouseId,
                                quantity: item.quantity,
                            },
                        });
                    }
                }

                // Update transaction status to DONE
                return await tx.transaction.update({
                    where: { id },
                    data: {
                        status: "DONE",
                    },
                    include: {
                        items: {
                            include: {
                                product: true,
                                toWarehouse: true,
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
                            toWarehouse: true,
                        },
                    },
                },
            });
            return NextResponse.json(updatedTransaction);
        }

        return NextResponse.json({ error: "Invalid status update" }, { status: 400 });
    } catch (error) {
        console.error("Error updating receipt:", error);
        return NextResponse.json(
            { error: "Failed to update receipt" },
            { status: 500 }
        );
    }
}

// DELETE: Delete a draft receipt
export async function DELETE(request, { params }) {
    try {
        const { id } = await params;

        const transaction = await prisma.transaction.findUnique({
            where: { id },
        });

        if (!transaction || transaction.type !== "INBOUND") {
            return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
        }

        if (transaction.status !== "DRAFT") {
            return NextResponse.json(
                { error: "Only DRAFT receipts can be deleted" },
                { status: 400 }
            );
        }

        // Delete transaction items first, then transaction
        await prisma.transactionItem.deleteMany({
            where: { transactionId: id },
        });

        await prisma.transaction.delete({
            where: { id },
        });

        return NextResponse.json({ message: "Receipt deleted successfully" });
    } catch (error) {
        console.error("Error deleting receipt:", error);
        return NextResponse.json(
            { error: "Failed to delete receipt" },
            { status: 500 }
        );
    }
}
