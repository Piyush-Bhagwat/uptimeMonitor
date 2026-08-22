import "dotenv/config";
import bullmqConnection from "../config/bullmq.config.js";
import { Worker } from "bullmq";
import MonitorModel from "../model/monitor.model.js";
import { checkEndpoint } from "../util/checkEndpoint.util.js";
import { connectDB } from "../config/mongoose.config.js";
import CheckModel from "../model/check.model.js";
import IncidentModel from "../model/incident.model.js";
import { MonitorService } from "../service/monitor.service.js";

const worker = new Worker(
    "monitoring-checks",

    async (job) => {
        console.log("Job received:", job.id);
        console.log("Job name:", job.name);
        console.log("Job data:", job.data);
        await MonitorService.checkMonitor(job.data.monitorId, job);
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