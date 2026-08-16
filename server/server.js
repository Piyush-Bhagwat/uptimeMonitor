import "dotenv/config";

import { app } from "./src/app.js";
import { connectDB } from "./src/config/mongoose.config.js";
import redisClient from "./src/config/redis.config.js";

app.listen(3030, async () => {
    console.log("Server started on http://localhost:3030");
    console.log("Check Health on http://localhost:3030/health");
    await connectDB();
    // await redisClient.connect();
});