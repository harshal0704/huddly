"use client";

import { create } from "zustand";
import { io, Socket } from "socket.io-client";

interface Player {
    id: string;
    name: string;
    x: number;
    y: number;
    z: number;
    zone: string;
    color: string;
    avatarConfig?: Record<string, unknown>;
}

interface RealtimeState {
    socket: Socket | null;
    connected: boolean;
    players: Map<string, Player>;
    myId: string;

    connect: (serverUrl: string, userName: string, roomId: string) => void;
    disconnect: () => void;
    updatePosition: (x: number, y: number, z: number, zone: string) => void;
    sendChat: (message: string, channel: "global" | "proximity") => void;
}

export const useRealtimeStore = create<RealtimeState>((set, get) => ({
    socket: null,
    connected: false,
    players: new Map(),
    myId: "",

    connect: (serverUrl: string, userName: string, roomId: string) => {
        const existing = get().socket;
        if (existing) existing.disconnect();

        const socket = io(serverUrl, {
            query: { userName, roomId },
            transports: ["websocket", "polling"],
        });

        socket.on("connect", () => {
            set({ connected: true, myId: socket.id || "" });
            console.log("[Realtime] Connected:", socket.id);
        });

        socket.on("disconnect", () => {
            set({ connected: false });
            console.log("[Realtime] Disconnected");
        });

        socket.on("players:sync", (playerList: Player[]) => {
            const map = new Map<string, Player>();
            playerList.forEach(p => map.set(p.id, p));
            set({ players: map });
        });

        socket.on("player:joined", (player: Player) => {
            set(state => {
                const next = new Map(state.players);
                next.set(player.id, player);
                return { players: next };
            });
        });

        socket.on("player:moved", (data: { id: string; x: number; y: number; z: number; zone: string }) => {
            set(state => {
                const next = new Map(state.players);
                const existing = next.get(data.id);
                if (existing) {
                    next.set(data.id, { ...existing, ...data });
                }
                return { players: next };
            });
        });

        socket.on("player:left", (id: string) => {
            set(state => {
                const next = new Map(state.players);
                next.delete(id);
                return { players: next };
            });
        });

        set({ socket });
    },

    disconnect: () => {
        const { socket } = get();
        if (socket) {
            socket.disconnect();
            set({ socket: null, connected: false, players: new Map() });
        }
    },

    updatePosition: (x: number, y: number, z: number, zone: string) => {
        const { socket } = get();
        socket?.emit("player:move", { x, y, z, zone });
    },

    sendChat: (message: string, channel: "global" | "proximity") => {
        const { socket } = get();
        socket?.emit("chat:message", { message, channel });
    },
}));
