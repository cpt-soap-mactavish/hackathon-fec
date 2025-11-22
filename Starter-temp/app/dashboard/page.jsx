"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useEffect, useState } from "react"
import {
    Package,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    Plus,
    Search,
    Filter,
    Download
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { PageWrapper } from "@/components/PageWrapper"
import { toast } from "sonner"

export default function DashboardPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalStock: 0,
        lowStockItems: 0,
        recentTransactions: 0
    })
    const [lowStockProducts, setLowStockProducts] = useState([])
    const [recentTransactions, setRecentTransactions] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login")
        }
    }, [status, router])

    useEffect(() => {
        if (status === "authenticated") {
            fetchDashboardData()
        }
    }, [status])

    const fetchDashboardData = async () => {
        try {
            // TODO: Replace with actual API calls
            // Simulating data for now
            setStats({
                totalProducts: 156,
                totalStock: 12450,
                lowStockItems: 8,
                recentTransactions: 24
            })

            setLowStockProducts([
                { id: 1, name: "Laptop Pro X", sku: "LAP-PRO-001", currentStock: 5, minStock: 10, warehouse: "Main Warehouse" },
                { id: 2, name: "Wireless Mouse", sku: "ACC-MSE-002", currentStock: 15, minStock: 50, warehouse: "Main Warehouse" },
            ])

            setRecentTransactions([
                { id: 1, type: "INBOUND", reference: "RCV-001", product: "Laptop Pro X", quantity: 50, date: "2025-11-22", status: "COMPLETED" },
                { id: 2, type: "OUTBOUND", reference: "DEL-001", product: "Wireless Mouse", quantity: 20, date: "2025-11-22", status: "COMPLETED" },
            ])

            setIsLoading(false)
        } catch (error) {
            toast.error("Failed to load dashboard data")
            setIsLoading(false)
        }
    }

    if (status === "loading" || isLoading) {
        return (
            <PageWrapper className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
                </div>
            </PageWrapper>
        )
    }

    return (
        <PageWrapper className="min-h-screen bg-background p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                        <p className="text-muted-foreground">Welcome back, {session?.user?.name || session?.user?.username}</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Export
                        </Button>
                        <Button size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            New Transaction
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="border-primary/20 bg-card/50 backdrop-blur">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalProducts}</div>
                            <p className="text-xs text-muted-foreground">Active SKUs</p>
                        </CardContent>
                    </Card>

                    <Card className="border-primary/20 bg-card/50 backdrop-blur">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
                            <TrendingUp className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalStock.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Units in inventory</p>
                        </CardContent>
                    </Card>

                    <Card className="border-destructive/20 bg-card/50 backdrop-blur">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-destructive" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-destructive">{stats.lowStockItems}</div>
                            <p className="text-xs text-muted-foreground">Items below minimum</p>
                        </CardContent>
                    </Card>

                    <Card className="border-primary/20 bg-card/50 backdrop-blur">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Recent Transactions</CardTitle>
                            <TrendingDown className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.recentTransactions}</div>
                            <p className="text-xs text-muted-foreground">Last 7 days</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Grid */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Low Stock Alerts */}
                    <Card className="border-primary/20 bg-card/50 backdrop-blur">
                        <CardHeader>
                            <CardTitle>Low Stock Alerts</CardTitle>
                            <CardDescription>Products below minimum stock level</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {lowStockProducts.map((product) => (
                                    <div key={product.id} className="flex items-center justify-between p-3 border border-destructive/20 rounded-lg bg-destructive/5">
                                        <div className="space-y-1">
                                            <p className="font-medium">{product.name}</p>
                                            <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                                            <p className="text-xs text-muted-foreground">{product.warehouse}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-destructive">
                                                {product.currentStock} / {product.minStock}
                                            </p>
                                            <p className="text-xs text-muted-foreground">Current / Min</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Transactions */}
                    <Card className="border-primary/20 bg-card/50 backdrop-blur">
                        <CardHeader>
                            <CardTitle>Recent Transactions</CardTitle>
                            <CardDescription>Latest stock movements</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentTransactions.map((transaction) => (
                                    <div key={transaction.id} className="flex items-center justify-between p-3 border border-border/50 rounded-lg">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-0.5 text-xs rounded-full ${transaction.type === 'INBOUND' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'
                                                    }`}>
                                                    {transaction.type}
                                                </span>
                                                <p className="font-medium">{transaction.reference}</p>
                                            </div>
                                            <p className="text-sm text-muted-foreground">{transaction.product}</p>
                                            <p className="text-xs text-muted-foreground">{transaction.date}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium">{transaction.quantity} units</p>
                                            <p className={`text-xs ${transaction.status === 'COMPLETED' ? 'text-green-500' : 'text-yellow-500'
                                                }`}>
                                                {transaction.status}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <Card className="border-primary/20 bg-card/50 backdrop-blur">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Common inventory operations</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-3">
                            <Button variant="outline" className="h-24 flex-col gap-2" asChild>
                                <Link href="/dashboard/receipts">
                                    <TrendingUp className="h-6 w-6" />
                                    <span>Stock Receipt</span>
                                </Link>
                            </Button>

                            <Button variant="outline" className="h-24 flex-col gap-2" asChild>
                                <Link href="/dashboard/deliveries">
                                    <TrendingDown className="h-6 w-6" />
                                    <span>Stock Delivery</span>
                                </Link>
                            </Button>
                            <Button variant="outline" className="h-24 flex-col gap-2">
                                <Package className="h-6 w-6" />
                                <span>Stock Transfer</span>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </PageWrapper>
    )
}
