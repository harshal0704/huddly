import { create } from "zustand";

export interface Toast {
    id: string;
    message: string;
    type: "success" | "error" | "info" | "warning";
    duration?: number;
}

interface ToastState {
    toasts: Toast[];
    addToast: (message: string, type?: Toast["type"], duration?: number) => void;
    removeToast: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
    toasts: [],

    addToast: (message, type = "info", duration = 4000) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        set((state) => ({
            toasts: [...state.toasts.slice(-4), { id, message, type, duration }],
        }));
        // Auto-remove after duration
        if (duration > 0) {
            setTimeout(() => {
                set((state) => ({
                    toasts: state.toasts.filter((t) => t.id !== id),
                }));
            }, duration);
        }
    },

    removeToast: (id) =>
        set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id),
        })),
}));
