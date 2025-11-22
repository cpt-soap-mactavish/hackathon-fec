"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Mail, Loader2, ArrowLeft, Lock, Eye, EyeOff, Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { PageWrapper } from "@/components/PageWrapper"
import { toast } from "sonner"

export default function ForgotPasswordPage() {
    const router = useRouter()
    const [step, setStep] = useState(1) // 1: Email, 2: OTP, 3: New Password
    const [email, setEmail] = useState("")
    const [otp, setOtp] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [timeLeft, setTimeLeft] = useState(600) // 10 minutes in seconds
    const [canResend, setCanResend] = useState(false)

    // Countdown timer for OTP expiration
    useEffect(() => {
        if (step === 2 && timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        setCanResend(true)
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
            return () => clearInterval(timer)
        }
    }, [step, timeLeft])

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const handleSendOTP = async (e) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            })

            const data = await res.json()

            if (res.ok && data.success) {
                toast.success("OTP sent to your email!")
                setStep(2)
                setTimeLeft(600) // Reset timer
                setCanResend(false)
            } else {
                toast.error(data.message || "Failed to send OTP")
            }
        } catch (error) {
            toast.error("Failed to send request")
        } finally {
            setIsLoading(false)
        }
    }

    const handleVerifyOTP = async (e) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const res = await fetch("/api/auth/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp }),
            })

            const data = await res.json()

            if (res.ok && data.success) {
                toast.success("OTP verified!")
                setStep(3)
            } else {
                toast.error(data.message || "Invalid OTP")
            }
        } catch (error) {
            toast.error("Failed to verify OTP")
        } finally {
            setIsLoading(false)
        }
    }

    const handleResetPassword = async (e) => {
        e.preventDefault()

        if (password !== confirmPassword) {
            toast.error("Passwords do not match")
            return
        }

        if (password.length < 8) {
            toast.error("Password must be at least 8 characters")
            return
        }

        setIsLoading(true)

        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp, password }),
            })

            const data = await res.json()

            if (res.ok && data.success) {
                toast.success("Password reset successfully!")
                router.push("/login")
            } else {
                toast.error(data.message || "Failed to reset password")
            }
        } catch (error) {
            toast.error("Failed to reset password")
        } finally {
            setIsLoading(false)
        }
    }

    const handleResendOTP = async () => {
        setCanResend(false)
        await handleSendOTP({ preventDefault: () => { } })
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
                        <CardTitle className="text-2xl font-bold tracking-tight">
                            {step === 1 && "Forgot Password"}
                            {step === 2 && "Verify OTP"}
                            {step === 3 && "Set New Password"}
                        </CardTitle>
                        <CardDescription>
                            {step === 1 && "Enter your email to receive an OTP"}
                            {step === 2 && "Enter the 6-digit code sent to your email"}
                            {step === 3 && "Create a new password for your account"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.form
                                    key="step1"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    onSubmit={handleSendOTP}
                                    className="space-y-4"
                                >
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="name@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            disabled={isLoading}
                                            className="bg-background/50 border-primary/20 focus-visible:ring-primary"
                                        />
                                    </div>
                                    <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
                                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Send OTP"}
                                    </Button>
                                </motion.form>
                            )}

                            {step === 2 && (
                                <motion.form
                                    key="step2"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    onSubmit={handleVerifyOTP}
                                    className="space-y-4"
                                >
                                    <div className="space-y-2">
                                        <Label htmlFor="otp">OTP Code</Label>
                                        <Input
                                            id="otp"
                                            type="text"
                                            placeholder="123456"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                            required
                                            disabled={isLoading}
                                            className="bg-background/50 border-primary/20 focus-visible:ring-primary text-center text-2xl tracking-widest"
                                            maxLength={6}
                                        />
                                        <div className="flex justify-between items-center text-sm">
                                            <span className={`${timeLeft < 60 ? 'text-destructive' : 'text-muted-foreground'}`}>
                                                Expires in: {formatTime(timeLeft)}
                                            </span>
                                            {canResend && (
                                                <Button
                                                    type="button"
                                                    variant="link"
                                                    onClick={handleResendOTP}
                                                    className="text-primary p-0 h-auto"
                                                >
                                                    Resend OTP
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                    <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading || otp.length !== 6}>
                                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Verify OTP"}
                                    </Button>
                                </motion.form>
                            )}

                            {step === 3 && (
                                <motion.form
                                    key="step3"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    onSubmit={handleResetPassword}
                                    className="space-y-4"
                                >
                                    <div className="space-y-2">
                                        <Label htmlFor="password">New Password</Label>
                                        <div className="relative">
                                            <Input
                                                id="password"
                                                type={showPassword ? "text" : "password"}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                                disabled={isLoading}
                                                className="bg-background/50 border-primary/20 focus-visible:ring-primary pr-10"
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
                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            disabled={isLoading}
                                            className="bg-background/50 border-primary/20 focus-visible:ring-primary"
                                        />
                                    </div>
                                    <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
                                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Reset Password"}
                                    </Button>
                                </motion.form>
                            )}
                        </AnimatePresence>
                    </CardContent>
                    <CardFooter className="flex justify-center">
                        <Button variant="link" asChild className="text-muted-foreground">
                            <Link href="/login" className="flex items-center gap-2">
                                <ArrowLeft className="h-4 w-4" />
                                Back to Login
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
            </motion.div>
        </PageWrapper>
    )
}
