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

export interface ChatMessage {
    id: string;
    user: string;
    text: string;
    time: string;
    type: "global" | "proximity" | "system";
    reactions?: Record<string, string[]>;
}

interface RealtimeState {
    socket: Socket | null;
    connected: boolean;
    players: Map<string, Player>;
    myId: string;
    chatMessages: ChatMessage[];
    whiteboardDataUrl: string | null;
    typingUsers: string[];
    roomId: string;

    connect: (serverUrl: string, userName: string, roomId: string) => void;
    disconnect: () => void;
    updatePosition: (x: number, y: number, z: number, zone: string) => void;
    sendChat: (message: string, channel: "global" | "proximity") => void;
    updateWhiteboard: (dataUrl: string | null) => void;
    setTyping: (isTyping: boolean) => void;
    addReaction: (messageId: string, emoji: string) => void;
}

// Fetch chat history from API
async function fetchChatHistory(roomId: string): Promise<ChatMessage[]> {
    try {
        const res = await fetch(`/api/rooms/${roomId}/messages?limit=100`);
        if (!res.ok) return [];
        const data = await res.json();
        return (data.messages || []).map((m: any) => ({
            id: m.id,
            user: m.user_name,
            text: m.content,
            time: new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            type: m.channel || "global",
            reactions: m.reactions || {},
        }));
    } catch {
        return [];
    }
}

// Persist a message to API (fire-and-forget)
function persistMessage(roomId: string, content: string, channel: string, userName: string) {
    fetch(`/api/rooms/${roomId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, channel, user_name: userName }),
    }).catch(() => { /* silently fail */ });
}

export const useRealtimeStore = create<RealtimeState>((set, get) => ({
    socket: null,
    connected: false,
    players: new Map(),
    myId: "",
    chatMessages: [],
    whiteboardDataUrl: null,
    typingUsers: [],
    roomId: "",

    connect: (serverUrl: string, userName: string, roomId: string) => {
        const existing = get().socket;
        if (existing) existing.disconnect();

        set({ roomId });

        const socket = io(serverUrl, {
            query: { userName, roomId },
            transports: ["websocket", "polling"],
        });

        socket.on("connect", async () => {
            set({
                connected: true,
                myId: socket.id || "",
            });
            console.log("[Realtime] Connected:", socket.id);

            // Load historical messages from Supabase
            const history = await fetchChatHistory(roomId);
            set((state) => ({
                chatMessages: [
                    ...history,
                    {
                        id: "sys-welcome",
                        user: "System",
                        text: "Connected! Walk near someone to start chatting.",
                        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                        type: "system",
                    },
                ],
            }));
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
                return {
                    players: next,
                    chatMessages: [...state.chatMessages, {
                        id: `join-${player.id}-${Date.now()}`,
                        user: "System",
                        text: `${player.name} joined the room`,
                        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                        type: "system" as const,
                    }],
                };
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
                const leaving = next.get(id);
                next.delete(id);
                return {
                    players: next,
                    chatMessages: leaving ? [...state.chatMessages, {
                        id: `leave-${id}-${Date.now()}`,
                        user: "System",
                        text: `${leaving.name} left the room`,
                        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                        type: "system" as const,
                    }] : state.chatMessages,
                };
            });
        });

        // Chat messages from server
        socket.on("chat:message", (msg: ChatMessage) => {
            set(state => ({
                chatMessages: [...state.chatMessages.slice(-199), {
                    ...msg,
                    time: msg.time === "now"
                        ? new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                        : msg.time,
                }],
            }));
        });

        // Typing indicators
        socket.on("chat:user-typing", (data: { name: string; isTyping: boolean }) => {
            set(state => {
                const filtered = state.typingUsers.filter(u => u !== data.name);
                return {
                    typingUsers: data.isTyping ? [...filtered, data.name] : filtered,
                };
            });
        });

        // Whiteboard updates
        socket.on("whiteboard:update", (dataUrl: string | null) => {
            set({ whiteboardDataUrl: dataUrl });
        });

        set({ socket });
    },

    disconnect: () => {
        const { socket } = get();
        if (socket) {
            socket.disconnect();
            set({ socket: null, connected: false, players: new Map(), chatMessages: [], typingUsers: [] });
        }
    },

    updatePosition: (x: number, y: number, z: number, zone: string) => {
        const { socket } = get();
        socket?.emit("player:move", { x, y, z, zone });
    },

    sendChat: (message: string, channel: "global" | "proximity") => {
        const { socket, roomId } = get();
        socket?.emit("chat:message", { message, channel });
        // Also persist to Supabase
        const userName = (socket as any)?.io?.opts?.query?.userName || "Guest";
        persistMessage(roomId, message, channel, userName);
    },

    updateWhiteboard: (dataUrl: string | null) => {
        const { socket } = get();
        set({ whiteboardDataUrl: dataUrl });
        socket?.emit("whiteboard:update", dataUrl);
    },

    setTyping: (isTyping: boolean) => {
        const { socket } = get();
        socket?.emit("chat:typing", { isTyping });
    },

    addReaction: (messageId: string, emoji: string) => {
        const { socket } = get();
        socket?.emit("chat:reaction", { messageId, emoji });
        // Optimistic update
        set(state => ({
            chatMessages: state.chatMessages.map(msg => {
                if (msg.id !== messageId) return msg;
                const reactions = { ...(msg.reactions || {}) };
                const users = reactions[emoji] || [];
                if (users.includes("You")) {
                    reactions[emoji] = users.filter(u => u !== "You");
                    if (reactions[emoji].length === 0) delete reactions[emoji];
                } else {
                    reactions[emoji] = [...users, "You"];
                }
                return { ...msg, reactions };
            }),
        }));
    },
}));
