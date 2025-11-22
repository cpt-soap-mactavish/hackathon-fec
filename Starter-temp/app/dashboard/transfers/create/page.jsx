"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, ArrowRight, Plus } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { PageWrapper } from "@/components/PageWrapper";

export default function CreateTransferPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [warehouses, setWarehouses] = useState([]);
    const [locations, setLocations] = useState([]); // All locations
    const [products, setProducts] = useState([]);

    const [formData, setFormData] = useState({
        sourceWarehouseId: "",
        sourceLocationId: "null", // "null" string to represent 'No specific location'
        destinationWarehouseId: "",
        destinationLocationId: "null",
        date: format(new Date(), "yyyy-MM-dd"),
        notes: "",
        items: [{ productId: "", quantity: 1 }]
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [whRes, locRes, prodRes] = await Promise.all([
                    fetch("/api/warehouses"),
                    fetch("/api/locations"),
                    fetch("/api/products")
                ]);

                if (whRes.ok) setWarehouses(await whRes.json());
                if (locRes.ok) setLocations(await locRes.json());
                if (prodRes.ok) setProducts(await prodRes.json());

            } catch (error) {
                console.error("Failed to fetch data:", error);
                toast.error("Failed to load form data");
            }
        };
        fetchData();
    }, []);

    // Filter locations based on selected warehouse
    const getWarehouseLocations = (warehouseId) => {
        return locations.filter(l => l.warehouseId === warehouseId);
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...formData.items];
        newItems[index][field] = value;
        setFormData({ ...formData, items: newItems });
    };

    const addItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { productId: "", quantity: 1 }]
        });
    };

    const removeItem = (index) => {
        const newItems = formData.items.filter((_, i) => i !== index);
        setFormData({ ...formData, items: newItems });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Validation: Source and Dest cannot be exactly the same
        if (formData.sourceWarehouseId === formData.destinationWarehouseId &&
            formData.sourceLocationId === formData.destinationLocationId) {
            toast.error("Source and Destination must be different (Warehouse or Location)");
            setLoading(false);
            return;
        }

        try {
            const apiData = {
                date: formData.date,
                notes: formData.notes,
                items: formData.items.map(item => ({
                    productId: item.productId,
                    quantity: parseInt(item.quantity),
                    fromWarehouseId: formData.sourceWarehouseId,
                    toWarehouseId: formData.destinationWarehouseId,
                    fromLocationId: formData.sourceLocationId === "null" ? null : formData.sourceLocationId,
                    toLocationId: formData.destinationLocationId === "null" ? null : formData.destinationLocationId,
                }))
            };

            const res = await fetch("/api/transfers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(apiData),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || "Failed to create transfer");
            }

            toast.success("Transfer created successfully");
            router.push("/dashboard/transfers");
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageWrapper>
            <div className="flex flex-col space-y-6 p-8 max-w-4xl mx-auto">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/dashboard/transfers">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-bold tracking-tight">New Transfer</h1>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Source */}
                        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle>Source (From)</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Warehouse</Label>
                                    <Select
                                        value={formData.sourceWarehouseId}
                                        onValueChange={(val) => setFormData({ ...formData, sourceWarehouseId: val, sourceLocationId: "null" })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Warehouse" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {warehouses.map((w) => (
                                                <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Location (Optional)</Label>
                                    <Select
                                        value={formData.sourceLocationId}
                                        onValueChange={(val) => setFormData({ ...formData, sourceLocationId: val })}
                                        disabled={!formData.sourceWarehouseId}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Location" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="null">-- Warehouse Default --</SelectItem>
                                            {getWarehouseLocations(formData.sourceWarehouseId).map((l) => (
                                                <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Destination */}
                        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle>Destination (To)</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Warehouse</Label>
                                    <Select
                                        value={formData.destinationWarehouseId}
                                        onValueChange={(val) => setFormData({ ...formData, destinationWarehouseId: val, destinationLocationId: "null" })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Warehouse" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {warehouses.map((w) => (
                                                <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Location (Optional)</Label>
                                    <Select
                                        value={formData.destinationLocationId}
                                        onValueChange={(val) => setFormData({ ...formData, destinationLocationId: val })}
                                        disabled={!formData.destinationWarehouseId}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Location" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="null">-- Warehouse Default --</SelectItem>
                                            {getWarehouseLocations(formData.destinationWarehouseId).map((l) => (
                                                <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Items */}
                    <Card className="mt-6 border-border/50 bg-card/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle>Items to Transfer</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {formData.items.map((item, index) => (
                                <div key={index} className="flex gap-4 items-end">
                                    <div className="flex-1 space-y-2">
                                        <Label>Product</Label>
                                        <Select
                                            value={item.productId}
                                            onValueChange={(val) => handleItemChange(index, "productId", val)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Product" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {products.map((p) => (
                                                    <SelectItem key={p.id} value={p.id}>{p.name} ({p.sku})</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="w-32 space-y-2">
                                        <Label>Quantity</Label>
                                        <Input
                                            type="number"
                                            min="1"
                                            value={item.quantity}
                                            onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                                        />
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        type="button"
                                        onClick={() => removeItem(index)}
                                        disabled={formData.items.length === 1}
                                    >
                                        <ArrowRight className="h-4 w-4 rotate-45" />
                                    </Button>
                                </div>
                            ))}
                            <Button type="button" variant="outline" onClick={addItem} className="mt-2">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Item
                            </Button>
                        </CardContent>
                    </Card>

                    <div className="mt-6 flex justify-end gap-4">
                        <Button variant="outline" type="button" onClick={() => router.back()}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Transfer
                        </Button>
                    </div>
                </form>
            </div>
        </PageWrapper>
    );
}
