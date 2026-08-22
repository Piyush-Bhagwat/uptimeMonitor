"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    Activity,
    LayoutDashboard,
    Settings,
    Bell,
    Menu,
    LogOut
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

// Define navigation items here for easy mapping and maintainability
const navItems = [
    { name: "All Monitors", href: "/monitors", icon: LayoutDashboard },
    { name: "Alerts", href: "/alerts", icon: Bell },
    { name: "Settings", href: "/settings", icon: Settings },
];

export default function MonitorsLayout({ children }) {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem("token");
        router.push("/login");
    };

    // Reusable Nav Component for both Desktop and Mobile
    const NavigationLinks = () => (
        <nav className="grid items-start gap-1 px-2 text-sm font-medium lg:px-4">
            {navItems.map((item) => {
                // Check if the current path starts with the item's href (to keep it active on sub-pages like /monitors/123)
                const isActive = pathname.startsWith(item.href);
                const Icon = item.icon;

                return (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center gap-3 rounded-md px-3 py-2.5 transition-all ${isActive
                                ? "bg-primary/10 text-primary font-semibold"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            }`}
                    >
                        <Icon className="h-4 w-4" />
                        {item.name}
                    </Link>
                );
            })}
        </nav>
    );

    return (
        <div className="flex min-h-screen w-full bg-muted/20">
            {/* Desktop Sidebar */}
            <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r bg-background sm:flex">
                {/* Logo Area */}
                <div className="flex h-16 items-center border-b px-4 lg:px-6">
                    <Link href="/" className="flex items-center gap-2 font-bold text-lg hover:opacity-80 transition-opacity">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                            <Activity className="h-5 w-5 text-primary" />
                        </div>
                        <span className="tracking-tight">MonitorApp</span>
                    </Link>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-auto py-4">
                    <NavigationLinks />
                </div>

                {/* Bottom Actions (User / Logout) */}
                <div className="mt-auto border-t p-4">
                    <Button
                        variant="ghost"
                        className="w-full justify-start text-muted-foreground hover:text-foreground"
                        onClick={handleLogout}
                    >
                        <LogOut className="mr-3 h-4 w-4" />
                        Log out
                    </Button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex flex-1 flex-col sm:pl-64">
                {/* Mobile Header & Navigation */}
                <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-md px-4 sm:hidden">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="icon" className="shrink-0">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle navigation menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="flex w-[280px] flex-col">
                            {/* Hidden title for accessibility compliance */}
                            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>

                            <Link href="/" className="flex items-center gap-2 font-bold text-lg mb-6 mt-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                                    <Activity className="h-5 w-5 text-primary" />
                                </div>
                                <span className="tracking-tight">MonitorApp</span>
                            </Link>

                            <div className="flex-1 -mx-2">
                                <NavigationLinks />
                            </div>

                            <div className="mt-auto -mx-2 pt-4">
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start text-muted-foreground"
                                    onClick={handleLogout}
                                >
                                    <LogOut className="mr-3 h-4 w-4" />
                                    Log out
                                </Button>
                            </div>
                        </SheetContent>
                    </Sheet>

                    <div className="flex items-center gap-2 font-bold">
                        <Activity className="h-5 w-5 text-primary" />
                        <span>MonitorApp</span>
                    </div>
                </header>

                {/* Page Content Container */}
                <div className="flex-1 w-full max-w-7xl mx-auto">
                    {children}
                </div>
            </div>
        </div>
    );
}