"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import {
    Search,
    Filter,
    Download,
    Plus,
    MoreHorizontal,
    ArrowDownLeft,
    Calendar,
    CheckCircle2,
    Clock
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

export default function ReceiptsPage() {
    const { data: session } = useSession()
    const [isLoading, setIsLoading] = useState(true)
    const [receipts, setReceipts] = useState([])
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        // Simulate fetching data
        const timer = setTimeout(() => {
            setReceipts([
                { id: "1", reference: "RCV-2025-001", supplier: "TechDistro Inc.", items: 5, totalQty: 150, date: "2025-11-22", status: "Completed", warehouse: "Warehouse A" },
                { id: "2", reference: "RCV-2025-002", supplier: "Global Parts Ltd.", items: 2, totalQty: 45, date: "2025-11-21", status: "Pending", warehouse: "Warehouse B" },
                { id: "3", reference: "RCV-2025-003", supplier: "Office Supplies Co.", items: 12, totalQty: 500, date: "2025-11-20", status: "Completed", warehouse: "Warehouse A" },
                { id: "4", reference: "RCV-2025-004", supplier: "TechDistro Inc.", items: 1, totalQty: 10, date: "2025-11-19", status: "Cancelled", warehouse: "Warehouse C" },
            ])
            setIsLoading(false)
        }, 1000)

        return () => clearTimeout(timer)
    }, [])

    const filteredReceipts = receipts.filter(receipt =>
        receipt.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
        receipt.supplier.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <PageWrapper className="min-h-screen bg-background p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Stock Receipts</h1>
                        <p className="text-muted-foreground">Manage inbound stock and supplier deliveries</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline">
                            <Download className="mr-2 h-4 w-4" />
                            Export
                        </Button>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            New Receipt
                        </Button>
                    </div>
                </div>

                <Card className="border-primary/20 bg-card/50 backdrop-blur">
                    <CardHeader>
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <CardTitle>Recent Receipts</CardTitle>
                            <div className="flex items-center gap-2 w-full md:w-auto">
                                <div className="relative w-full md:w-64">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search receipts..."
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
                                        <TableHead>Supplier</TableHead>
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
                                    ) : filteredReceipts.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                                No receipts found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredReceipts.map((receipt) => (
                                            <TableRow key={receipt.id}>
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-8 w-8 rounded bg-green-500/10 flex items-center justify-center text-green-500">
                                                            <ArrowDownLeft className="h-4 w-4" />
                                                        </div>
                                                        {receipt.reference}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{receipt.supplier}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2 text-muted-foreground">
                                                        <Calendar className="h-3 w-3" />
                                                        {receipt.date}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{receipt.warehouse}</TableCell>
                                                <TableCell className="text-right font-mono">
                                                    {receipt.items} / {receipt.totalQty}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={
                                                            receipt.status === "Completed" ? "default" :
                                                                receipt.status === "Pending" ? "secondary" : "destructive"
                                                        }
                                                        className={
                                                            receipt.status === "Completed" ? "bg-green-500/15 text-green-600 hover:bg-green-500/25 border-green-500/20" :
                                                                receipt.status === "Pending" ? "bg-blue-500/15 text-blue-600 hover:bg-blue-500/25 border-blue-500/20" :
                                                                    "bg-red-500/15 text-red-600 hover:bg-red-500/25 border-red-500/20"
                                                        }
                                                    >
                                                        {receipt.status === "Completed" && <CheckCircle2 className="mr-1 h-3 w-3" />}
                                                        {receipt.status === "Pending" && <Clock className="mr-1 h-3 w-3" />}
                                                        {receipt.status}
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
                                                            <DropdownMenuItem>Print Receipt</DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem className="text-destructive">Cancel Receipt</DropdownMenuItem>
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
