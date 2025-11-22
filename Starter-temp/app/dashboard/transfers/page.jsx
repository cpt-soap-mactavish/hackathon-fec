"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Filter, ArrowRight, ArrowLeftRight, ArrowDown, ArrowUp, FileText } from "lucide-react";
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
import { PageWrapper } from "@/components/PageWrapper";

export default function MoveHistoryPage() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

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
            case "CANCELLED": return "bg-red-500/10 text-red-500 hover:bg-red-500/20";
            default: return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20";
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case "INBOUND": return <ArrowDown className="h-4 w-4 text-green-500" />;
            case "OUTBOUND": return <ArrowUp className="h-4 w-4 text-red-500" />;
            case "TRANSFER": return <ArrowLeftRight className="h-4 w-4 text-blue-500" />;
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

                {/* Filters */}
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
                    <Button variant="outline" size="icon">
                        <Filter className="h-4 w-4" />
                    </Button>
                </div>

                {/* Transactions Table */}
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
            </div>
        </PageWrapper>
    );
}
