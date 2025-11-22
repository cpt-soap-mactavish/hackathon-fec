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

export default function CreateReceiptPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [currentStatus, setCurrentStatus] = useState("DRAFT"); // DRAFT, READY, DONE

    const [formData, setFormData] = useState({
        reference: "WH/IN/NEW", // Placeholder
        vendor: "",
        date: new Date().toISOString().split('T')[0],
        responsible: "",
        operationType: "Receipts",
        destinationWarehouseId: "",
        items: [
            { productId: "", warehouseId: "", quantity: 1 }
        ]
    });

    useEffect(() => {
        if (session?.user) {
            setFormData(prev => ({
                ...prev,
                responsible: session.user.username || session.user.name || session.user.email || "Unknown User"
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
                            destinationWarehouseId: warehousesData[0].id,
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
            items: [...formData.items, { productId: "", warehouseId: formData.destinationWarehouseId || warehouses[0]?.id || "", quantity: 1 }]
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate items
        const invalidItems = formData.items.filter(item => !item.productId);
        if (invalidItems.length > 0) {
            toast.error("Please select a product for all items");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/receipts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error("Failed to create receipt");

            toast.success("Receipt created successfully");
            router.push("/dashboard/receipts");
        } catch (error) {
            toast.error("Error creating receipt");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const steps = ["DRAFT", "READY", "DONE"];
    const currentStepIndex = steps.indexOf(currentStatus);

    return (
        <PageWrapper>
            <div className="flex flex-col space-y-6 p-8 max-w-5xl mx-auto">
                {/* Header & Actions */}
                <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" asChild>
                                <Link href="/dashboard/receipts">
                                    <ArrowLeft className="h-4 w-4" />
                                </Link>
                            </Button>
                            <h1 className="text-2xl font-bold tracking-tight">New Receipt</h1>
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
                            onClick={handleSubmit}
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
                                    <Label htmlFor="vendor">Vendor (From/Supplier)</Label>
                                    <Input
                                        id="vendor"
                                        placeholder="Select Vendor..."
                                        value={formData.vendor}
                                        onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                                        required
                                        className="border-x-0 border-t-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary bg-transparent"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Responsible</Label>
                                    <div className="text-sm font-medium px-3 py-2 border-b border-border/50 text-muted-foreground">
                                        {formData.responsible || "..."}
                                    </div>
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
                                            <SelectItem value="Receipts">Receipts</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="destinationWarehouse">Destination Warehouse</Label>
                                    <Select
                                        value={formData.destinationWarehouseId}
                                        onValueChange={(val) => {
                                            setFormData(prev => ({
                                                ...prev,
                                                destinationWarehouseId: val,
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
                        <CardHeader>
                            <CardTitle>Products</CardTitle>
                            <CardDescription>Add products to be received</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent border-border/50">
                                        <TableHead className="w-[60%]">Product</TableHead>
                                        <TableHead className="w-[30%]">Quantity</TableHead>
                                        <TableHead className="w-[10%]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {formData.items.map((item, index) => (
                                        <TableRow
                                            key={index}
                                            className="hover:bg-muted/50 border-border/50"
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
                                    ))}
                                    <TableRow className="hover:bg-transparent border-0">
                                        <TableCell colSpan={3}>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="text-primary hover:text-primary/80 hover:bg-transparent p-0 h-auto font-normal"
                                                onClick={handleAddItem}
                                            >
                                                <Plus className="mr-2 h-4 w-4" />
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
