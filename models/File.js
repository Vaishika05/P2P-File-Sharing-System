const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
    filename: { type: String, required: true },
    filepath: { type: String, required: true }, // Path to the file
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Reference to the User model
});

module.exports = mongoose.model("File", fileSchema);
