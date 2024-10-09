require("dotenv").config();
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");
// const multer = require("multer");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const userRoutes = require("./routes/auth.js");
const fileRoutes = require("./routes/file")(io); // Pass io to files route
app.use(
    cors({
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
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
            sslValidate: true, // Not recommended for production
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
app.use("/file", fileRoutes); // Pass WebSocket (io) to file routes

// WebSocket connection
io.on("connection", (socket) => {
    console.log("New client connected");
    socket.on("disconnect", () => console.log("Client disconnected"));
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
