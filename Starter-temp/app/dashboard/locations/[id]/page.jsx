"use client";

import React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Trash2, Loader2 } from "lucide-react";
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

export default function EditLocationPage({ params }) {
    const unwrappedParams = React.use(params);
    const { id } = unwrappedParams;

    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [warehouses, setWarehouses] = useState([]);
    const [formData, setFormData] = useState({
        name: "",
        warehouseId: "",
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [locationRes, warehousesRes] = await Promise.all([
                    fetch(`/api/locations/${id}`),
                    fetch("/api/warehouses")
                ]);

                if (warehousesRes.ok) {
                    setWarehouses(await warehousesRes.json());
                }

                if (locationRes.ok) {
                    const data = await locationRes.json();
                    setFormData({
                        name: data.name,
                        warehouseId: data.warehouseId,
                        shortCode: data.shortCode || "",
                    });
                } else {
                    toast.error("Location not found");
                    router.push("/dashboard/locations");
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("Failed to load data");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const res = await fetch(`/api/locations/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error("Failed to update location");

            toast.success("Location updated successfully");
            router.push("/dashboard/locations");
        } catch (error) {
            toast.error(error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this location?")) return;

        setSaving(true);
        try {
            const res = await fetch(`/api/locations/${id}`, {
                method: "DELETE",
            });

            if (!res.ok) throw new Error("Failed to delete location");

            toast.success("Location deleted");
            router.push("/dashboard/locations");
        } catch (error) {
            toast.error(error.message);
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <PageWrapper className="flex justify-center items-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </PageWrapper>
        );
    }

    return (
        <PageWrapper>
            <div className="flex flex-col space-y-6 p-8 max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/dashboard/locations">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <h1 className="text-2xl font-bold tracking-tight">Edit Location</h1>
                    </div>
                    <Button variant="destructive" size="sm" onClick={handleDelete} disabled={saving}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                    </Button>
                </div>

                <form onSubmit={handleSubmit}>
                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle>Location Details</CardTitle>
                            <CardDescription>
                                Update details for this rack or bin.
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
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="shortCode">Short Code</Label>
                                <Input
                                    id="shortCode"
                                    value={formData.shortCode}
                                    onChange={(e) => setFormData({ ...formData, shortCode: e.target.value })}
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2">
                            <Button variant="outline" type="button" onClick={() => router.back()}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={saving}>
                                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </div>
        </PageWrapper>
    );
}
