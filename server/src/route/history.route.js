import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { HistoryController } from "../controller/history.controller.js";

const HistoryRouter = Router();

HistoryRouter.get("/:id", authMiddleware, HistoryController.get);

export default HistoryRouter;