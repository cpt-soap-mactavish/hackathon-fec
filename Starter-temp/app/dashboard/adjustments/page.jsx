"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Search, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
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

export default function AdjustmentsPage() {
    const router = useRouter();
    const [adjustments, setAdjustments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchAdjustments();
    }, []);

    const fetchAdjustments = async () => {
        try {
            const res = await fetch("/api/adjustments");
            if (res.ok) {
                const data = await res.json();
                setAdjustments(data);
            }
        } catch (error) {
            console.error("Error fetching adjustments:", error);
            toast.error("Failed to load adjustments");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this adjustment?")) return;

        try {
            const res = await fetch(`/api/adjustments/${id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                toast.success("Adjustment deleted");
                fetchAdjustments();
            } else {
                const data = await res.json();
                toast.error(data.error || "Failed to delete adjustment");
            }
        } catch (error) {
            toast.error("Error deleting adjustment");
        }
    };

    const filteredAdjustments = adjustments.filter((adj) =>
        adj.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (adj.customer && adj.customer.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const getStatusColor = (status) => {
        switch (status) {
            case "DRAFT": return "bg-gray-500/10 text-gray-600 border-gray-500/20";
            case "DONE": return "bg-green-500/10 text-green-600 border-green-500/20";
            case "CANCELLED": return "bg-red-500/10 text-red-600 border-red-500/20";
            default: return "bg-blue-500/10 text-blue-600 border-blue-500/20";
        }
    };

    return (
        <PageWrapper>
            <div className="flex flex-col space-y-6 p-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Stock Adjustments</h1>
                        <p className="text-muted-foreground">Manage inventory corrections and physical count updates</p>
                    </div>
                    <Button asChild>
                        <Link href="/dashboard/adjustments/create">
                            <Plus className="mr-2 h-4 w-4" />
                            New Adjustment
                        </Link>
                    </Button>
                </div>

                {/* Search */}
                <div className="flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search by reference or reason..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                </div>

                {/* Table */}
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle>All Adjustments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-border/50">
                                    <TableHead>Reference</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Reason</TableHead>
                                    <TableHead>Items</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            Loading adjustments...
                                        </TableCell>
                                    </TableRow>
                                ) : filteredAdjustments.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            No adjustments found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredAdjustments.map((adjustment) => (
                                        <TableRow
                                            key={adjustment.id}
                                            className="hover:bg-muted/50 border-border/50 cursor-pointer"
                                            onClick={() => router.push(`/dashboard/adjustments/${adjustment.id}`)}
                                        >
                                            <TableCell className="font-medium">{adjustment.reference}</TableCell>
                                            <TableCell>{format(new Date(adjustment.date), "PPP")}</TableCell>
                                            <TableCell className="max-w-xs truncate">
                                                {adjustment.customer || "No reason provided"}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{adjustment.items.length} items</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={getStatusColor(adjustment.status)}>
                                                    {adjustment.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            router.push(`/dashboard/adjustments/${adjustment.id}`);
                                                        }}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    {adjustment.status === "DRAFT" && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDelete(adjustment.id);
                                                            }}
                                                            className="text-destructive hover:text-destructive"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </PageWrapper>
    );
}
