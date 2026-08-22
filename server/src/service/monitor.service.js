import { checkEndpoint } from "../util/checkEndpoint.util.js";
import MonitorModel from "../model/monitor.model.js";
import IncidentModel from "../model/incident.model.js";
import CheckModel from "../model/check.model.js";

export const MonitorService = {
    async checkMonitor(monitorId, job = null) {
        const monitor = await MonitorModel.findById(monitorId);

        if (!monitor) {
            console.error(`Monitor with ID ${job?.data.monitorId} not found`);
            return;
        }

        const result = await checkEndpoint(monitor.url);
        console.log(`Check result for monitor ${monitor.url}:`, result);

        monitor.lastResult = { ...result, checkedAt: new Date() };


        const activeIncidents = await IncidentModel.findOne({ monitorId: monitor._id, endTime: null });


        if (!result.success) {
            // If this isn't the final attempt, throw so BullMQ retries
            if (job && job.attemptsMade < 2) {
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
            // FINAL FAILURE
            monitor.status = "DOWN";
            await monitor.save();

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
            return result;
        }

        const check = await CheckModel.create({ //and one question is this always success route?
            ...result, status: "up",
            timestamp: new Date(), monitorId: monitor._id
        });

        if (activeIncidents) {
            activeIncidents.endTime = new Date();
            await activeIncidents.save();
        }
        monitor.status = "UP";
        await monitor.save();

        return result;
    }
}