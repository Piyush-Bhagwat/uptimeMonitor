"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, AlertCircle, CheckCircle2, Clock, XCircle } from "lucide-react";

import { apiFetch } from "@/lib/api";
import MonitorFormDialog from "@/components/MonitorFormDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/lib/store/authStore";
import MonitorCard from "@/components/MonitorCard";

// Same tokens as the monitor detail page — keep these in sync if you move
// them to a shared file (e.g. `@/lib/theme.js`).
const UP = "#2DD4BF";
const DOWN = "#FB7185";
const MUTE = "#767E8C";

function FleetPill({ label, value, color }) {
    return (
        <div className="flex items-center gap-2 font-mono text-xs text-white/50">
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
            {value} <span className="text-white/30">{label}</span>
        </div>
    );
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

    function handleMonitorUpdate(updatedMonitor) {
        setMonitors((prev) =>
            prev.map((monitor) => (monitor._id === updatedMonitor._id ? updatedMonitor : monitor))
        );
    }

    useEffect(() => {
        if (!initialized) return;
        if (!token) {
            router.replace("/login");
            return;
        }
        fetchMonitors();
    }, [initialized, token]);

    const counts = useMemo(() => {
        const up = monitors.filter((m) => m.status?.toUpperCase() === "UP").length;
        const down = monitors.filter((m) => m.status?.toUpperCase() === "DOWN").length;
        const other = monitors.length - up - down;
        return { up, down, other };
    }, [monitors]);

    if (loading) {
        return (
            <main className="min-h-screen bg-[#0B0D12] p-6 md:p-10">
                <div className="mx-auto w-full max-w-6xl space-y-8">
                    <div className="flex items-center justify-between">
                        <div className="space-y-2">
                            <Skeleton className="h-3 w-20 bg-white/5" />
                            <Skeleton className="h-9 w-40 bg-white/5" />
                        </div>
                        <Skeleton className="h-10 w-36 bg-white/5" />
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <Skeleton key={i} className="h-32 w-full rounded-2xl bg-white/5" />
                        ))}
                    </div>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="min-h-screen bg-[#0B0D12] p-6 md:p-10">
                <div className="mx-auto w-full max-w-6xl">
                    <Alert variant="destructive" className="border-[#FB7185]/30 bg-[#FB7185]/10">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#0B0D12] px-6 pb-24 pt-8 text-white md:px-10">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">

                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div className="space-y-2">
                        <div className="text-[11px] uppercase tracking-[0.2em] text-white/30">Fleet</div>
                        <h1 className="font-display text-3xl font-semibold tracking-tight">Monitors</h1>
                        {monitors.length > 0 && (
                            <div className="flex flex-wrap items-center gap-4 pt-1">
                                <FleetPill label="up" value={counts.up} color={UP} />
                                <FleetPill label="down" value={counts.down} color={DOWN} />
                                {counts.other > 0 && <FleetPill label="pending" value={counts.other} color={MUTE} />}
                            </div>
                        )}
                    </div>

                    <MonitorFormDialog onSuccess={addMonitor} />
                </div>

                {/* Grid */}
                {monitors.length === 0 ? (
                    <div className="flex min-h-[380px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.08] text-center">
                        <Activity className="h-10 w-10 text-white/15" />
                        <h3 className="mt-4 font-display text-lg text-white/80">No monitors yet</h3>
                        <p className="mb-1 mt-2 max-w-xs text-sm text-white/40">
                            You haven't set up any monitors. Add a URL to start tracking uptime.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {monitors.map((monitor) => (
                            <MonitorCard
                                key={monitor._id}
                                monitor={monitor}
                                onDelete={(id) => {
                                    setMonitors((prev) => prev.filter((monitor) => monitor._id !== id));
                                }}
                                onUpdate={handleMonitorUpdate}
                            />
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}