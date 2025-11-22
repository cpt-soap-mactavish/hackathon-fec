import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: Fetch all receipts
export async function GET() {
    try {
        const receipts = await prisma.transaction.findMany({
            where: {
                type: "INBOUND"
            },
            include: {
                items: {
                    include: {
                        product: true,
                        toWarehouse: true,
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        return NextResponse.json(receipts);
    } catch (error) {
        console.error("Error fetching receipts:", error);
        return NextResponse.json(
            { error: "Failed to fetch receipts" },
            { status: 500 }
        );
    }
}

// POST: Create a new receipt
export async function POST(request) {
    try {
        const body = await request.json();
        const { vendor, contact, date, responsible, items } = body;

        // Validate items
        if (!items || items.length === 0) {
            return NextResponse.json({ error: "At least one item is required" }, { status: 400 });
        }

        // Filter out invalid items or validate them
        const validItems = items.filter(item => item.productId && item.quantity > 0);

        if (validItems.length === 0) {
            return NextResponse.json({ error: "At least one valid item (with product and quantity) is required" }, { status: 400 });
        }

        // Generate reference number
        const count = await prisma.transaction.count({
            where: { type: "INBOUND" }
        });
        const reference = `WH/IN/${String(count + 1).padStart(5, "0")}`;

        // Create receipt with items
        const receipt = await prisma.transaction.create({
            data: {
                type: "INBOUND",
                status: "DRAFT",
                reference,
                customer: vendor, // Repurpose customer field for vendor
                notes: `Responsible: ${responsible} | Contact: ${contact || "N/A"}`, // Store responsible and contact in notes
                date: new Date(date),
                // responsible, // Commented out because prisma generate failed
                items: {
                    create: validItems.map(item => ({
                        productId: item.productId,
                        toWarehouseId: item.warehouseId,
                        quantity: parseInt(item.quantity)
                    }))
                }
            },
            include: {
                items: {
                    include: {
                        product: true,
                        toWarehouse: true,
                    }
                }
            }
        });

        return NextResponse.json(receipt, { status: 201 });
    } catch (error) {
        console.error("Error creating receipt:", error);
        return NextResponse.json(
            { error: "Failed to create receipt" },
            { status: 500 }
        );
    }
}
