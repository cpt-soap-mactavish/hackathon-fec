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
import { PageWrapper } from "@/components/PageWrapper";

export default function EditWarehousePage({ params }) {
    const unwrappedParams = React.use(params);
    const { id } = unwrappedParams;

    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        location: "",
    });

    useEffect(() => {
        const fetchWarehouse = async () => {
            try {
                const res = await fetch(`/api/warehouses/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setFormData({
                        name: data.name,
                        shortCode: data.shortCode || "",
                        location: data.location || "",
                    });
                } else {
                    toast.error("Warehouse not found");
                    router.push("/dashboard/warehouses");
                }
            } catch (error) {
                console.error("Error fetching warehouse:", error);
                toast.error("Failed to load warehouse");
            } finally {
                setLoading(false);
            }
        };
        fetchWarehouse();
    }, [id, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const res = await fetch(`/api/warehouses/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error("Failed to update warehouse");

            toast.success("Warehouse updated successfully");
            router.push("/dashboard/warehouses");
        } catch (error) {
            toast.error(error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this warehouse? This action cannot be undone.")) return;

        setSaving(true);
        try {
            const res = await fetch(`/api/warehouses/${id}`, {
                method: "DELETE",
            });

            if (!res.ok) throw new Error("Failed to delete warehouse");

            toast.success("Warehouse deleted");
            router.push("/dashboard/warehouses");
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
                            <Link href="/dashboard/warehouses">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <h1 className="text-2xl font-bold tracking-tight">Edit Warehouse</h1>
                    </div>
                    <Button variant="destructive" size="sm" onClick={handleDelete} disabled={saving}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                    </Button>
                </div>

                <form onSubmit={handleSubmit}>
                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle>Warehouse Details</CardTitle>
                            <CardDescription>
                                Update the details for this storage location.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
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
                            <div className="space-y-2">
                                <Label htmlFor="location">Address</Label>
                                <Input
                                    id="location"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
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
