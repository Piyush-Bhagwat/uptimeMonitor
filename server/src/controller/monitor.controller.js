import { checkEndpoint, normalizeUrl } from "../util/checkEndpoint.util.js";
import MonitorModel from "../model/monitor.model.js";
import { ApiError, asyncHandler } from "../util/asyncHandler.util.js";
import monitoringQueue from "../queue/monitor.queue.js";

export const MonitorController = {
    create: asyncHandler(async (req, res) => {
        const { url, interval, name } = req.body;
        if (!url || !interval || !name) {
            throw new ApiError(400, "Missing required fields: url, interval, name");
        }

        const exisitingMonitor = await MonitorModel.findOne({ url: normalizeUrl(url), userId: req.user.id });
        if (exisitingMonitor) {
            throw new ApiError(409, "Monitor already exists for this URL");
        }

        const monitor = await MonitorModel.create({
            userId: req.user.id,
            url: normalizeUrl(url),
            interval,
            name
        });
        res.status(201).json({
            success: true,
            data: { monitor }
        });
    }),
    getAll: asyncHandler(async (req, res) => {
        const monitors = await MonitorModel.find({ userId: req.user.id });
        res.status(200).json({
            success: true,
            data: { monitors }
        });
    }),
    getById: asyncHandler(async (req, res) => {
        const monitor = await MonitorModel.findOne({ _id: req.params.id, userId: req.user.id });
        if (!monitor) {
            throw new ApiError(404, "Monitor not found");
        }
        res.status(200).json({
            success: true,
            data: { monitor }
        });
    }),
    update: asyncHandler(async (req, res) => {
        const { url, interval, name, status, isActive } = req.body;
        const monitor = await MonitorModel.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { url, interval, name, status, isActive },
            { new: true }
        );
        if (!monitor) {
            throw new ApiError(404, "Monitor not found");
        }
        res.status(200).json({
            success: true,
            data: { monitor }
        });
    }),
    delete: asyncHandler(async (req, res) => {
        const monitor = await MonitorModel.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!monitor) {
            throw new ApiError(404, "Monitor not found");
        }
        res.status(200).json({
            success: true,
            data: { monitor }
        });
    }),
    check: asyncHandler(async (req, res) => {
        const monitor = await MonitorModel.findOne({ _id: req.params.id, userId: req.user.id });
        if (!monitor) {
            throw new ApiError(404, "Monitor not found");
        }
        await monitoringQueue.add(
            "check-endpoint",
            {
                monitorId: monitor._id.toString(),
            }
        );
        res.status(202).json({
            success: true,
            message: "Monitor check initiated"
        });
    })
}