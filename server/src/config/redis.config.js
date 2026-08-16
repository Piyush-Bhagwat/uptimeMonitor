import { createClient } from "redis";
console.log(
    "REDIS URL:",
    process.env.REDIS_URL
        ? "DEFINED"
        : "UNDEFINED"
);

const redisClient = createClient({
    url: process.env.REDIS_URL
});

redisClient.on("error", (error) => {
    console.error("Redis error:", error);
});

redisClient.on("connect", () => {
    console.log("Connecting to Redis...");
});

redisClient.on("ready", () => {
    console.log("Redis connected");
});

export default redisClient;