import {
    CheckCircle2,
    Clock,
    XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";

export default function StatusBadge({ status }) {
    const normalizedStatus = status?.toUpperCase() || "UNKNOWN";

    switch (normalizedStatus) {
        case "UP":
            return (
                <Badge className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    UP
                </Badge>
            );

        case "DOWN":
            return (
                <Badge
                    variant="destructive"
                    className="flex items-center gap-1"
                >
                    <XCircle className="h-3 w-3" />
                    DOWN
                </Badge>
            );

        default:
            return (
                <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                >
                    <Clock className="h-3 w-3" />
                    {normalizedStatus}
                </Badge>
            );
    }
}