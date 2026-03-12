// ============================================
// Huddly — Spaces Store (Zustand) — API-backed
// ============================================
import { create } from "zustand";
import type { Room, RoomTemplate } from "@/types";

interface SpacesState {
    rooms: Room[];
    isLoading: boolean;
    error: string | null;

    fetchRooms: () => Promise<void>;
    addRoom: (name: string, description: string, template: RoomTemplate, visibility: Room["visibility"], maxCapacity: number, password?: string) => Promise<Room>;
    deleteRoom: (id: string) => Promise<void>;
    duplicateRoom: (id: string) => Promise<Room | null>;
    updateRoom: (id: string, updates: Partial<Room>) => Promise<void>;
}

// Fallback rooms for offline/error scenarios
const FALLBACK_ROOMS: Room[] = [
    { id: "office", name: "Team HQ 🏢", description: "Our virtual office with team pods and a break area", ownerId: "system", template: "office", visibility: "public", maxCapacity: 50, mapData: { width: 40, height: 30, tileWidth: 32, tileHeight: 32, layers: [], objects: [], tilesets: [] }, onlineCount: 0, createdAt: new Date("2026-02-01"), updatedAt: new Date("2026-02-20") },
    { id: "demo", name: "Demo Classroom 📚", description: "A cozy classroom for learning together", ownerId: "system", template: "classroom", visibility: "public", maxCapacity: 25, mapData: { width: 40, height: 30, tileWidth: 32, tileHeight: 32, layers: [], objects: [], tilesets: [] }, onlineCount: 0, createdAt: new Date("2026-01-15"), updatedAt: new Date("2026-02-20") },
    { id: "cafe", name: "Pixel Café ☕", description: "Grab a virtual coffee and chat with friends", ownerId: "system", template: "cafe", visibility: "public", maxCapacity: 15, mapData: { width: 40, height: 30, tileWidth: 32, tileHeight: 32, layers: [], objects: [], tilesets: [] }, onlineCount: 0, createdAt: new Date("2026-02-10"), updatedAt: new Date("2026-02-18") },
    { id: "conference", name: "Tech Talk Hall 🎤", description: "Conference hall for presentations and AMAs", ownerId: "system", template: "conference", visibility: "public", maxCapacity: 100, mapData: { width: 40, height: 30, tileWidth: 32, tileHeight: 32, layers: [], objects: [], tilesets: [] }, onlineCount: 0, createdAt: new Date("2026-02-05"), updatedAt: new Date("2026-02-20") },
    { id: "party", name: "Friday Vibes 🎉", description: "Weekend Party Island", ownerId: "system", template: "party", visibility: "public", maxCapacity: 30, mapData: { width: 40, height: 30, tileWidth: 32, tileHeight: 32, layers: [], objects: [], tilesets: [] }, onlineCount: 0, createdAt: new Date("2026-02-14"), updatedAt: new Date("2026-02-20") },
    { id: "library", name: "Quiet Library 📖", description: "Focus zone with bookshelves", ownerId: "system", template: "library", visibility: "public", maxCapacity: 20, mapData: { width: 40, height: 30, tileWidth: 32, tileHeight: 32, layers: [], objects: [], tilesets: [] }, onlineCount: 0, createdAt: new Date("2026-02-15"), updatedAt: new Date("2026-02-20") },
    { id: "gaming", name: "Gaming Lounge 🎮", description: "Arcade cabinets and neon vibes", ownerId: "system", template: "gaming", visibility: "public", maxCapacity: 20, mapData: { width: 40, height: 30, tileWidth: 32, tileHeight: 32, layers: [], objects: [], tilesets: [] }, onlineCount: 0, createdAt: new Date("2026-02-16"), updatedAt: new Date("2026-02-20") },
    { id: "rooftop", name: "Rooftop Bar 🌃", description: "City skyline views", ownerId: "system", template: "rooftop", visibility: "public", maxCapacity: 25, mapData: { width: 40, height: 30, tileWidth: 32, tileHeight: 32, layers: [], objects: [], tilesets: [] }, onlineCount: 0, createdAt: new Date("2026-02-17"), updatedAt: new Date("2026-02-20") },
    { id: "theater", name: "Theater 🎭", description: "Watch party with stage", ownerId: "system", template: "theater", visibility: "public", maxCapacity: 50, mapData: { width: 40, height: 30, tileWidth: 32, tileHeight: 32, layers: [], objects: [], tilesets: [] }, onlineCount: 0, createdAt: new Date("2026-02-18"), updatedAt: new Date("2026-02-20") },
    { id: "blank", name: "Blank Canvas 🎨", description: "Build your own with Room Builder", ownerId: "system", template: "blank", visibility: "public", maxCapacity: 20, mapData: { width: 40, height: 30, tileWidth: 32, tileHeight: 32, layers: [], objects: [], tilesets: [] }, onlineCount: 0, createdAt: new Date("2026-02-19"), updatedAt: new Date("2026-02-20") },
];

function mapApiRoom(r: any): Room {
    return {
        id: r.id,
        name: r.name,
        description: r.description || "",
        ownerId: r.owner_id || "system",
        template: r.template || "office",
        visibility: r.visibility || "public",
        maxCapacity: r.max_capacity || 20,
        mapData: r.map_data || { width: 40, height: 30, tileWidth: 32, tileHeight: 32, layers: [], objects: [], tilesets: [] },
        customObjects: r.custom_objects,
        onlineCount: r.online_count || 0,
        createdAt: new Date(r.created_at),
        updatedAt: new Date(r.updated_at || r.created_at),
    };
}

export const useSpacesStore = create<SpacesState>((set, get) => ({
    rooms: FALLBACK_ROOMS,
    isLoading: false,
    error: null,

    fetchRooms: async () => {
        set({ isLoading: true, error: null });
        try {
            const res = await fetch("/api/rooms?limit=50");
            if (!res.ok) throw new Error("Failed to fetch rooms");
            const data = await res.json();
            const rooms = (data.rooms || []).map(mapApiRoom);
            set({ rooms: rooms.length > 0 ? rooms : FALLBACK_ROOMS, isLoading: false });
        } catch {
            set({ rooms: FALLBACK_ROOMS, isLoading: false });
        }
    },

    addRoom: async (name, description, template, visibility, maxCapacity, password) => {
        try {
            const res = await fetch("/api/rooms", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    description,
                    template,
                    visibility,
                    max_capacity: maxCapacity,
                    password,
                }),
            });

            if (!res.ok) throw new Error("Failed to create room");
            const data = await res.json();
            const room = mapApiRoom(data);
            set((state) => ({ rooms: [room, ...state.rooms] }));
            return room;
        } catch {
            // Fallback: create locally
            const room: Room = {
                id: `room_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
                name,
                description,
                ownerId: "local-user",
                template,
                visibility,
                maxCapacity,
                mapData: { width: 40, height: 30, tileWidth: 32, tileHeight: 32, layers: [], objects: [], tilesets: [] },
                onlineCount: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            set((state) => ({ rooms: [room, ...state.rooms] }));
            return room;
        }
    },

    deleteRoom: async (id) => {
        const prevRooms = get().rooms;
        // Optimistic delete
        set((state) => ({ rooms: state.rooms.filter((r) => r.id !== id) }));
        try {
            const res = await fetch(`/api/rooms/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error();
        } catch {
            // Revert on failure
            set({ rooms: prevRooms });
        }
    },

    duplicateRoom: async (id) => {
        const original = get().rooms.find((r) => r.id === id);
        if (!original) return null;
        return get().addRoom(
            `${original.name} (Copy)`,
            original.description,
            original.template,
            original.visibility,
            original.maxCapacity
        );
    },

    updateRoom: async (id, updates) => {
        const prevRooms = get().rooms;
        // Optimistic update
        set((state) => ({
            rooms: state.rooms.map((r) =>
                r.id === id ? { ...r, ...updates, updatedAt: new Date() } : r
            ),
        }));

        try {
            const res = await fetch(`/api/rooms/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updates),
            });
            if (!res.ok) throw new Error("Failed to update room");
        } catch {
            // Revert on failure
            set({ rooms: prevRooms });
        }
    },
}));
