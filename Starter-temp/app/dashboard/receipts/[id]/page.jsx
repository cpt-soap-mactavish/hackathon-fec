"use client";

import React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Printer, CheckCircle, XCircle, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export default function ReceiptDetailsPage({ params }) {
    const unwrappedParams = React.use(params);
    const { id } = unwrappedParams;

    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [receipt, setReceipt] = useState(null);
    const [products, setProducts] = useState([]);
    const [warehouses, setWarehouses] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [receiptRes, productsRes, warehousesRes] = await Promise.all([
                    fetch(`/api/receipts/${id}`),
                    fetch("/api/products"),
                    fetch("/api/warehouses")
                ]);

                if (receiptRes.ok) {
                    const data = await receiptRes.json();
                    setReceipt(data);
                } else {
                    toast.error("Receipt not found");
                    router.push("/dashboard/receipts");
                }

                if (productsRes.ok) setProducts(await productsRes.json());
                if (warehousesRes.ok) setWarehouses(await warehousesRes.json());

            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("Failed to load receipt details");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
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

            toast.success("Receipt validated and stock added");
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

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <PageWrapper className="flex justify-center items-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </PageWrapper>
        );
    }

    if (!receipt) return null;

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
                            <h1 className="text-2xl font-bold tracking-tight">Receipt {receipt.reference}</h1>
                        </div>
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
                                variant="outline"
                                className="border-primary/50 text-primary hover:bg-primary/10"
                                onClick={handleValidate}
                                disabled={loading}
                            >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Validate
                            </Button>
                        )}
                        {(receipt.status === "DRAFT" || receipt.status === "WAITING" || receipt.status === "READY") && (
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
                        <Button variant="outline" onClick={handlePrint}>
                            <Printer className="mr-2 h-4 w-4" />
                            Print
                        </Button>
                    </div>
                </div>

                <div className="space-y-8">
                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                        <CardContent className="p-6 grid gap-6 md:grid-cols-2">
                            {/* Left Column */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-muted-foreground">Reference</Label>
                                    <div className="font-medium text-lg">{receipt.reference}</div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Vendor (From/Supplier)</Label>
                                    <Input value={receipt.customer || ""} readOnly className="bg-transparent border-x-0 border-t-0 rounded-none px-0" />
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Schedule Date</Label>
                                    <Input value={format(new Date(receipt.date), "yyyy-MM-dd")} readOnly className="bg-transparent border-x-0 border-t-0 rounded-none px-0" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Status</Label>
                                    <div className="font-medium">{receipt.status}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Products Table */}
                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg">Products</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent border-border/50">
                                        <TableHead className="w-[40%]">Product</TableHead>
                                        <TableHead className="w-[30%]">To Warehouse</TableHead>
                                        <TableHead className="w-[20%]">Quantity</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {receipt.items.map((item, index) => {
                                        const warehouse = warehouses.find(w => w.id === item.toWarehouseId);
                                        return (
                                            <TableRow key={index} className="hover:bg-muted/50 border-border/50">
                                                <TableCell>
                                                    <div className="font-medium">{item.product.name}</div>
                                                    <div className="text-xs text-muted-foreground">SKU: {item.product.sku}</div>
                                                </TableCell>
                                                <TableCell>
                                                    {item.toWarehouse?.name || warehouse?.name || "N/A"}
                                                </TableCell>
                                                <TableCell>
                                                    {item.quantity}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </PageWrapper>
    );
}
