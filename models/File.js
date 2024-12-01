const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
    filename: { type: String, required: true },
    filepath: { type: String, required: true }, // Path to the file
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Reference to the User model
    uploadTime: { type: Date, default: Date.now }, // Add the upload time
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Reference to User who uploaded the file
});

module.exports = mongoose.model("File", fileSchema);
