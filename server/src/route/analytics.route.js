import { AnaliticsController } from "../controller/anaylitics.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { Router } from "express";

const AnalyticsRouter = Router();

AnalyticsRouter.get("/:id", authMiddleware, AnaliticsController.get);

export default AnalyticsRouter;