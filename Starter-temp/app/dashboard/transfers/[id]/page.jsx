"use client";

import React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle, XCircle, Trash2, Loader2, ArrowRight } from "lucide-react";
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

export default function TransferDetailsPage({ params }) {
    const unwrappedParams = React.use(params);
    const { id } = unwrappedParams;

    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [transfer, setTransfer] = useState(null);

    useEffect(() => {
        const fetchTransfer = async () => {
            try {
                const res = await fetch(`/api/transfers/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setTransfer(data);
                } else {
                    toast.error("Transfer not found");
                    router.push("/dashboard/transfers");
                }
            } catch (error) {
                console.error("Error fetching transfer:", error);
                toast.error("Failed to load transfer");
            } finally {
                setLoading(false);
            }
        };
        fetchTransfer();
    }, [id, router]);

    const handleValidate = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/transfers/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "DONE" }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Validation failed");
            }

            toast.success("Transfer validated. Stock moved successfully.");
            setTransfer(data);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this transfer?")) return;

        try {
            setLoading(true);
            const res = await fetch(`/api/transfers/${id}`, {
                method: "DELETE",
            });

            if (!res.ok) throw new Error("Failed to delete");

            toast.success("Transfer deleted");
            router.push("/dashboard/transfers");
        } catch (error) {
            toast.error("Error deleting transfer");
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

    if (!transfer) return null;

    // Get warehouse info from first item
    const fromWarehouse = transfer.items[0]?.fromWarehouse;
    const toWarehouse = transfer.items[0]?.toWarehouse;
    const fromLocation = transfer.items[0]?.fromLocation;
    const toLocation = transfer.items[0]?.toLocation;

    return (
        <PageWrapper>
            <div className="flex flex-col space-y-6 p-8 max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/dashboard/transfers">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div className="flex flex-col">
                            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                                Transfer {transfer.reference}
                                <Badge variant="outline" className={
                                    transfer.status === "DONE" ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"
                                }>
                                    {transfer.status}
                                </Badge>
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                {format(new Date(transfer.date), "PPP")}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {transfer.status === "DRAFT" && (
                            <>
                                <Button
                                    variant="default"
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                    onClick={handleValidate}
                                    disabled={loading}
                                >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Validate & Move Stock
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

                {/* Movement Card */}
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between max-w-2xl mx-auto">
                            <div className="text-center">
                                <Label className="text-muted-foreground mb-2 block">Source (From)</Label>
                                <div className="text-xl font-bold">{fromWarehouse?.name}</div>
                                <div className="text-sm text-muted-foreground">{fromWarehouse?.location || "No Address"}</div>
                                {fromLocation && (
                                    <Badge variant="outline" className="mt-1">{fromLocation.name}</Badge>
                                )}
                            </div>

                            <div className="flex flex-col items-center px-8">
                                <ArrowRight className="h-8 w-8 text-muted-foreground mb-2" />
                                <Badge variant="secondary">Moving</Badge>
                            </div>

                            <div className="text-center">
                                <Label className="text-muted-foreground mb-2 block">Destination (To)</Label>
                                <div className="text-xl font-bold">{toWarehouse?.name}</div>
                                <div className="text-sm text-muted-foreground">{toWarehouse?.location || "No Address"}</div>
                                {toLocation && (
                                    <Badge variant="outline" className="mt-1">{toLocation.name}</Badge>
                                )}
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
                                    <TableHead className="w-[60%]">Product</TableHead>
                                    <TableHead className="w-[20%] text-right">Quantity</TableHead>
                                    <TableHead className="w-[20%]">UOM</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transfer.items.map((item, index) => (
                                    <TableRow key={index} className="hover:bg-muted/50 border-border/50">
                                        <TableCell>
                                            <div className="font-medium">{item.product?.name}</div>
                                            <div className="text-xs text-muted-foreground">{item.product?.sku}</div>
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

                {transfer.notes && (
                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-muted-foreground">Notes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>{transfer.notes}</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </PageWrapper>
    );
}
