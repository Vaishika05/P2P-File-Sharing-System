const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();
const File = require("../models/File");

const uploadDir = path.join(__dirname, "../uploads");
const upload = multer({ dest: uploadDir }); // Save uploaded files here

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
            owner: req.body.username,
        });
        await newFile.save();
        res.status(201).json({ message: "File uploaded successfully" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Home page after registration
router.get("/home", (req, res) => {
    const username = req.query.username;
    res.render("index", { username, files: sharedFiles });
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

// Additional file-related routes can be added here

module.exports = router;
