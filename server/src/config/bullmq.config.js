import IORedis from "ioredis";

const bullmqConnection = new IORedis(process.env.REDIS_URL,{
    maxRetriesPerRequest: null
});

export default bullmqConnection;