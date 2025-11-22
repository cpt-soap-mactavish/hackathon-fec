import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: Fetch all deliveries (OUTBOUND transactions)
export async function GET() {
  try {
    const deliveries = await prisma.transaction.findMany({
      where: {
        type: "OUTBOUND",
      },
      include: {
        items: {
          include: {
            product: true,
            fromWarehouse: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(deliveries);
  } catch (error) {
    console.error("Error fetching deliveries:", error);
    return NextResponse.json(
      { error: "Failed to fetch deliveries" },
      { status: 500 }
    );
  }
}

// POST: Create a new delivery (Draft)
export async function POST(request) {
  try {
    const body = await request.json();
    const { customer, items, notes, date } = body;

    // Create the transaction with items
    const transaction = await prisma.transaction.create({
      data: {
        type: "OUTBOUND",
        status: "DRAFT",
        customer,
        notes,
        date: new Date(date || Date.now()),
        reference: `WH/OUT/${Date.now().toString().slice(-6)}`, // Simple reference generation
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: parseInt(item.quantity),
            fromWarehouseId: item.warehouseId, // Source warehouse
            fromLocationId: item.fromLocationId || null,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error("Error creating delivery:", error);
    return NextResponse.json(
      { error: "Failed to create delivery" },
      { status: 500 }
    );
  }
}
