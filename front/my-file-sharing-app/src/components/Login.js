import React, { useState } from "react";
import styles from "./Login.module.css";

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
            window.location.href = "/home";
        } catch (error) {
            console.error("Error during login:", error); // Error log
            alert("Failed to connect to the server.");
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h2 className={styles.title}>Welcome Back</h2>
                <form className={styles.form} onSubmit={handleLogin}>
                    <input
                        type="text"
                        placeholder="Enter your username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className={styles.input}
                    />
                    <input
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className={styles.input}
                    />
                    <button type="submit" className={styles.button}>
                        Login
                    </button>
                </form>
                <p className={styles.redirectText}>
                    Don't have an account?{" "}
                    <a href="/register" className={styles.link}>
                        Sign up
                    </a>
                </p>
            </div>
        </div>
    );
};

export default Login;
