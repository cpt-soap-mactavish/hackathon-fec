import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const locations = await prisma.location.findMany({
            include: {
                warehouse: true,
            },
            orderBy: {
                warehouseId: 'asc',
            }
        });
        return NextResponse.json(locations);
    } catch (error) {
        console.error("Error fetching locations:", error);
        return NextResponse.json(
            { error: "Failed to fetch locations" },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { name, warehouseId, shortCode } = body;

        if (!name || !warehouseId) {
            return NextResponse.json(
                { error: "Name and Warehouse are required" },
                { status: 400 }
            );
        }

        const existing = await prisma.location.findUnique({
            where: {
                name_warehouseId: {
                    name,
                    warehouseId,
                },
            },
        });

        if (existing) {
            return NextResponse.json(
                { error: "Location with this name already exists in the selected warehouse" },
                { status: 400 }
            );
        }

        const location = await prisma.location.create({
            data: {
                name,
                warehouseId,
                shortCode,
            },
            include: {
                warehouse: true,
            }
        });

        return NextResponse.json(location, { status: 201 });
    } catch (error) {
        console.error("Error creating location:", error);
        return NextResponse.json(
            { error: "Failed to create location" },
            { status: 500 }
        );
    }
}
