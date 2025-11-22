import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const warehouses = await prisma.warehouse.findMany();
        return NextResponse.json(warehouses);
    } catch (error) {
        console.error("Error fetching warehouses:", error);
        return NextResponse.json(
            { error: "Failed to fetch warehouses" },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { name, location, shortCode } = body;

        if (!name) {
            return NextResponse.json(
                { error: "Warehouse name is required" },
                { status: 400 }
            );
        }

        const existing = await prisma.warehouse.findUnique({
            where: { name },
        });

        if (existing) {
            return NextResponse.json(
                { error: "Warehouse with this name already exists" },
                { status: 400 }
            );
        }

        const warehouse = await prisma.warehouse.create({
            data: {
                name,
                location,
                shortCode,
            },
        });

        return NextResponse.json(warehouse, { status: 201 });
    } catch (error) {
        console.error("Error creating warehouse:", error);
        return NextResponse.json(
            { error: "Failed to create warehouse" },
            { status: 500 }
        );
    }
}
