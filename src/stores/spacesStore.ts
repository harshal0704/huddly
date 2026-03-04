// ============================================
// Huddly — Spaces Store (Zustand)
// ============================================
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Room, RoomTemplate, MapData } from "@/types";
import { generateRoomId } from "@/lib/utils";

// Default empty map
const createDefaultMap = (): MapData => ({
    width: 40,
    height: 30,
    tileWidth: 32,
    tileHeight: 32,
    layers: [
        { id: "floor", name: "Floor", type: "tile", visible: true, data: new Array(40 * 30).fill(1) },
        { id: "walls", name: "Walls", type: "tile", visible: true, data: new Array(40 * 30).fill(0) },
        { id: "objects", name: "Objects", type: "object", visible: true, objects: [] },
    ],
    objects: [],
    tilesets: [],
});

interface SpacesState {
    rooms: Room[];
    addRoom: (name: string, description: string, template: RoomTemplate, visibility: Room["visibility"], maxCapacity: number) => Room;
    deleteRoom: (id: string) => void;
    duplicateRoom: (id: string) => Room | null;
    updateRoom: (id: string, updates: Partial<Room>) => void;
}

export const useSpacesStore = create<SpacesState>()(
    persist(
        (set, get) => ({
            rooms: [
                {
                    id: "office",
                    name: "Team HQ 🏢",
                    description: "Our virtual office with team pods and a break area",
                    ownerId: "system",
                    template: "office",
                    visibility: "public",
                    maxCapacity: 50,
                    mapData: createDefaultMap(),
                    onlineCount: 0,
                    createdAt: new Date("2026-02-01"),
                    updatedAt: new Date("2026-02-20"),
                },
                {
                    id: "demo",
                    name: "Demo Classroom 📚",
                    description: "A cozy classroom for learning together",
                    ownerId: "system",
                    template: "classroom",
                    visibility: "public",
                    maxCapacity: 25,
                    mapData: createDefaultMap(),
                    onlineCount: 0,
                    createdAt: new Date("2026-01-15"),
                    updatedAt: new Date("2026-02-20"),
                },
                {
                    id: "cafe",
                    name: "Pixel Café ☕",
                    description: "Grab a virtual coffee and chat with friends",
                    ownerId: "system",
                    template: "cafe",
                    visibility: "public",
                    maxCapacity: 15,
                    mapData: createDefaultMap(),
                    onlineCount: 0,
                    createdAt: new Date("2026-02-10"),
                    updatedAt: new Date("2026-02-18"),
                },
                {
                    id: "conference",
                    name: "Tech Talk Hall 🎤",
                    description: "Conference hall for presentations and AMAs",
                    ownerId: "system",
                    template: "conference",
                    visibility: "public",
                    maxCapacity: 100,
                    mapData: createDefaultMap(),
                    onlineCount: 0,
                    createdAt: new Date("2026-02-05"),
                    updatedAt: new Date("2026-02-20"),
                },
                {
                    id: "party",
                    name: "Friday Vibes 🎉",
                    description: "Weekend Party Island with DJ booth and dance floor",
                    ownerId: "system",
                    template: "party",
                    visibility: "public",
                    maxCapacity: 30,
                    mapData: createDefaultMap(),
                    onlineCount: 0,
                    createdAt: new Date("2026-02-14"),
                    updatedAt: new Date("2026-02-20"),
                },
                {
                    id: "library",
                    name: "Quiet Library 📖",
                    description: "Focus zone with bookshelves and reading nooks",
                    ownerId: "system",
                    template: "library",
                    visibility: "public",
                    maxCapacity: 20,
                    mapData: createDefaultMap(),
                    onlineCount: 0,
                    createdAt: new Date("2026-02-15"),
                    updatedAt: new Date("2026-02-20"),
                },
                {
                    id: "gaming",
                    name: "Gaming Lounge 🎮",
                    description: "Arcade cabinets, ping pong, and neon vibes",
                    ownerId: "system",
                    template: "gaming",
                    visibility: "public",
                    maxCapacity: 20,
                    mapData: createDefaultMap(),
                    onlineCount: 0,
                    createdAt: new Date("2026-02-16"),
                    updatedAt: new Date("2026-02-20"),
                },
                {
                    id: "rooftop",
                    name: "Rooftop Bar 🌃",
                    description: "City skyline views with lounge seating",
                    ownerId: "system",
                    template: "rooftop",
                    visibility: "public",
                    maxCapacity: 25,
                    mapData: createDefaultMap(),
                    onlineCount: 0,
                    createdAt: new Date("2026-02-17"),
                    updatedAt: new Date("2026-02-20"),
                },
                {
                    id: "theater",
                    name: "Theater 🎭",
                    description: "Watch party with stage and tiered seating",
                    ownerId: "system",
                    template: "theater",
                    visibility: "public",
                    maxCapacity: 50,
                    mapData: createDefaultMap(),
                    onlineCount: 0,
                    createdAt: new Date("2026-02-18"),
                    updatedAt: new Date("2026-02-20"),
                },
                {
                    id: "blank",
                    name: "Blank Canvas 🎨",
                    description: "Empty room — build your own with Room Builder",
                    ownerId: "system",
                    template: "blank",
                    visibility: "public",
                    maxCapacity: 20,
                    mapData: createDefaultMap(),
                    onlineCount: 0,
                    createdAt: new Date("2026-02-19"),
                    updatedAt: new Date("2026-02-20"),
                },
            ],

            addRoom: (name, description, template, visibility, maxCapacity) => {
                const room: Room = {
                    id: generateRoomId(),
                    name,
                    description,
                    ownerId: "local-user",
                    template,
                    visibility,
                    maxCapacity,
                    mapData: createDefaultMap(),
                    onlineCount: 0,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
                set((state) => ({ rooms: [...state.rooms, room] }));
                return room;
            },

            deleteRoom: (id) =>
                set((state) => ({ rooms: state.rooms.filter((r) => r.id !== id) })),

            duplicateRoom: (id) => {
                const original = get().rooms.find((r) => r.id === id);
                if (!original) return null;
                const room: Room = {
                    ...original,
                    id: generateRoomId(),
                    name: `${original.name} (Copy)`,
                    onlineCount: 0,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
                set((state) => ({ rooms: [...state.rooms, room] }));
                return room;
            },

            updateRoom: (id, updates) =>
                set((state) => ({
                    rooms: state.rooms.map((r) =>
                        r.id === id ? { ...r, ...updates, updatedAt: new Date() } : r
                    ),
                })),
        }),
        { name: "huddly-spaces" }
    )
);
