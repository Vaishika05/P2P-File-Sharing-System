import React, { useEffect, useState } from "react";

const Home = () => {
    const [files, setFiles] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);

    useEffect(() => {
        // Fetch the uploaded files from the server
        const fetchFiles = async () => {
            try {
                const response = await fetch(`http://localhost:5000/file/home`, {
                    method: "GET",
                    credentials: "include",
                });

                if (response.ok) {
                    const data = await response.json();
                    setFiles(data.files); // Assuming the backend returns an array of files
                } else {
                    console.error("Failed to fetch files");
                }
            } catch (error) {
                console.error("Error fetching files:", error);
            }
        };

        fetchFiles();
    }, []);

    // Handle file selection
    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    // Handle file upload
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
                const newFile = await response.json(); // Assuming the response contains the new file info
                setFiles([...files, newFile]); // Add the new file to the list
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
                // Remove the file from the list
                setFiles(files.filter((file) => file.filename !== filename));
            } else {
                console.error("Failed to delete file");
            }
        } catch (error) {
            console.error("Error deleting file:", error);
        }
    };

    return (
        <div>
            <h1>Welcome!</h1>

            {/* Upload Section */}
            <h2>Upload a File</h2>
            <form onSubmit={handleFileUpload}>
                <input type="file" onChange={handleFileChange} />
                <button type="submit">Upload</button>
            </form>

            {/* Download Section */}
            <h2>All Uploaded Files</h2>
            <ul>
                {files.map((file) => (
                    <li key={file.filename}>
                        <span>{file.filename}</span>
                        <button onClick={() => handleDownload(file.filename)}>Download</button>
                        <button onClick={() => handleDelete(file.filename)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Home;
