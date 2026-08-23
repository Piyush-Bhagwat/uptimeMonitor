import { CheckCircle2, Clock, XCircle } from "lucide-react";

const UP = "#2DD4BF";
const DOWN = "#FB7185";
const MUTE = "#767E8C";

// Kept the same component contract (status in, badge out) so nothing else
// that imports StatusBadge needs to change. Visually it's now a pulse dot +
// mono label instead of a solid-fill badge — matches the detail page.
export default function StatusBadge({ status }) {
    const normalizedStatus = status?.toUpperCase() || "UNKNOWN";
    const color = normalizedStatus === "UP" ? UP : normalizedStatus === "DOWN" ? DOWN : MUTE;
    const Icon = normalizedStatus === "UP" ? CheckCircle2 : normalizedStatus === "DOWN" ? XCircle : Clock;

    return (
        <span
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-1 font-mono text-[11px] uppercase tracking-[0.1em]"
            style={{ color, borderColor: `${color}33`, backgroundColor: `${color}14` }}
        >
            <span className="relative flex h-1.5 w-1.5">
                {normalizedStatus !== "UNKNOWN" && (
                    <span
                        className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
                        style={{ backgroundColor: color }}
                    />
                )}
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
            </span>
            {normalizedStatus}
        </span>
    );
}