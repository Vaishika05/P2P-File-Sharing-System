const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    ipAddress: {
        type: String,
        default: null, // Store IP address, null by default
    },
    status: { type: String, enum: ["online", "offline"], default: "online" },
    lastActive: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);
