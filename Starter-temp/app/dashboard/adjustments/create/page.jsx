"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";
import { toast } from "sonner";

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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { PageWrapper } from "@/components/PageWrapper";

export default function CreateAdjustmentPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [locations, setLocations] = useState([]);

    const [formData, setFormData] = useState({
        reference: `ADJ/${new Date().getFullYear()}/${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        reason: "",
        responsible: "",
        items: [
            { productId: "", warehouseId: "", locationId: "null", currentQty: 0, adjustment: 0 }
        ]
    });

    useEffect(() => {
        if (session?.user) {
            setFormData(prev => ({
                ...prev,
                responsible: session.user.name || session.user.username || "Unknown User"
            }));
        }
    }, [session]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productsRes, warehousesRes, locationsRes] = await Promise.all([
                    fetch("/api/products"),
                    fetch("/api/warehouses"),
                    fetch("/api/locations")
                ]);

                if (productsRes.ok) {
                    const productsData = await productsRes.json();
                    setProducts(productsData);
                }
                if (warehousesRes.ok) {
                    const warehousesData = await warehousesRes.json();
                    setWarehouses(warehousesData);
                }
                if (locationsRes.ok) {
                    const locationsData = await locationsRes.json();
                    setLocations(locationsData);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("Failed to load data");
            }
        };
        fetchData();
    }, []);

    const handleAddItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { productId: "", warehouseId: "", locationId: "null", currentQty: 0, adjustment: 0 }]
        });
    };

    const handleRemoveItem = (index) => {
        const newItems = [...formData.items];
        newItems.splice(index, 1);
        setFormData({ ...formData, items: newItems });
    };

    const handleItemChange = async (index, field, value) => {
        const newItems = [...formData.items];
        newItems[index][field] = value;

        // If product, warehouse, or location changes, fetch current stock
        if (field === "productId" || field === "warehouseId" || field === "locationId") {
            const item = newItems[index];
            if (item.productId && item.warehouseId) {
                try {
                    const product = products.find(p => p.id === item.productId);
                    if (product && product.stocks) {
                        const stock = product.stocks.find(s =>
                            s.warehouseId === item.warehouseId &&
                            (item.locationId === "null" ? s.locationId === null : s.locationId === item.locationId)
                        );
                        newItems[index].currentQty = stock ? stock.quantity : 0;
                    }
                } catch (error) {
                    console.error("Error fetching stock:", error);
                }
            }
        }

        setFormData({ ...formData, items: newItems });
    };

    const getWarehouseLocations = (warehouseId) => {
        return locations.filter(l => l.warehouseId === warehouseId);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.reason.trim()) {
            toast.error("Reason is required for adjustments");
            return;
        }

        if (formData.items.some(item => !item.productId || !item.warehouseId)) {
            toast.error("Please select product and warehouse for all items");
            return;
        }

        if (formData.items.some(item => item.adjustment === 0)) {
            toast.error("Adjustment cannot be zero");
            return;
        }

        setLoading(true);

        try {
            const payload = {
                reference: formData.reference,
                date: formData.date,
                reason: formData.reason,
                responsible: formData.responsible,
                items: formData.items.map(item => ({
                    productId: item.productId,
                    warehouseId: item.warehouseId,
                    locationId: item.locationId === "null" ? null : item.locationId,
                    difference: parseInt(item.adjustment), // The adjustment amount
                    countedQty: item.currentQty + parseInt(item.adjustment) // For reference
                }))
            };

            const res = await fetch("/api/adjustments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to create adjustment");
            }

            toast.success("Adjustment created successfully");
            router.push("/dashboard/adjustments");
        } catch (error) {
            toast.error(error.message);
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageWrapper>
            <div className="flex flex-col space-y-6 p-8 max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/dashboard/adjustments">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">New Stock Adjustment</h1>
                            <p className="text-sm text-muted-foreground">Correct inventory discrepancies</p>
                        </div>
                    </div>
                    <Button onClick={handleSubmit} disabled={loading}>
                        <Save className="mr-2 h-4 w-4" />
                        {loading ? "Saving..." : "Save Draft"}
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Info Card */}
                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                        <CardContent className="p-6 grid gap-6 md:grid-cols-2">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-muted-foreground">Reference</Label>
                                    <div className="font-medium text-lg">{formData.reference}</div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="reason">Reason *</Label>
                                    <Textarea
                                        id="reason"
                                        placeholder="e.g., Physical count discrepancy, damaged goods, etc."
                                        value={formData.reason}
                                        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                        required
                                        rows={3}
                                        className="resize-none"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="date">Date</Label>
                                    <Input
                                        id="date"
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="responsible">Responsible</Label>
                                    <Input
                                        id="responsible"
                                        value={formData.responsible}
                                        readOnly
                                        className="bg-muted"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Items Table */}
                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg">Adjustment Items</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent border-border/50">
                                        <TableHead className="w-[25%]">Product</TableHead>
                                        <TableHead className="w-[20%]">Warehouse</TableHead>
                                        <TableHead className="w-[15%]">Location</TableHead>
                                        <TableHead className="w-[15%]">Current Stock</TableHead>
                                        <TableHead className="w-[15%]">Adjustment</TableHead>
                                        <TableHead className="w-[10%]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {formData.items.map((item, index) => {
                                        const newQty = item.currentQty + parseInt(item.adjustment || 0);
                                        const isPositive = parseInt(item.adjustment || 0) > 0;
                                        const isNegative = parseInt(item.adjustment || 0) < 0;

                                        return (
                                            <TableRow key={index} className="hover:bg-muted/50 border-border/50">
                                                <TableCell>
                                                    <Select
                                                        value={item.productId}
                                                        onValueChange={(val) => handleItemChange(index, "productId", val)}
                                                    >
                                                        <SelectTrigger className="border-0 bg-transparent focus:ring-0 p-0 h-auto">
                                                            <SelectValue placeholder="Select Product" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {products.map((p) => (
                                                                <SelectItem key={p.id} value={p.id}>
                                                                    {p.name} <span className="text-muted-foreground text-xs">[{p.sku}]</span>
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                                <TableCell>
                                                    <Select
                                                        value={item.warehouseId}
                                                        onValueChange={(val) => handleItemChange(index, "warehouseId", val)}
                                                    >
                                                        <SelectTrigger className="border-0 bg-transparent focus:ring-0 p-0 h-auto">
                                                            <SelectValue placeholder="Select Warehouse" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {warehouses.map((w) => (
                                                                <SelectItem key={w.id} value={w.id}>
                                                                    {w.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                                <TableCell>
                                                    <Select
                                                        value={item.locationId}
                                                        onValueChange={(val) => handleItemChange(index, "locationId", val)}
                                                        disabled={!item.warehouseId}
                                                    >
                                                        <SelectTrigger className="border-0 bg-transparent focus:ring-0 p-0 h-auto">
                                                            <SelectValue placeholder="Location" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="null">-- Default --</SelectItem>
                                                            {getWarehouseLocations(item.warehouseId).map((l) => (
                                                                <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-mono font-medium">{item.currentQty}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        type="number"
                                                        placeholder="+/- qty"
                                                        value={item.adjustment}
                                                        onChange={(e) => handleItemChange(index, "adjustment", e.target.value)}
                                                        className={`border-0 bg-transparent focus-visible:ring-0 p-0 h-auto w-20 font-mono ${isPositive ? "text-green-600" : isNegative ? "text-red-600" : ""
                                                            }`}
                                                    />
                                                    {item.adjustment != 0 && (
                                                        <div className="text-xs text-muted-foreground mt-1">
                                                            → {newQty}
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                        onClick={() => handleRemoveItem(index)}
                                                        disabled={formData.items.length === 1}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                    <TableRow className="hover:bg-transparent border-0">
                                        <TableCell colSpan={6}>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="text-primary hover:text-primary/80 hover:bg-transparent p-0 h-auto font-normal"
                                                onClick={handleAddItem}
                                            >
                                                <Plus className="mr-2 h-4 w-4" />
                                                Add Item
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </PageWrapper>
    );
}
