const mongoose = require("mongoose");

const interestSchema = new mongoose.Schema({
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FarmerPost",
        required: true,
    },
    buyerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FarmerUser",
        required: true,
    },
    farmerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FarmerUser",
        required: true,
    },
    message: {
        type: String,
        required: true,
        maxlength: 500,
    },
    status: {
        type: String,
        enum: ["pending", "contacted", "closed"],
        default: "pending",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Interest", interestSchema);
