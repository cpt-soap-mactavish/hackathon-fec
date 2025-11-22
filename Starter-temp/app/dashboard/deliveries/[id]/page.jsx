"use client";

import React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Printer, CheckCircle, XCircle, Trash2, Loader2, PackageCheck, Box } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
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

export default function DeliveryDetailsPage({ params }) {
    const unwrappedParams = React.use(params);
    const { id } = unwrappedParams;

    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [delivery, setDelivery] = useState(null);
    const [products, setProducts] = useState([]);
    const [warehouses, setWarehouses] = useState([]);

    // Picking State
    const [pickedItems, setPickedItems] = useState({});
    const [isPacked, setIsPacked] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [deliveryRes, productsRes, warehousesRes] = await Promise.all([
                    fetch(`/api/deliveries/${id}`),
                    fetch("/api/products"),
                    fetch("/api/warehouses")
                ]);

                if (deliveryRes.ok) {
                    const data = await deliveryRes.json();
                    setDelivery(data);
                    // Initialize picked state if status is DONE
                    if (data.status === "DONE") {
                        const allPicked = {};
                        data.items.forEach(item => allPicked[item.id] = true);
                        setPickedItems(allPicked);
                        setIsPacked(true);
                    }
                } else {
                    toast.error("Delivery not found");
                    router.push("/dashboard/deliveries");
                }

                if (productsRes.ok) setProducts(await productsRes.json());
                if (warehousesRes.ok) setWarehouses(await warehousesRes.json());

            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("Failed to load delivery details");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, router]);

    const handleStatusChange = async (newStatus) => {
        try {
            setLoading(true);
            const res = await fetch(`/api/deliveries/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to update status");
            }

            toast.success(`Status updated to ${newStatus}`);
            setDelivery(data);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleValidate = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/deliveries/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "DONE" }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Validation failed");
            }

            toast.success("Delivery validated and stock deducted");
            setDelivery(data);
            setIsPacked(true);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async () => {
        if (!confirm("Are you sure you want to cancel this delivery?")) return;

        try {
            setLoading(true);
            const res = await fetch(`/api/deliveries/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "CANCELLED" }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to cancel");
            }

            toast.success("Delivery cancelled");
            setDelivery(data);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this delivery?")) return;

        try {
            setLoading(true);
            const res = await fetch(`/api/deliveries/${id}`, {
                method: "DELETE",
            });

            if (!res.ok) throw new Error("Failed to delete");

            toast.success("Delivery deleted");
            router.push("/dashboard/deliveries");
        } catch (error) {
            toast.error("Error deleting delivery");
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const togglePickItem = (itemId) => {
        setPickedItems(prev => ({
            ...prev,
            [itemId]: !prev[itemId]
        }));
    };

    const allItemsPicked = delivery?.items?.every(item => pickedItems[item.id]);

    if (loading) {
        return (
            <PageWrapper className="flex justify-center items-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </PageWrapper>
        );
    }

    if (!delivery) return null;

    const steps = ["DRAFT", "WAITING", "READY", "DONE"];
    const currentStepIndex = steps.indexOf(delivery.status);

    return (
        <PageWrapper>
            <div className="flex flex-col space-y-6 p-8 max-w-5xl mx-auto">
                {/* Header & Actions */}
                <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" asChild className="print:hidden">
                                <Link href="/dashboard/deliveries">
                                    <ArrowLeft className="h-4 w-4" />
                                </Link>
                            </Button>
                            <div className="flex flex-col">
                                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                                    Delivery {delivery.reference}
                                    <Badge variant="outline" className="ml-2">{delivery.status}</Badge>
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    {delivery.status === "DONE" ? "Completed and Shipped" : "Manage outgoing stock"}
                                </p>
                            </div>
                        </div>

                        {/* Status Stepper */}
                        <div className="flex items-center gap-2 print:hidden">
                            <div className="flex items-center bg-muted/50 rounded-lg p-1 border border-border/50">
                                {steps.map((step, index) => (
                                    <div key={step} className="flex items-center">
                                        <button
                                            onClick={() => delivery.status !== "DONE" && delivery.status !== "CANCELLED" && index <= currentStepIndex + 1 && handleStatusChange(step)}
                                            disabled={delivery.status === "DONE" || delivery.status === "CANCELLED" || index > currentStepIndex + 1 || loading}
                                            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${index === currentStepIndex
                                                ? "bg-primary text-primary-foreground shadow-sm"
                                                : index < currentStepIndex
                                                    ? "text-primary hover:bg-primary/10 cursor-pointer"
                                                    : index === currentStepIndex + 1 && delivery.status !== "DONE" && delivery.status !== "CANCELLED"
                                                        ? "text-muted-foreground hover:bg-muted cursor-pointer"
                                                        : "text-muted-foreground cursor-not-allowed"
                                                } ${(delivery.status === "DONE" || delivery.status === "CANCELLED") ? "cursor-not-allowed" : ""}`}
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
                        {delivery.status === "READY" && (
                            <Button
                                variant="default"
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={handleValidate}
                                disabled={loading || !allItemsPicked || !isPacked}
                            >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Validate & Ship
                            </Button>
                        )}
                        {(delivery.status === "DRAFT" || delivery.status === "WAITING" || delivery.status === "READY") && (
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
                        {delivery.status === "DRAFT" && (
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

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Main Content - Left 2/3 */}
                    <div className="md:col-span-2 space-y-6">
                        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg">Order Lines</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="hover:bg-transparent border-border/50">
                                            <TableHead className="w-[40%]">Product</TableHead>
                                            <TableHead className="w-[30%]">From</TableHead>
                                            <TableHead className="w-[20%]">Location</TableHead>
                                            <TableHead className="w-[10%] text-right">Quantity</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {delivery.items.map((item, index) => {
                                            const product = products.find(p => p.id === item.productId);
                                            const warehouse = warehouses.find(w => w.id === item.fromWarehouseId);
                                            return (
                                                <TableRow key={index} className="hover:bg-muted/50 border-border/50">
                                                    <TableCell>
                                                        <div className="font-medium">{product?.name || "Unknown Product"}</div>
                                                        <div className="text-xs text-muted-foreground">{product?.sku}</div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {warehouse?.name || "Unknown Warehouse"}
                                                    </TableCell>
                                                    <TableCell>
                                                        {item.fromLocation ? (
                                                            <Badge variant="outline">{item.fromLocation.name}</Badge>
                                                        ) : (
                                                            <span className="text-muted-foreground text-sm">-</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right font-mono">
                                                        {item.quantity}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        {/* Picking Operations - Only Visible in READY or DONE */}
                        {(delivery.status === "READY" || delivery.status === "DONE") && (
                            <Card className={`border-border/50 bg-card/50 backdrop-blur-sm ${delivery.status === "DONE" ? "opacity-75" : ""}`}>
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <PackageCheck className="h-5 w-5 text-primary" />
                                            Picking Operations
                                        </CardTitle>
                                        {delivery.status === "READY" && (
                                            <Badge variant={allItemsPicked ? "success" : "secondary"}>
                                                {Object.values(pickedItems).filter(Boolean).length} / {delivery.items.length} Picked
                                            </Badge>
                                        )}
                                    </div>
                                    <CardDescription>Check off items as they are picked from the warehouse</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {delivery.items.map((item) => {
                                            const product = products.find(p => p.id === item.productId);
                                            return (
                                                <div key={item.id} className="flex items-center space-x-4 p-3 border rounded-lg bg-background/50">
                                                    <Checkbox
                                                        id={`pick-${item.id}`}
                                                        checked={pickedItems[item.id] || delivery.status === "DONE"}
                                                        onCheckedChange={() => delivery.status === "READY" && togglePickItem(item.id)}
                                                        disabled={delivery.status === "DONE"}
                                                    />
                                                    <div className="flex-1">
                                                        <Label htmlFor={`pick-${item.id}`} className="font-medium cursor-pointer">
                                                            {product?.name}
                                                        </Label>
                                                        <p className="text-xs text-muted-foreground">Location: {item.fromLocation?.name || "General Stock"}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="font-mono font-bold">{item.quantity}</span> <span className="text-xs text-muted-foreground">{product?.uom}</span>
                                                    </div>
                                                </div>
                                            )
                                        })}

                                        {/* Packing Step */}
                                        {allItemsPicked && (
                                            <div className="mt-6 pt-6 border-t border-border/50">
                                                <div className="flex items-center space-x-4 p-4 border-2 border-dashed border-primary/20 rounded-lg bg-primary/5">
                                                    <Checkbox
                                                        id="pack-complete"
                                                        checked={isPacked || delivery.status === "DONE"}
                                                        onCheckedChange={(checked) => setIsPacked(checked)}
                                                        disabled={delivery.status === "DONE"}
                                                    />
                                                    <div className="flex-1">
                                                        <Label htmlFor="pack-complete" className="font-medium cursor-pointer flex items-center gap-2">
                                                            <Box className="h-4 w-4" />
                                                            Packing Completed
                                                        </Label>
                                                        <p className="text-xs text-muted-foreground">Items are packed and ready for shipping</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Sidebar - Info */}
                    <div className="space-y-6">
                        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="text-sm font-medium text-muted-foreground">Delivery Info</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label className="text-xs text-muted-foreground">Reference</Label>
                                    <div className="font-medium">{delivery.reference}</div>
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">Customer</Label>
                                    <div className="font-medium">{delivery.customer}</div>
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">Scheduled Date</Label>
                                    <div className="font-medium">{format(new Date(delivery.date), "PPP")}</div>
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">Status</Label>
                                    <div className="mt-1">
                                        <Badge variant="outline" className="capitalize">{delivery.status.toLowerCase()}</Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {delivery.status === "READY" && !allItemsPicked && (
                            <Card className="bg-yellow-500/10 border-yellow-500/20">
                                <CardContent className="p-4">
                                    <p className="text-sm text-yellow-600 dark:text-yellow-400 flex items-start gap-2">
                                        <Loader2 className="h-4 w-4 shrink-0 mt-0.5 animate-spin" />
                                        Please complete the picking checklist to validate this delivery.
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
