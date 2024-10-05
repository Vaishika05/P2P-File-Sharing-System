const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");
const multer = require("multer");
const mongoose = require("mongoose");

// Models
const User = require("./models/User");
const File = require("./models/File");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const uploadDir = path.join(__dirname, "uploads");
const upload = multer({ dest: uploadDir }); // Save uploaded files here

// MongoDB connection
mongoose
    .connect(
        "mongodb+srv://Vaishika:P2P1234@cluster0.k2bl8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
        {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }
    )
    .then(() => console.log("MongoDB connected..."))
    .catch((err) => console.error("MongoDB connection error:", err));

// Middleware
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // For parsing application/json
app.set("view engine", "ejs");

// File sharing data
let sharedFiles = [];

// User Registration Route
app.post("/register", async (req, res) => {
    console.log("Received registration data:", req.body); // Log incoming request body
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required." });
    }

    try {
        const newUser = new User({ username, password });
        await newUser.save();
        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// File Upload Route
app.post("/upload", upload.single("file"), async (req, res) => {
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
        io.emit("newFile", sharedFiles); // Notify all peers about the new file
        res.status(201).json({ message: "File uploaded successfully" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Home page after registration
app.get("/home", (req, res) => {
    const username = req.query.username;
    res.render("index", { username, files: sharedFiles });
});

// Download file
app.get("/download/:filename", (req, res) => {
    const file = sharedFiles.find((f) => f.filename === req.params.filename);
    if (file) {
        res.download(file.filepath, file.filename);
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
