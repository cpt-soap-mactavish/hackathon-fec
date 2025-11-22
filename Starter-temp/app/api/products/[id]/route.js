import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request, { params }) {
    try {
        const { id } = await params;
        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                stocks: {
                    include: {
                        warehouse: true,
                        location: true,
                    }
                }
            }
        });

        if (!product) {
            return NextResponse.json(
                { error: "Product not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(product);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch product" },
            { status: 500 }
        );
    }
}

export async function PUT(request, { params }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { name, sku, category, uom, minStock } = body;

        // Check if SKU is being changed to one that already exists
        if (sku) {
            const existing = await prisma.product.findFirst({
                where: {
                    sku,
                    NOT: { id }
                }
            });
            if (existing) {
                return NextResponse.json(
                    { error: "SKU already in use by another product" },
                    { status: 400 }
                );
            }
        }

        const product = await prisma.product.update({
            where: { id },
            data: {
                name,
                sku,
                category,
                uom,
                minStock: parseInt(minStock),
            },
        });

        return NextResponse.json(product);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to update product" },
            { status: 500 }
        );
    }
}

export async function DELETE(request, { params }) {
    try {
        const { id } = await params;
        
        // Check if product has transactions or stock
        const hasUsage = await prisma.stock.findFirst({
            where: { productId: id, quantity: { gt: 0 } }
        });

        if (hasUsage) {
            return NextResponse.json(
                { error: "Cannot delete product with existing stock" },
                { status: 400 }
            );
        }

        await prisma.product.delete({
            where: { id },
        });

        return NextResponse.json({ message: "Product deleted" });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to delete product" },
            { status: 500 }
        );
    }
}
