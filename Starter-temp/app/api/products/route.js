import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: Fetch all products with stock information
export async function GET() {
    try {
        const products = await prisma.product.findMany({
            include: {
                stocks: {
                    include: {
                        warehouse: true,
                        location: true
                    }
                }
            },
            orderBy: {
                name: "asc"
            }
        });

        // Calculate total stock for each product
        const productsWithStock = products.map(product => ({
            ...product,
            totalStock: product.stocks.reduce((sum, stock) => sum + stock.quantity, 0)
        }));

        return NextResponse.json(productsWithStock);
    } catch (error) {
        console.error("Error fetching products:", error);
        return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
    }
}

// POST: Create a new product
export async function POST(request) {
    try {
        const body = await request.json();
        const { name, sku, category, uom, minStock, unitCost } = body;

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
                unitCost: parseFloat(unitCost) || 0,
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
