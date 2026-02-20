"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const EMOTES = [
    { emoji: "👋", label: "Wave" },
    { emoji: "👍", label: "Thumbs up" },
    { emoji: "❤️", label: "Heart" },
    { emoji: "😂", label: "Laugh" },
    { emoji: "🎉", label: "Celebrate" },
    { emoji: "🔥", label: "Fire" },
    { emoji: "💬", label: "Chat" },
    { emoji: "🤔", label: "Think" },
];

interface EmoteWheelProps {
    isOpen: boolean;
    onSelect: (emoji: string) => void;
    onClose: () => void;
}

export default function EmoteWheel({ isOpen, onSelect, onClose }: EmoteWheelProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div className="fixed inset-0 z-40" onClick={onClose} />

                    {/* Wheel */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50"
                    >
                        <div className="relative w-48 h-48">
                            {EMOTES.map((emote, i) => {
                                const angle = (i / EMOTES.length) * 2 * Math.PI - Math.PI / 2;
                                const radius = 70;
                                const x = Math.cos(angle) * radius;
                                const y = Math.sin(angle) * radius;

                                return (
                                    <motion.button
                                        key={emote.emoji}
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0 }}
                                        transition={{ delay: i * 0.03 }}
                                        className="absolute w-12 h-12 rounded-xl bg-gray-900/90 border border-white/10 flex items-center justify-center text-xl hover:scale-125 hover:bg-violet-600/30 hover:border-violet-500/50 transition-all cursor-pointer"
                                        style={{
                                            left: `calc(50% + ${x}px - 24px)`,
                                            top: `calc(50% + ${y}px - 24px)`,
                                        }}
                                        onClick={() => {
                                            onSelect(emote.emoji);
                                            onClose();
                                        }}
                                        title={emote.label}
                                    >
                                        {emote.emoji}
                                    </motion.button>
                                );
                            })}

                            {/* Center label */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-xs text-gray-500 font-medium">EMOTE</span>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
