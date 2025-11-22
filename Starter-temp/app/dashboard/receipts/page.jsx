"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Filter, ArrowDown, FileText } from "lucide-react";
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

export default function ReceiptsPage() {
    const [receipts, setReceipts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchReceipts = async () => {
            try {
                const res = await fetch("/api/receipts");
                if (res.ok) {
                    const data = await res.json();
                    setReceipts(data);
                }
            } catch (error) {
                console.error("Failed to fetch receipts:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchReceipts();
    }, []);

    const filteredReceipts = receipts.filter((r) =>
        (r.reference?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (r.customer?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );

    const getStatusColor = (status) => {
        switch (status) {
            case "DONE": return "bg-green-500/10 text-green-500 hover:bg-green-500/20";
            case "DRAFT": return "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20";
            case "CANCELLED": return "bg-red-500/10 text-red-500 hover:bg-red-500/20";
            default: return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20";
        }
    };

    return (
        <PageWrapper>
            <div className="flex flex-col space-y-6 p-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Receipts</h1>
                        <p className="text-muted-foreground">
                            Manage incoming stock from vendors
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/dashboard/receipts/create">
                            <Plus className="mr-2 h-4 w-4" />
                            New Receipt
                        </Link>
                    </Button>
                </div>

                {/* Filters */}
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
                </div>

                {/* Receipts Table */}
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
                                        Loading receipts...
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
                                    <TableRow key={receipt.id} className="hover:bg-muted/50">
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <ArrowDown className="h-4 w-4 text-green-500" />
                                                <Link href={`/dashboard/receipts/${receipt.id}`} className="hover:underline">
                                                    {receipt.reference || "N/A"}
                                                </Link>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {receipt.date ? format(new Date(receipt.date), "dd/MM/yyyy") : "-"}
                                        </TableCell>
                                        <TableCell>
                                            {receipt.customer || "Unknown Vendor"}
                                        </TableCell>
                                        <TableCell>
                                            {receipt.items?.[0]?.toWarehouse?.name || "-"}
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
            </div>
        </PageWrapper>
    );
}
