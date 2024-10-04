const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");
const multer = require("multer");
const fs = require("fs");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const uploadDir = path.join(__dirname, "uploads");
const upload = multer({ dest: uploadDir }); // Save uploaded files here

// Middleware to serve static files
app.use(express.static("public"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

// Store users and shared files
let users = {};
let sharedFiles = [];

// Register users
app.post("/register", (req, res) => {
    const username = req.body.username;
    if (!users[username]) {
        users[username] = { id: username };
        res.redirect(`/home?username=${username}`);
    } else {
        res.send("Username already taken");
    }
});

// Home page after registration
app.get("/home", (req, res) => {
    const username = req.query.username;
    res.render("index", { username, files: sharedFiles });
});

// Upload files
app.post("/upload", upload.single("file"), (req, res) => {
    const file = req.file;
    sharedFiles.push({ filename: file.originalname, path: file.path, uploader: req.body.username });
    io.emit("newFile", sharedFiles); // Notify all peers about the new file
    res.redirect(`/home?username=${req.body.username}`);
});

// Download file
app.get("/download/:filename", (req, res) => {
    const file = sharedFiles.find((f) => f.filename === req.params.filename);
    if (file) {
        res.download(file.path, file.filename);
    } else {
        res.status(404).send("File not found");
    }
});

// WebSocket connection
io.on("connection", (socket) => {
    console.log("New client connected");
    socket.on("disconnect", () => console.log("Client disconnected"));
});

// Start the server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
