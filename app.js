const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set the view engine to EJS
app.set("view engine", "ejs");

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, "public")));

// Handle socket connections
io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Listen for location updates from clients
    socket.on("send-location", (data) => {
        console.log(`Location received from ${socket.id}:`, data);
        io.emit("recieve-location", { id: socket.id, ...data });
    });

    // Handle user disconnections
    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
        io.emit("user-disconnected", socket.id);
    });
});

// Define the root route
app.get('/', (req, res) => {
    res.render("index");
});

// Start the server
const PORT = process.env.PORT || 3000; // Use the environment port if available
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
