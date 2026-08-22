"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Activity,
    AlertCircle,
    CheckCircle2,
    Clock,
    XCircle,
    Pause,
    Play,
} from "lucide-react";

import { apiFetch } from "@/lib/api";
import MonitorFormDialog from "@/components/MonitorFormDialog";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/lib/store/authStore";
import MonitorCard from "@/components/MonitorCard";

// Helper component for styled status badges
function StatusBadge({ status }) {
    const normalizedStatus = status?.toUpperCase() || "UNKNOWN";

    switch (normalizedStatus) {
        case "UP":
            return (
                <Badge className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> UP
                </Badge>
            );
        case "DOWN":
            return (
                <Badge variant="destructive" className="flex items-center gap-1">
                    <XCircle className="h-3 w-3" /> DOWN
                </Badge>
            );
        default:
            return (
                <Badge variant="secondary" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {normalizedStatus}
                </Badge>
            );
    }
}

export default function MonitorsPage() {
    const router = useRouter();

    const [monitors, setMonitors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const { token, initialized } = useAuth();
    async function fetchMonitors() {
        try {
            setLoading(true);
            setError("");

            const data = await apiFetch("/monitor");

            setMonitors(data.data.monitors);
        } catch (error) {
            console.error(error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }
    function addMonitor(newMonitor) {
        setMonitors((prev) => [newMonitor, ...prev]);
    }

    useEffect(() => {
        if (!initialized) return;

        if (!token) {
            router.replace("/login");
            return;
        }

        fetchMonitors();
    }, [initialized, token]);

    if (loading) {
        return (
            <main className="p-6 md:p-8 space-y-6">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-40" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Skeleton key={i} className="h-32 w-full rounded-xl" />
                    ))}
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="p-6 md:p-8">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </main>
        );
    }

    function handleMonitorUpdate(updatedMonitor) {
        setMonitors((prev) =>
            prev.map((monitor) =>
                monitor._id === updatedMonitor._id
                    ? updatedMonitor
                    : monitor
            )
        );
    }

    return (
        <main className="p-6 md:p-8">
            {/* Header Area */}
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Monitors</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage and track your website uptime.
                    </p>
                </div>

                <MonitorFormDialog onSuccess={addMonitor} />
            </div>

            {/* Monitors Grid */}
            {monitors.length === 0 ? (
                <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed text-center animate-in fade-in-50">
                    <Activity className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-semibold">No monitors found</h3>
                    <p className="mb-4 mt-2 text-sm text-muted-foreground">
                        You haven't set up any monitors yet. Start by creating one.
                    </p>
                    {/* If CreateMonitorDialog can act as a standalone button, you could place a duplicate here */}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {monitors.map((monitor) => (
                        <MonitorCard
                            key={monitor._id}
                            monitor={monitor}
                            onDelete={(id) => {
                                setMonitors((prev) =>
                                    prev.filter((monitor) => monitor._id !== id)
                                );
                            }}
                            onUpdate={handleMonitorUpdate}
                        />
                    ))}
                </div>
            )}
        </main>
    );
}