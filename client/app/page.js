"use client";

import Link from "next/link";
import { Activity, ArrowRight, BrainCircuit, Github, Linkedin, History, Zap, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/store/authStore";

const UP = "#2DD4BF";
const DOWN = "#FB7185";

const PORTFOLIO_URL = "https://piyushs-portfolio.netlify.app/";
const GITHUB_URL = "https://github.com/Piyush-Bhagwat";
const LINKEDIN_URL = "https://www.linkedin.com/in/piyush-bhagwat/";

const features = [
  {
    icon: Activity,
    title: "HTTP/HTTPS monitoring",
    desc: "Automated checks on your own schedule, with retries before anything is called downtime.",
  },
  {
    icon: History,
    title: "Incident history",
    desc: "Consecutive failures group into a single incident with start, end, and duration — not a wall of individual logs.",
  },
  {
    icon: BrainCircuit,
    title: "AI-generated insights",
    desc: "Plain-language explanations of what happened, generated from your monitor's real data — never invented.",
  },
];

function AuthCTA({ variant = "primary" }) {
  const { token, initialized } = useAuth();
  const loggedIn = initialized && !!token;

  const className =
    variant === "primary"
      ? "bg-white text-black hover:bg-white/90"
      : "border border-white/[0.1] bg-transparent text-white/70 hover:border-white/25 hover:bg-white/[0.04] hover:text-white";

  if (!initialized) {
    return <div className={`h-10 w-32 animate-pulse rounded-md bg-white/5`} />;
  }

  return (
    <Link href={loggedIn ? "/monitors" : "/login"}>
      <Button className={className}>
        {loggedIn ? "Go to monitors" : "Login"}
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </Link>
  );
}

// Decorative product preview — mirrors the detail page's hero band so the
// marketing page already looks like the product, not a separate brochure.
function PreviewPanel() {
  const bars = Array.from({ length: 28 }, () => 35 + Math.random() * 65);

  return (
    <div className="w-full max-w-sm rounded-2xl border border-white/[0.06] bg-[#12151C] p-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-display text-sm font-medium text-white/90">api.example.com</div>
          <div className="font-mono text-[11px] text-white/30">every 1m</div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.1em]" style={{ color: UP, borderColor: `${UP}33`, backgroundColor: `${UP}14` }}>
          <CheckCircle2 className="h-3 w-3" /> up
        </span>
      </div>

      <div className="mt-4 flex items-end gap-[3px]">
        {bars.map((h, i) => (
          <div key={i} className="w-full rounded-[1px]" style={{ height: `${h * 0.4}px`, backgroundColor: UP, opacity: 0.3 + (i / bars.length) * 0.5 }} />
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3 font-mono text-xs">
        <span className="text-white/40">Uptime</span>
        <span style={{ color: UP }}>99.94%</span>
      </div>
      <div className="mt-2 flex items-center justify-between font-mono text-xs">
        <span className="text-white/40">Avg latency</span>
        <span className="text-white/70">142ms</span>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div
      className="flex min-h-screen flex-col bg-[#0B0D12] text-white"
      style={{
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }}
    >
      {/* Nav */}
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6 md:px-10">
        <div className="flex items-center gap-2.5 font-display text-base font-medium tracking-tight">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: `${UP}1A` }}>
            <Activity className="h-4 w-4" style={{ color: UP }} />
          </div>
          MonitorApp
        </div>
        <AuthCTA variant="secondary" />
      </header>

      {/* Hero */}
      <section className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col items-center gap-14 px-6 py-16 md:flex-row md:items-center md:justify-between md:py-24 md:px-10">
        <div
          className="pointer-events-none absolute left-1/2 top-1/3 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px]"
          style={{ backgroundColor: `${UP}1A` }}
        />

        <div className="relative max-w-xl text-center md:text-left">
          <div className="mb-4 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: UP }} />
            Uptime monitoring, simplified
          </div>
          <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
            Know the moment your site goes down —{" "}
            <span style={{ color: UP }}>not an hour later.</span>
          </h1>
          <p className="mt-5 text-base leading-relaxed text-white/50">
            MonitorApp checks your endpoints on a schedule you set, turns failures into readable
            incident history instead of raw logs, and explains what happened in plain language —
            so you spend less time squinting at dashboards.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row md:justify-start">
            <AuthCTA variant="primary" />
          </div>
        </div>

        <div className="relative">
          <PreviewPanel />
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto w-full max-w-6xl border-t border-white/[0.06] px-6 py-14 md:px-10">
        <div className="grid gap-8 md:grid-cols-3">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title}>
              <Icon className="h-5 w-5" style={{ color: UP }} />
              <h3 className="mt-3 font-display text-base font-medium text-white/90">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-white/40">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer / credit */}
      <footer className="mx-auto w-full max-w-6xl border-t border-white/[0.06] px-6 py-8 md:px-10">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <p className="font-mono text-xs text-white/30">
            Built by{" "}
            <a href={PORTFOLIO_URL} target="_blank" rel="noreferrer" className="text-white/60 underline-offset-4 hover:text-white hover:underline">
              Piyush Bhagwat
            </a>
          </p>
          <div className="flex items-center gap-4">
            <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="text-white/40 transition-colors hover:text-white" aria-label="GitHub">
              GITHUB
            </a>
            <a href={LINKEDIN_URL} target="_blank" rel="noreferrer" className="text-white/40 transition-colors hover:text-white" aria-label="LinkedIn">
              LINKEDIN
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}