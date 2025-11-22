"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Filter, List, LayoutGrid, ArrowDown, ArrowUp, ArrowLeftRight, FileText } from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageWrapper } from "@/components/PageWrapper";
import { toast } from "sonner";

export default function MoveHistoryPage() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [viewMode, setViewMode] = useState("list"); // "list" or "kanban"

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const res = await fetch("/api/transactions");
                if (res.ok) {
                    const data = await res.json();
                    setTransactions(data);
                }
            } catch (error) {
                console.error("Failed to fetch transactions:", error);
                toast.error("Failed to load transactions");
            } finally {
                setLoading(false);
            }
        };
        fetchTransactions();
    }, []);

    const filteredTransactions = transactions.filter((tx) =>
        tx.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.items?.some(item => item.product?.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const getStatusColor = (status) => {
        switch (status) {
            case "DONE": return "bg-green-500/10 text-green-500 hover:bg-green-500/20";
            case "DRAFT": return "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20";
            case "READY": return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20";
            case "WAITING": return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20";
            case "CANCELLED": return "bg-red-500/10 text-red-500 hover:bg-red-500/20";
            default: return "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20";
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case "INBOUND": return <ArrowDown className="h-4 w-4 text-green-500" />;
            case "OUTBOUND": return <ArrowUp className="h-4 w-4 text-red-500" />;
            case "TRANSFER": return <ArrowLeftRight className="h-4 w-4 text-blue-500" />;
            case "ADJUSTMENT": return <FileText className="h-4 w-4 text-purple-500" />;
            default: return <FileText className="h-4 w-4" />;
        }
    };

    const getRowStyle = (type) => {
        switch (type) {
            case "INBOUND": return "hover:bg-green-500/5";
            case "OUTBOUND": return "hover:bg-red-500/5";
            default: return "hover:bg-muted/50";
        }
    };

    // Group transactions by status for Kanban view
    const groupedByStatus = {
        DRAFT: filteredTransactions.filter(t => t.status === "DRAFT"),
        READY: filteredTransactions.filter(t => t.status === "READY" || t.status === "WAITING"),
        DONE: filteredTransactions.filter(t => t.status === "DONE"),
        CANCELLED: filteredTransactions.filter(t => t.status === "CANCELLED"),
    };

    const TransactionCard = ({ tx }) => (
        <Link href={`/dashboard/transfers/${tx.id}`}>
            <Card className="mb-3 hover:border-primary/50 transition-colors cursor-pointer">
                <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                            {getTypeIcon(tx.type)}
                            <span className="font-medium text-sm">{tx.reference}</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                            {tx.type}
                        </Badge>
                    </div>
                    <div className="space-y-1 text-xs text-muted-foreground">
                        <div>{tx.date ? format(new Date(tx.date), "dd/MM/yyyy") : "-"}</div>
                        <div className="flex items-center gap-1">
                            <span>{tx.items?.[0]?.fromWarehouse?.name || "Vendor"}</span>
                            <ArrowLeftRight className="h-3 w-3" />
                            <span>{tx.items?.[0]?.toWarehouse?.name || "Customer"}</span>
                        </div>
                        <div className="font-medium text-foreground">
                            {tx.items?.reduce((acc, item) => acc + item.quantity, 0)} units
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
                        <h1 className="text-3xl font-bold tracking-tight">Move History</h1>
                        <p className="text-muted-foreground">
                            Track all stock movements: Receipts, Deliveries, and Transfers
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/dashboard/transfers/create">
                            <Plus className="mr-2 h-4 w-4" />
                            New Transfer
                        </Link>
                    </Button>
                </div>

                {/* Filters & View Toggle */}
                <div className="flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by reference or product..."
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
                                    <TableHead>Contact</TableHead>
                                    <TableHead>From</TableHead>
                                    <TableHead>To</TableHead>
                                    <TableHead className="text-right">Quantity</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center">
                                            Loading history...
                                        </TableCell>
                                    </TableRow>
                                ) : filteredTransactions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                                            No transactions found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredTransactions.map((tx) => (
                                        <TableRow key={tx.id} className={getRowStyle(tx.type)}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    {getTypeIcon(tx.type)}
                                                    <Link href={`/dashboard/transfers/${tx.id}`} className="hover:underline">
                                                        {tx.reference || "N/A"}
                                                    </Link>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {tx.date ? format(new Date(tx.date), "dd/MM/yyyy") : "-"}
                                            </TableCell>
                                            <TableCell>
                                                {tx.customer || tx.items?.[0]?.product?.name || "-"}
                                            </TableCell>
                                            <TableCell>
                                                {tx.items?.[0]?.fromWarehouse?.name || "Vendor"}
                                                {tx.items?.[0]?.fromLocation && (
                                                    <span className="text-xs text-muted-foreground block">
                                                        ({tx.items[0].fromLocation.name})
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {tx.items?.[0]?.toWarehouse?.name || "Customer"}
                                                {tx.items?.[0]?.toLocation && (
                                                    <span className="text-xs text-muted-foreground block">
                                                        ({tx.items[0].toLocation.name})
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {tx.items?.reduce((acc, item) => acc + item.quantity, 0)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className={getStatusColor(tx.status)}>
                                                    {tx.status}
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
                                {groupedByStatus.DRAFT.map(tx => (
                                    <TransactionCard key={tx.id} tx={tx} />
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
                                {groupedByStatus.READY.map(tx => (
                                    <TransactionCard key={tx.id} tx={tx} />
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
                                {groupedByStatus.DONE.map(tx => (
                                    <TransactionCard key={tx.id} tx={tx} />
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
                                {groupedByStatus.CANCELLED.map(tx => (
                                    <TransactionCard key={tx.id} tx={tx} />
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
