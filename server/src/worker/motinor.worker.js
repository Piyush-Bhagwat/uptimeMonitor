import "dotenv/config";
import bullmqConnection from "../config/bullmq.config.js";
import { Worker } from "bullmq";
import MonitorModel from "../model/monitor.model.js";
import { checkEndpoint } from "../util/checkEndpoint.util.js";
import { connectDB } from "../config/mongoose.config.js";

const worker = new Worker(
    "monitoring-checks",

    async (job) => {
        console.log("Job received:", job.id);
        console.log("Job name:", job.name);
        console.log("Job data:", job.data);
        const monitor = await MonitorModel.findById(job.data.monitorId);

        if (!monitor) {
            console.error(`Monitor with ID ${job.data.monitorId} not found`);
            return;
        }

        const result = await checkEndpoint(monitor.url);
        console.log(`Check result for monitor ${monitor.url}:`, result);

        monitor.lastResult = {...result, checkedAt: new Date()};
        await monitor.save();
    },
    {
        connection: bullmqConnection
    }
);

worker.on("completed", (job) => {
    console.log(`Job ${job.id} completed`);
});

worker.on("failed", (job, error) => {
    console.error(`Job ${job?.id} failed:`, error);
});

await connectDB();
console.log("Monitoring worker started");