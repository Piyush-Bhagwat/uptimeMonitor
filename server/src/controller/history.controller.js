import CheckModel from "../model/check.model.js";
import IncidentModel from "../model/incident.model.js";
import MonitorModel from "../model/monitor.model.js";
import { ApiError, asyncHandler } from "../util/asyncHandler.util.js";

export const HistoryController = {
    get: asyncHandler(async (req, res) => {
        const monitor = await MonitorModel.findOne({
            _id: req.params.id,
            userId: req.user.id
        }).select("_id");

        if (!monitor) {
            throw new ApiError(404, "Monitor not found");
        }

        const [incidents, totalChecks] = await Promise.all([
            IncidentModel.find({ monitorId: monitor._id })
                .sort({ startTime: -1 }),
            CheckModel.countDocuments({ monitorId: monitor._id })
        ]);

        res.status(200).json({
            success: true,
            data: {
                incidents,
                totalChecks
            }
        });
    })
};