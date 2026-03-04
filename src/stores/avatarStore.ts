"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AvatarConfig } from "@/types";

const DEFAULT_AVATAR: AvatarConfig = {
    body: 1,
    skinColor: "#e0c8b0",
    hair: 2,
    hairColor: "#3d2b1f",
    top: 0,
    topColor: "#2D6A4F",
    bottom: 0,
    bottomColor: "#1a1a2e",
    accessory: 0,
};

interface AvatarState {
    config: AvatarConfig;
    setConfig: (updates: Partial<AvatarConfig>) => void;
    resetConfig: () => void;
}

export const useAvatarStore = create<AvatarState>()(
    persist(
        (set) => ({
            config: DEFAULT_AVATAR,
            setConfig: (updates) => set((s) => ({ config: { ...s.config, ...updates } })),
            resetConfig: () => set({ config: DEFAULT_AVATAR }),
        }),
        { name: "huddly-avatar" }
    )
);
