require("dotenv").config();
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "http://localhost:3000", // Frontend URL
        methods: ["GET", "POST"],
        credentials: true,
    },
});

app.use(
    session({
        secret: "your-secret-key",
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false }, // Set to true if using HTTPS
    })
);
const userRoutes = require("./routes/auth.js");
const fileRoutes = require("./routes/file")(io); // Pass io to files route
app.use(
    cors({
        origin: "http://localhost:3000",
        methods: ["GET", "POST", "DELETE"],
        credentials: true, // Include if you need to send cookies
    })
);

app.use(express.json());

// MongoDB connection
mongoose
    .connect(
        "mongodb+srv://Vaishika:P2P1234@cluster0.k2bl8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
        {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        },
        {
            ssl: true,
            sslValidate: true,
            useNewUrlParser: true,
            useUnifiedTopology: true,
            tlsAllowInvalidCertificates: true,
        }
    )
    .then(() => console.log("MongoDB connected..."))
    .catch((err) => console.error("MongoDB connection error:", err));

// Middleware
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // For parsing application/json
app.set("view engine", "ejs");

// User Registration Route
app.use("/auth", userRoutes);
app.use("/file", fileRoutes);

// WebSocket connection
io.on("connection", (socket) => {
    const loginTime = new Date().toLocaleString();
    console.log("A peer has connected:", socket.id);
    // Notify all peers that a new peer has logged in
    io.emit("peer-login", {
        message: `Peer ${socket.id} has logged in.`,
        time: loginTime,
    });
    console.log("A new client connected");

    socket.on("file-uploaded", (newFile) => {
        io.emit("file-uploaded", newFile); // Broadcast the new file to all clients
    });

    socket.on("file-deleted", (filename) => {
        io.emit("file-deleted", filename); // Broadcast file deletion
    });

    socket.on("disconnect", () => {
        console.log("Client disconnected");
    });
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
