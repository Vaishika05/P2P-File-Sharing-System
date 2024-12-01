import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import "./Home.css"; // Importing the CSS file for styling

const Home = () => {
    const [files, setFiles] = useState([]);
    const [filteredFiles, setFilteredFiles] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [recipientUsername, setRecipientUsername] = useState("");
    const [selectedTransferFile, setSelectedTransferFile] = useState(null);

    useEffect(() => {
        const socket = io("http://localhost:5000");

        socket.on("file-uploaded", (newFile) => {
            setFiles((prevFiles) => [...prevFiles, newFile]);
            setFilteredFiles((prevFiles) => [...prevFiles, newFile]);
        });

        socket.on("peer-login", (data) => {
            window.alert(`${data.message} at ${data.time}`);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    useEffect(() => {
        const fetchFiles = async () => {
            try {
                const response = await fetch(`http://localhost:5000/file/home`, {
                    method: "GET",
                    credentials: "include",
                });

                if (response.ok) {
                    const data = await response.json();
                    setFiles(data.files);
                    setFilteredFiles(data.files);
                } else {
                    console.error("Failed to fetch files");
                }
            } catch (error) {
                console.error("Error fetching files:", error);
            }
        };

        fetchFiles();
    }, []);

    const handleLogout = async () => {
        try {
            const response = await fetch("http://localhost:5000/auth/logout", {
                method: "POST",
                credentials: "include",
            });

            if (response.ok) {
                alert("Logged out successfully!");
                window.location.href = "/";
            } else {
                console.error("Failed to log out");
            }
        } catch (error) {
            console.error("Error logging out:", error);
        }
    };

    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);
        const filtered = files.filter((file) => file.filename.toLowerCase().includes(query));
        setFilteredFiles(filtered);
    };

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleFileUpload = async (e) => {
        e.preventDefault();
        if (!selectedFile) {
            alert("Please select a file first!");
            return;
        }

        const formData = new FormData();
        formData.append("file", selectedFile);

        try {
            const response = await fetch("http://localhost:5000/file/upload", {
                method: "POST",
                body: formData,
                credentials: "include",
            });

            if (response.ok) {
                alert("File uploaded successfully!");
                const newFile = await response.json();
                setFiles([...files, newFile]);
                setFilteredFiles([...filteredFiles, newFile]);
            } else {
                console.error("Failed to upload file");
            }
        } catch (error) {
            console.error("Error uploading file:", error);
        }
    };

    const handleDownload = (filename) => {
        window.location.href = `http://localhost:5000/file/download/${filename}`;
    };

    const handleDelete = async (filename) => {
        try {
            const response = await fetch(`http://localhost:5000/file/delete/${filename}`, {
                method: "DELETE",
                credentials: "include",
            });

            if (response.ok) {
                alert("File deleted successfully!");
                setFiles(files.filter((file) => file.filename !== filename));
                setFilteredFiles(filteredFiles.filter((file) => file.filename !== filename));
            } else {
                console.error("Failed to delete file");
            }
        } catch (error) {
            console.error("Error deleting file:", error);
        }
    };

    const handleTransfer = async (e) => {
        e.preventDefault();
        if (!selectedTransferFile || !recipientUsername) {
            alert("Please select a file and enter the recipient's username.");
            return;
        }

        const formData = new FormData();
        formData.append("file", selectedTransferFile);
        formData.append("recipientUsername", recipientUsername);

        try {
            const response = await fetch("http://localhost:5000/file/transfer", {
                method: "POST",
                body: formData,
                credentials: "include",
            });

            if (response.ok) {
                alert("File transferred successfully!");
            } else {
                console.error("Failed to transfer file");
            }
        } catch (error) {
            console.error("Error transferring file:", error);
        }
    };

    const handleTransferFileChange = (e) => {
        setSelectedTransferFile(e.target.files[0]);
    };

    return (
        <div className="home-container">
            <header className="home-header">
                <h1>Welcome to the File Sharing System</h1>
                <button className="logout-btn" onClick={handleLogout}>
                    Logout
                </button>
            </header>

            <section className="upload-section">
                <h2>Upload a File</h2>
                <form onSubmit={handleFileUpload}>
                    <input type="file" onChange={handleFileChange} />
                    <button type="submit">Upload</button>
                </form>
            </section>

            <section className="transfer-section">
                <h2>Transfer a File</h2>
                <form onSubmit={handleTransfer}>
                    <input type="file" onChange={handleTransferFileChange} />
                    <input
                        type="text"
                        placeholder="Recipient Username"
                        value={recipientUsername}
                        onChange={(e) => setRecipientUsername(e.target.value)}
                    />
                    <button type="submit">Transfer</button>
                </form>
            </section>

            <section className="search-section">
                <h2>Search Files</h2>
                <input type="text" placeholder="Search for files..." value={searchQuery} onChange={handleSearch} />
            </section>

            <section className="files-list-section">
                <h2>Uploaded Files</h2>
                <ul>
                    {filteredFiles.map((file) => (
                        <li key={file.filename} className="file-item">
                            <span>{file.filename}</span>
                            {file.username && <span>Uploaded by: {file.username}</span>}
                            <button onClick={() => handleDownload(file.filename)}>Download</button>
                            <button onClick={() => handleDelete(file.filename)}>Delete</button>
                        </li>
                    ))}
                </ul>
            </section>
        </div>
    );
};

export default Home;
