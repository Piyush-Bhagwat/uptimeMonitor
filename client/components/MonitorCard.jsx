"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, Pause, Play, Trash2 } from "lucide-react";

import { apiFetch } from "@/lib/api";
import MonitorFormDialog from "@/components/MonitorFormDialog";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/status-badge";

const UP = "#2DD4BF";
const DOWN = "#FB7185";

export default function MonitorCard({ monitor, onDelete, onUpdate }) {
    const router = useRouter();

    const [toggling, setToggling] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const isDown = monitor.status?.toUpperCase() === "DOWN";
    const accent = isDown ? DOWN : UP;

    async function toggleMonitor() {
        if (toggling) return;
        try {
            setToggling(true);
            const response = await apiFetch(`/monitor/${monitor._id}`, {
                method: "PATCH",
                body: JSON.stringify({ isActive: !monitor.isActive }),
            });
            onUpdate(response.data.monitor);
        } catch (error) {
            console.error("Failed to update monitor:", error);
        } finally {
            setToggling(false);
        }
    }

    async function deleteMonitor() {
        if (deleting) return;
        try {
            setDeleting(true);
            await apiFetch(`/monitor/${monitor._id}`, { method: "DELETE" });
            onDelete(monitor._id);
        } catch (error) {
            console.error("Failed to delete monitor:", error);
        } finally {
            setDeleting(false);
        }
    }

    return (
        <div
            onClick={() => router.push(`/monitors/${monitor._id}`)}
            className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/[0.06] bg-[#12151C] p-5 transition-colors hover:border-white/[0.14]"
        >
            {/* Left status rail — quieter than a full colored badge, reads at a glance */}
            <span
                className="absolute left-0 top-0 h-full w-[3px] opacity-70 transition-opacity group-hover:opacity-100"
                style={{ backgroundColor: accent }}
            />

            <div className="flex items-start justify-between gap-2 pl-2">
                <div className="min-w-0 space-y-1">
                    <h3 className="truncate font-display text-base font-medium text-white/90 transition-colors group-hover:text-white">
                        {monitor.name}
                    </h3>
                    <p className="truncate font-mono text-xs text-white/35">{monitor.url}</p>
                </div>
                <StatusBadge status={monitor.status} />
            </div>

            <div className="mt-5 flex items-center justify-between pl-2">
                <div className="flex items-center gap-1.5 font-mono text-xs text-white/35">
                    <Clock className="h-3.5 w-3.5" />
                    {monitor.interval || 5}m interval
                </div>

                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <MonitorFormDialog monitor={monitor} onSuccess={onUpdate} />

                    <Button
                        variant="ghost"
                        size="icon"
                        disabled={deleting}
                        onClick={deleteMonitor}
                        className="text-white/30 hover:bg-[#FB7185]/10 hover:text-[#FB7185]"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="sm"
                        disabled={toggling}
                        onClick={toggleMonitor}
                        className="border border-white/[0.08] text-white/60 hover:border-white/20 hover:bg-white/[0.04] hover:text-white"
                    >
                        {monitor.isActive ? (
                            <>
                                <Pause className="mr-1.5 h-3.5 w-3.5" />
                                Pause
                            </>
                        ) : (
                            <>
                                <Play className="mr-1.5 h-3.5 w-3.5" />
                                Resume
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}