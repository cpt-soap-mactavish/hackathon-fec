"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus,
    Search,
    LayoutList,
    LayoutGrid,
    Package,
    Calendar,
    MapPin,
    ArrowRight
} from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageWrapper } from "@/components/PageWrapper";

export default function ReceiptsPage() {
    const [viewMode, setViewMode] = useState("list"); // 'list' or 'kanban'
    const [searchQuery, setSearchQuery] = useState("");
    const [receipts, setReceipts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReceipts();
    }, []);

    const fetchReceipts = async () => {
        try {
            const res = await fetch("/api/receipts");
            if (res.ok) {
                const data = await res.json();
                setReceipts(data);
            }
        } catch (error) {
            console.error("Failed to fetch receipts", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredReceipts = receipts.filter((receipt) =>
        receipt.reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        receipt.customer?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getStatusColor = (status) => {
        switch (status) {
            case "DRAFT":
                return "bg-gray-500/15 text-gray-600 dark:text-gray-400 border-gray-500/20";
            case "WAITING":
                return "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-500/20";
            case "READY":
                return "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20";
            case "DONE":
                return "bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/20";
            case "CANCELLED":
                return "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20";
            default:
                return "bg-primary/10 text-primary";
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case "DONE": return "Done";
            case "DRAFT": return "Draft";
            case "WAITING": return "Waiting";
            case "READY": return "Ready";
            case "CANCELLED": return "Cancelled";
            default: return status;
        }
    };

    return (
        <PageWrapper>
            <div className="flex flex-col space-y-6 p-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                            Receipt Operations
                        </h1>
                        <p className="text-muted-foreground">
                            Manage incoming stock and vendor shipments
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button asChild className="shadow-lg shadow-primary/20">
                            <Link href="/dashboard/receipts/create">
                                <Plus className="mr-2 h-4 w-4" />
                                NEW
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-card/50 p-2 rounded-lg border border-border/50 backdrop-blur-sm">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search Reference, Vendor..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-8 bg-background/50 border-border/50 focus:bg-background transition-colors"
                        />
                    </div>
                    <div className="flex items-center gap-1 bg-background/50 p-1 rounded-md border border-border/50">
                        <Button
                            variant={viewMode === "list" ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => setViewMode("list")}
                            className="h-8 w-8 p-0"
                        >
                            <LayoutList className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={viewMode === "kanban" ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => setViewMode("kanban")}
                            className="h-8 w-8 p-0"
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Content */}
                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center justify-center h-64"
                        >
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </motion.div>
                    ) : viewMode === "list" ? (
                        <motion.div
                            key="list"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.2 }}
                            className="rounded-md border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden"
                        >
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow>
                                        <TableHead>Reference</TableHead>
                                        <TableHead>From (Vendor)</TableHead>
                                        <TableHead>To (Warehouse)</TableHead>
                                        <TableHead>Contact</TableHead>
                                        <TableHead>Schedule Date</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredReceipts.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="h-24 text-center">
                                                No receipts found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredReceipts.map((receipt) => (
                                            <TableRow key={receipt.id} className="group hover:bg-muted/50 transition-colors">
                                                <TableCell className="font-medium">{receipt.reference}</TableCell>
                                                <TableCell>{receipt.customer || "N/A"}</TableCell>
                                                <TableCell>
                                                    {receipt.items[0]?.toWarehouse?.name || "N/A"}
                                                </TableCell>
                                                <TableCell>{receipt.responsible}</TableCell>
                                                <TableCell>
                                                    {receipt.date ? format(new Date(receipt.date), "PP") : "-"}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className={getStatusColor(receipt.status)}>
                                                        {getStatusLabel(receipt.status)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="icon" asChild className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Link href={`/dashboard/receipts/${receipt.id}`}>
                                                            <ArrowRight className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="kanban"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.2 }}
                            className="grid grid-cols-1 md:grid-cols-3 gap-6"
                        >
                            {["DRAFT", "READY", "DONE"].map((status) => (
                                <div key={status} className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold text-muted-foreground text-sm uppercase tracking-wider">
                                            {getStatusLabel(status)}
                                        </h3>
                                        <Badge variant="secondary" className="rounded-full px-2">
                                            {filteredReceipts.filter(d => d.status === status).length}
                                        </Badge>
                                    </div>
                                    <div className="space-y-3">
                                        {filteredReceipts
                                            .filter((d) => d.status === status)
                                            .map((receipt) => (
                                                <Card key={receipt.id} className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-colors cursor-pointer group">
                                                    <CardHeader className="p-4 pb-2">
                                                        <div className="flex justify-between items-start">
                                                            <CardTitle className="text-sm font-medium">
                                                                {receipt.reference}
                                                            </CardTitle>
                                                            <Badge variant="outline" className={getStatusColor(receipt.status)}>
                                                                {getStatusLabel(receipt.status)}
                                                            </Badge>
                                                        </div>
                                                        <CardDescription className="text-xs truncate">
                                                            {receipt.customer}
                                                        </CardDescription>
                                                    </CardHeader>
                                                    <CardContent className="p-4 pt-2 text-xs text-muted-foreground space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="h-3 w-3" />
                                                            {receipt.date ? format(new Date(receipt.date), "PP") : "-"}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <MapPin className="h-3 w-3" />
                                                            {receipt.items[0]?.toWarehouse?.name || "N/A"}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                            <span className="font-medium">From:</span>
                                                            <span>{receipt.customer || "N/A"}</span>
                                                        </div>
                                                    </CardContent>
                                                    <CardFooter className="p-4 pt-0 flex justify-end">
                                                        <Button variant="ghost" size="sm" asChild className="h-8 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Link href={`/dashboard/receipts/${receipt.id}`}>
                                                                View Details
                                                            </Link>
                                                        </Button>
                                                    </CardFooter>
                                                </Card>
                                            ))}
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </PageWrapper>
    );
}
