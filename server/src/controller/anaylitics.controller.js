import { GeminiService } from "../service/gemini.service.js";
import MonitorModel from "../model/monitor.model.js";
import { AnalyticsService } from "../service/analytics.service.js";
import { ApiError, asyncHandler } from "../util/asyncHandler.util.js";

export const AnalyticsController = {
    get: asyncHandler(async (req, res) => {
        const id = req.params.id;
        const range = req.query.range || "24h"; //24h || 7d

        if (range !== "24h" && range !== "7d") {
            throw new ApiError(400, "Invalid range");
        }

        const monitor = await MonitorModel.findOne({ _id: id, userId: req.user.id });

        if (!monitor) {
            throw new ApiError(404, "Monitor not found");
        }

        const analyticsData = await AnalyticsService.analyzeChecks(id, range);
        const cached = monitor.aiExplanation?.[range];

        const CACHE_DURATION = 3 * 60 * 60 * 1000; // 3 hours

        const cacheValid =
            cached?.text &&
            cached?.generatedAt &&
            Date.now() - new Date(cached.generatedAt).getTime() < CACHE_DURATION;

        if (!cacheValid) {
            try {
                const prompt = GeminiService.getAnalyticsPrompt(analyticsData, monitor);
                const geminiResponse = await GeminiService.generate(prompt);
                console.log("[ANALYTICS] Gemini response:", geminiResponse);
                monitor.aiExplanation[range] = {
                    text: geminiResponse,
                    generatedAt: new Date()
                };
                await monitor.save();
            } catch (error) {
                console.error("[ANALYTICS] Gemini API error:", error);
                // If there's an error with the Gemini API, we can still return the analytics data without the AI explanation.}
            }
        }
        analyticsData.explanation = {
            text: monitor.aiExplanation[range]?.text ?? "No explanation available",
            generatedAt: monitor.aiExplanation[range]?.generatedAt ?? null
        };

        res.status(200).json({ message: "Analytics data", data: { analyticsData } });
    })
}