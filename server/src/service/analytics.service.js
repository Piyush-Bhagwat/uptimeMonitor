import IncidentModel from "../model/incident.model.js";
import CheckModel from "../model/check.model.js";
import mongoose from "mongoose"
import { ApiError } from "../util/asyncHandler.util.js";

export const AnalyticsService = {

    analyzeChecks: async (monitorId, range) => {

        const id = new mongoose.Types.ObjectId(monitorId);

        const now = new Date();

        let startTime;

        if (range === "24h") {
            startTime = new Date(
                now.getTime() - 24 * 60 * 60 * 1000
            );
        } else if (range === "7d") {
            startTime = new Date(
                now.getTime() - 7 * 24 * 60 * 60 * 1000
            );
        } else {
            throw new ApiError(400, "Invalid range");
        }

        // 1. Check statistics
        const checkStats = await CheckModel.aggregate([
            {
                $match: {
                    monitorId: id,
                    timestamp: {
                        $gte: startTime,
                        $lte: now
                    }
                }
            },
            {
                $group: {
                    _id: null,

                    totalChecks: {
                        $sum: 1
                    },

                    successfulChecks: {
                        $sum: {
                            $cond: [
                                { $eq: ["$status", "up"] },
                                1,
                                0
                            ]
                        }
                    },

                    averageResponseTime: {
                        $avg: "$responseTimeMs"
                    },

                    minResponseTime: {
                        $min: "$responseTimeMs"
                    },

                    maxResponseTime: {
                        $max: "$responseTimeMs"
                    }
                }
            }
        ]);

        // 2. HTTP distribution
        const statusStats = await CheckModel.aggregate([
            {
                $match: {
                    monitorId: id,
                    timestamp: {
                        $gte: startTime,
                        $lte: now
                    }
                }
            },
            {
                $group: {
                    _id: "$statusCode",
                    count: {
                        $sum: 1
                    }
                }
            }
        ]);

        // 3. Incidents
        const incidents = await IncidentModel.find({
            monitorId: id,
            startTime: {
                $lte: now
            },
            $or: [
                {
                    endTime: {
                        $gte: startTime
                    }
                },
                {
                    endTime: null
                }
            ]
        });

        // 4. Calculate uptime
        const stats = checkStats[0] || {
            totalChecks: 0,
            successfulChecks: 0,
            averageResponseTime: 0,
            minResponseTime: 0,
            maxResponseTime: 0
        };

        const uptimePercentage =
            stats.totalChecks === 0
                ? 0
                : (
                    stats.successfulChecks /
                    stats.totalChecks
                ) * 100;

        // 5. HTTP distribution
        const httpDistribution = {};

        for (const item of statusStats) {
            const key = item._id === null
                ? "error"
                : String(item._id);

            httpDistribution[key] = item.count;
        }

        // 6. Downtime
        let totalDowntimeMs = 0;

        for (const incident of incidents) {

            const incidentStart = Math.max(
                incident.startTime.getTime(),
                startTime.getTime()
            );

            const incidentEnd = incident.endTime
                ? Math.min(
                    incident.endTime.getTime(),
                    now.getTime()
                )
                : now.getTime();

            if (incidentEnd > incidentStart) {
                totalDowntimeMs +=
                    incidentEnd - incidentStart;
            }
        }

        return {
            uptimePercentage,
            totalDowntimeMinutes:
                totalDowntimeMs / 1000 / 60,

            latency: {
                avg: stats.averageResponseTime,
                min: stats.minResponseTime,
                max: stats.maxResponseTime
            },

            incidentCount: incidents.length,

            httpDistribution,

            checks: {
                total: stats.totalChecks,
                successful: stats.successfulChecks,
                failed:
                    stats.totalChecks -
                    stats.successfulChecks
            }
        };
    }
};