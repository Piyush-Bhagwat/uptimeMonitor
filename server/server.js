import "dotenv/config";

import { app } from "./src/app.js";
import { connectDB } from "./src/config/mongoose.config.js";
import redisClient from "./src/config/redis.config.js";

const PORT = process.env.PORT || 3030;

app.listen(PORT, "0.0.0.0", async () => {
    console.log(`Server started on port ${PORT}`);

    await connectDB();
    await redisClient.connect();
});