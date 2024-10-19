const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();

// User registration
router.post("/register", async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: "User registered" });
});

// User login
router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        // Find the user in the database
        const user = await User.findOne({ username });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: "Invalid username or password" });
        }

        // Generate a token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "1h", // Token expires in 1 hour
        });

        // Set token in a cookie if needed
        res.cookie("token", token, {
            httpOnly: true, // Prevent access via JavaScript
            secure: process.env.NODE_ENV === "production", // Set secure cookie in production
            sameSite: "Strict",
        });

        // Send success message
        res.json({ token, message: "Login successful!" });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// user logout
router.post("/logout", (req, res) => {
    // Destroy the session and clear the cookie
    req.session.destroy((err) => {
        if (err) {
            console.error("Error destroying session:", err);
            return res.status(500).send("Error logging out");
        }

        res.clearCookie("connect.sid"); // Clearing the session cookie
        return res.status(200).send("Logged out successfully");
    });
});

module.exports = router;
