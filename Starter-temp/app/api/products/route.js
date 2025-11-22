import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const products = await prisma.product.findMany({
            select: {
                id: true,
                name: true,
                sku: true,
                category: true,
                uom: true,
                minStock: true,
                stocks: {
                    select: {
                        warehouseId: true,
                        quantity: true,
                    },
                },
            },
            orderBy: {
                updatedAt: 'desc'
            }
        });
        return NextResponse.json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        return NextResponse.json(
            { error: "Failed to fetch products" },
            { status: 500 }
        );
    }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, sku, category, uom, minStock } = body;

    if (!name || !sku || !uom) {
      return NextResponse.json(
        { error: "Name, SKU, and UOM are required" },
        { status: 400 }
      );
    }

    const existing = await prisma.product.findUnique({
      where: { sku },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Product with this SKU already exists" },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        sku,
        category,
        uom,
        minStock: parseInt(minStock) || 0,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
