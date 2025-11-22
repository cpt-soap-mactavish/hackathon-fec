"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Filter, List, LayoutGrid, ArrowDown, Loader2 } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PageWrapper } from "@/components/PageWrapper";
import { toast } from "sonner";

export default function ReceiptsPage() {
    const [receipts, setReceipts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [viewMode, setViewMode] = useState("list"); // "list" or "kanban"

    useEffect(() => {
        fetchReceipts();
    }, []);

    const fetchReceipts = async () => {
        try {
            const res = await fetch("/api/receipts");
            if (res.ok) {
                const data = await res.json();
                setReceipts(data);
            }
        } catch (error) {
            console.error("Failed to fetch receipts:", error);
            toast.error("Failed to load receipts");
        } finally {
            setLoading(false);
        }
    };

    const filteredReceipts = receipts.filter((receipt) =>
        receipt.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        receipt.customer?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusColor = (status) => {
        switch (status) {
            case "DONE": return "bg-green-500/10 text-green-500 hover:bg-green-500/20";
            case "DRAFT": return "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20";
            case "READY": return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20";
            case "CANCELLED": return "bg-red-500/10 text-red-500 hover:bg-red-500/20";
            default: return "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20";
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this receipt?")) return;

        try {
            const res = await fetch(`/api/receipts/${id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                toast.success("Receipt deleted");
                fetchReceipts();
            } else {
                const data = await res.json();
                toast.error(data.error || "Failed to delete receipt");
            }
        } catch (error) {
            toast.error("Error deleting receipt");
        }
    };

    // Group receipts by status for Kanban view
    const groupedByStatus = {
        DRAFT: filteredReceipts.filter(r => r.status === "DRAFT"),
        READY: filteredReceipts.filter(r => r.status === "READY"),
        DONE: filteredReceipts.filter(r => r.status === "DONE"),
        CANCELLED: filteredReceipts.filter(r => r.status === "CANCELLED"),
    };

    const ReceiptCard = ({ receipt }) => (
        <Link href={`/dashboard/receipts/${receipt.id}`}>
            <Card className="mb-3 hover:border-primary/50 transition-colors cursor-pointer">
                <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <ArrowDown className="h-4 w-4 text-green-500" />
                            <span className="font-medium text-sm">{receipt.reference}</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                            INBOUND
                        </Badge>
                    </div>
                    <div className="space-y-1 text-xs text-muted-foreground">
                        <div>{receipt.date ? format(new Date(receipt.date), "dd/MM/yyyy") : "-"}</div>
                        <div>Vendor: {receipt.customer || "-"}</div>
                        <div>To: {receipt.items?.[0]?.toWarehouse?.name || "-"}</div>
                        <div className="font-medium text-foreground">
                            {receipt.items?.reduce((acc, item) => acc + item.quantity, 0)} units
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );

    return (
        <PageWrapper>
            <div className="flex flex-col space-y-6 p-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Receipts</h1>
                        <p className="text-muted-foreground">
                            Manage inbound stock from vendors
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/dashboard/receipts/create">
                            <Plus className="mr-2 h-4 w-4" />
                            New Receipt
                        </Link>
                    </Button>
                </div>

                {/* Filters & View Toggle */}
                <div className="flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by reference or vendor..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant={viewMode === "list" ? "default" : "outline"}
                            size="icon"
                            onClick={() => setViewMode("list")}
                        >
                            <List className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={viewMode === "kanban" ? "default" : "outline"}
                            size="icon"
                            onClick={() => setViewMode("kanban")}
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* List View */}
                {viewMode === "list" && (
                    <div className="rounded-md border border-border/50 bg-card/50 backdrop-blur-sm">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Reference</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Vendor</TableHead>
                                    <TableHead>Destination</TableHead>
                                    <TableHead className="text-right">Items</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">
                                            <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                        </TableCell>
                                    </TableRow>
                                ) : filteredReceipts.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                                            No receipts found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredReceipts.map((receipt) => (
                                        <TableRow key={receipt.id} className="hover:bg-green-500/5">
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <ArrowDown className="h-4 w-4 text-green-500" />
                                                    <Link href={`/dashboard/receipts/${receipt.id}`} className="hover:underline">
                                                        {receipt.reference}
                                                    </Link>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {receipt.date ? format(new Date(receipt.date), "dd/MM/yyyy") : "-"}
                                            </TableCell>
                                            <TableCell>{receipt.customer || "-"}</TableCell>
                                            <TableCell>
                                                {receipt.items?.[0]?.toWarehouse?.name || "-"}
                                                {receipt.items?.[0]?.toLocation && (
                                                    <span className="text-xs text-muted-foreground block">
                                                        ({receipt.items[0].toLocation.name})
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {receipt.items?.length || 0}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className={getStatusColor(receipt.status)}>
                                                    {receipt.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}

                {/* Kanban View */}
                {viewMode === "kanban" && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Draft Column */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-gray-500/10 rounded-lg">
                                <h3 className="font-semibold">Draft</h3>
                                <Badge variant="secondary">{groupedByStatus.DRAFT.length}</Badge>
                            </div>
                            <div className="space-y-2">
                                {groupedByStatus.DRAFT.map(receipt => (
                                    <ReceiptCard key={receipt.id} receipt={receipt} />
                                ))}
                                {groupedByStatus.DRAFT.length === 0 && (
                                    <p className="text-sm text-muted-foreground text-center py-8">No drafts</p>
                                )}
                            </div>
                        </div>

                        {/* Ready Column */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded-lg">
                                <h3 className="font-semibold">Ready</h3>
                                <Badge variant="secondary">{groupedByStatus.READY.length}</Badge>
                            </div>
                            <div className="space-y-2">
                                {groupedByStatus.READY.map(receipt => (
                                    <ReceiptCard key={receipt.id} receipt={receipt} />
                                ))}
                                {groupedByStatus.READY.length === 0 && (
                                    <p className="text-sm text-muted-foreground text-center py-8">No ready items</p>
                                )}
                            </div>
                        </div>

                        {/* Done Column */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg">
                                <h3 className="font-semibold">Done</h3>
                                <Badge variant="secondary">{groupedByStatus.DONE.length}</Badge>
                            </div>
                            <div className="space-y-2">
                                {groupedByStatus.DONE.map(receipt => (
                                    <ReceiptCard key={receipt.id} receipt={receipt} />
                                ))}
                                {groupedByStatus.DONE.length === 0 && (
                                    <p className="text-sm text-muted-foreground text-center py-8">No completed items</p>
                                )}
                            </div>
                        </div>

                        {/* Cancelled Column */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg">
                                <h3 className="font-semibold">Cancelled</h3>
                                <Badge variant="secondary">{groupedByStatus.CANCELLED.length}</Badge>
                            </div>
                            <div className="space-y-2">
                                {groupedByStatus.CANCELLED.map(receipt => (
                                    <ReceiptCard key={receipt.id} receipt={receipt} />
                                ))}
                                {groupedByStatus.CANCELLED.length === 0 && (
                                    <p className="text-sm text-muted-foreground text-center py-8">No cancelled items</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </PageWrapper>
    );
}
