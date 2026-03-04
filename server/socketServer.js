/**
 * Huddly — Socket.io Real-Time Server
 *
 * Run standalone: npx ts-node server/socketServer.ts
 * Or: node server/socketServer.js (after tsc)
 *
 * This handles player sync, movement broadcast, chat relay,
 * and meeting room signaling.
 */

const { Server } = require("socket.io");
const http = require("http");

const PORT = process.env.SOCKET_PORT || 3001;

const server = http.createServer();
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
    },
});

// In-memory state
const players = new Map();
const rooms = new Map();

io.on("connection", (socket) => {
    const { userName, roomId } = socket.query || {};
    const name = userName || `Guest_${socket.id.slice(0, 4)}`;
    const room = roomId || "office";

    console.log(`[+] ${name} joined ${room} (${socket.id})`);

    // Join Socket.io room
    socket.join(room);

    // Register player
    const player = {
        id: socket.id,
        name,
        x: 0,
        y: 0.6,
        z: 24,
        zone: "Lobby",
        color: `hsl(${Math.random() * 360}, 60%, 45%)`,
        room,
    };
    players.set(socket.id, player);

    // Notify others
    socket.to(room).emit("player:joined", player);

    // Send existing players to new joiner
    const roomPlayers = Array.from(players.values()).filter(p => p.room === room);
    socket.emit("players:sync", roomPlayers);

    // Handle movement
    socket.on("player:move", (data) => {
        const p = players.get(socket.id);
        if (p) {
            p.x = data.x;
            p.y = data.y;
            p.z = data.z;
            p.zone = data.zone || p.zone;
            socket.to(room).emit("player:moved", {
                id: socket.id,
                x: data.x,
                y: data.y,
                z: data.z,
                zone: data.zone,
            });
        }
    });

    // Handle chat
    socket.on("chat:message", (data) => {
        io.to(room).emit("chat:message", {
            id: Date.now().toString(),
            user: name,
            text: data.message,
            time: "now",
            type: data.channel || "global",
        });
    });

    // Handle meeting room signaling
    socket.on("meeting:join", (meetingZone) => {
        socket.join(`${room}:${meetingZone}`);
        io.to(`${room}:${meetingZone}`).emit("meeting:participant-joined", { id: socket.id, name });
    });

    socket.on("meeting:leave", (meetingZone) => {
        socket.leave(`${room}:${meetingZone}`);
        io.to(`${room}:${meetingZone}`).emit("meeting:participant-left", { id: socket.id });
    });

    // WebRTC signaling relay
    socket.on("webrtc:offer", (data) => {
        socket.to(data.target).emit("webrtc:offer", { from: socket.id, offer: data.offer });
    });

    socket.on("webrtc:answer", (data) => {
        socket.to(data.target).emit("webrtc:answer", { from: socket.id, answer: data.answer });
    });

    socket.on("webrtc:ice-candidate", (data) => {
        socket.to(data.target).emit("webrtc:ice-candidate", { from: socket.id, candidate: data.candidate });
    });

    // Handle disconnect
    socket.on("disconnect", () => {
        console.log(`[-] ${name} left (${socket.id})`);
        players.delete(socket.id);
        io.to(room).emit("player:left", socket.id);
    });
});

server.listen(PORT, () => {
    console.log(`\n🏢 Huddly Socket Server running on port ${PORT}`);
    console.log(`   Client URL: ${process.env.CLIENT_URL || "http://localhost:3000"}`);
    console.log(`   WebSocket ready for connections\n`);
});
