const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("./models/User"); // Assuming you have a User model
const app = express();
app.use(express.json());

app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        // Find the user in the database
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ error: "User not found" });
        }

        // Check if the password matches
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        // Create JWT token
        const token = jwt.sign({ userId: user._id }, "your_jwt_secret", { expiresIn: "1h" });

        res.json({ message: "Login successful", token });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});
