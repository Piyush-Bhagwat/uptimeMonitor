import mongoose, { Schema } from "mongoose";

const monitorSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    url: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["UP", "DOWN", "PAUSED"],
        default: "PAUSED"
    },
    interval: {
        type: Number,
        required: true,
        default: 2
    },
    lastResult: {
        success: String,
        statusCode: Number,
        responseTimeMs: Number,
        error: String,
        checkedAt: {
            type: Date,
            default: null
        }
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const MonitorModel = mongoose.model("Monitor", monitorSchema);
export default MonitorModel;