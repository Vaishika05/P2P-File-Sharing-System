import React, { useState } from "react";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        console.log("Attempting to login with:", username, password);
        try {
            const response = await fetch("http://localhost:5000/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, password }),
                credentials: "include",
            });

            console.log("Response status:", response.status); // Log status code

            if (!response.ok) {
                const data = await response.json();
                alert(data.error);
                return;
            }

            const data = await response.json();
            console.log("Response data:", data);
            window.location.href = "/upload";
        } catch (error) {
            console.error("Error during login:", error); // Error log
            alert("Failed to connect to the server.");
        }
    };

    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Login</button>
            </form>
            <p>
                Don't have an account? <a href="/register">Sign up</a>
            </p>
        </div>
    );
};

export default Login;
