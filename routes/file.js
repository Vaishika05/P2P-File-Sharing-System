// routes/file.js
const express = require("express");
const multer = require("multer");
const path = require("path");
const File = require("../models/File");

module.exports = (io) => {
    const router = express.Router();

    const uploadDir = path.join(__dirname, "../uploads");
    const upload = multer({ dest: uploadDir }); // Save uploaded files here

    // To store the files in memory for demo purposes (this should ideally be handled through a database)
    let sharedFiles = [];

    // File Upload Route
    router.post("/upload", upload.single("file"), async (req, res) => {
        const file = req.file;

        if (!file) {
            return res.status(400).send("No file uploaded.");
        }

        try {
            const newFile = new File({
                filename: file.originalname,
                filepath: file.path,
                owner: req.body.username, // Assuming username is sent in the body
            });

            await newFile.save();
            sharedFiles.push(newFile); // Store in shared files array

            // Notify all clients about the new file upload via WebSocket
            io.emit("newFile", sharedFiles);

            res.status(201).json({ message: "File uploaded successfully" });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    });

    // Home page after registration
    // Home page after registration (fetch all files)
    router.get("/home", async (req, res) => {
        try {
            const files = await File.find(); // Fetch all files from the database
            res.json({ files }); // Send all files as a response
        } catch (error) {
            res.status(500).json({ error: "Error fetching files" });
        }
    });

    // Download file
    router.get("/download/:filename", (req, res) => {
        const file = sharedFiles.find((f) => f.filename === req.params.filename);
        if (file) {
            res.download(file.filepath, file.filename);
        } else {
            res.status(404).send("File not found");
        }
    });

    // Delete File Route
    router.delete("/delete/:filename", async (req, res) => {
        const filename = req.params.filename;

        try {
            // Find the file by its filename in the database
            const file = await File.findOne({ filename });

            if (!file) {
                return res.status(404).send("File not found.");
            }

            // Remove the file from the sharedFiles array
            sharedFiles = sharedFiles.filter((f) => f.filename !== filename);

            // Delete file from the database and file system
            await File.deleteOne({ filename });

            // Emit a WebSocket event to notify clients about the file deletion
            io.emit("deleteFile", filename);

            res.status(200).json({ message: "File deleted successfully." });
        } catch (error) {
            res.status(500).json({ error: "Error deleting file." });
        }
    });

    return router;
};
