"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import {
    Search,
    Filter,
    Download,
    Plus,
    MoreHorizontal,
    ArrowUpDown,
    Package,
    AlertTriangle
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

export default function StockPage() {
    const { data: session } = useSession()
    const [isLoading, setIsLoading] = useState(true)
    const [products, setProducts] = useState([])
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        // Simulate fetching data
        const timer = setTimeout(() => {
            setProducts([
                { id: "1", name: "Laptop Pro X", sku: "LAP-PRO-001", category: "Electronics", stock: 45, minStock: 10, status: "In Stock", location: "Warehouse A" },
                { id: "2", name: "Wireless Mouse", sku: "ACC-MSE-002", category: "Accessories", stock: 12, minStock: 20, status: "Low Stock", location: "Warehouse B" },
                { id: "3", name: "HD Monitor 27\"", sku: "MON-HD-027", category: "Electronics", stock: 0, minStock: 5, status: "Out of Stock", location: "Warehouse A" },
                { id: "4", name: "Mechanical Keyboard", sku: "ACC-KEY-003", category: "Accessories", stock: 89, minStock: 15, status: "In Stock", location: "Warehouse A" },
                { id: "5", name: "USB-C Cable", sku: "CBL-USB-004", category: "Cables", stock: 200, minStock: 50, status: "In Stock", location: "Warehouse C" },
            ])
            setIsLoading(false)
        }, 1000)

        return () => clearTimeout(timer)
    }, [])

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <PageWrapper className="min-h-screen bg-background p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Stock Management</h1>
                        <p className="text-muted-foreground">Manage your inventory across all locations</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline">
                            <Download className="mr-2 h-4 w-4" />
                            Export
                        </Button>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Product
                        </Button>
                    </div>
                </div>

                <Card className="border-primary/20 bg-card/50 backdrop-blur">
                    <CardHeader>
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <CardTitle>Inventory Items</CardTitle>
                            <div className="flex items-center gap-2 w-full md:w-auto">
                                <div className="relative w-full md:w-64">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search products..."
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
                                        <TableHead className="w-[100px]">SKU</TableHead>
                                        <TableHead>Product Name</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Location</TableHead>
                                        <TableHead className="text-right">Stock Level</TableHead>
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
                                    ) : filteredProducts.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                                No products found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredProducts.map((product) => (
                                            <TableRow key={product.id}>
                                                <TableCell className="font-medium">{product.sku}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center text-primary">
                                                            <Package className="h-4 w-4" />
                                                        </div>
                                                        {product.name}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{product.category}</TableCell>
                                                <TableCell>{product.location}</TableCell>
                                                <TableCell className="text-right font-mono">
                                                    {product.stock}
                                                    <span className="text-xs text-muted-foreground ml-1">/ {product.minStock}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={
                                                            product.status === "In Stock" ? "default" :
                                                                product.status === "Low Stock" ? "destructive" : "secondary"
                                                        }
                                                        className={
                                                            product.status === "In Stock" ? "bg-green-500/15 text-green-600 hover:bg-green-500/25 border-green-500/20" :
                                                                product.status === "Low Stock" ? "bg-yellow-500/15 text-yellow-600 hover:bg-yellow-500/25 border-yellow-500/20" :
                                                                    "bg-red-500/15 text-red-600 hover:bg-red-500/25 border-red-500/20"
                                                        }
                                                    >
                                                        {product.status}
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
                                                            <DropdownMenuItem>Edit Product</DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem className="text-destructive">Delete Product</DropdownMenuItem>
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
