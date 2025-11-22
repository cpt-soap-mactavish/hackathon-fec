"use client"

import { useState, useEffect } from "react"
import {
    Search,
    Filter,
    Download,
    Plus,
    MoreHorizontal,
    ArrowRightLeft,
    Calendar,
    CheckCircle2,
    Clock,
    MapPin
} from "lucide-react"
import Link from "next/link"
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

export default function TransfersPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [transfers, setTransfers] = useState([])
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState("All")

    useEffect(() => {
        // Simulate fetching data
        const timer = setTimeout(() => {
            const mockData = [
                { id: "1", reference: "TRF-2025-001", product: "Laptop Pro X", from: "Warehouse A / Zone A", to: "Warehouse B", quantity: 10, date: "2025-11-22", status: "Completed" },
                { id: "2", reference: "TRF-2025-002", product: "Wireless Mouse", from: "Warehouse A / Zone B", to: "Warehouse A / Zone A", quantity: 50, date: "2025-11-21", status: "Pending" },
                { id: "3", reference: "TRF-2025-003", product: "USB-C Cable", from: "Warehouse C", to: "Warehouse A", quantity: 100, date: "2025-11-20", status: "Draft" },
            ]

            // Merge with localStorage data
            const storedTransfers = JSON.parse(localStorage.getItem("mock_transfers") || "[]")
            setTransfers([...storedTransfers, ...mockData])

            setIsLoading(false)
        }, 1000)

        return () => clearTimeout(timer)
    }, [])

    const filteredTransfers = transfers.filter(transfer => {
        const matchesSearch = transfer.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
            transfer.product.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesStatus = statusFilter === "All" || transfer.status === statusFilter

        return matchesSearch && matchesStatus
    })

    const handleExport = () => {
        // Define CSV headers
        const headers = ["Reference", "Product", "From", "To", "Quantity", "Date", "Status"]

        // Convert data to CSV format
        const csvContent = [
            headers.join(","),
            ...filteredTransfers.map(t => [
                t.reference,
                t.product,
                t.from,
                t.to,
                t.quantity,
                t.date,
                t.status
            ].join(","))
        ].join("\n")

        // Create blob and download link
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.setAttribute("href", url)
        link.setAttribute("download", `transfers_export_${new Date().toISOString().split('T')[0]}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <PageWrapper className="min-h-screen bg-background p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Internal Transfers</h1>
                        <p className="text-muted-foreground">Move stock between warehouses, zones, and racks</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleExport}>
                            <Download className="mr-2 h-4 w-4" />
                            Export
                        </Button>
                        <Button asChild>
                            <Link href="/dashboard/transfers/create">
                                <Plus className="mr-2 h-4 w-4" />
                                New Transfer
                            </Link>
                        </Button>
                    </div>
                </div>

                <Card className="border-primary/20 bg-card/50 backdrop-blur">
                    <CardHeader>
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <CardTitle>Transfer History</CardTitle>
                            <div className="flex items-center gap-2 w-full md:w-auto">
                                <div className="relative w-full md:w-64">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search transfers..."
                                        className="pl-8"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant={statusFilter === "All" ? "outline" : "secondary"} size="icon">
                                            <Filter className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => setStatusFilter("All")}>
                                            All
                                            {statusFilter === "All" && <CheckCircle2 className="ml-auto h-4 w-4" />}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setStatusFilter("Completed")}>
                                            Completed
                                            {statusFilter === "Completed" && <CheckCircle2 className="ml-auto h-4 w-4" />}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setStatusFilter("Pending")}>
                                            Pending
                                            {statusFilter === "Pending" && <CheckCircle2 className="ml-auto h-4 w-4" />}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setStatusFilter("Draft")}>
                                            Draft
                                            {statusFilter === "Draft" && <CheckCircle2 className="ml-auto h-4 w-4" />}
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[150px]">Reference</TableHead>
                                        <TableHead>Product</TableHead>
                                        <TableHead>From Location</TableHead>
                                        <TableHead>To Location</TableHead>
                                        <TableHead className="text-right">Quantity</TableHead>
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
                                    ) : filteredTransfers.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                                No transfers found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredTransfers.map((transfer) => (
                                            <TableRow key={transfer.id}>
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-8 w-8 rounded bg-purple-500/10 flex items-center justify-center text-purple-500">
                                                            <ArrowRightLeft className="h-4 w-4" />
                                                        </div>
                                                        {transfer.reference}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{transfer.product}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2 text-muted-foreground text-xs">
                                                        <MapPin className="h-3 w-3" />
                                                        {transfer.from}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2 text-muted-foreground text-xs">
                                                        <MapPin className="h-3 w-3" />
                                                        {transfer.to}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right font-mono font-bold">
                                                    {transfer.quantity}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={
                                                            transfer.status === "Completed" ? "default" :
                                                                transfer.status === "Pending" ? "secondary" : "outline"
                                                        }
                                                        className={
                                                            transfer.status === "Completed" ? "bg-green-500/15 text-green-600 hover:bg-green-500/25 border-green-500/20" :
                                                                transfer.status === "Pending" ? "bg-blue-500/15 text-blue-600 hover:bg-blue-500/25 border-blue-500/20" :
                                                                    "bg-gray-500/15 text-gray-600 hover:bg-gray-500/25 border-gray-500/20"
                                                        }
                                                    >
                                                        {transfer.status === "Completed" && <CheckCircle2 className="mr-1 h-3 w-3" />}
                                                        {transfer.status === "Pending" && <Clock className="mr-1 h-3 w-3" />}
                                                        {transfer.status}
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
                                                            <DropdownMenuItem>View Details</DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem className="text-destructive">Cancel Transfer</DropdownMenuItem>
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
