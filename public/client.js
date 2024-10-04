const socket = io();

// Listen for new file notifications
socket.on("newFile", (files) => {
    const fileList = document.getElementById("fileList");
    fileList.innerHTML = ""; // Clear the current list
    files.forEach((file) => {
        const li = document.createElement("li");
        li.innerHTML = `<a href="/download/${file.filename}">${file.filename}</a> (Uploaded by: ${file.uploader})`;
        fileList.appendChild(li);
    });
});
