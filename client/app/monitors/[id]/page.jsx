"use client";

import ReactMarkdown from "react-markdown";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Activity,
    AlertCircle,
    AlertTriangle,
    ArrowLeft,
    BrainCircuit,
    CheckCircle2,
    Clock,
    Globe,
    XCircle,
    Zap,
    History,
} from "lucide-react";

import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import MonitorFormDialog from "@/components/MonitorFormDialog";

/*
  Fonts: this design assumes a display face + a mono face are available as
  Tailwind utilities `font-display` and `font-mono`. Easiest way to wire
  that up with next/font in your root layout:

    import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
    const display = Space_Grotesk({ subsets: ["latin"], variable: "--font-display" });
    const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });
    // <body className={`${display.variable} ${mono.variable}`}>

  Then in tailwind.config: fontFamily: { display: ["var(--font-display)"], mono: ["var(--font-mono)"] }

  If you don't want to touch the font setup right now, everything still
  works — `font-display` just falls back to your default sans.
*/

const UP = "#2DD4BF";
const DOWN = "#FB7185";
const MUTE = "#767E8C";

function formatRelativeTime(timestamp) {
    const generatedAt = new Date(timestamp);
    if (Number.isNaN(generatedAt.getTime())) return "recently";

    const elapsedSeconds = Math.max(0, Math.floor((Date.now() - generatedAt.getTime()) / 1000));
    if (elapsedSeconds < 60) return "just now";

    const elapsedMinutes = Math.floor(elapsedSeconds / 60);
    if (elapsedMinutes < 60) return `${elapsedMinutes}m ago`;

    const elapsedHours = Math.floor(elapsedMinutes / 60);
    if (elapsedHours < 24) return `${elapsedHours}h ago`;

    const elapsedDays = Math.floor(elapsedHours / 24);
    if (elapsedDays < 30) return `${elapsedDays}d ago`;

    return generatedAt.toLocaleDateString();
}

function calculateDuration(start, end) {
    const startTime = new Date(start).getTime();
    const endTime = end ? new Date(end).getTime() : Date.now();
    const diffMins = Math.round((endTime - startTime) / 1000 / 60);
    if (diffMins < 60) return `${diffMins}m`;
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours}h ${mins}m`;
}

// ── Status pulse — small live dot used throughout ──────────────────────────
function StatusPulse({ status, size = "text-xs" }) {
    const s = status?.toUpperCase();
    const color = s === "UP" ? UP : s === "DOWN" ? DOWN : MUTE;
    return (
        <span className={`inline-flex items-center gap-2 font-mono ${size} uppercase tracking-[0.15em]`} style={{ color }}>
            <span className="relative flex h-2 w-2">
                {(s === "UP" || s === "DOWN") && (
                    <span
                        className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-50"
                        style={{ backgroundColor: color }}
                    />
                )}
                <span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
            </span>
            {status || "unknown"}
        </span>
    );
}

// ── Signature element — oscilloscope-style pulse strip ──────────────────────
function PulseStrip({ status, checks }) {
    const total = checks?.total || 0;
    const failed = checks?.failed || 0;
    const bars = Array.from({ length: 40 }, (_, i) => {
        // Weight failures toward existing but keep it a texture, not a false data claim
        const failRatio = total > 0 ? failed / total : 0;
        const isDown = status?.toUpperCase() === "DOWN" && i > 35;
        const isFail = isDown || Math.random() < failRatio * 0.3;
        const height = isFail ? 40 + Math.random() * 20 : 55 + Math.random() * 45;
        return { height, isFail };
    });

    return (
        <div className="flex h-16 items-end gap-[3px] overflow-hidden rounded-md border border-white/[0.06] bg-black/20 px-3 py-2">
            {bars.map((bar, i) => (
                <div
                    key={i}
                    className="w-full rounded-[1px] transition-all"
                    style={{
                        height: `${bar.height}%`,
                        backgroundColor: bar.isFail ? DOWN : UP,
                        opacity: bar.isFail ? 0.85 : 0.35 + (i / bars.length) * 0.5,
                    }}
                />
            ))}
        </div>
    );
}

function StatRow({ icon: Icon, label, value, unit, accent }) {
    return (
        <div className="flex items-center justify-between border-b border-white/[0.06] py-3 last:border-0">
            <div className="flex items-center gap-2 text-[13px] text-white/50">
                <Icon className="h-3.5 w-3.5" />
                {label}
            </div>
            <div className="font-mono text-sm text-white/90" style={accent ? { color: accent } : undefined}>
                {value} {unit && <span className="text-white/40">{unit}</span>}
            </div>
        </div>
    );
}

function Signal({ icon: Icon, label, value, sub, tone }) {
    const color = tone === "bad" ? DOWN : tone === "good" ? UP : undefined;
    return (
        <div className="flex-1 px-6 py-5 first:pl-0 last:pr-0">
            <div className="mb-2 flex items-center gap-1.5 text-[11px] uppercase tracking-[0.12em] text-white/40">
                <Icon className="h-3 w-3" />
                {label}
            </div>
            <div className="font-mono text-2xl font-medium text-white/90" style={color ? { color } : undefined}>
                {value}
            </div>
            {sub && <div className="mt-1 text-xs text-white/40">{sub}</div>}
        </div>
    );
}

export default function MonitorDetailPage() {
    const params = useParams();
    const router = useRouter();

    const [monitor, setMonitor] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [checkState, setCheckState] = useState("idle");

    const [aiExplanation, setAiExplanation] = useState(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState("");

    async function fetchAIExplanation() {
        try {
            setAiLoading(true);
            setAiError("");
            const response = await apiFetch(`/ai/${params.id}/explain`);
            setAiExplanation(response?.data?.explanation || null);
        } catch (error) {
            console.error("AI explanation error:", error);
            setAiError(error.message || "Failed to load AI explanation.");
        } finally {
            setAiLoading(false);
        }
    }

    async function handleManualCheck() {
        setCheckState("checking");
        try {
            const response = await apiFetch(`/monitor/${params.id}/check`, { method: "GET" });
            setCheckState(response?.data?.success ? "success" : "failed");
            fetchData();
        } catch (error) {
            console.error(error);
            setCheckState("failed");
        } finally {
            setTimeout(() => setCheckState("idle"), 2000);
        }
    }

    async function fetchData() {
        try {
            const [monitorRes, analyticsRes, historyRes] = await Promise.all([
                apiFetch(`/monitor/${params.id}`),
                apiFetch(`/analytics/${params.id}`),
                apiFetch(`/history/${params.id}`),
            ]);
            setMonitor(monitorRes.data.monitor);
            setAnalytics(analyticsRes.data.analyticsData);
            setIncidents(historyRes.data?.incidents || []);
            fetchAIExplanation();
        } catch (error) {
            console.error(error);
            setError(error.message || "Failed to load monitor data.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.replace("/login");
            return;
        }
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params.id, router]);

    if (loading) {
        return (
            <main className="min-h-screen bg-[#0B0D12] p-6 md:p-10">
                <div className="mx-auto w-full max-w-6xl space-y-8">
                    <div className="flex items-center justify-between">
                        <div className="space-y-2">
                            <Skeleton className="h-3 w-24 bg-white/5" />
                            <Skeleton className="h-8 w-56 bg-white/5" />
                        </div>
                        <Skeleton className="h-10 w-28 bg-white/5" />
                    </div>
                    <Skeleton className="h-40 w-full rounded-xl bg-white/5" />
                    <Skeleton className="h-24 w-full rounded-xl bg-white/5" />
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
                    <Button className="mt-6" variant="outline" onClick={() => router.push("/monitors")}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to monitors
                    </Button>
                </div>
            </main>
        );
    }

    if (!monitor) {
        return (
            <main className="flex min-h-screen flex-col items-center justify-center bg-[#0B0D12] text-white/60">
                <Activity className="mb-4 h-10 w-10 text-white/20" />
                <h2 className="font-display text-lg text-white/80">Monitor not found</h2>
                <Button className="mt-4" variant="outline" onClick={() => router.push("/monitors")}>
                    Back to dashboard
                </Button>
            </main>
        );
    }

    const uptimeVal = analytics?.uptimePercentage;
    const uptimeColor = uptimeVal == null ? MUTE : uptimeVal < 90 ? DOWN : UP;

    return (
        <main className="min-h-screen bg-[#0B0D12] px-6 pb-24 pt-8 text-white md:px-10">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">

                {/* Top bar */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => router.push("/monitors")}
                        className="flex items-center gap-2 text-sm text-white/40 transition-colors hover:text-white/80"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Monitors
                    </button>
                    <div className="flex items-center gap-2">
                        <MonitorFormDialog monitor={monitor} onSuccess={(updatedMonitor) => setMonitor(updatedMonitor)} />
                        <Button
                            variant={checkState === "failed" ? "destructive" : "default"}
                            onClick={handleManualCheck}
                            disabled={checkState === "checking"}
                            className="w-[130px] bg-white text-black hover:bg-white/90"
                        >
                            {checkState === "checking" && <Clock className="mr-2 h-4 w-4 animate-spin" />}
                            {checkState === "success" && <CheckCircle2 className="mr-2 h-4 w-4" />}
                            {checkState === "failed" && <XCircle className="mr-2 h-4 w-4" />}
                            {checkState === "checking" ? "Checking..." : checkState === "success" ? "Success" : checkState === "failed" ? "Failed" : "Check now"}
                        </Button>
                    </div>
                </div>

                {/* Identity */}
                <div className="space-y-2">
                    <div className="text-[11px] uppercase tracking-[0.2em] text-white/30">Monitor</div>
                    <div className="flex flex-wrap items-center gap-4">
                        <h1 className="font-display text-4xl font-semibold tracking-tight">{monitor.name}</h1>
                        <StatusPulse status={monitor.status} size="text-[13px]" />
                    </div>
                    <a
                        href={monitor.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex w-fit items-center gap-1.5 font-mono text-sm text-white/40 transition-colors hover:text-white/70"
                    >
                        <Globe className="h-3.5 w-3.5" />
                        {monitor.url}
                    </a>
                </div>

                {/* Hero band */}
                <div className="grid gap-6 rounded-2xl border border-white/[0.06] bg-[#12151C] p-6 md:grid-cols-[1fr_1.4fr_1fr] md:p-8">
                    <div>
                        <div className="mb-1 text-[11px] uppercase tracking-[0.15em] text-white/40">Uptime</div>
                        <div className="font-mono text-5xl font-semibold" style={{ color: uptimeColor }}>
                            {uptimeVal != null ? `${uptimeVal}%` : "—"}
                        </div>
                        <div className="mt-1 text-xs text-white/30">across recorded checks</div>
                    </div>

                    <div className="flex flex-col justify-center gap-2">
                        <div className="text-[11px] uppercase tracking-[0.15em] text-white/40">Signal</div>
                        <PulseStrip status={monitor.status} checks={analytics?.checks} />
                    </div>

                    <div>
                        <StatRow icon={Clock} label="Interval" value={monitor.interval} unit="min" />
                        <StatRow icon={Zap} label="Last response" value={monitor.lastResult?.responseTimeMs || "—"} unit="ms" />
                        <StatRow
                            icon={CheckCircle2}
                            label="Last checked"
                            value={
                                monitor.lastResult?.checkedAt
                                    ? new Date(monitor.lastResult.checkedAt).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" })
                                    : "Never"
                            }
                        />
                    </div>
                </div>

                {/* Signals strip */}
                <section>
                    <div className="mb-3 text-[11px] uppercase tracking-[0.15em] text-white/30">Analytics</div>
                    {analytics ? (
                        <div className="flex flex-col divide-y divide-white/[0.06] rounded-2xl border border-white/[0.06] bg-[#12151C] md:flex-row md:divide-x md:divide-y-0">
                            <Signal icon={Clock} label="Downtime" value={`${analytics.totalDowntimeMinutes}m`} />
                            <Signal
                                icon={Zap}
                                label="Avg latency"
                                value={analytics.latency?.avg ? `${analytics.latency.avg.toFixed(1)}ms` : "—"}
                            />
                            <Signal
                                icon={CheckCircle2}
                                label="Checks"
                                value={analytics.checks?.total || 0}
                                sub={`${analytics.checks?.successful || 0} ok · ${analytics.checks?.failed || 0} failed`}
                            />
                            <Signal
                                icon={AlertTriangle}
                                label="Incidents"
                                value={analytics.incidentCount}
                                tone={analytics.incidentCount > 0 ? "bad" : undefined}
                            />
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-dashed border-white/[0.08] p-8 text-center text-sm text-white/30">
                            No analytics data available for this monitor yet.
                        </div>
                    )}
                </section>

                {/* Body: incidents + AI sidebar */}
                <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr] lg:items-start">

                    {/* Incident timeline */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.15em] text-white/30">
                            <History className="h-3.5 w-3.5" />
                            Incident history
                        </div>

                        {incidents.length > 0 ? (
                            <div className="relative space-y-6 border-l border-white/[0.08] pl-6">
                                {incidents.map((incident) => {
                                    const resolved = !!incident.endTime;
                                    return (
                                        <div key={incident._id} className="relative">
                                            <span
                                                className="absolute -left-[29px] top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-[#0B0D12]"
                                                style={{ backgroundColor: resolved ? UP : DOWN }}
                                            />
                                            <div className="flex flex-col gap-2 rounded-xl border border-white/[0.06] bg-[#12151C] p-4 sm:flex-row sm:items-start sm:justify-between">
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <span
                                                            className="rounded-full px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide"
                                                            style={{
                                                                color: resolved ? UP : DOWN,
                                                                backgroundColor: resolved ? `${UP}1A` : `${DOWN}1A`,
                                                            }}
                                                        >
                                                            {resolved ? "Resolved" : "Ongoing"}
                                                        </span>
                                                        <span className="font-mono text-xs text-white/50">
                                                            {calculateDuration(incident.startTime, incident.endTime)} downtime
                                                        </span>
                                                    </div>
                                                    <p className="max-w-xl break-all rounded-md bg-black/30 p-2 font-mono text-xs text-white/50">
                                                        {incident.errorMessage || "No error message provided"}
                                                    </p>
                                                </div>
                                                <div className="whitespace-nowrap font-mono text-xs text-white/40 sm:text-right">
                                                    <div>Start {new Date(incident.startTime).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" })}</div>
                                                    {resolved && (
                                                        <div>End {new Date(incident.endTime).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" })}</div>
                                                    )}
                                                    <div className="mt-1 text-white/25">{incident.checkIds?.length || 0} checks failed</div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-dashed border-white/[0.08] p-10 text-center">
                                <CheckCircle2 className="mx-auto mb-3 h-7 w-7" style={{ color: UP }} />
                                <h3 className="font-display text-base text-white/80">Clean record</h3>
                                <p className="mt-1 text-sm text-white/40">No incidents or downtime recorded for this monitor.</p>
                            </div>
                        )}
                    </section>

                    {/* AI insights — sticky sidebar, distinct voice */}
                    <section className="lg:sticky lg:top-8">
                        <div className="mb-3 flex items-center gap-2 text-[11px] uppercase tracking-[0.15em] text-white/30">
                            <BrainCircuit className="h-3.5 w-3.5" />
                            AI insights
                        </div>

                        <div className="rounded-2xl border border-[#8B5CF6]/20 bg-gradient-to-b from-[#8B5CF6]/[0.07] to-transparent p-5">
                            {aiLoading ? (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm text-white/40">
                                        <BrainCircuit className="h-4 w-4 animate-pulse" style={{ color: "#8B5CF6" }} />
                                        Analyzing monitor data...
                                    </div>
                                    <Skeleton className="h-3 w-full bg-white/5" />
                                    <Skeleton className="h-3 w-[85%] bg-white/5" />
                                    <Skeleton className="h-3 w-[70%] bg-white/5" />
                                </div>
                            ) : aiError ? (
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" style={{ color: DOWN }} />
                                    <div>
                                        <p className="text-sm font-medium text-white/80">Unable to load insights</p>
                                        <p className="mt-1 text-xs text-white/40">{aiError}</p>
                                    </div>
                                </div>
                            ) : aiExplanation?.text ? (
                                <div className="space-y-4">
                                    <div className="prose prose-sm prose-invert max-w-none prose-p:text-white/70 prose-headings:font-display prose-strong:text-white/90">
                                        <ReactMarkdown>{aiExplanation.text}</ReactMarkdown>
                                    </div>
                                    <div className="flex items-center gap-2 border-t border-white/[0.06] pt-3 font-mono text-[11px] text-white/30">
                                        <Clock className="h-3 w-3" />
                                        {formatRelativeTime(aiExplanation.generatedAt)}
                                        <span>·</span>
                                        <span>updates every 3h</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-4 text-center">
                                    <BrainCircuit className="mx-auto mb-3 h-6 w-6 text-white/20" />
                                    <p className="text-sm text-white/50">Insights aren't available yet.</p>
                                    <p className="mt-1 text-xs text-white/30">They'll appear once monitoring data comes in.</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
}