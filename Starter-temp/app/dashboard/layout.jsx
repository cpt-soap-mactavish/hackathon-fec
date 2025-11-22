import { Navbar } from "@/components/Navbar"

export default function DashboardLayout({ children }) {
    return (
        <div className="relative flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
        </div>
    )
}
