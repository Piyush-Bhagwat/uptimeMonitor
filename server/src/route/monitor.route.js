import { MonitorController } from "../controller/monitor.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { Router } from "express";

const MonitorRouter = Router();

MonitorRouter.use(authMiddleware)
MonitorRouter.get("/", MonitorController.getAll);
MonitorRouter.post("/", MonitorController.create);
MonitorRouter.get("/:id", MonitorController.getById);
MonitorRouter.put("/:id", MonitorController.update);
MonitorRouter.delete("/:id", MonitorController.delete);

MonitorRouter.get("/:id/check", MonitorController.check);
export default MonitorRouter;