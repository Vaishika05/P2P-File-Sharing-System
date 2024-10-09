import React, { useState } from "react";

const FileUpload = () => {
    const [file, setFile] = useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleFileUpload = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("http://localhost:5001/file/upload", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`, // Add your token handling here
                },
                body: formData,
            });
            const data = await response.json();
            if (response.ok) {
                alert("File uploaded successfully!");
            } else {
                alert(data.error);
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    return (
        <div>
            <h2>File Upload</h2>
            <form onSubmit={handleFileUpload}>
                <input type="file" onChange={handleFileChange} required />
                <button type="submit">Upload</button>
            </form>
        </div>
    );
};

export default FileUpload;
