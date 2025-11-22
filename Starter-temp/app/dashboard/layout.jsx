"use client"

import { Navbar } from "@/components/Navbar"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function DashboardLayout({ children }) {
    const { data: session, status } = useSession()
    const router = useRouter()

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login")
        }
    }, [status, router])

    // Show loading state while checking authentication
    if (status === "loading") {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    // Don't render dashboard if not authenticated
    if (status === "unauthenticated") {
        return null
    }

    return (
        <div className="relative flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
        </div>
    )
}
