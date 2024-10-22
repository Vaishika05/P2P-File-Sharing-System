// routes/file.js
const express = require("express");
const multer = require("multer");
const path = require("path");
const File = require("../models/File");
const axios = require("axios");

module.exports = (io) => {
    const router = express.Router();

    const uploadDir = path.join(__dirname, "../uploads");
    const upload = multer({ dest: uploadDir }); // Save uploaded files here

    // To store the files in memory for demo purposes (this should ideally be handled through a database)
    let sharedFiles = [];

    // File Upload Route
    router.post("/upload", upload.single("file"), async (req, res) => {
        const file = req.file;
        const username = req.body.username; // Assuming username is sent in the body

        if (!file) {
            return res.status(400).send("No file uploaded or username missing.");
        }

        try {
            const newFile = new File({
                filename: file.originalname,
                filepath: file.path,
                owner: username,
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

    // Simulated peer list (replace with dynamic peer discovery)
    const peers = [
        { ip: "192.168.1.3", port: 3002 },
        { ip: "192.168.1.4", port: 3003 },
    ];

    // Search for a file across all known peers
    router.get("/search/:filename", async (req, res) => {
        const { filename } = req.params;
        let fileFound = false;

        // Iterate through each peer to search for the file
        for (const peer of peers) {
            try {
                const response = await axios.get(`http://${peer.ip}:${peer.port}/files/search/${filename}`);
                const result = response.data;

                if (result.found) {
                    fileFound = true;
                    return res.status(200).send(`File found on peer at ${peer.ip}:${peer.port}`);
                }
            } catch (error) {
                console.error(`Error searching peer at ${peer.ip}:${peer.port}`, error);
            }
        }

        if (!fileFound) {
            res.status(404).send("File not found on any peers");
        }
    });

    // New route for transferring files to a peer by IP
    router.post("/transfer", upload.single("file"), async (req, res) => {
        const { recipientUsername } = req.body;
        const file = req.file;

        if (!file || !recipientUsername) {
            return res.status(400).send("File and recipient username are required.");
        }

        try {
            // Fetch recipient user's IP address from the database
            const recipientUser = await User.findOne({ username: recipientUsername });
            if (!recipientUser || !recipientUser.ipAddress) {
                return res.status(404).send("Recipient user not found or IP address missing.");
            }

            const recipientIp = recipientUser.ipAddress;
            const filePath = path.join(__dirname, "..", "uploads", file.filename);

            // Send file to the recipient IP via HTTP request
            const options = {
                hostname: recipientIp,
                port: 5000, // Assuming the recipient's server is running on port 5000
                path: "/file/receive", // A route on the recipient’s server to handle the file upload
                method: "POST",
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            };

            const reqFileTransfer = http.request(options, (response) => {
                response.on("data", (d) => {
                    process.stdout.write(d);
                });
            });

            // Send file data
            fs.createReadStream(filePath).pipe(reqFileTransfer);

            reqFileTransfer.on("error", (e) => {
                console.error(`Error in file transfer: ${e.message}`);
                return res.status(500).send("File transfer failed.");
            });

            reqFileTransfer.end();

            res.status(200).send("File transfer initiated.");
        } catch (error) {
            console.error("Error in file transfer:", error);
            res.status(500).send("Error transferring file.");
        }
    });

    // Receiving File Route (for peers to receive files)
    router.post("/receive", upload.single("file"), (req, res) => {
        const file = req.file;

        if (!file) {
            return res.status(400).send("No file received.");
        }

        const filePath = path.join(uploadDir, file.originalname); // Save file

        fs.rename(file.path, filePath, (err) => {
            if (err) {
                console.error("Error saving file:", err);
                return res.status(500).send("Error saving file.");
            }

            // Store the received file in sharedFiles array (in memory)
            sharedFiles.push({
                filename: file.originalname,
                filepath: filePath,
            });

            res.status(200).json({ message: "File received successfully." });
        });
    });

    module.exports = router;

    return router;
};
