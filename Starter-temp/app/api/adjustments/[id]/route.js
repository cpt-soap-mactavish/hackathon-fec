import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

// GET /api/adjustments/:id - Fetch single adjustment
export async function GET(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const unwrappedParams = await params;
        const { id } = unwrappedParams;

        const adjustment = await prisma.transaction.findUnique({
            where: { id },
            include: {
                items: {
                    include: {
                        product: true,
                        fromWarehouse: true,
                        fromLocation: true,
                    }
                }
            }
        });

        if (!adjustment) {
            return NextResponse.json({ error: "Adjustment not found" }, { status: 404 });
        }

        return NextResponse.json(adjustment);
    } catch (error) {
        console.error("Error fetching adjustment:", error);
        return NextResponse.json({ error: "Failed to fetch adjustment" }, { status: 500 });
    }
}

// PUT /api/adjustments/:id - Update adjustment (validate or cancel)
export async function PUT(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const unwrappedParams = await params;
        const { id } = unwrappedParams;
        const { status } = await req.json();

        const adjustment = await prisma.transaction.findUnique({
            where: { id },
            include: {
                items: {
                    include: {
                        product: true,
                        fromWarehouse: true,
                        fromLocation: true,
                    }
                }
            }
        });

        if (!adjustment) {
            return NextResponse.json({ error: "Adjustment not found" }, { status: 404 });
        }

        if (adjustment.status === "DONE") {
            return NextResponse.json({ error: "Cannot modify completed adjustment" }, { status: 400 });
        }

        // If validating (status = DONE), apply stock changes
        if (status === "DONE") {
            // Apply stock adjustments for each item
            for (const item of adjustment.items) {
                const difference = item.quantity; // This is the difference we stored

                // Use upsert to update or create stock record
                await prisma.stock.upsert({
                    where: {
                        productId_warehouseId_locationId: {
                            productId: item.productId,
                            warehouseId: item.fromWarehouseId,
                            locationId: item.fromLocationId
                        }
                    },
                    update: {
                        quantity: {
                            increment: difference // Add the difference (can be negative)
                        }
                    },
                    create: {
                        productId: item.productId,
                        warehouseId: item.fromWarehouseId,
                        locationId: item.fromLocationId,
                        quantity: Math.max(0, difference) // If creating new, ensure non-negative
                    }
                });
            }
        }

        // Update adjustment status
        const updatedAdjustment = await prisma.transaction.update({
            where: { id },
            data: { status },
            include: {
                items: {
                    include: {
                        product: true,
                        fromWarehouse: true,
                        fromLocation: true,
                    }
                }
            }
        });

        return NextResponse.json(updatedAdjustment);
    } catch (error) {
        console.error("Error updating adjustment:", error);
        return NextResponse.json({ error: "Failed to update adjustment" }, { status: 500 });
    }
}

// DELETE /api/adjustments/:id - Delete draft adjustment
export async function DELETE(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const unwrappedParams = await params;
        const { id } = unwrappedParams;

        const adjustment = await prisma.transaction.findUnique({
            where: { id }
        });

        if (!adjustment) {
            return NextResponse.json({ error: "Adjustment not found" }, { status: 404 });
        }

        if (adjustment.status !== "DRAFT") {
            return NextResponse.json({ error: "Can only delete draft adjustments" }, { status: 400 });
        }

        await prisma.transaction.delete({
            where: { id }
        });

        return NextResponse.json({ message: "Adjustment deleted successfully" });
    } catch (error) {
        console.error("Error deleting adjustment:", error);
        return NextResponse.json({ error: "Failed to delete adjustment" }, { status: 500 });
    }
}
