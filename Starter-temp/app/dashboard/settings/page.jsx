"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import {
    User,
    Bell,
    Shield,
    Key,
    Mail,
    Save,
    Building,
    Globe
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { PageWrapper } from "@/components/PageWrapper"
import { toast } from "sonner"

export default function SettingsPage() {
    const { data: session } = useSession()
    const [isLoading, setIsLoading] = useState(false)

    const handleSave = () => {
        setIsLoading(true)
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false)
            toast.success("Settings saved successfully")
        }, 1000)
    }

    return (
        <PageWrapper className="min-h-screen bg-background p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                    <p className="text-muted-foreground">Manage your account settings and preferences</p>
                </div>

                <Tabs defaultValue="profile" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
                        <TabsTrigger value="profile">Profile</TabsTrigger>
                        <TabsTrigger value="account">Account</TabsTrigger>
                        <TabsTrigger value="notifications">Notifications</TabsTrigger>
                    </TabsList>

                    {/* Profile Tab */}
                    <TabsContent value="profile" className="space-y-4 mt-4">
                        <Card className="border-primary/20 bg-card/50 backdrop-blur">
                            <CardHeader>
                                <CardTitle>Profile Information</CardTitle>
                                <CardDescription>Update your photo and personal details here.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center gap-6">
                                    <Avatar className="h-20 w-20">
                                        <AvatarImage src={session?.user?.image} />
                                        <AvatarFallback className="text-lg">{session?.user?.name?.charAt(0) || "U"}</AvatarFallback>
                                    </Avatar>
                                    <Button variant="outline">Change Avatar</Button>
                                </div>
                                <Separator />
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <div className="relative">
                                            <User className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input id="name" defaultValue={session?.user?.name} className="pl-8" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input id="email" defaultValue={session?.user?.email} className="pl-8" disabled />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="role">Role</Label>
                                        <div className="relative">
                                            <Shield className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input id="role" defaultValue="Administrator" className="pl-8" disabled />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button onClick={handleSave} disabled={isLoading}>
                                    {isLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>}
                                    Save Changes
                                </Button>
                            </CardFooter>
                        </Card>
                    </TabsContent>

                    {/* Account Tab */}
                    <TabsContent value="account" className="space-y-4 mt-4">
                        <Card className="border-primary/20 bg-card/50 backdrop-blur">
                            <CardHeader>
                                <CardTitle>Password & Security</CardTitle>
                                <CardDescription>Manage your password and security preferences.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="current-password">Current Password</Label>
                                    <div className="relative">
                                        <Key className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input id="current-password" type="password" className="pl-8" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="new-password">New Password</Label>
                                    <div className="relative">
                                        <Key className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input id="new-password" type="password" className="pl-8" />
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button onClick={handleSave} disabled={isLoading}>Update Password</Button>
                            </CardFooter>
                        </Card>

                        <Card className="border-destructive/20 bg-destructive/5 backdrop-blur">
                            <CardHeader>
                                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                                <CardDescription>Irreversible actions for your account.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Once you delete your account, there is no going back. Please be certain.
                                </p>
                                <Button variant="destructive">Delete Account</Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Notifications Tab */}
                    <TabsContent value="notifications" className="space-y-4 mt-4">
                        <Card className="border-primary/20 bg-card/50 backdrop-blur">
                            <CardHeader>
                                <CardTitle>Notification Preferences</CardTitle>
                                <CardDescription>Choose what you want to be notified about.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-between space-x-2">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">Low Stock Alerts</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Receive notifications when items fall below minimum stock.
                                        </p>
                                    </div>
                                    <Switch defaultChecked />
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between space-x-2">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">New Orders</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Get notified when a new delivery order is created.
                                        </p>
                                    </div>
                                    <Switch defaultChecked />
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between space-x-2">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">System Updates</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Receive emails about system maintenance and updates.
                                        </p>
                                    </div>
                                    <Switch />
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button onClick={handleSave} disabled={isLoading}>Save Preferences</Button>
                            </CardFooter>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </PageWrapper>
    )
}
