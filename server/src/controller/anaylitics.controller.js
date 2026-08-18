import MonitorModel from "../model/monitor.model.js";
import { AnalyticsService } from "../service/analytics.service.js";
import { ApiError, asyncHandler } from "../util/asyncHandler.util.js";

export const AnaliticsController = {
    get: asyncHandler(async (req, res) => {
        const id = req.params.id;
        const range = req.query.range || "24h"; //24h || 7d

        if (range !== "24h" && range !== "7d") {
            throw new ApiError(400, "Invalid range");
        }

        const monitor = await MonitorModel.find({ _id: id, userId: req.user._id });

        if (!monitor) {
            throw new ApiError(404, "Monitor not found");
        }

        const analyticsData = await AnalyticsService.analyzeChecks(id, range);
        res.status(200).json({ message: "Analitics data", data: { analyticsData } });
    })
}