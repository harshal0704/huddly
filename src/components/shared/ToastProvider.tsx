"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { useToastStore, type Toast } from "@/stores/toastStore";

const ICONS: Record<Toast["type"], React.ReactNode> = {
    success: <CheckCircle className="w-4 h-4 text-emerald-400" />,
    error: <AlertCircle className="w-4 h-4 text-red-400" />,
    info: <Info className="w-4 h-4 text-blue-400" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-400" />,
};

const STYLES: Record<Toast["type"], string> = {
    success: "bg-emerald-950/90 border-emerald-500/30 text-emerald-100",
    error: "bg-red-950/90 border-red-500/30 text-red-100",
    info: "bg-slate-950/90 border-blue-500/30 text-blue-100",
    warning: "bg-amber-950/90 border-amber-500/30 text-amber-100",
};

const PROGRESS_COLORS: Record<Toast["type"], string> = {
    success: "bg-emerald-400",
    error: "bg-red-400",
    info: "bg-blue-400",
    warning: "bg-amber-400",
};

export default function ToastProvider() {
    const toasts = useToastStore((s) => s.toasts);
    const removeToast = useToastStore((s) => s.removeToast);

    return (
        <div className="fixed bottom-20 right-4 z-[200] flex flex-col-reverse gap-2 pointer-events-none">
            <AnimatePresence mode="popLayout">
                {toasts.map((toast) => (
                    <motion.div
                        key={toast.id}
                        layout
                        initial={{ opacity: 0, x: 80, scale: 0.8 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 80, scale: 0.8 }}
                        transition={{ type: "spring", damping: 20, stiffness: 250 }}
                        className={`pointer-events-auto min-w-[280px] max-w-sm rounded-xl border backdrop-blur-xl shadow-2xl overflow-hidden ${STYLES[toast.type]}`}
                    >
                        <div className="flex items-start gap-3 px-4 py-3">
                            <span className="mt-0.5 shrink-0">{ICONS[toast.type]}</span>
                            <span className="text-sm font-medium flex-1">{toast.message}</span>
                            <button
                                onClick={() => removeToast(toast.id)}
                                className="shrink-0 p-0.5 rounded hover:bg-white/10 transition-colors"
                            >
                                <X className="w-3.5 h-3.5 opacity-60" />
                            </button>
                        </div>
                        {/* Progress bar */}
                        {toast.duration && toast.duration > 0 && (
                            <motion.div
                                initial={{ scaleX: 1 }}
                                animate={{ scaleX: 0 }}
                                transition={{ duration: toast.duration / 1000, ease: "linear" }}
                                className={`h-0.5 origin-left ${PROGRESS_COLORS[toast.type]}`}
                            />
                        )}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
