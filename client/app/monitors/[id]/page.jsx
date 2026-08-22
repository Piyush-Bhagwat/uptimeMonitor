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
    History
} from "lucide-react";

import { apiFetch } from "@/lib/api";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import MonitorFormDialog from "@/components/MonitorFormDialog";

function formatRelativeTime(timestamp) {
    const generatedAt = new Date(timestamp);

    if (Number.isNaN(generatedAt.getTime())) {
        return "recently";
    }

    const elapsedSeconds = Math.max(
        0,
        Math.floor((Date.now() - generatedAt.getTime()) / 1000)
    );

    if (elapsedSeconds < 60) {
        return "just now";
    }

    const elapsedMinutes = Math.floor(elapsedSeconds / 60);
    if (elapsedMinutes < 60) {
        return `${elapsedMinutes} min${elapsedMinutes === 1 ? "" : "s"} ago`;
    }

    const elapsedHours = Math.floor(elapsedMinutes / 60);
    if (elapsedHours < 24) {
        return `${elapsedHours} hr${elapsedHours === 1 ? "" : "s"} ago`;
    }

    const elapsedDays = Math.floor(elapsedHours / 24);
    if (elapsedDays < 30) {
        return `${elapsedDays} day${elapsedDays === 1 ? "" : "s"} ago`;
    }

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

// Helper component for styled status badges
function StatusBadge({ status }) {
    const normalizedStatus = status?.toUpperCase() || "UNKNOWN";

    switch (normalizedStatus) {
        case "UP":
            return (
                <Badge className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-1 w-fit">
                    <CheckCircle2 className="h-3 w-3" /> UP
                </Badge>
            );
        case "DOWN":
            return (
                <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                    <XCircle className="h-3 w-3" /> DOWN
                </Badge>
            );
        default:
            return (
                <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                    <Clock className="h-3 w-3" /> {normalizedStatus}
                </Badge>
            );
    }
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

            const response = await apiFetch(
                `/ai/${params.id}/explain`
            );

            setAiExplanation(
                response?.data?.explanation || null
            );
        } catch (error) {
            console.error("AI explanation error:", error);
            setAiError(
                error.message || "Failed to load AI explanation."
            );
        } finally {
            setAiLoading(false);
        }
    }

    async function handleManualCheck() {
        setCheckState("checking");

        try {
            const response = await apiFetch(`/monitor/${params.id}/check`, {
                method: "GET",
            });

            setCheckState(response?.data?.success ? "success" : "failed");

            // Refresh data after manual check
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
            // Fetch monitor details, analytics, and history concurrently
            const [monitorRes, analyticsRes, historyRes] = await Promise.all([
                apiFetch(`/monitor/${params.id}`),
                apiFetch(`/analytics/${params.id}`),
                apiFetch(`/history/${params.id}`)
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
            <main className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-10 w-24" />
                </div>
                <div className="grid gap-4 md:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
                </div>
                <div className="space-y-4">
                    <Skeleton className="h-8 w-32" />
                    <div className="grid gap-4 md:grid-cols-5">
                        {[1, 2, 3, 4, 5].map((i) => <Skeleton key={`an-${i}`} className="h-32 rounded-xl" />)}
                    </div>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="p-6 md:p-8 max-w-7xl mx-auto w-full">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
                <Button className="mt-6" variant="outline" onClick={() => router.push("/monitors")}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to monitors
                </Button>
            </main>
        );
    }

    if (!monitor) {
        return (
            <main className="p-6 md:p-8 flex flex-col items-center justify-center min-h-[50vh]">
                <Activity className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h2 className="text-xl font-semibold">Monitor not found</h2>
                <Button className="mt-4" variant="outline" onClick={() => router.push("/monitors")}>
                    Back to Dashboard
                </Button>
            </main>
        );
    }

    return (
        <main className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto w-full pb-16">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight">
                            {monitor.name}
                        </h1>
                        <StatusBadge status={monitor.status} />
                    </div>
                    <a
                        href={monitor.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors w-fit"
                    >
                        <Globe className="h-4 w-4" />
                        {monitor.url}
                    </a>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <MonitorFormDialog
                        monitor={monitor}
                        onSuccess={(updatedMonitor) => setMonitor(updatedMonitor)}
                    />
                    <Button
                        variant={checkState === "failed" ? "destructive" : "default"}
                        onClick={handleManualCheck}
                        disabled={checkState === "checking"}
                        className="w-[130px] transition-all duration-300"
                    >
                        {checkState === "checking" && (
                            <Clock className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {checkState === "success" && (
                            <CheckCircle2 className="mr-2 h-4 w-4 animate-in zoom-in duration-300" />
                        )}
                        {checkState === "failed" && (
                            <XCircle className="mr-2 h-4 w-4 animate-in zoom-in duration-300" />
                        )}
                        {checkState === "checking" ? "Checking..." :
                            checkState === "success" ? "Success" :
                                checkState === "failed" ? "Failed" : "Check now"}
                    </Button>

                    <Button
                        variant="outline"
                        onClick={() => router.push("/monitors")}
                        className="w-fit"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                </div>
            </div>

            {/* Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Current Status
                        </CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{monitor.status}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Check Interval
                        </CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{monitor.interval} <span className="text-sm font-normal text-muted-foreground">min</span></div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Last Response Time
                        </CardTitle>
                        <Zap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {monitor.lastResult?.responseTimeMs || "—"} <span className="text-sm font-normal text-muted-foreground">ms</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Last Checked
                        </CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm font-medium mt-1">
                            {monitor.lastResult?.checkedAt
                                ? new Date(monitor.lastResult.checkedAt).toLocaleString(undefined, {
                                    dateStyle: 'short',
                                    timeStyle: 'short'
                                })
                                : "Never"}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Analytics Section */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold tracking-tight border-b pb-2">
                    Performance Analytics
                </h2>

                {analytics ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Uptime</CardTitle>
                                <Activity className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className={`text-2xl font-bold ${analytics.uptimePercentage < 90 ? 'text-red-500' : 'text-green-500'}`}>
                                    {analytics.uptimePercentage}%
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Total Downtime</CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{analytics.totalDowntimeMinutes} <span className="text-sm font-normal text-muted-foreground">min</span></div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Avg Latency</CardTitle>
                                <Zap className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {analytics.latency?.avg ? analytics.latency.avg.toFixed(1) : "—"} <span className="text-sm font-normal text-muted-foreground">ms</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Total Checks</CardTitle>
                                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{analytics.checks?.total || 0}</div>
                                <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                                    <span className="text-green-500 flex items-center"><CheckCircle2 className="h-3 w-3 mr-1" /> {analytics.checks?.successful || 0}</span>
                                    <span className="text-red-500 flex items-center"><XCircle className="h-3 w-3 mr-1" /> {analytics.checks?.failed || 0}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Incidents</CardTitle>
                                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className={`text-2xl font-bold ${analytics.incidentCount > 0 ? 'text-red-500' : ''}`}>
                                    {analytics.incidentCount}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    <Card className="border-dashed">
                        <CardContent className="p-8 text-center">
                            <Activity className="h-8 w-8 text-muted-foreground/50 mx-auto mb-3" />
                            <p className="text-muted-foreground">
                                No analytics data available for this monitor yet.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </section>

            {/* AI Insights Section */}
            <section className="space-y-4 pt-4">
                <div className="flex items-center gap-2 border-b pb-2">
                    <BrainCircuit className="h-6 w-6 text-primary" />

                    <h2 className="text-xl font-semibold tracking-tight">
                        AI Insights
                    </h2>
                </div>

                <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="p-6">

                        {aiLoading ? (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <BrainCircuit className="h-5 w-5 animate-pulse text-primary" />

                                    <p className="text-sm text-muted-foreground">
                                        Analyzing your monitor data...
                                    </p>
                                </div>

                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-[90%]" />
                                <Skeleton className="h-4 w-[75%]" />
                            </div>

                        ) : aiError ? (
                            <div className="flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />

                                <div>
                                    <p className="font-medium">
                                        Unable to load AI insights
                                    </p>

                                    <p className="text-sm text-muted-foreground mt-1">
                                        {aiError}
                                    </p>
                                </div>
                            </div>

                        ) : aiExplanation?.text ? (
                            <div className="space-y-4">

                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                    <ReactMarkdown>
                                        {aiExplanation.text}
                                    </ReactMarkdown>
                                </div>

                                <div className="flex items-center gap-2 pt-4 border-t border-primary/10 text-xs text-muted-foreground">
                                    <Clock className="h-3 w-3" />

                                    Generated{" "}
                                    {formatRelativeTime(
                                        aiExplanation.generatedAt
                                    )}

                                    <span>•</span>

                                    <span>
                                        Updates every 3 hours
                                    </span>
                                </div>

                            </div>

                        ) : (
                            <div className="flex flex-col items-center justify-center py-6 text-center">
                                <BrainCircuit className="h-8 w-8 text-muted-foreground/50 mb-3" />

                                <p className="text-muted-foreground text-sm">
                                    AI insights aren't available yet.
                                </p>

                                <p className="text-xs text-muted-foreground mt-1">
                                    Insights will appear automatically after
                                    monitoring data is available.
                                </p>
                            </div>
                        )}

                    </CardContent>
                </Card>
            </section>

            {/* Incident History Section */}
            <section className="space-y-4 pt-4">
                <div className="flex items-center gap-2 border-b pb-2">
                    <History className="h-6 w-6 text-muted-foreground" />
                    <h2 className="text-xl font-semibold tracking-tight">
                        Incident History
                    </h2>
                </div>

                {incidents.length > 0 ? (
                    <div className="space-y-4">
                        {incidents.map((incident) => (
                            <Card key={incident._id} className="overflow-hidden">
                                <div className={`h-1.5 w-full ${incident.endTime ? 'bg-green-500/80' : 'bg-red-500'}`} />
                                <CardContent className="p-5 flex flex-col sm:flex-row gap-4 sm:items-start justify-between">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            {incident.endTime ? (
                                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800">
                                                    Resolved
                                                </Badge>
                                            ) : (
                                                <Badge variant="destructive" className="animate-pulse">
                                                    Ongoing Outage
                                                </Badge>
                                            )}

                                            <span className="text-sm font-medium">
                                                {calculateDuration(incident.startTime, incident.endTime)} Downtime
                                            </span>
                                        </div>

                                        <p className="text-sm font-mono bg-muted p-2 rounded-md border text-muted-foreground max-w-2xl break-all">
                                            {incident.errorMessage || "No error message provided"}
                                        </p>
                                    </div>

                                    <div className="text-sm text-muted-foreground flex flex-col sm:items-end gap-1 whitespace-nowrap">
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="h-3.5 w-3.5" />
                                            Start: {new Date(incident.startTime).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                                        </div>
                                        {incident.endTime && (
                                            <div className="flex items-center gap-1.5">
                                                <CheckCircle2 className="h-3.5 w-3.5" />
                                                End: {new Date(incident.endTime).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                                            </div>
                                        )}
                                        <div className="text-xs mt-1">
                                            {incident.checkIds?.length || 0} checks failed
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="border-dashed">
                        <CardContent className="p-8 text-center">
                            <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-3" />
                            <h3 className="font-semibold text-lg mb-1">Clean Record</h3>
                            <p className="text-muted-foreground">
                                No incidents or downtime recorded for this monitor.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </section>
        </main>
    );
}