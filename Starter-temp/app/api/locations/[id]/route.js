import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request, { params }) {
    try {
        const { id } = await params;
        const location = await prisma.location.findUnique({
            where: { id },
            include: {
                warehouse: true,
            },
        });

        if (!location) {
            return NextResponse.json(
                { error: "Location not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(location);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch location" },
            { status: 500 }
        );
    }
}

export async function PUT(request, { params }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { name, warehouseId, shortCode } = body;

        const location = await prisma.location.update({
            where: { id },
            data: { name, warehouseId, shortCode },
            include: {
                warehouse: true,
            },
        });

        return NextResponse.json(location);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to update location" },
            { status: 500 }
        );
    }
}

export async function DELETE(request, { params }) {
    try {
        const { id } = await params;
        
        await prisma.location.delete({
            where: { id },
        });

        return NextResponse.json({ message: "Location deleted" });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to delete location" },
            { status: 500 }
        );
    }
}
