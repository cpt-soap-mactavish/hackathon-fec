"use client";

import { useState, useEffect } from "react";
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

export default function CreateLocationPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [warehouses, setWarehouses] = useState([]);
    const [formData, setFormData] = useState({
        name: "",
        warehouseId: "",
    });

    useEffect(() => {
        const fetchWarehouses = async () => {
            try {
                const res = await fetch("/api/warehouses");
                if (res.ok) {
                    const data = await res.json();
                    setWarehouses(data);
                    if (data.length > 0) {
                        setFormData(prev => ({ ...prev, warehouseId: data[0].id }));
                    }
                }
            } catch (error) {
                console.error("Failed to fetch warehouses:", error);
            }
        };
        fetchWarehouses();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/locations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || "Failed to create location");
            }

            toast.success("Location created successfully");
            router.push("/dashboard/locations");
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
                        <Link href="/dashboard/locations">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-bold tracking-tight">New Location</h1>
                </div>

                <form onSubmit={handleSubmit}>
                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle>Location Details</CardTitle>
                            <CardDescription>
                                Define a specific spot (Rack, Bin, Zone) within a warehouse.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="warehouse">Parent Warehouse</Label>
                                <Select
                                    value={formData.warehouseId}
                                    onValueChange={(val) => setFormData({ ...formData, warehouseId: val })}
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
                                <Label htmlFor="name">Location Name</Label>
                                <Input
                                    id="name"
                                    placeholder="e.g. Rack A, Bin 101, Zone C"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="shortCode">Short Code</Label>
                                <Input
                                    id="shortCode"
                                    placeholder="e.g. R-A, B-101"
                                    value={formData.shortCode}
                                    onChange={(e) => setFormData({ ...formData, shortCode: e.target.value })}
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2">
                            <Button variant="outline" type="button" onClick={() => router.back()}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create Location
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </div>
        </PageWrapper>
    );
}
