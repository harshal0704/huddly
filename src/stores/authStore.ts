// ============================================
// Huddly — Auth Store (Zustand)
// ============================================
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, AvatarConfig } from "@/types";

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;

    // Actions
    login: (user: User) => void;
    loginAsGuest: (name: string) => void;
    logout: () => void;
    updateAvatar: (avatar: AvatarConfig) => void;
    updateStatus: (status: User["status"]) => void;
}

const DEFAULT_AVATAR: AvatarConfig = {
    body: 0,
    hair: 0,
    hairColor: "#5C4033",
    top: 0,
    topColor: "#4A90D9",
    bottom: 0,
    bottomColor: "#2C3E50",
    accessory: 0,
    skinColor: "#FDBCB4",
};

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            isLoading: false,

            login: (user) => set({ user, isAuthenticated: true, isLoading: false }),

            loginAsGuest: (name) =>
                set({
                    user: {
                        id: `guest-${Math.random().toString(36).substring(2, 10)}`,
                        name,
                        email: "",
                        avatar: DEFAULT_AVATAR,
                        status: "available",
                        isGuest: true,
                    },
                    isAuthenticated: true,
                    isLoading: false,
                }),

            logout: () => set({ user: null, isAuthenticated: false }),

            updateAvatar: (avatar) =>
                set((state) => ({
                    user: state.user ? { ...state.user, avatar } : null,
                })),

            updateStatus: (status) =>
                set((state) => ({
                    user: state.user ? { ...state.user, status } : null,
                })),
        }),
        { name: "huddly-auth" }
    )
);
