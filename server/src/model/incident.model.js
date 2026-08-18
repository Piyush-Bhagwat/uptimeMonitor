import mongoose, { Schema } from "mongoose";

const incidentSchema = new Schema({
    monitorId: {
        type: Schema.Types.ObjectId,
        ref: "Monitor",
        required: true
    },
    startTime: {
        type: Date,
        default: Date.now
    },
    endTime: {
        type: Date,
        default: null
    },
    httpStatus: {
        type: Number,
        required: true
    },

    errorMessage: {
        type: String,
        default: null
    },
    checkIds: [{
        type: Schema.Types.ObjectId,
        ref: "Check"
    }]
}, { timestamps: true });

const IncidentModel = mongoose.model("Incident", incidentSchema);

export default IncidentModel;