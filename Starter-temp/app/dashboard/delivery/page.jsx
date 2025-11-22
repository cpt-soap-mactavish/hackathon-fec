"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import {
    Search,
    Filter,
    Download,
    Plus,
    MoreHorizontal,
    ArrowUpRight,
    Calendar,
    CheckCircle2,
    Clock,
    Truck
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PageWrapper } from "@/components/PageWrapper"

export default function DeliveryPage() {
    const { data: session } = useSession()
    const [isLoading, setIsLoading] = useState(true)
    const [deliveries, setDeliveries] = useState([])
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        // Simulate fetching data
        const timer = setTimeout(() => {
            setDeliveries([
                { id: "1", reference: "DEL-2025-001", customer: "Acme Corp", items: 3, totalQty: 10, date: "2025-11-22", status: "Shipped", warehouse: "Warehouse A" },
                { id: "2", reference: "DEL-2025-002", customer: "TechStart Solutions", items: 1, totalQty: 5, date: "2025-11-21", status: "Processing", warehouse: "Warehouse B" },
                { id: "3", reference: "DEL-2025-003", customer: "Global Systems", items: 8, totalQty: 120, date: "2025-11-20", status: "Delivered", warehouse: "Warehouse A" },
                { id: "4", reference: "DEL-2025-004", customer: "Local Retailer", items: 2, totalQty: 25, date: "2025-11-19", status: "Cancelled", warehouse: "Warehouse C" },
            ])
            setIsLoading(false)
        }, 1000)

        return () => clearTimeout(timer)
    }, [])

    const filteredDeliveries = deliveries.filter(delivery =>
        delivery.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
        delivery.customer.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <PageWrapper className="min-h-screen bg-background p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Stock Deliveries</h1>
                        <p className="text-muted-foreground">Manage outbound orders and shipments</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline">
                            <Download className="mr-2 h-4 w-4" />
                            Export
                        </Button>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            New Delivery
                        </Button>
                    </div>
                </div>

                <Card className="border-primary/20 bg-card/50 backdrop-blur">
                    <CardHeader>
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <CardTitle>Recent Deliveries</CardTitle>
                            <div className="flex items-center gap-2 w-full md:w-auto">
                                <div className="relative w-full md:w-64">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search deliveries..."
                                        className="pl-8"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <Button variant="outline" size="icon">
                                    <Filter className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[150px]">Reference</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Warehouse</TableHead>
                                        <TableHead className="text-right">Items / Qty</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="h-24 text-center">
                                                <div className="flex justify-center items-center">
                                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : filteredDeliveries.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                                No deliveries found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredDeliveries.map((delivery) => (
                                            <TableRow key={delivery.id}>
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-8 w-8 rounded bg-blue-500/10 flex items-center justify-center text-blue-500">
                                                            <ArrowUpRight className="h-4 w-4" />
                                                        </div>
                                                        {delivery.reference}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{delivery.customer}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2 text-muted-foreground">
                                                        <Calendar className="h-3 w-3" />
                                                        {delivery.date}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{delivery.warehouse}</TableCell>
                                                <TableCell className="text-right font-mono">
                                                    {delivery.items} / {delivery.totalQty}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={
                                                            delivery.status === "Delivered" ? "default" :
                                                                delivery.status === "Shipped" ? "secondary" :
                                                                    delivery.status === "Processing" ? "outline" : "destructive"
                                                        }
                                                        className={
                                                            delivery.status === "Delivered" ? "bg-green-500/15 text-green-600 hover:bg-green-500/25 border-green-500/20" :
                                                                delivery.status === "Shipped" ? "bg-blue-500/15 text-blue-600 hover:bg-blue-500/25 border-blue-500/20" :
                                                                    delivery.status === "Processing" ? "bg-yellow-500/15 text-yellow-600 hover:bg-yellow-500/25 border-yellow-500/20" :
                                                                        "bg-red-500/15 text-red-600 hover:bg-red-500/25 border-red-500/20"
                                                        }
                                                    >
                                                        {delivery.status === "Delivered" && <CheckCircle2 className="mr-1 h-3 w-3" />}
                                                        {delivery.status === "Shipped" && <Truck className="mr-1 h-3 w-3" />}
                                                        {delivery.status === "Processing" && <Clock className="mr-1 h-3 w-3" />}
                                                        {delivery.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                                <span className="sr-only">Open menu</span>
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                            <DropdownMenuItem>View Details</DropdownMenuItem>
                                                            <DropdownMenuItem>Print Packing Slip</DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem className="text-destructive">Cancel Delivery</DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </PageWrapper>
    )
}
