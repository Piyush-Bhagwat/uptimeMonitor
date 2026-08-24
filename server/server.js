import "dotenv/config";

import { app } from "./src/app.js";
import { connectDB } from "./src/config/mongoose.config.js";
import redisClient from "./src/config/redis.config.js";

app.listen(3030, "0.0.0.0", async () => {
    console.log("Server started on port 3030");

    await connectDB();
    await redisClient.connect();
});