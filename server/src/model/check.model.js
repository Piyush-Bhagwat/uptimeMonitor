import mongoose, { Schema } from "mongoose";

const checkSchema = new Schema({
    monitorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Monitor",
        required: true
    },

    timestamp: {
        type: Date,
        default: Date.now
    },

    status: {
        type: String,
        required: true
    },

    statusCode: {
        type: Number,
        default: null
    },

    responseTimeMs: {
        type: Number,
        default: null
    },

    error: {
        type: String,
        default: null
    }
});

const CheckModel = mongoose.model("Check", checkSchema);

export default CheckModel;