// ============================================
// Huddly — Room Store (Zustand)
// ============================================
import { create } from "zustand";
import type { Room, PlayerState, ChatMessage, ProximityPeer } from "@/types";

interface RoomState {
    // Current room
    currentRoom: Room | null;
    players: Map<string, PlayerState>;
    localPlayer: PlayerState | null;
    chatMessages: ChatMessage[];
    proximityPeers: ProximityPeer[];

    // UI state
    isChatOpen: boolean;
    isMinimapOpen: boolean;
    isParticipantsOpen: boolean;
    isEmoteWheelOpen: boolean;

    // Actions
    setCurrentRoom: (room: Room | null) => void;
    setLocalPlayer: (player: PlayerState) => void;
    updateLocalPosition: (x: number, y: number, direction: PlayerState["direction"], isMoving: boolean) => void;
    updatePlayer: (userId: string, state: Partial<PlayerState>) => void;
    removePlayer: (userId: string) => void;
    addChatMessage: (message: ChatMessage) => void;
    setProximityPeers: (peers: ProximityPeer[]) => void;

    // UI toggles
    toggleChat: () => void;
    toggleMinimap: () => void;
    toggleParticipants: () => void;
    setEmoteWheel: (open: boolean) => void;
}

export const useRoomStore = create<RoomState>((set) => ({
    currentRoom: null,
    players: new Map(),
    localPlayer: null,
    chatMessages: [],
    proximityPeers: [],

    isChatOpen: false,
    isMinimapOpen: true,
    isParticipantsOpen: false,
    isEmoteWheelOpen: false,

    setCurrentRoom: (room) => set({ currentRoom: room }),

    setLocalPlayer: (player) => set({ localPlayer: player }),

    updateLocalPosition: (x, y, direction, isMoving) =>
        set((state) => ({
            localPlayer: state.localPlayer
                ? { ...state.localPlayer, x, y, direction, isMoving }
                : null,
        })),

    updatePlayer: (userId, updates) =>
        set((state) => {
            const newPlayers = new Map(state.players);
            const existing = newPlayers.get(userId);
            if (existing) {
                newPlayers.set(userId, { ...existing, ...updates });
            } else {
                newPlayers.set(userId, updates as PlayerState);
            }
            return { players: newPlayers };
        }),

    removePlayer: (userId) =>
        set((state) => {
            const newPlayers = new Map(state.players);
            newPlayers.delete(userId);
            return { players: newPlayers };
        }),

    addChatMessage: (message) =>
        set((state) => ({
            chatMessages: [...state.chatMessages.slice(-100), message],
        })),

    setProximityPeers: (peers) => set({ proximityPeers: peers }),

    toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),
    toggleMinimap: () => set((state) => ({ isMinimapOpen: !state.isMinimapOpen })),
    toggleParticipants: () => set((state) => ({ isParticipantsOpen: !state.isParticipantsOpen })),
    setEmoteWheel: (open) => set({ isEmoteWheelOpen: open }),
}));
