import { Router } from "express";
import AuthRouter from "./auth.route.js";
import MonitorRouter from "./monitor.route.js";
import AnalyticsRouter from "./analytics.route.js";
import HistoryRouter from "./history.route.js";
import AiRouter from "./ai.route.js";

const router= Router();

router.use("/auth", AuthRouter);
router.use("/monitor", MonitorRouter);
router.use("/analytics", AnalyticsRouter);
router.use("/history", HistoryRouter);
router.use("/ai", AiRouter);

export default router;