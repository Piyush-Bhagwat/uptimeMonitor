import { Router } from "express";
import AuthRouter from "./auth.route.js";
import MonitorRouter from "./monitor.route.js";
import AnalyticsRouter from "./analytics.route.js";

const router= Router();

router.use("/auth", AuthRouter);
router.use("/monitor", MonitorRouter);
router.use("/analytics", AnalyticsRouter);

export default router;