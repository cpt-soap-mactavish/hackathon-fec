"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Lock, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { signIn, useSession } from "next-auth/react"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PageWrapper } from "@/components/PageWrapper"

export default function LoginPage() {
    const router = useRouter()
    const { data: session, status } = useSession()
    const [isLoading, setIsLoading] = React.useState(false)
    const [showPassword, setShowPassword] = React.useState(false)
    const [formData, setFormData] = React.useState({
        username: "",
        password: "",
    })

    React.useEffect(() => {
        if (status === "authenticated") {
            router.push("/dashboard")
        }
    }, [status, router])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const res = await signIn("credentials", {
                username: formData.username,
                password: formData.password,
                redirect: false,
            })

            setIsLoading(false)

            if (res?.error) {
                toast.error("Invalid Login ID or Password")
            } else {
                router.push("/dashboard")
                toast.success("Welcome back!")
            }
        } catch (error) {
            setIsLoading(false)
            toast.error("Something went wrong")
        }
    }

    return (
        <PageWrapper className="min-h-screen w-full bg-background flex items-center justify-center p-4">
            <div className="absolute inset-0 -z-10 h-full w-full bg-background [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)] opacity-50" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md"
            >
                <Card className="border-primary/20 bg-black/40 backdrop-blur-xl shadow-2xl shadow-primary/10">
                    <CardHeader className="space-y-1 text-center">
                        <div className="flex justify-center mb-4">
                            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                                <Lock className="h-6 w-6 text-primary" />
                            </div>
                        </div>
                        <CardTitle className="text-2xl font-bold tracking-tight">Welcome back</CardTitle>
                        <CardDescription>Enter your credentials to access your account</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="username">Login ID</Label>
                                <Input
                                    id="username"
                                    name="username"
                                    placeholder="Velvety Meerkat"
                                    required
                                    className="bg-background/50 border-primary/20 focus-visible:ring-primary"
                                    value={formData.username}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Password</Label>
                                </div>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        required
                                        className="bg-background/50 border-primary/20 focus-visible:ring-primary pr-10"
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-0 top-0 h-10 w-10 text-muted-foreground hover:text-primary"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>
                            <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "SIGN IN"}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4 text-center">
                        <div className="flex justify-between w-full text-sm">
                            <Link href="/forgot-password" className="text-muted-foreground hover:text-primary transition-colors">
                                Forgot Password?
                            </Link>
                            <Link href="/register" className="text-primary hover:underline font-medium">
                                Sign Up
                            </Link>
                        </div>
                    </CardFooter>
                </Card>
            </motion.div>
        </PageWrapper>
    )
}
