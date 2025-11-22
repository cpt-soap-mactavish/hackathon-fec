"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, MapPin, Edit, Trash2, Loader2, Warehouse } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter,
} from "@/components/ui/card";
import { PageWrapper } from "@/components/PageWrapper";

export default function WarehousesPage() {
    const [warehouses, setWarehouses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWarehouses = async () => {
            try {
                const res = await fetch("/api/warehouses");
                if (res.ok) {
                    const data = await res.json();
                    setWarehouses(data);
                }
            } catch (error) {
                console.error("Failed to fetch warehouses:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchWarehouses();
    }, []);

    return (
        <PageWrapper>
            <div className="flex flex-col space-y-6 p-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Warehouses</h1>
                        <p className="text-muted-foreground">
                            Manage your physical inventory locations
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/dashboard/warehouses/create">
                            <Plus className="mr-2 h-4 w-4" />
                            New Warehouse
                        </Link>
                    </Button>
                </div>

                {/* Warehouses Grid */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : warehouses.length === 0 ? (
                    <div className="text-center py-12 border border-dashed rounded-lg">
                        <Warehouse className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium">No warehouses found</h3>
                        <p className="text-muted-foreground mb-4">Create your first warehouse to get started.</p>
                        <Button asChild>
                            <Link href="/dashboard/warehouses/create">
                                Create Warehouse
                            </Link>
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {warehouses.map((warehouse) => (
                            <Card key={warehouse.id} className="border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-colors">
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <span className="truncate">{warehouse.name}</span>
                                        <Warehouse className="h-4 w-4 text-muted-foreground" />
                                    </CardTitle>
                                    <CardDescription className="flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        {warehouse.location || "No location specified"}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {/* Future: Add stats like "Total Items", "Value" here */}
                                    <div className="text-sm text-muted-foreground">
                                        ID: <span className="font-mono text-xs">{warehouse.id}</span>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-end gap-2">
                                    <Button variant="ghost" size="sm" asChild>
                                        <Link href={`/dashboard/warehouses/${warehouse.id}`}>
                                            <Edit className="h-4 w-4 mr-2" />
                                            Edit
                                        </Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </PageWrapper>
    );
}
