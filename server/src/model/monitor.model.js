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
    interval: { //minutes
        type: Number,
        required: true,
        default: 2,
        min: 1
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
        default: false
    },
    aiExplanation: {
        "24h": {
            text: String,
            generatedAt: Date
        },
        "7d": {
            text: String,
            generatedAt: Date
        }
    }
}, { timestamps: true });

const MonitorModel = mongoose.model("Monitor", monitorSchema);
export default MonitorModel;