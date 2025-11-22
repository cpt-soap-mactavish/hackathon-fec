"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, MapPin, Edit, Trash2, Loader2, Grid } from "lucide-react";

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
import { Badge } from "@/components/ui/badge";

export default function LocationsPage() {
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const res = await fetch("/api/locations");
                if (res.ok) {
                    const data = await res.json();
                    setLocations(data);
                }
            } catch (error) {
                console.error("Failed to fetch locations:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLocations();
    }, []);

    return (
        <PageWrapper>
            <div className="flex flex-col space-y-6 p-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Locations</h1>
                        <p className="text-muted-foreground">
                            Manage Racks, Bins, and Zones within your warehouses
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/dashboard/locations/create">
                            <Plus className="mr-2 h-4 w-4" />
                            New Location
                        </Link>
                    </Button>
                </div>

                {/* Locations Grid */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : locations.length === 0 ? (
                    <div className="text-center py-12 border border-dashed rounded-lg">
                        <Grid className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium">No locations found</h3>
                        <p className="text-muted-foreground mb-4">Define racks or bins to organize your stock.</p>
                        <Button asChild>
                            <Link href="/dashboard/locations/create">
                                Create Location
                            </Link>
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {locations.map((location) => (
                            <Card key={location.id} className="border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-colors">
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <span className="truncate">{location.name}</span>
                                        <Grid className="h-4 w-4 text-muted-foreground" />
                                    </CardTitle>
                                    <CardDescription className="flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        {location.warehouse?.name || "Unknown Warehouse"}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-sm text-muted-foreground">
                                        ID: <span className="font-mono text-xs">{location.id}</span>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-end gap-2">
                                    <Button variant="ghost" size="sm" asChild>
                                        <Link href={`/dashboard/locations/${location.id}`}>
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
