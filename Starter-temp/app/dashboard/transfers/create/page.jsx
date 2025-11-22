"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
    ArrowLeft,
    Save,
    ArrowRight,
    CheckCircle2
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PageWrapper } from "@/components/PageWrapper"
import { toast } from "sonner"

export default function CreateTransferPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [step, setStep] = useState(1)
    const [formData, setFormData] = useState({
        product: "",
        fromLocation: "",
        toLocation: "",
        quantity: "",
        notes: ""
    })

    const getProductName = (id) => {
        switch (id) {
            case "1": return "Laptop Pro X"
            case "2": return "Wireless Mouse"
            case "3": return "USB-C Cable"
            default: return "Unknown Product"
        }
    }

    const handleNext = () => {
        if (step === 1) {
            if (!formData.product || !formData.fromLocation || !formData.toLocation || !formData.quantity) {
                toast.error("Please fill in all required fields")
                return
            }
            if (formData.fromLocation === formData.toLocation) {
                toast.error("Source and destination locations cannot be the same")
                return
            }
        }
        setStep(step + 1)
    }

    const handleSubmit = async () => {
        setIsLoading(true)

        // Create new transfer object
        const newTransfer = {
            id: Math.random().toString(36).substr(2, 9),
            reference: `TRF-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
            product: getProductName(formData.product),
            from: formData.fromLocation,
            to: formData.toLocation,
            quantity: parseInt(formData.quantity),
            date: new Date().toISOString().split('T')[0],
            status: "Pending"
        }

        // Save to localStorage (Mock DB)
        const existingTransfers = JSON.parse(localStorage.getItem("mock_transfers") || "[]")
        localStorage.setItem("mock_transfers", JSON.stringify([newTransfer, ...existingTransfers]))

        setTimeout(() => {
            setIsLoading(false)
            toast.success("Transfer created successfully")
            router.push("/dashboard/transfers")
        }, 1000)
    }

    return (
        <PageWrapper className="min-h-screen bg-background p-6">
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/dashboard/transfers">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">New Transfer</h1>
                        <p className="text-muted-foreground">Move stock between internal locations</p>
                    </div>
                </div>

                <div className="flex items-center justify-center mb-8">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'} font-bold`}>1</div>
                    <div className={`w-20 h-1 ${step >= 2 ? 'bg-primary' : 'bg-muted'}`}></div>
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'} font-bold`}>2</div>
                </div>

                <Card className="border-primary/20 bg-card/50 backdrop-blur">
                    {step === 1 ? (
                        <>
                            <CardHeader>
                                <CardTitle>Transfer Details</CardTitle>
                                <CardDescription>Select product and locations for movement.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="product">Product</Label>
                                    <Select
                                        value={formData.product}
                                        onValueChange={(value) => setFormData({ ...formData, product: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select product" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">Laptop Pro X (SKU: LAP-PRO-001)</SelectItem>
                                            <SelectItem value="2">Wireless Mouse (SKU: ACC-MSE-002)</SelectItem>
                                            <SelectItem value="3">USB-C Cable (SKU: CBL-USB-004)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="from">From Location</Label>
                                        <Select
                                            value={formData.fromLocation}
                                            onValueChange={(value) => setFormData({ ...formData, fromLocation: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Source" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="wh-a-zone-a">Warehouse A / Zone A</SelectItem>
                                                <SelectItem value="wh-a-zone-b">Warehouse A / Zone B</SelectItem>
                                                <SelectItem value="wh-b">Warehouse B</SelectItem>
                                                <SelectItem value="wh-c">Warehouse C</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="to">To Location</Label>
                                        <Select
                                            value={formData.toLocation}
                                            onValueChange={(value) => setFormData({ ...formData, toLocation: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Destination" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="wh-a-zone-a">Warehouse A / Zone A</SelectItem>
                                                <SelectItem value="wh-a-zone-b">Warehouse A / Zone B</SelectItem>
                                                <SelectItem value="wh-b">Warehouse B</SelectItem>
                                                <SelectItem value="wh-c">Warehouse C</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="quantity">Quantity</Label>
                                    <Input
                                        id="quantity"
                                        type="number"
                                        placeholder="Enter quantity"
                                        value={formData.quantity}
                                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                    />
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-end">
                                <Button onClick={handleNext}>
                                    Next Step <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </CardFooter>
                        </>
                    ) : (
                        <>
                            <CardHeader>
                                <CardTitle>Review & Confirm</CardTitle>
                                <CardDescription>Please review the transfer details before confirming.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="rounded-lg border p-4 space-y-4 bg-muted/20">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div className="text-muted-foreground">Product:</div>
                                        <div className="font-medium">{getProductName(formData.product)}</div>

                                        <div className="text-muted-foreground">Quantity:</div>
                                        <div className="font-medium">{formData.quantity} units</div>

                                        <div className="text-muted-foreground">From:</div>
                                        <div className="font-medium text-red-500">{formData.fromLocation}</div>

                                        <div className="text-muted-foreground">To:</div>
                                        <div className="font-medium text-green-500">{formData.toLocation}</div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="notes">Notes (Optional)</Label>
                                    <Input
                                        id="notes"
                                        placeholder="Add any additional notes..."
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    />
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-between">
                                <Button variant="outline" onClick={() => setStep(1)}>
                                    Back
                                </Button>
                                <Button onClick={handleSubmit} disabled={isLoading}>
                                    {isLoading ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    ) : (
                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                    )}
                                    Confirm Transfer
                                </Button>
                            </CardFooter>
                        </>
                    )}
                </Card>
            </div >
        </PageWrapper >
    )
}
