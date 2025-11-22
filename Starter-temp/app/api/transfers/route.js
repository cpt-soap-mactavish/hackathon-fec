import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: Fetch all TRANSFER transactions
export async function GET() {
  try {
    const transfers = await prisma.transaction.findMany({
      where: {
        type: "TRANSFER",
      },
      include: {
        items: {
          include: {
            product: true,
            fromWarehouse: true,
            toWarehouse: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(transfers);
  } catch (error) {
    console.error("Error fetching transfers:", error);
    return NextResponse.json(
      { error: "Failed to fetch transfers" },
      { status: 500 }
    );
  }
}

// POST: Create a new Transfer (Draft)
export async function POST(request) {
  try {
    const body = await request.json();
    const { items, date, notes } = body;

    // Validate items have both from and to warehouses
    for (const item of items) {
      if (!item.fromWarehouseId || !item.toWarehouseId) {
        return NextResponse.json(
          { error: "Source and Destination warehouses are required for all items" },
          { status: 400 }
        );
      }
      if (item.fromWarehouseId === item.toWarehouseId) {
        return NextResponse.json(
          { error: "Source and Destination warehouses must be different" },
          { status: 400 }
        );
      }
    }

    // Create the transaction
    const transaction = await prisma.transaction.create({
      data: {
        type: "TRANSFER",
        status: "DRAFT", // Start as DRAFT, validate later to move stock
        notes,
        date: new Date(date || Date.now()),
        reference: `INT/TR/${Date.now().toString().slice(-6)}`,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: parseInt(item.quantity),
            fromWarehouseId: item.fromWarehouseId,
            toWarehouseId: item.toWarehouseId,
            fromLocationId: item.fromLocationId || null,
            toLocationId: item.toLocationId || null,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error("Error creating transfer:", error);
    return NextResponse.json(
      { error: "Failed to create transfer" },
      { status: 500 }
    );
  }
}
