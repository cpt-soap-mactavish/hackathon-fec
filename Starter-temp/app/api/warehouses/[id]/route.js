import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request, { params }) {
    try {
        const { id } = await params;
        const warehouse = await prisma.warehouse.findUnique({
            where: { id },
        });

        if (!warehouse) {
            return NextResponse.json(
                { error: "Warehouse not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(warehouse);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch warehouse" },
            { status: 500 }
        );
    }
}

export async function PUT(request, { params }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { name, location, shortCode } = body;

        const warehouse = await prisma.warehouse.update({
            where: { id },
            data: { name, location, shortCode },
        });

        return NextResponse.json(warehouse);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to update warehouse" },
            { status: 500 }
        );
    }
}

export async function DELETE(request, { params }) {
    try {
        const { id } = await params;
        
        // Check for dependencies (stocks, transactions) before deleting?
        // For now, letting Prisma handle foreign key constraints or failing.
        
        await prisma.warehouse.delete({
            where: { id },
        });

        return NextResponse.json({ message: "Warehouse deleted" });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to delete warehouse" },
            { status: 500 }
        );
    }
}
