import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

// GET /api/adjustments - Fetch all adjustments
export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const adjustments = await prisma.transaction.findMany({
            where: {
                type: "ADJUSTMENT"
            },
            include: {
                items: {
                    include: {
                        product: true,
                        fromWarehouse: true,
                        fromLocation: true,
                    }
                }
            },
            orderBy: {
                date: "desc"
            }
        });

        return NextResponse.json(adjustments);
    } catch (error) {
        console.error("Error fetching adjustments:", error);
        return NextResponse.json({ error: "Failed to fetch adjustments" }, { status: 500 });
    }
}

// POST /api/adjustments - Create new adjustment
export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { reference, date, reason, responsible, items } = await req.json();

        // Validate required fields
        if (!reason || !reason.trim()) {
            return NextResponse.json({ error: "Reason is required for adjustments" }, { status: 400 });
        }

        if (!items || items.length === 0) {
            return NextResponse.json({ error: "At least one item is required" }, { status: 400 });
        }

        // Validate each item has required fields
        for (const item of items) {
            if (!item.productId || !item.warehouseId) {
                return NextResponse.json({ error: "Product and warehouse are required for each item" }, { status: 400 });
            }
            if (item.countedQty === undefined || item.countedQty === null) {
                return NextResponse.json({ error: "Counted quantity is required for each item" }, { status: 400 });
            }
        }

        // Create adjustment transaction
        const adjustment = await prisma.transaction.create({
            data: {
                reference: reference || `ADJ/${new Date().getFullYear()}/${Date.now()}`,
                type: "ADJUSTMENT",
                status: "DRAFT",
                date: date ? new Date(date) : new Date(),
                customer: reason, // Store reason in customer field for adjustments
                responsible: responsible || session.user.name || session.user.username,
                items: {
                    create: items.map(item => ({
                        productId: item.productId,
                        fromWarehouseId: item.warehouseId,
                        fromLocationId: item.locationId || null,
                        quantity: item.difference, // Store the difference (can be positive or negative)
                        // Store additional metadata in a note-like field if available, or use quantity
                        // We'll use quantity for the difference and rely on the transaction's customer field for reason
                    }))
                }
            },
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

        return NextResponse.json(adjustment, { status: 201 });
    } catch (error) {
        console.error("Error creating adjustment:", error);
        return NextResponse.json({ error: "Failed to create adjustment" }, { status: 500 });
    }
}
