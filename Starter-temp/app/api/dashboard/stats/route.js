import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

// GET /api/dashboard/stats - Fetch real-time dashboard statistics
export async function GET(req) {
    try {
        // Temporarily disabled auth check for development
        // const session = await getServerSession(authOptions);
        // if (!session) {
        //     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        // }

        // 1. Get total products count
        const totalProducts = await prisma.product.count();

        // 2. Get total stock across all warehouses/locations
        const stockAggregation = await prisma.stock.aggregate({
            _sum: {
                quantity: true
            }
        });
        const totalStock = stockAggregation._sum.quantity || 0;

        // 3. Get low stock products (where current stock < minStock)
        const products = await prisma.product.findMany({
            include: {
                stocks: {
                    include: {
                        warehouse: true,
                        location: true
                    }
                }
            }
        });

        const lowStockProducts = [];
        products.forEach(product => {
            const totalProductStock = product.stocks.reduce((sum, stock) => sum + stock.quantity, 0);
            if (totalProductStock < product.minStock) {
                lowStockProducts.push({
                    id: product.id,
                    name: product.name,
                    sku: product.sku,
                    currentStock: totalProductStock,
                    minStock: product.minStock,
                    stocks: product.stocks.map(s => ({
                        warehouse: s.warehouse.name,
                        location: s.location?.name || "Default",
                        quantity: s.quantity
                    }))
                });
            }
        });

        // 4. Get recent transactions count (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const recentTransactionsCount = await prisma.transaction.count({
            where: {
                date: {
                    gte: thirtyDaysAgo
                }
            }
        });

        // 5. Get recent transactions (last 10)
        const recentTransactions = await prisma.transaction.findMany({
            take: 10,
            orderBy: {
                date: "desc"
            },
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            }
        });

        const formattedTransactions = recentTransactions.map(t => ({
            id: t.id,
            type: t.type,
            reference: t.reference,
            product: t.items[0]?.product?.name || "Multiple items",
            quantity: t.items.reduce((sum, item) => sum + item.quantity, 0),
            date: t.date,
            status: t.status,
            customer: t.customer
        }));

        // 6. Get pending operations counts
        const pendingReceipts = await prisma.transaction.count({
            where: {
                type: "INBOUND",
                status: { in: ["DRAFT", "READY"] }
            }
        });

        const pendingDeliveries = await prisma.transaction.count({
            where: {
                type: "OUTBOUND",
                status: { in: ["DRAFT", "WAITING", "READY"] }
            }
        });

        const pendingTransfers = await prisma.transaction.count({
            where: {
                type: "TRANSFER",
                status: { in: ["DRAFT", "READY"] }
            }
        });

        return NextResponse.json({
            stats: {
                totalProducts,
                totalStock,
                lowStockItems: lowStockProducts.length,
                recentTransactions: recentTransactionsCount,
                pendingReceipts,
                pendingDeliveries,
                pendingTransfers
            },
            lowStockProducts,
            recentTransactions: formattedTransactions
        });
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        return NextResponse.json({ error: "Failed to fetch dashboard stats" }, { status: 500 });
    }
}
