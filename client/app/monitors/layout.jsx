"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Activity, LayoutDashboard, Settings, Bell, Menu, LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

const UP = "#2DD4BF";

const navItems = [
    { name: "All Monitors", href: "/monitors", icon: LayoutDashboard },
    { name: "Alerts", href: "/alerts", icon: Bell },
    { name: "Settings", href: "/settings", icon: Settings },
];

function Logo() {
    return (
        <div className="flex items-center gap-2.5 font-display text-lg font-medium tracking-tight text-white">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: `${UP}1A` }}>
                <Activity className="h-4 w-4" style={{ color: UP }} />
            </div>
            MonitorApp
        </div>
    );
}

export default function MonitorsLayout({ children }) {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem("token");
        router.push("/login");
    };

    // Reusable nav for both desktop sidebar and mobile sheet
    const NavigationLinks = () => (
        <nav className="grid items-start gap-0.5 px-2 text-sm">
            {navItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                const Icon = item.icon;

                return (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={`relative flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${isActive ? "bg-white/[0.05] text-white" : "text-white/40 hover:bg-white/[0.03] hover:text-white/70"
                            }`}
                    >
                        {isActive && (
                            <span className="absolute -left-2 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-full" style={{ backgroundColor: UP }} />
                        )}
                        <Icon className="h-4 w-4" />
                        {item.name}
                    </Link>
                );
            })}
        </nav>
    );

    return (
        <div className="flex min-h-screen w-full bg-[#0B0D12]">
            {/* Desktop sidebar */}
            <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r border-white/[0.06] bg-[#0B0D12] sm:flex">
                <div className="flex h-16 items-center border-b border-white/[0.06] px-5">
                    <Link href="/" className="transition-opacity hover:opacity-80">
                        <Logo />
                    </Link>
                </div>

                <div className="flex-1 overflow-auto py-4">
                    <NavigationLinks />
                </div>

                <div className="mt-auto border-t border-white/[0.06] p-3">
                    <Button
                        variant="ghost"
                        className="w-full justify-start text-white/40 hover:bg-white/[0.03] hover:text-white/80"
                        onClick={handleLogout}
                    >
                        <LogOut className="mr-3 h-4 w-4" />
                        Log out
                    </Button>
                </div>
            </aside>

            {/* Main content area */}
            <div className="flex flex-1 flex-col sm:pl-64">
                {/* Mobile header */}
                <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-white/[0.06] bg-[#0B0D12]/90 px-4 backdrop-blur-md sm:hidden">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                className="shrink-0 border-white/[0.08] bg-transparent text-white/60 hover:bg-white/[0.04] hover:text-white"
                            >
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle navigation menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="flex w-[280px] flex-col border-white/[0.08] bg-[#0B0D12] text-white">
                            <SheetTitle className="sr-only">Navigation menu</SheetTitle>

                            <div className="mb-6 mt-2">
                                <Logo />
                            </div>

                            <div className="-mx-2 flex-1">
                                <NavigationLinks />
                            </div>

                            <div className="-mx-2 mt-auto pt-4">
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start text-white/40 hover:bg-white/[0.03] hover:text-white/80"
                                    onClick={handleLogout}
                                >
                                    <LogOut className="mr-3 h-4 w-4" />
                                    Log out
                                </Button>
                            </div>
                        </SheetContent>
                    </Sheet>

                    <Logo />
                </header>

                {/* Page content — pages own their own max-width and padding */}
                <div className="flex-1 w-full">{children}</div>
            </div>
        </div>
    );
}