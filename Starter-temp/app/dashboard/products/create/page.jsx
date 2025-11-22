"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

export default function CreateProductPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        sku: "",
        category: "",
        uom: "Units",
        minStock: "0",
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || "Failed to create product");
            }

            toast.success("Product created successfully");
            router.push("/dashboard/products");
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageWrapper>
            <div className="flex flex-col space-y-6 p-8 max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/dashboard/products">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-bold tracking-tight">New Product</h1>
                </div>

                <form onSubmit={handleSubmit}>
                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle>Product Details</CardTitle>
                            <CardDescription>
                                Add a new item to your inventory catalog.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Product Name</Label>
                                <Input
                                    id="name"
                                    placeholder="e.g. Steel Rod 10mm"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="sku">SKU / Code</Label>
                                    <Input
                                        id="sku"
                                        placeholder="e.g. SR-10-MM"
                                        value={formData.sku}
                                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="category">Category</Label>
                                    <Select
                                        value={formData.category}
                                        onValueChange={(val) => setFormData({ ...formData, category: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Raw Materials">Raw Materials</SelectItem>
                                            <SelectItem value="Finished Goods">Finished Goods</SelectItem>
                                            <SelectItem value="Packaging">Packaging</SelectItem>
                                            <SelectItem value="Spares">Spares</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="uom">Unit of Measure (UOM)</Label>
                                    <Select
                                        value={formData.uom}
                                        onValueChange={(val) => setFormData({ ...formData, uom: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select UOM" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Units">Units</SelectItem>
                                            <SelectItem value="Kg">Kg</SelectItem>
                                            <SelectItem value="Meters">Meters</SelectItem>
                                            <SelectItem value="Liters">Liters</SelectItem>
                                            <SelectItem value="Box">Box</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="minStock">Min Stock Alert</Label>
                                    <Input
                                        id="minStock"
                                        type="number"
                                        min="0"
                                        value={formData.minStock}
                                        onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                                    />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2">
                            <Button variant="outline" type="button" onClick={() => router.back()}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create Product
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </div>
        </PageWrapper>
    );
}
