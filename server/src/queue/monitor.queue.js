import { Queue } from "bullmq";
import bullmqConnection from "../config/bullmq.config.js";

const monitoringQueue = new Queue("monitoring-checks", {
    connection: bullmqConnection
});

export default monitoringQueue;