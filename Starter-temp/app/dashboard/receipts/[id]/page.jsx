"use client";

import React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle, Trash2, Loader2, ArrowDown, XCircle } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { PageWrapper } from "@/components/PageWrapper";

export default function ReceiptDetailsPage({ params }) {
    const unwrappedParams = React.use(params);
    const { id } = unwrappedParams;

    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [receipt, setReceipt] = useState(null);

    useEffect(() => {
        const fetchReceipt = async () => {
            try {
                const res = await fetch(`/api/receipts/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setReceipt(data);
                } else {
                    toast.error("Receipt not found");
                    router.push("/dashboard/receipts");
                }
            } catch (error) {
                console.error("Error fetching receipt:", error);
                toast.error("Failed to load receipt");
            } finally {
                setLoading(false);
            }
        };
        fetchReceipt();
    }, [id, router]);

    const handleStatusChange = async (newStatus) => {
        try {
            setLoading(true);
            const res = await fetch(`/api/receipts/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to update status");
            }

            toast.success(`Status updated to ${newStatus}`);
            setReceipt(data);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleValidate = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/receipts/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "DONE" }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Validation failed");
            }

            toast.success("Receipt validated. Stock updated successfully.");
            setReceipt(data);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async () => {
        if (!confirm("Are you sure you want to cancel this receipt?")) return;

        try {
            setLoading(true);
            const res = await fetch(`/api/receipts/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "CANCELLED" }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to cancel");
            }

            toast.success("Receipt cancelled");
            setReceipt(data);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this receipt?")) return;

        try {
            setLoading(true);
            const res = await fetch(`/api/receipts/${id}`, {
                method: "DELETE",
            });

            if (!res.ok) throw new Error("Failed to delete");

            toast.success("Receipt deleted");
            router.push("/dashboard/receipts");
        } catch (error) {
            toast.error("Error deleting receipt");
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

    if (!receipt) return null;

    const toWarehouse = receipt.items[0]?.toWarehouse;
    const steps = ["DRAFT", "READY", "DONE"];
    const currentStepIndex = steps.indexOf(receipt.status);

    return (
        <PageWrapper>
            <div className="flex flex-col space-y-6 p-8 max-w-5xl mx-auto">
                {/* Header & Actions */}
                <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" asChild className="print:hidden">
                                <Link href="/dashboard/receipts">
                                    <ArrowLeft className="h-4 w-4" />
                                </Link>
                            </Button>
                            <div className="flex flex-col">
                                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                                    Receipt {receipt.reference}
                                    <Badge variant="outline" className="ml-2">{receipt.status}</Badge>
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    {receipt.status === "DONE" ? "Completed and Received" : "Manage incoming stock"}
                                </p>
                            </div>
                        </div>

                        {/* Status Stepper */}
                        <div className="flex items-center gap-2 print:hidden">
                            <div className="flex items-center bg-muted/50 rounded-lg p-1 border border-border/50">
                                {steps.map((step, index) => (
                                    <div key={step} className="flex items-center">
                                        <button
                                            onClick={() => receipt.status !== "DONE" && receipt.status !== "CANCELLED" && index <= currentStepIndex + 1 && handleStatusChange(step)}
                                            disabled={receipt.status === "DONE" || receipt.status === "CANCELLED" || index > currentStepIndex + 1 || loading}
                                            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${index === currentStepIndex
                                                ? "bg-primary text-primary-foreground shadow-sm"
                                                : index < currentStepIndex
                                                    ? "text-primary hover:bg-primary/10 cursor-pointer"
                                                    : index === currentStepIndex + 1 && receipt.status !== "DONE" && receipt.status !== "CANCELLED"
                                                        ? "text-muted-foreground hover:bg-muted cursor-pointer"
                                                        : "text-muted-foreground cursor-not-allowed"
                                                } ${(receipt.status === "DONE" || receipt.status === "CANCELLED") ? "cursor-not-allowed" : ""}`}
                                        >
                                            {step.charAt(0) + step.slice(1).toLowerCase()}
                                        </button>
                                        {index < steps.length - 1 && (
                                            <div className="h-4 w-px bg-border mx-1" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 print:hidden">
                        {receipt.status === "READY" && (
                            <Button
                                variant="default"
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={handleValidate}
                                disabled={loading}
                            >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Validate & Receive Stock
                            </Button>
                        )}
                        {(receipt.status === "DRAFT" || receipt.status === "READY") && (
                            <Button
                                variant="outline"
                                className="text-destructive hover:bg-destructive/10 border-destructive/50"
                                onClick={handleCancel}
                                disabled={loading}
                            >
                                <XCircle className="mr-2 h-4 w-4" />
                                Cancel
                            </Button>
                        )}
                        {receipt.status === "DRAFT" && (
                            <Button
                                variant="outline"
                                className="text-destructive hover:bg-destructive/10 border-destructive/50"
                                onClick={handleDelete}
                                disabled={loading}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </Button>
                        )}
                    </div>
                </div>

                {/* Info Card */}
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between max-w-2xl mx-auto">
                            <div className="text-center">
                                <Label className="text-muted-foreground mb-2 block">Source (Vendor)</Label>
                                <div className="text-xl font-bold">{receipt.customer}</div>
                                <div className="text-sm text-muted-foreground">External Supplier</div>
                            </div>

                            <div className="flex flex-col items-center px-8">
                                <ArrowDown className="h-8 w-8 text-green-500 mb-2" />
                                <Badge variant="secondary" className="bg-green-500/10 text-green-500">Receiving</Badge>
                            </div>

                            <div className="text-center">
                                <Label className="text-muted-foreground mb-2 block">Destination (Warehouse)</Label>
                                <div className="text-xl font-bold">{toWarehouse?.name}</div>
                                <div className="text-sm text-muted-foreground">{toWarehouse?.location || "No Address"}</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Items Table */}
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Items</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-border/50">
                                    <TableHead className="w-[50%]">Product</TableHead>
                                    <TableHead className="w-[20%]">Location</TableHead>
                                    <TableHead className="w-[15%] text-right">Quantity</TableHead>
                                    <TableHead className="w-[15%]">UOM</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {receipt.items.map((item, index) => (
                                    <TableRow key={index} className="hover:bg-muted/50 border-border/50">
                                        <TableCell>
                                            <div className="font-medium">{item.product?.name}</div>
                                            <div className="text-xs text-muted-foreground">{item.product?.sku}</div>
                                        </TableCell>
                                        <TableCell>
                                            {item.toLocation ? (
                                                <Badge variant="outline">{item.toLocation.name}</Badge>
                                            ) : (
                                                <span className="text-muted-foreground text-sm">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right font-mono font-bold">
                                            {item.quantity}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {item.product?.uom}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {receipt.notes && (
                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-muted-foreground">Notes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>{receipt.notes}</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </PageWrapper>
    );
}
