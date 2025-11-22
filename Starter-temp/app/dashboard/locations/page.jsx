"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import {
    Search,
    Plus,
    MoreHorizontal,
    Warehouse,
    Grid,
    Box,
    ChevronRight,
    ChevronDown
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PageWrapper } from "@/components/PageWrapper"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

export default function LocationsPage() {
    const { data: session } = useSession()
    const [isLoading, setIsLoading] = useState(true)
    const [locations, setLocations] = useState([])
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        // Simulate fetching data
        const timer = setTimeout(() => {
            setLocations([
                {
                    id: "1",
                    name: "Main Warehouse",
                    type: "WAREHOUSE",
                    location: "New York, NY",
                    children: [
                        {
                            id: "1-1", name: "Zone A", type: "ZONE", children: [
                                { id: "1-1-1", name: "Rack A1", type: "RACK" },
                                { id: "1-1-2", name: "Rack A2", type: "RACK" },
                            ]
                        },
                        {
                            id: "1-2", name: "Zone B", type: "ZONE", children: [
                                { id: "1-2-1", name: "Rack B1", type: "RACK" },
                            ]
                        },
                    ]
                },
                {
                    id: "2",
                    name: "Distribution Center",
                    type: "WAREHOUSE",
                    location: "Chicago, IL",
                    children: [
                        { id: "2-1", name: "Cold Storage", type: "ZONE", children: [] }
                    ]
                },
            ])
            setIsLoading(false)
        }, 1000)

        return () => clearTimeout(timer)
    }, [])

    const LocationItem = ({ item, level = 0 }) => {
        const [isOpen, setIsOpen] = useState(false)
        const hasChildren = item.children && item.children.length > 0

        return (
            <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
                <div className="flex items-center justify-between p-2 hover:bg-accent/50 rounded-lg group">
                    <div className="flex items-center gap-2" style={{ paddingLeft: `${level * 20}px` }}>
                        {hasChildren ? (
                            <CollapsibleTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                    {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                </Button>
                            </CollapsibleTrigger>
                        ) : (
                            <div className="w-6" />
                        )}

                        {item.type === "WAREHOUSE" && <Warehouse className="h-4 w-4 text-blue-500" />}
                        {item.type === "ZONE" && <Grid className="h-4 w-4 text-orange-500" />}
                        {item.type === "RACK" && <Box className="h-4 w-4 text-green-500" />}

                        <span className="font-medium">{item.name}</span>
                        <Badge variant="outline" className="ml-2 text-xs">{item.type}</Badge>
                    </div>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" className="h-8">Add Sub-location</Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem>Edit</DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {hasChildren && (
                    <CollapsibleContent>
                        <div className="border-l border-border/50 ml-[19px] mt-1">
                            {item.children.map(child => (
                                <LocationItem key={child.id} item={child} level={level + 1} />
                            ))}
                        </div>
                    </CollapsibleContent>
                )}
            </Collapsible>
        )
    }

    return (
        <PageWrapper className="min-h-screen bg-background p-6">
            <div className="max-w-5xl mx-auto space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Locations</h1>
                        <p className="text-muted-foreground">Manage warehouses, zones, and racks</p>
                    </div>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Warehouse
                    </Button>
                </div>

                <Card className="border-primary/20 bg-card/50 backdrop-blur">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Location Hierarchy</CardTitle>
                            <div className="relative w-64">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search locations..."
                                    className="pl-8"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {locations.map(location => (
                                    <LocationItem key={location.id} item={location} />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </PageWrapper>
    )
}
