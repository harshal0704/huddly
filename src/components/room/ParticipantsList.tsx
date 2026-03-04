"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, X } from "lucide-react";
import { useRealtimeStore } from "@/stores/realtimeStore";

interface ParticipantsListProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ParticipantsList({ isOpen, onClose }: ParticipantsListProps) {
    const players = useRealtimeStore(s => s.players);
    const myId = useRealtimeStore(s => s.myId);
    const connected = useRealtimeStore(s => s.connected);

    const playerList = Array.from(players.values());
    const me = playerList.find(p => p.id === myId);
    const others = playerList.filter(p => p.id !== myId);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="fixed left-4 top-20 w-64 bg-gray-950/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-30 overflow-hidden"
                >
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                        <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                            <span>Participants</span>
                            <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">
                                {playerList.length}
                            </span>
                            {!connected && (
                                <span className="text-[10px] text-amber-400 bg-amber-500/20 px-1.5 py-0.5 rounded-full">
                                    Offline
                                </span>
                            )}
                        </h3>
                        <button
                            onClick={onClose}
                            className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    {/* List */}
                    <div className="max-h-[60vh] overflow-y-auto p-2">
                        {/* You */}
                        {me && (
                            <div className="mb-2">
                                <span className="text-[10px] text-gray-600 uppercase tracking-wider px-2 font-semibold">
                                    You
                                </span>
                                <ParticipantItem name={me.name} color={me.color} zone={me.zone} isYou />
                            </div>
                        )}

                        {/* Others */}
                        {others.length > 0 && (
                            <div>
                                <span className="text-[10px] text-gray-600 uppercase tracking-wider px-2 font-semibold">
                                    In Room ({others.length})
                                </span>
                                {others.map(p => (
                                    <ParticipantItem key={p.id} name={p.name} color={p.color} zone={p.zone} />
                                ))}
                            </div>
                        )}

                        {playerList.length <= 1 && (
                            <div className="text-center text-xs text-gray-500 py-4">
                                No one else is here yet
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

function ParticipantItem({ name, color, zone, isYou }: { name: string; color: string; zone: string; isYou?: boolean }) {
    return (
        <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group">
            {/* Avatar */}
            <div className="relative">
                <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: color }}
                >
                    {name.charAt(0).toUpperCase()}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-gray-950" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                    <span className="text-sm text-white truncate">{name}</span>
                    {isYou && <Crown className="w-3 h-3 text-amber-400" />}
                </div>
                <span className="text-[10px] text-gray-500">{zone}</span>
            </div>
        </div>
    );
}

