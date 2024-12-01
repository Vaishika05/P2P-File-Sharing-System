import React, { useState } from "react";
import styles from "./Register.module.css";

const Register = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("http://localhost:5000/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                alert("User registered successfully!");
                window.location.href = "/"; // Redirect to login page
            } else {
                alert(data.error || "Registration failed.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("An error occurred while registering. Please try again.");
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h2 className={styles.title}>Create an Account</h2>
                <form className={styles.form} onSubmit={handleRegister}>
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
                        placeholder="Create a password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className={styles.input}
                    />
                    <button type="submit" className={styles.button}>
                        Register
                    </button>
                </form>
                <p className={styles.loginRedirect}>
                    Already have an account?{" "}
                    <a href="/" className={styles.link}>
                        Login
                    </a>
                </p>
            </div>
        </div>
    );
};

export default Register;
