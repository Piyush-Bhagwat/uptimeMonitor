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

const DOWN = "#FB7185";

// Shared field wrapper so label + input spacing stays identical across the
// three fields without repeating classNames three times.
function Field({ id, label, children }) {
    return (
        <div className="space-y-1.5">
            <Label htmlFor={id} className="text-[11px] uppercase tracking-[0.12em] text-white/40">
                {label}
            </Label>
            {children}
        </div>
    );
}

const inputClass =
    "border-white/[0.08] bg-black/20 text-white placeholder:text-white/25 focus-visible:ring-1 focus-visible:ring-[#2DD4BF]/40 focus-visible:border-[#2DD4BF]/40";

export default function MonitorFormDialog({ monitor = null, onSuccess }) {
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
            const payload = { name, url, interval: Number(interval) };

            const response = await apiFetch(isEdit ? `/monitor/${monitor._id}` : "/monitor", {
                method: isEdit ? "PATCH" : "POST",
                body: JSON.stringify(payload),
            });

            onSuccess(response.data.monitor);
            setOpen(false);
        } catch (error) {
            console.error(error);
            setError(error.message || `Failed to ${isEdit ? "update" : "create"} monitor`);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
                render={
                    <Button
                        onClick={(e) => e.stopPropagation()}
                        className={
                            isEdit
                                ? "border border-white/[0.08] bg-transparent text-white/60 hover:border-white/20 hover:bg-white/[0.04] hover:text-white"
                                : "bg-white text-black hover:bg-white/90"
                        }
                    />
                }
            >
                {isEdit ? "Edit" : "+ Add monitor"}
            </DialogTrigger>

            <DialogContent className="border border-white/[0.08] bg-[#12151C] text-white sm:rounded-2xl">
                <DialogHeader>
                    <DialogTitle className="font-display text-lg font-medium text-white/90">
                        {isEdit ? "Edit monitor" : "Create monitor"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5 pt-2">
                    <Field id="monitor-name" label="Name">
                        <Input
                            id="monitor-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Google"
                            required
                            className={inputClass}
                        />
                    </Field>

                    <Field id="monitor-url" label="URL">
                        <Input
                            id="monitor-url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://google.com"
                            required
                            className={`font-mono ${inputClass}`}
                        />
                    </Field>

                    <Field id="monitor-interval" label="Interval (minutes)">
                        <Input
                            id="monitor-interval"
                            type="number"
                            min={1}
                            value={interval}
                            onChange={(e) => setInterval(e.target.value)}
                            required
                            className={`font-mono ${inputClass}`}
                        />
                    </Field>

                    {error && (
                        <p className="font-mono text-xs" style={{ color: DOWN }}>
                            {error}
                        </p>
                    )}

                    <Button
                        className="w-full bg-white text-black hover:bg-white/90"
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? isEdit
                                ? "Updating..."
                                : "Creating..."
                            : isEdit
                                ? "Update monitor"
                                : "Create monitor"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}