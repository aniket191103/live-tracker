const socket = io();

if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            // Emit the user's location to the server
            socket.emit("send-location", { latitude, longitude });

            // Set the map view to the current user's location
            map.setView([latitude, longitude], 16);
        },
        (error) => {
            console.error(error);
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
        }
    );
}

// Create the map and set its initial view
const map = L.map("map").setView([0, 0], 16);

// Add tile layer to the map
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "OpenStreetMap",
}).addTo(map);

// Create an object to hold markers for different users
const markers = {};

// Listen for location updates from the server
socket.on("recieve-location", (data) => {
    const { id, latitude, longitude } = data;

    // Update the user's marker or create a new one
    if (markers[id]) {
        // Update existing marker's position
        markers[id].setLatLng([latitude, longitude]);
    } else {
        // Create a new marker for the user and add it to the map
        markers[id] = L.marker([latitude, longitude]).addTo(map);
    }

    // Optionally, you may set the view to the latest user location, but
    // it might be better to keep the user's location centered
    // Uncomment the following line if you want to center the map on any user's location
    // map.setView([latitude, longitude], 16);
});

// Listen for user disconnection events
socket.on("user-disconnected", (id) => {
    // Remove the marker of the disconnected user from the map
    if (markers[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
    }
});
