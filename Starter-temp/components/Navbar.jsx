"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Moon, Sun, Terminal, LogOut, User } from "lucide-react"
import { useTheme } from "next-themes"
import { useSession, signOut } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function Navbar() {
    const { theme, setTheme } = useTheme()
    const pathname = usePathname()
    const { data: session } = useSession()
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        >
            <div className="container flex h-14 max-w-screen-2xl items-center justify-between px-4 md:px-8">
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tighter hover:opacity-80 transition-opacity">
                        <motion.div
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.5 }}
                            className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                        >
                            <Terminal className="h-5 w-5" />
                        </motion.div>
                        <span className="hidden md:inline-block bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                            TechAuth
                        </span>
                    </Link>
                </div>

                <div className="hidden md:flex items-center gap-6 text-sm font-medium">
                    <Link href="/dashboard" className="transition-colors hover:text-foreground/80 text-foreground/60">
                        Dashboard
                    </Link>

                    <DropdownMenu>
                        <DropdownMenuTrigger className="flex items-center gap-1 transition-colors hover:text-foreground/80 text-foreground/60 outline-none">
                            Operations
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            <DropdownMenuItem asChild>
                                <Link href="/dashboard/receipts">Receipts</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/dashboard/deliveries">Deliveries</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/dashboard/adjustments">Adjustments</Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Link href="/dashboard/products" className="transition-colors hover:text-foreground/80 text-foreground/60">
                        Stock
                    </Link>

                    <Link href="/dashboard/transfers" className="transition-colors hover:text-foreground/80 text-foreground/60">
                        Move History
                    </Link>

                    <DropdownMenu>
                        <DropdownMenuTrigger className="flex items-center gap-1 transition-colors hover:text-foreground/80 text-foreground/60 outline-none">
                            Settings
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            <DropdownMenuItem asChild>
                                <Link href="/dashboard/warehouses">Warehouses</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/dashboard/locations">Locations</Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        className="relative h-9 w-9 rounded-full border border-border/50 bg-background/50 backdrop-blur-sm hover:bg-accent hover:text-accent-foreground overflow-hidden"
                    >
                        <AnimatePresence mode="wait">
                            {mounted && theme === "dark" ? (
                                <motion.div
                                    key="moon"
                                    initial={{ y: -30, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: 30, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute"
                                >
                                    <Moon className="h-[1.2rem] w-[1.2rem]" />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="sun"
                                    initial={{ y: -30, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: 30, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute"
                                >
                                    <Sun className="h-[1.2rem] w-[1.2rem]" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <span className="sr-only">Toggle theme</span>
                    </Button>

                    {session ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={session.user?.image} alt={session.user?.name} />
                                            <AvatarFallback>{session.user?.name?.charAt(0) || "U"}</AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </motion.div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">{session.user?.name}</p>
                                        <p className="text-xs leading-none text-muted-foreground">
                                            {session.user?.email}
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/profile" className="cursor-pointer">
                                        <User className="mr-2 h-4 w-4" />
                                        <span>Profile</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Log out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <>
                            {pathname !== "/login" && pathname !== "/register" && (
                                <div className="flex items-center gap-2">
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Button variant="ghost" asChild className="hidden sm:flex">
                                            <Link href="/login">Log in</Link>
                                        </Button>
                                    </motion.div>
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Button asChild className="shadow-lg shadow-primary/20">
                                            <Link href="/register">Sign up</Link>
                                        </Button>
                                    </motion.div>
                                </div>
                            )}
                            {(pathname === "/login" || pathname === "/register") && (
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Button variant="ghost" asChild>
                                        <Link href={pathname === "/login" ? "/register" : "/login"}>
                                            {pathname === "/login" ? "Sign up" : "Log in"}
                                        </Link>
                                    </Button>
                                </motion.div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </motion.nav>
    )
}
