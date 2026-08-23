"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Activity } from "lucide-react";

import { apiFetch } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/store/authStore";

const UP = "#2DD4BF";
const DOWN = "#FB7185";

const inputClass =
    "border-white/[0.08] bg-black/20 text-white placeholder:text-white/25 focus-visible:ring-1 focus-visible:ring-[#2DD4BF]/40 focus-visible:border-[#2DD4BF]/40";

// Faint animated pulse bars — same signature motif as the monitor detail
// page, used here as ambient texture rather than data. Purely decorative.
function AmbientPulse() {
    const bars = Array.from({ length: 60 }, () => 30 + Math.random() * 70);
    return (
        <div className="flex h-10 items-end gap-[3px] opacity-[0.35]">
            {bars.map((h, i) => (
                <div
                    key={i}
                    className="w-full rounded-[1px]"
                    style={{ height: `${h}%`, backgroundColor: UP, opacity: 0.2 + (i / bars.length) * 0.5 }}
                />
            ))}
        </div>
    );
}

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            const data = await apiFetch("/auth/login", {
                method: "POST",
                body: JSON.stringify({ email, password }),
            });
            const token = data.data.token;

            login(token);
            router.push("/monitors");
        } catch (error) {
            console.error("Login error:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <main
            className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0B0D12] p-6"
            style={{
                backgroundImage:
                    "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
                backgroundSize: "40px 40px",
            }}
        >
            {/* Ambient glow */}
            <div
                className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px]"
                style={{ backgroundColor: `${UP}22` }}
            />

            <div className="relative w-full max-w-md">
                <div className="mb-8 flex flex-col items-center gap-3 text-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${UP}1A` }}>
                        <Activity className="h-5 w-5" style={{ color: UP }} />
                    </div>
                    <div className="font-display text-lg font-medium tracking-tight text-white">MonitorApp</div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#12151C]">
                    <div className="border-b border-white/[0.06] px-7 pb-6 pt-7">
                        <h1 className="font-display text-xl font-medium text-white">Welcome back</h1>
                        <p className="mt-1 text-sm text-white/40">Log in to your uptime monitoring dashboard.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5 px-7 py-6">
                        <div className="space-y-1.5">
                            <Label htmlFor="email" className="text-[11px] uppercase tracking-[0.12em] text-white/40">
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className={inputClass}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="password" className="text-[11px] uppercase tracking-[0.12em] text-white/40">
                                Password
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className={inputClass}
                            />
                        </div>

                        {error && (
                            <p className="font-mono text-xs" style={{ color: DOWN }}>
                                {error}
                            </p>
                        )}

                        <Button type="submit" className="w-full bg-white text-black hover:bg-white/90" disabled={loading}>
                            {loading ? "Logging in..." : "Log in"}
                        </Button>
                    </form>

                    <div className="border-t border-white/[0.06] px-7 py-4">
                        <AmbientPulse />
                    </div>
                </div>
            </div>
        </main>
    );
}