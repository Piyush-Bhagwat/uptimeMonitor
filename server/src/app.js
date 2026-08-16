import express from "express";
import cors from "cors";
import errorHandler from "./middleware/errorHandler.js";
import router from "./route/index.route.js";

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Health route
app.get("/health", (req, res) => {
	res.json({ status: "ok", uptime: process.uptime() });
});
app.use("/api/v1", router);

// Error handler 
app.use(errorHandler);

export { app };