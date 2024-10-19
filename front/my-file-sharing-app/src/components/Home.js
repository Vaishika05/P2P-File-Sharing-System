// import React, { useEffect, useState } from "react";
// import io from "socket.io-client";

// const Home = () => {
//     const [files, setFiles] = useState([]);
//     const [selectedFile, setSelectedFile] = useState(null);

//     // Initialize the socket connection
//     useEffect(() => {
//         const socket = io("http://localhost:5000");

//         // Listen for the "file-uploaded" event
//         socket.on("file-uploaded", (newFile) => {
//             setFiles((prevFiles) => [...prevFiles, newFile]);
//         });

//         return () => {
//             // Clean up the connection on component unmount
//             socket.disconnect();
//         };
//     }, []);

//     useEffect(() => {
//         // Fetch the uploaded files from the server
//         const fetchFiles = async () => {
//             try {
//                 const response = await fetch(`http://localhost:5000/file/home`, {
//                     method: "GET",
//                     credentials: "include",
//                 });

//                 if (response.ok) {
//                     const data = await response.json();
//                     setFiles(data.files); // Assuming the backend returns an array of files
//                 } else {
//                     console.error("Failed to fetch files");
//                 }
//             } catch (error) {
//                 console.error("Error fetching files:", error);
//             }
//         };

//         fetchFiles();
//     }, []);

//     // Handle file selection
//     const handleFileChange = (e) => {
//         setSelectedFile(e.target.files[0]);
//     };

//     // Handle file upload
//     const handleFileUpload = async (e) => {
//         e.preventDefault();
//         if (!selectedFile) {
//             alert("Please select a file first!");
//             return;
//         }

//         const formData = new FormData();
//         formData.append("file", selectedFile);

//         try {
//             const response = await fetch("http://localhost:5000/file/upload", {
//                 method: "POST",
//                 body: formData,
//                 credentials: "include",
//             });

//             if (response.ok) {
//                 alert("File uploaded successfully!");
//                 const newFile = await response.json(); // Assuming the response contains the new file info
//                 setFiles([...files, newFile]); // Add the new file to the list
//             } else {
//                 console.error("Failed to upload file");
//             }
//         } catch (error) {
//             console.error("Error uploading file:", error);
//         }
//     };

//     const handleDownload = (filename) => {
//         window.location.href = `http://localhost:5000/file/download/${filename}`;
//     };

//     const handleDelete = async (filename) => {
//         try {
//             const response = await fetch(`http://localhost:5000/file/delete/${filename}`, {
//                 method: "DELETE",
//                 credentials: "include",
//             });

//             if (response.ok) {
//                 alert("File deleted successfully!");
//                 // Remove the file from the list
//                 setFiles(files.filter((file) => file.filename !== filename));
//             } else {
//                 console.error("Failed to delete file");
//             }
//         } catch (error) {
//             console.error("Error deleting file:", error);
//         }
//     };

//     return (
//         <div>
//             <h1>Welcome!</h1>

//             {/* Upload Section */}
//             <h2>Upload a File</h2>
//             <form onSubmit={handleFileUpload}>
//                 <input type="file" onChange={handleFileChange} />
//                 <button type="submit">Upload</button>
//             </form>

//             {/* Download Section */}
//             <h2>All Uploaded Files</h2>
//             <ul>
//                 {files.map((file) => (
//                     <li key={file.filename}>
//                         <span>{file.filename}</span>
//                         <button onClick={() => handleDownload(file.filename)}>Download</button>
//                         <button onClick={() => handleDelete(file.filename)}>Delete</button>
//                     </li>
//                 ))}
//             </ul>
//         </div>
//     );
// };

// export default Home;

import React, { useEffect, useState } from "react";
import io from "socket.io-client";

const Home = () => {
    const [files, setFiles] = useState([]); // All files
    const [filteredFiles, setFilteredFiles] = useState([]); // Filtered files for search
    const [selectedFile, setSelectedFile] = useState(null);
    const [searchQuery, setSearchQuery] = useState(""); // Search input state

    // Initialize the socket connection
    useEffect(() => {
        const socket = io("http://localhost:5000");

        // Listen for the "file-uploaded" event
        socket.on("file-uploaded", (newFile) => {
            setFiles((prevFiles) => [...prevFiles, newFile]);
            setFilteredFiles((prevFiles) => [...prevFiles, newFile]); // Update filtered list too
        });

        socket.on("peer-login", (data) => {
            window.alert(`${data.message} at ${data.time}`);
        });

        return () => {
            // Clean up the connection on component unmount
            socket.disconnect();
        };
    }, []);

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
                    setFiles(data.files); // Set all files
                    setFilteredFiles(data.files); // Initialize the filtered files list
                } else {
                    console.error("Failed to fetch files");
                }
            } catch (error) {
                console.error("Error fetching files:", error);
            }
        };

        fetchFiles();
    }, []);

    // Handle logout
    const handleLogout = async () => {
        try {
            const response = await fetch("http://localhost:5000/auth/logout", {
                method: "POST",
                credentials: "include", // This will ensure the session is included in the request
            });

            if (response.ok) {
                alert("Logged out successfully!");
                window.location.href = "/"; // Redirect to login page after logout
            } else {
                console.error("Failed to log out");
            }
        } catch (error) {
            console.error("Error logging out:", error);
        }
    };

    // Handle search query change
    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);

        // Filter files based on the search query
        const filtered = files.filter((file) => file.filename.toLowerCase().includes(query));
        setFilteredFiles(filtered);
    };

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
                setFiles([...files, newFile]); // Add new file to all files
                setFilteredFiles([...filteredFiles, newFile]); // Add new file to filtered list
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
                // Remove the file from both lists (all files and filtered files)
                setFiles(files.filter((file) => file.filename !== filename));
                setFilteredFiles(filteredFiles.filter((file) => file.filename !== filename));
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
            {/* Logout button */}
            <button onClick={handleLogout}>Logout</button>
            {/* Notifications Section
            <h2>Peer Notifications</h2>
            <ul>
                {notifications.map((notification, index) => (
                    <li key={index}>{notification}</li>
                ))}
            </ul> */}

            {/* Upload Section */}
            <h2>Upload a File</h2>
            <form onSubmit={handleFileUpload}>
                <input type="file" onChange={handleFileChange} />
                <button type="submit">Upload</button>
            </form>

            {/* Search Section */}
            <h2>Search Files</h2>
            <input type="text" placeholder="Search for files..." value={searchQuery} onChange={handleSearch} />

            {/* Files List */}
            <h2>All Uploaded Files</h2>
            <ul>
                {filteredFiles.map((file) => (
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
