import { ApiError, asyncHandler } from "../util/asyncHandler.util.js";
import MonitorModel from "../model/monitor.model.js";
import { AnalyticsService } from "../service/analytics.service.js";
import { GeminiService } from "../service/gemini.service.js";


export const AiController = {
    generateExplanation: asyncHandler(async (req, res) => {
        const id = req.params.id;
        const range = req.query.range || "24h";

        if (range !== "24h" && range !== "7d") {
            throw new ApiError(400, "Invalid range");
        }

        const monitor = await MonitorModel.findOne({
            _id: id,
            userId: req.user.id
        });

        if (!monitor) {
            throw new ApiError(404, "Monitor not found");
        }

        const analyticsData =
            await AnalyticsService.analyzeChecks(id, range);

        const cached = monitor.aiExplanation?.[range];

        const CACHE_DURATION = 3 * 60 * 60 * 1000;

        const cacheValid =
            cached?.text &&
            cached?.generatedAt &&
            Date.now() - new Date(cached.generatedAt).getTime() < CACHE_DURATION;

        if (cacheValid) {
            return res.status(200).json({
                success: true,
                data: {
                    explanation: cached
                }
            });
        }

        const prompt =
            GeminiService.getAnalyticsPrompt(analyticsData, monitor);

        const text = await GeminiService.generate(prompt);

        monitor.aiExplanation[range] = {
            text,
            generatedAt: new Date()
        };

        await monitor.save();

        res.status(200).json({
            success: true,
            data: {
                explanation: {
                    text,
                    generatedAt: monitor.aiExplanation[range].generatedAt
                }
            }
        });
    }),
}