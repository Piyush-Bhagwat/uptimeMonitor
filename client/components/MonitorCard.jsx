"use client";

import { useState } from "react";
import MonitorFormDialog from "@/components/MonitorFormDialog";
import { useRouter } from "next/navigation";
import {
    Clock,
    Pause,
    Play,
    Trash2,
} from "lucide-react";

import { apiFetch } from "@/lib/api";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/status-badge";

export default function MonitorCard({ monitor, onDelete, onUpdate }) {
    const router = useRouter();

    const [toggling, setToggling] = useState(false);
    const [deleting, setDeleting] = useState(false);

    async function toggleMonitor() {
        if (toggling) return;

        try {
            setToggling(true);

            const response = await apiFetch(
                `/monitor/${monitor._id}`,
                {
                    method: "PATCH",
                    body: JSON.stringify({
                        isActive: !monitor.isActive,
                    }),
                }
            );

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

            await apiFetch(`/monitor/${monitor._id}`, {
                method: "DELETE",
            });

            onDelete(monitor._id);
        } catch (error) {
            console.error("Failed to delete monitor:", error);
        } finally {
            setDeleting(false);
        }
    }

    return (
        <Card
            onClick={() =>
                router.push(`/monitors/${monitor._id}`)
            }
            className="group cursor-pointer transition-all hover:border-primary hover:shadow-sm"
        >

            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="space-y-1 pr-2">
                    <CardTitle className="text-lg truncate font-semibold group-hover:text-primary transition-colors">
                        {monitor.name}
                    </CardTitle>

                    <CardDescription className="truncate max-w-[200px] text-xs">
                        {monitor.url}
                    </CardDescription>
                </div>

                <StatusBadge status={monitor.status} />
            </CardHeader>

            <CardContent>
                <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />

                        <span>
                            {monitor.interval || 5}m interval
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <MonitorFormDialog
                            monitor={monitor}
                            onSuccess={onUpdate}
                        />
                        {/* Delete */}
                        <Button
                            variant="ghost"
                            size="icon"
                            disabled={deleting}
                            onClick={(e) => {
                                e.stopPropagation();
                                deleteMonitor();
                            }}
                        >
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>

                        {/* Pause / Resume */}
                        <Button
                            variant={
                                monitor.isActive
                                    ? "outline"
                                    : "default"
                            }
                            size="sm"
                            disabled={toggling}
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleMonitor();
                            }}
                        >
                            {monitor.isActive ? (
                                <>
                                    <Pause className="mr-1 h-3.5 w-3.5" />
                                    Pause
                                </>
                            ) : (
                                <>
                                    <Play className="mr-1 h-3.5 w-3.5" />
                                    Resume
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}