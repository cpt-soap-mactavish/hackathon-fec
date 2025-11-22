"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, Plus, Trash2 } from "lucide-react";
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
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { PageWrapper } from "@/components/PageWrapper";

export default function CreateReceiptPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [warehouses, setWarehouses] = useState([]);
    const [locations, setLocations] = useState([]);
    const [products, setProducts] = useState([]);

    const [formData, setFormData] = useState({
        vendor: "",
        reference: `WH/IN/${new Date().getFullYear()}/${Date.now()}`,
        date: format(new Date(), "yyyy-MM-dd"),
        toWarehouseId: "",
        notes: "",
        items: [{ productId: "", quantity: 1, toLocationId: "null" }]
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
            items: [...formData.items, { productId: "", quantity: 1, toLocationId: "null" }]
        });
    };

    const removeItem = (index) => {
        const newItems = formData.items.filter((_, i) => i !== index);
        setFormData({ ...formData, items: newItems });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!formData.toWarehouseId) {
            toast.error("Please select a destination warehouse");
            setLoading(false);
            return;
        }

        try {
            const apiData = {
                ...formData,
                items: formData.items.map(item => ({
                    ...item,
                    toLocationId: item.toLocationId === "null" ? null : item.toLocationId
                }))
            };

            const res = await fetch("/api/receipts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(apiData),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || "Failed to create receipt");
            }

            toast.success("Receipt created successfully");
            router.push("/dashboard/receipts");
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
                        <Link href="/dashboard/receipts">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-bold tracking-tight">New Receipt</h1>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle>General Info</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Vendor Name</Label>
                                    <Input
                                        placeholder="e.g. Steel Suppliers Inc."
                                        value={formData.vendor}
                                        onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-muted-foreground">Reference</Label>
                                    <div className="font-medium text-lg">{formData.reference}</div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Date</Label>
                                    <Input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        required
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle>Destination</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Warehouse</Label>
                                    <Select
                                        value={formData.toWarehouseId}
                                        onValueChange={(val) => setFormData({ ...formData, toWarehouseId: val })}
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
                                    <Label>Notes</Label>
                                    <Textarea
                                        placeholder="Additional notes..."
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Items */}
                    <Card className="mt-6 border-border/50 bg-card/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle>Items to Receive</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {formData.items.map((item, index) => (
                                <div key={index} className="flex gap-4 items-end border-b pb-4 last:border-0 last:pb-0">
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
                                    <div className="w-48 space-y-2">
                                        <Label>Location (Optional)</Label>
                                        <Select
                                            value={item.toLocationId}
                                            onValueChange={(val) => handleItemChange(index, "toLocationId", val)}
                                            disabled={!formData.toWarehouseId}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Location" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="null">-- Default --</SelectItem>
                                                {getWarehouseLocations(formData.toWarehouseId).map((l) => (
                                                    <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        type="button"
                                        className="text-destructive"
                                        onClick={() => removeItem(index)}
                                        disabled={formData.items.length === 1}
                                    >
                                        <Trash2 className="h-4 w-4" />
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
                            Create Draft Receipt
                        </Button>
                    </div>
                </form>
            </div>
        </PageWrapper>
    );
}
