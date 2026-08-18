import "dotenv/config";
import bullmqConnection from "../config/bullmq.config.js";
import { Worker } from "bullmq";
import MonitorModel from "../model/monitor.model.js";
import { checkEndpoint } from "../util/checkEndpoint.util.js";
import { connectDB } from "../config/mongoose.config.js";
import CheckModel from "../model/check.model.js";
import IncidentModel from "../model/incident.model.js";

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

        monitor.lastResult = { ...result, checkedAt: new Date() };
        await monitor.save();

        const activeIncidents = await IncidentModel.findOne({ monitorId: monitor._id, endTime: null });


        if (!result.success) {
            // If this isn't the final attempt, throw so BullMQ retries
            if (job.attemptsMade < 2) {
                throw new Error(
                    result.error || `Endpoint returned ${result.statusCode}`
                );
            }

            // Final attempt failed → now treat it as DOWN
            const check = await CheckModel.create({
                ...result,
                status: "down",
                timestamp: new Date(),
                monitorId: monitor._id
            });

            if (!activeIncidents) {
                await IncidentModel.create({
                    monitorId: monitor._id,
                    startTime: new Date(),
                    httpStatus: result.statusCode || 0,
                    errorMessage: result.error || `Endpoint returned ${result.statusCode}`,
                    checkIds: [check._id]
                });
            } else {
                activeIncidents.checkIds.push(check._id);
                await activeIncidents.save();
            }
            return;
        }

        const check = await CheckModel.create({ //and one question is this always success route?
            ...result, status: "up",
            timestamp: new Date(), monitorId: monitor._id
        });

        if (activeIncidents) {
            activeIncidents.endTime = new Date();
            await activeIncidents.save();
        }

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