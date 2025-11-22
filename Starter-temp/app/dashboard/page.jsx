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
            setIsLoading(true)
            const response = await fetch('/api/dashboard/stats')

            if (!response.ok) {
                throw new Error('Failed to fetch dashboard data')
            }

            const data = await response.json()

            setStats({
                totalProducts: data.totalProducts || 0,
                totalStock: data.totalStock || 0,
                lowStockItems: data.lowStockItems || 0,
                recentTransactions: data.recentTransactions?.length || 0
            })

            setLowStockProducts(data.lowStockProducts || [])
            setRecentTransactions(data.recentTransactions || [])

        } catch (error) {
            console.error('Dashboard fetch error:', error)
            toast.error("Failed to load dashboard data")
        } finally {
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
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                        <p className="text-muted-foreground">Overview of your inventory operations</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Export
                        </Button>
                    </div>
                </div>

                {/* Operations Cards (Wireframe Layout) */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Receipt Card */}
                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-colors">
                        <CardHeader>
                            <CardTitle className="text-xl text-primary">Receipts</CardTitle>
                            <CardDescription>Inbound stock operations</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <Button size="lg" className="h-16 px-8 text-lg" asChild>
                                    <Link href="/dashboard/receipts">
                                        4 to receive
                                    </Link>
                                </Button>
                                <div className="space-y-1 text-right">
                                    <div className="text-sm font-medium text-destructive">1 Late</div>
                                    <div className="text-sm text-muted-foreground">6 operations</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Delivery Card */}
                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-colors">
                        <CardHeader>
                            <CardTitle className="text-xl text-primary">Deliveries</CardTitle>
                            <CardDescription>Outbound stock operations</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <Button size="lg" className="h-16 px-8 text-lg" asChild>
                                    <Link href="/dashboard/deliveries">
                                        4 to Deliver
                                    </Link>
                                </Button>
                                <div className="space-y-1 text-right">
                                    <div className="text-sm font-medium text-destructive">1 Late</div>
                                    <div className="text-sm font-medium text-yellow-500">2 waiting</div>
                                    <div className="text-sm text-muted-foreground">6 operations</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Transactions (Kept as useful context below the main cards) */}
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
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
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium">{transaction.quantity} units</p>
                                        <p className="text-xs text-muted-foreground">{transaction.date}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </PageWrapper>
    )
}
