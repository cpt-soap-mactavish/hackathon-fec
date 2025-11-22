import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: Fetch all Receipts (INBOUND transactions)
export async function GET() {
  try {
    const receipts = await prisma.transaction.findMany({
      where: {
        type: "INBOUND",
      },
      include: {
        items: {
          include: {
            product: true,
            toWarehouse: true,
            toLocation: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
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

// POST: Create a new Draft Receipt
export async function POST(request) {
  try {
    const body = await request.json();
    const { vendor, reference, date, toWarehouseId, items, notes } = body;

    if (!toWarehouseId || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Destination Warehouse and Items are required" },
        { status: 400 }
      );
    }

    // Create Transaction in DRAFT status
    const transaction = await prisma.transaction.create({
      data: {
        type: "INBOUND",
        status: "DRAFT",
        customer: vendor, // Using customer field for Vendor name
        reference,
        date: new Date(date),
        notes,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: parseInt(item.quantity),
            toWarehouseId: toWarehouseId,
            toLocationId: item.toLocationId || null,
            // fromWarehouseId is NULL for Receipts
          })),
        },
      },
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error("Error creating receipt:", error);
    return NextResponse.json(
      { error: "Failed to create receipt" },
      { status: 500 }
    );
  }
}
