"use client";

import React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle, XCircle, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
import { PageWrapper } from "@/components/PageWrapper";
import { Badge } from "@/components/ui/badge";

export default function AdjustmentDetailsPage({ params }) {
    const unwrappedParams = React.use(params);
    const { id } = unwrappedParams;

    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [adjustment, setAdjustment] = useState(null);

    useEffect(() => {
        fetchAdjustment();
    }, [id]);

    const fetchAdjustment = async () => {
        try {
            const res = await fetch(`/api/adjustments/${id}`);
            if (res.ok) {
                const data = await res.json();
                setAdjustment(data);
            } else {
                toast.error("Adjustment not found");
                router.push("/dashboard/adjustments");
            }
        } catch (error) {
            console.error("Error fetching adjustment:", error);
            toast.error("Failed to load adjustment details");
        } finally {
            setLoading(false);
        }
    };

    const handleValidate = async () => {
        if (!confirm("Are you sure you want to validate this adjustment? Stock will be updated.")) return;

        try {
            setLoading(true);
            const res = await fetch(`/api/adjustments/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "DONE" }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Validation failed");
            }

            toast.success("Adjustment validated and stock updated");
            setAdjustment(data);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async () => {
        if (!confirm("Are you sure you want to cancel this adjustment?")) return;

        try {
            setLoading(true);
            const res = await fetch(`/api/adjustments/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "CANCELLED" }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to cancel");
            }

            toast.success("Adjustment cancelled");
            setAdjustment(data);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this adjustment?")) return;

        try {
            setLoading(true);
            const res = await fetch(`/api/adjustments/${id}`, {
                method: "DELETE",
            });

            if (!res.ok) throw new Error("Failed to delete");

            toast.success("Adjustment deleted");
            router.push("/dashboard/adjustments");
        } catch (error) {
            toast.error("Error deleting adjustment");
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <PageWrapper className="flex justify-center items-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </PageWrapper>
        );
    }

    if (!adjustment) return null;

    return (
        <PageWrapper>
            <div className="flex flex-col space-y-6 p-8 max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" asChild>
                                <Link href="/dashboard/adjustments">
                                    <ArrowLeft className="h-4 w-4" />
                                </Link>
                            </Button>
                            <div className="flex flex-col">
                                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                                    Adjustment {adjustment.reference}
                                    <Badge variant="outline" className="ml-2">{adjustment.status}</Badge>
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    {adjustment.status === "DONE" ? "Completed and Applied" : "Stock correction"}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {adjustment.status === "DRAFT" && (
                            <>
                                <Button
                                    variant="default"
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                    onClick={handleValidate}
                                    disabled={loading}
                                >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Validate & Apply
                                </Button>
                                <Button
                                    variant="outline"
                                    className="text-destructive hover:bg-destructive/10 border-destructive/50"
                                    onClick={handleCancel}
                                    disabled={loading}
                                >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Cancel
                                </Button>
                                <Button
                                    variant="outline"
                                    className="text-destructive hover:bg-destructive/10 border-destructive/50"
                                    onClick={handleDelete}
                                    disabled={loading}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Main Content */}
                    <div className="md:col-span-2 space-y-6">
                        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg">Adjustment Items</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="hover:bg-transparent border-border/50">
                                            <TableHead className="w-[35%]">Product</TableHead>
                                            <TableHead className="w-[25%]">Location</TableHead>
                                            <TableHead className="w-[20%] text-right">Adjustment</TableHead>
                                            <TableHead className="w-[20%] text-right">New Qty</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {adjustment.items.map((item, index) => {
                                            const isPositive = item.quantity > 0;
                                            const isNegative = item.quantity < 0;

                                            return (
                                                <TableRow key={index} className="hover:bg-muted/50 border-border/50">
                                                    <TableCell>
                                                        <div className="font-medium">{item.product?.name || "Unknown Product"}</div>
                                                        <div className="text-xs text-muted-foreground">{item.product?.sku}</div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div>{item.fromWarehouse?.name || "Unknown Warehouse"}</div>
                                                        {item.fromLocation && (
                                                            <Badge variant="outline" className="mt-1">{item.fromLocation.name}</Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <span className={`font-mono font-bold ${isPositive ? "text-green-600" : isNegative ? "text-red-600" : ""
                                                            }`}>
                                                            {isPositive ? "+" : ""}{item.quantity}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-right font-mono">
                                                        {/* We don't have the old quantity stored, so just show the adjustment */}
                                                        <span className="text-muted-foreground text-xs">Applied</span>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Sidebar - Info */}
                    <div className="space-y-6">
                        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="text-sm font-medium text-muted-foreground">Adjustment Info</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label className="text-xs text-muted-foreground">Reference</Label>
                                    <div className="font-medium">{adjustment.reference}</div>
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">Date</Label>
                                    <div className="font-medium">{format(new Date(adjustment.date), "PPP")}</div>
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">Reason</Label>
                                    <div className="font-medium text-sm">{adjustment.customer || "No reason provided"}</div>
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">Responsible</Label>
                                    <div className="font-medium">{adjustment.responsible}</div>
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">Status</Label>
                                    <div className="mt-1">
                                        <Badge variant="outline" className="capitalize">{adjustment.status.toLowerCase()}</Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {adjustment.status === "DRAFT" && (
                            <Card className="bg-yellow-500/10 border-yellow-500/20">
                                <CardContent className="p-4">
                                    <p className="text-sm text-yellow-600 dark:text-yellow-400">
                                        This adjustment is pending validation. Click "Validate & Apply" to update stock.
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </PageWrapper>
    );
}
