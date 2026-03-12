"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Keyboard } from "lucide-react";

interface KeyboardShortcutsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SHORTCUTS = [
    { key: "W, A, S, D", action: "Move your avatar" },
    { key: "Shift (Hold)", action: "Sprint" },
    { key: "E", action: "Interact / Sit down" },
    { key: "C", action: "Toggle Chat sidebar" },
    { key: "P", action: "Toggle Participants list" },
    { key: "M", action: "Toggle Minimap" },
    { key: "V", action: "Toggle Video Call / Camera" },
    { key: "B", action: "Toggle Room Builder" },
    { key: "T", action: "Toggle Whiteboard" },
    { key: "Escape", action: "Close active panels" },
    { key: "?", action: "Toggle this help menu" },
];

export default function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100"
                        >
                            <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50">
                                <div className="flex items-center gap-2 text-gray-900 font-bold">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                                        <Keyboard className="w-4 h-4" />
                                    </div>
                                    Keyboard Shortcuts
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 -mr-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-xl transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-2 max-h-[60vh] overflow-y-auto">
                                <div className="space-y-1">
                                    {SHORTCUTS.map((shortcut) => (
                                        <div key={shortcut.key} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                                            <span className="text-sm font-medium text-gray-700">{shortcut.action}</span>
                                            <kbd className="px-2.5 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-600 shadow-sm font-mono text-[11px] font-bold">
                                                {shortcut.key}
                                            </kbd>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="p-4 border-t border-gray-100 bg-gray-50 text-center">
                                <p className="text-xs text-gray-500">
                                    Pro tip: You can walk up to other people to start a conversation instantly!
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
