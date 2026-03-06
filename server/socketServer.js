/**
 * Huddly — Socket.io Real-Time Server (Hardened)
 *
 * Run: node server/socketServer.js
 *
 * Handles: player sync, movement, chat, meeting zones,
 * heartbeat/zombie cleanup, and health checks.
 */

const { Server } = require("socket.io");
const http = require("http");

const PORT = process.env.SOCKET_PORT || process.env.PORT || 3001;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

// ── HTTP Server with health check & CORS preflight ──────────
const server = http.createServer((req, res) => {
    // CORS preflight
    if (req.method === "OPTIONS") {
        res.writeHead(204, {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Max-Age": "86400",
        });
        res.end();
        return;
    }

    // Health check
    if (req.method === "GET" && req.url === "/health") {
        res.writeHead(200, {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
        });
        res.end(JSON.stringify({
            status: "alive",
            uptime: process.uptime(),
            players: players.size,
            timestamp: new Date().toISOString(),
        }));
        return;
    }

    // Stats endpoint
    if (req.method === "GET" && req.url === "/stats") {
        const roomCounts = {};
        for (const [, player] of players) {
            roomCounts[player.room] = (roomCounts[player.room] || 0) + 1;
        }
        res.writeHead(200, {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
        });
        res.end(JSON.stringify({
            totalPlayers: players.size,
            rooms: roomCounts,
        }));
        return;
    }

    res.writeHead(404);
    res.end();
});

// ── Socket.IO ───────────────────────────────────────────────
const io = new Server(server, {
    cors: {
        origin: CLIENT_URL,
        methods: ["GET", "POST"],
    },
    pingInterval: 10000,  // Send ping every 10s
    pingTimeout: 5000,    // Disconnect if no pong within 5s
});

// ── In-memory state ─────────────────────────────────────────
const players = new Map();

// ── Connection handler ──────────────────────────────────────
io.on("connection", (socket) => {
    const { userName, roomId } = socket.handshake?.query || {};
    const name = userName || `Guest_${socket.id.slice(0, 4)}`;
    const room = roomId || "office";

    console.log(`[+] ${name} joined room "${room}" (${socket.id})`);

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
        meetingZone: null,
        color: `hsl(${Math.random() * 360}, 60%, 45%)`,
        room,
        lastPing: Date.now(),
    };
    players.set(socket.id, player);

    // Notify others in room
    socket.to(room).emit("player:joined", player);

    // Send existing players to new joiner
    const roomPlayers = Array.from(players.values()).filter(p => p.room === room);
    socket.emit("players:sync", roomPlayers);

    // ── Movement ────────────────────────────────────────
    socket.on("player:move", (data) => {
        const p = players.get(socket.id);
        if (!p) return;

        p.x = data.x;
        p.y = data.y;
        p.z = data.z;
        p.zone = data.zone || p.zone;
        p.lastPing = Date.now();

        socket.to(room).emit("player:moved", {
            id: socket.id,
            x: data.x,
            y: data.y,
            z: data.z,
            zone: data.zone,
        });
    });

    // ── Chat ────────────────────────────────────────────
    socket.on("chat:message", (data) => {
        if (!data || !data.message) return;
        io.to(room).emit("chat:message", {
            id: Date.now().toString(),
            user: name,
            text: data.message.slice(0, 500), // Limit message length
            time: "now",
            type: data.channel || "global",
        });
    });

    // ── Whiteboard sync ─────────────────────────────────
    socket.on("whiteboard:update", (dataUrl) => {
        // Relay the whiteboard canvas to all other players in the room
        socket.to(room).emit("whiteboard:update", dataUrl);
    });

    // ── Meeting zone tracking ───────────────────────────
    socket.on("meeting:join", (meetingZone) => {
        if (!meetingZone) return;
        const p = players.get(socket.id);
        if (p) p.meetingZone = meetingZone;

        socket.join(`${room}:${meetingZone}`);
        io.to(`${room}:${meetingZone}`).emit("meeting:participant-joined", {
            id: socket.id,
            name,
            zone: meetingZone,
        });

        // Send list of all participants in this meeting zone
        const meetingParticipants = Array.from(players.values())
            .filter(pl => pl.room === room && pl.meetingZone === meetingZone)
            .map(pl => ({ id: pl.id, name: pl.name }));
        socket.emit("meeting:participants", meetingParticipants);
    });

    socket.on("meeting:leave", (meetingZone) => {
        if (!meetingZone) return;
        const p = players.get(socket.id);
        if (p) p.meetingZone = null;

        socket.leave(`${room}:${meetingZone}`);
        io.to(`${room}:${meetingZone}`).emit("meeting:participant-left", {
            id: socket.id,
        });
    });

    // ── WebRTC signaling relay ──────────────────────────
    socket.on("webrtc:offer", (data) => {
        if (data?.target && data?.offer) {
            socket.to(data.target).emit("webrtc:offer", { from: socket.id, offer: data.offer });
        }
    });

    socket.on("webrtc:answer", (data) => {
        if (data?.target && data?.answer) {
            socket.to(data.target).emit("webrtc:answer", { from: socket.id, answer: data.answer });
        }
    });

    socket.on("webrtc:ice-candidate", (data) => {
        if (data?.target && data?.candidate) {
            socket.to(data.target).emit("webrtc:ice-candidate", { from: socket.id, candidate: data.candidate });
        }
    });

    // ── Disconnect ──────────────────────────────────────
    socket.on("disconnect", (reason) => {
        console.log(`[-] ${name} left (${socket.id}) reason: ${reason}`);
        players.delete(socket.id);
        io.to(room).emit("player:left", socket.id);
    });

    // ── Error handling ──────────────────────────────────
    socket.on("error", (err) => {
        console.error(`[!] Socket error for ${name} (${socket.id}):`, err.message);
    });
});

// ── Zombie cleanup interval (every 60s) ─────────────────────
setInterval(() => {
    const now = Date.now();
    const timeout = 120000; // 2 minutes
    for (const [id, player] of players) {
        if (now - player.lastPing > timeout) {
            console.log(`[🧹] Cleaning zombie: ${player.name} (${id})`);
            players.delete(id);
            io.to(player.room).emit("player:left", id);
        }
    }
}, 60000);

// ── Start server ────────────────────────────────────────────
server.listen(PORT, () => {
    console.log(`\n🏢 Huddly Socket Server running on port ${PORT}`);
    console.log(`   Client URL: ${CLIENT_URL}`);
    console.log(`   Health: http://localhost:${PORT}/health`);
    console.log(`   Stats:  http://localhost:${PORT}/stats`);
    console.log(`   WebSocket ready for connections\n`);
});

// ── Graceful shutdown ───────────────────────────────────────
process.on("SIGTERM", () => {
    console.log("[!] SIGTERM received, shutting down gracefully...");
    io.close();
    server.close(() => process.exit(0));
});
