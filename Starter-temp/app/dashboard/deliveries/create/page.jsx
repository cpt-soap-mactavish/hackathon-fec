"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Plus, Trash2, Loader2, Printer, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
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
import { Badge } from "@/components/ui/badge";
import { PageWrapper } from "@/components/PageWrapper";

export default function CreateDeliveryPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [currentStatus, setCurrentStatus] = useState("DRAFT"); // DRAFT, WAITING, READY, DONE

    const [formData, setFormData] = useState({
        reference: "WH/OUT/NEW", // Placeholder, real ref generated on backend or here
        customer: "",
        date: new Date().toISOString().split('T')[0],
        responsible: "",
        operationType: "Delivery Orders",
        sourceWarehouseId: "",
        items: [
            { productId: "", warehouseId: "", quantity: 1 }
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
                const [productsRes, warehousesRes] = await Promise.all([
                    fetch("/api/products"),
                    fetch("/api/warehouses")
                ]);

                if (productsRes.ok) {
                    const productsData = await productsRes.json();
                    setProducts(productsData);
                }
                if (warehousesRes.ok) {
                    const warehousesData = await warehousesRes.json();
                    setWarehouses(warehousesData);
                    // Set default warehouse for new items if available
                    if (warehousesData.length > 0) {
                        setFormData(prev => ({
                            ...prev,
                            sourceWarehouseId: warehousesData[0].id,
                            items: prev.items.map(item => ({ ...item, warehouseId: warehousesData[0].id }))
                        }));
                    }
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("Failed to load products or warehouses");
            }
        };
        fetchData();
    }, []);

    const handleAddItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { productId: "", warehouseId: formData.sourceWarehouseId || warehouses[0]?.id || "", quantity: 1 }]
        });
    };

    const handleRemoveItem = (index) => {
        const newItems = [...formData.items];
        newItems.splice(index, 1);
        setFormData({ ...formData, items: newItems });
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...formData.items];
        newItems[index][field] = value;
        setFormData({ ...formData, items: newItems });
    };

    const checkStock = (productId, warehouseId, quantity) => {
        const product = products.find(p => p.id === productId);
        if (!product) return true; // Can't check if product not found
        const stock = product.stocks.find(s => s.warehouseId === warehouseId);
        const available = stock ? stock.quantity : 0;
        return available >= quantity;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/deliveries", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error("Failed to create delivery");

            toast.success("Delivery created successfully");
            router.push("/dashboard/deliveries");
        } catch (error) {
            toast.error("Error creating delivery");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const steps = ["DRAFT", "WAITING", "READY", "DONE"];
    const currentStepIndex = steps.indexOf(currentStatus);

    return (
        <PageWrapper>
            <div className="flex flex-col space-y-6 p-8 max-w-5xl mx-auto">
                {/* Header & Actions */}
                <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" asChild>
                                <Link href="/dashboard/deliveries">
                                    <ArrowLeft className="h-4 w-4" />
                                </Link>
                            </Button>
                            <h1 className="text-2xl font-bold tracking-tight">Delivery</h1>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center bg-muted/50 rounded-lg p-1 border border-border/50">
                                {steps.map((step, index) => (
                                    <div key={step} className="flex items-center">
                                        <div
                                            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${index === currentStepIndex
                                                ? "bg-primary text-primary-foreground shadow-sm"
                                                : index < currentStepIndex
                                                    ? "text-primary"
                                                    : "text-muted-foreground"
                                                }`}
                                        >
                                            {step.charAt(0) + step.slice(1).toLowerCase()}
                                        </div>
                                        {index < steps.length - 1 && (
                                            <div className="h-4 w-px bg-border mx-1" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            className="border-primary/50 text-primary hover:bg-primary/10"
                            onClick={handleSubmit} // For now, Validate just saves (creates) the draft. Real validation happens on detail page or separate action.
                        >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Validate
                        </Button>
                        <Button variant="outline" onClick={handlePrint}>
                            <Printer className="mr-2 h-4 w-4" />
                            Print
                        </Button>
                        <Button variant="outline" onClick={() => router.back()}>
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancel
                        </Button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                        <CardContent className="p-6 grid gap-6 md:grid-cols-2">
                            {/* Left Column */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-muted-foreground">Reference</Label>
                                    <div className="font-medium text-lg">{formData.reference}</div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="customer">Customer (To/Contact)</Label>
                                    <Input
                                        id="customer"
                                        placeholder="Select Customer..."
                                        value={formData.customer}
                                        onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                                        required
                                        className="border-x-0 border-t-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary bg-transparent"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="responsible">Responsible</Label>
                                    <Input
                                        id="responsible"
                                        value={formData.responsible}
                                        readOnly
                                        className="border-x-0 border-t-0 border-b rounded-none px-0 focus-visible:ring-0 bg-transparent"
                                    />
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="date">Schedule Date</Label>
                                    <Input
                                        id="date"
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        required
                                        className="border-x-0 border-t-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary bg-transparent"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="operationType">Operation Type</Label>
                                    <Select
                                        value={formData.operationType}
                                        onValueChange={(val) => setFormData({ ...formData, operationType: val })}
                                    >
                                        <SelectTrigger className="border-x-0 border-t-0 border-b rounded-none px-0 focus:ring-0 bg-transparent">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Delivery Orders">Delivery Orders</SelectItem>
                                            <SelectItem value="Dropship">Dropship</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="sourceWarehouse">Source Warehouse (From)</Label>
                                    <Select
                                        value={formData.sourceWarehouseId}
                                        onValueChange={(val) => {
                                            setFormData(prev => ({
                                                ...prev,
                                                sourceWarehouseId: val,
                                                items: prev.items.map(item => ({ ...item, warehouseId: val }))
                                            }));
                                        }}
                                    >
                                        <SelectTrigger className="border-x-0 border-t-0 border-b rounded-none px-0 focus:ring-0 bg-transparent">
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
                                        <TableHead className="w-[30%]">From</TableHead>
                                        <TableHead className="w-[20%]">Quantity</TableHead>
                                        <TableHead className="w-[10%]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {formData.items.map((item, index) => {
                                        const isStockAvailable = checkStock(item.productId, item.warehouseId, item.quantity);
                                        return (
                                            <TableRow
                                                key={index}
                                                className={`hover:bg-muted/50 border-border/50 ${!isStockAvailable && item.productId ? "bg-destructive/10 hover:bg-destructive/15" : ""}`}
                                            >
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
                                                    {!isStockAvailable && item.productId && (
                                                        <div className="text-xs text-destructive mt-1">Not enough stock available</div>
                                                    )}
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
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        value={item.quantity}
                                                        onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                                                        className="border-0 bg-transparent focus-visible:ring-0 p-0 h-auto w-20"
                                                    />
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
                                        <TableCell colSpan={4}>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="text-primary hover:text-primary/80 hover:bg-transparent p-0 h-auto font-normal"
                                                onClick={handleAddItem}
                                            >
                                                Add New Product
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
