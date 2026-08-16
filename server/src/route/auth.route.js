import { authMiddleware } from "../middleware/auth.middleware.js";
import { AuthController } from "../controller/auth.controller.js";
import { Router } from "express";

const AuthRouter = Router();

AuthRouter.post("/register", AuthController.register);
AuthRouter.post("/login", AuthController.login);
AuthRouter.get("/me", authMiddleware, AuthController.getProfile);

export default AuthRouter;