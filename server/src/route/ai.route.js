import { authMiddleware } from "../middleware/auth.middleware.js";
import { AiController } from "../controller/ai.controller.js";
import { Router } from "express";

const AiRouter = Router();

AiRouter.get("/:id/explain", authMiddleware, AiController.generateExplanation);

export default AiRouter;