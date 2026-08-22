"use client";

import { useEffect, useState } from "react";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { apiFetch } from "@/lib/api";

export default function MonitorFormDialog({
    monitor = null,
    onSuccess,
}) {
    const isEdit = Boolean(monitor);

    const [open, setOpen] = useState(false);

    const [name, setName] = useState("");
    const [url, setUrl] = useState("");
    const [interval, setInterval] = useState(1);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!open) return;

        if (monitor) {
            setName(monitor.name || "");
            setUrl(monitor.url || "");
            setInterval(monitor.interval || 1);
        } else {
            setName("");
            setUrl("");
            setInterval(1);
        }

        setError("");
    }, [open, monitor]);

    async function handleSubmit(e) {
        e.preventDefault();

        setLoading(true);
        setError("");

        try {
            const payload = {
                name,
                url,
                interval: Number(interval),
            };

            const response = await apiFetch(
                isEdit
                    ? `/monitor/${monitor._id}`
                    : "/monitor",
                {
                    method: isEdit ? "PATCH" : "POST",
                    body: JSON.stringify(payload),
                }
            );

            onSuccess(response.data.monitor);

            setOpen(false);
        } catch (error) {
            console.error(error);
            setError(
                error.message ||
                `Failed to ${isEdit ? "update" : "create"} monitor`
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
                render={
                    <Button
                        variant={isEdit ? "outline" : "default"}
                        onClick={(e) => e.stopPropagation()}
                    />
                }
            >
                {isEdit ? "Edit" : "+ Add Monitor"}
            </DialogTrigger>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {isEdit
                            ? "Edit Monitor"
                            : "Create Monitor"}
                    </DialogTitle>
                </DialogHeader>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-4"
                >
                    <div className="space-y-2">
                        <Label htmlFor="monitor-name">
                            Name
                        </Label>

                        <Input
                            id="monitor-name"
                            value={name}
                            onChange={(e) =>
                                setName(e.target.value)
                            }
                            placeholder="Google"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="monitor-url">
                            URL
                        </Label>

                        <Input
                            id="monitor-url"
                            value={url}
                            onChange={(e) =>
                                setUrl(e.target.value)
                            }
                            placeholder="https://google.com"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="monitor-interval">
                            Interval (minutes)
                        </Label>

                        <Input
                            id="monitor-interval"
                            type="number"
                            min={1}
                            value={interval}
                            onChange={(e) =>
                                setInterval(e.target.value)
                            }
                            required
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-red-500">
                            {error}
                        </p>
                    )}

                    <Button
                        className="w-full"
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? isEdit
                                ? "Updating..."
                                : "Creating..."
                            : isEdit
                                ? "Update Monitor"
                                : "Create Monitor"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}