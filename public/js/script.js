const socket = io();

const markers = {}; // Store user markers
const bounds = L.latLngBounds(); // Create LatLngBounds to keep track of all markers

// Confirm connection to the server
socket.on("connect", () => {
    console.log(`Connected to server: ${socket.id}`);
});

// Check for geolocation support
if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            // Emit the user's location to the server
            socket.emit("send-location", { latitude, longitude });
            console.log(`Sending location: ${latitude}, ${longitude}`);

            // Update the map view to the current user's location
            map.setView([latitude, longitude], 16);
        },
        (error) => {
            console.error("Geolocation error:", error);
        },
        {
            enableHighAccuracy: false,
            timeout: 5000,
            maximumAge: 0,
        }
    );
}

// Create the map and set its initial view
const map = L.map("map").setView([0, 0], 2); // Initially set the map to a zoomed-out view

// Add tile layer to the map
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "OpenStreetMap",
}).addTo(map);

// Use standard Leaflet marker icon (default color)
const defaultIcon = L.icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Listen for location updates from the server
socket.on("recieve-location", (data) => {
    const { id, latitude, longitude } = data;

    // Update the user's marker or create a new one
    if (markers[id]) {
        markers[id].setLatLng([latitude, longitude]);
        console.log(`Marker for ${id} updated to: ${latitude}, ${longitude}`);
    } else {
        markers[id] = L.marker([latitude, longitude], { icon: defaultIcon }).addTo(map);
        console.log(`Marker created for ${id} at: ${latitude}, ${longitude}`);
    }

    // Add this marker's position to the bounds
    bounds.extend([latitude, longitude]);

    // Adjust the map view to include all markers
    map.fitBounds(bounds);
});

// Listen for user disconnection events
socket.on("user-disconnected", (id) => {
    if (markers[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
        console.log(`Marker removed for disconnected user: ${id}`);
    }
});
