"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Video, VideoOff, Crown } from "lucide-react";

interface Participant {
    id: string;
    name: string;
    color: string;
    status: string;
    isMuted: boolean;
    isCameraOff: boolean;
    isOwner: boolean;
    isProximate: boolean;
}

const MOCK_PARTICIPANTS: Participant[] = [
    { id: "1", name: "You", color: "from-violet-400 to-purple-500", status: "available", isMuted: false, isCameraOff: false, isOwner: true, isProximate: false },
    { id: "2", name: "Alex", color: "from-blue-400 to-cyan-500", status: "available", isMuted: false, isCameraOff: false, isOwner: false, isProximate: true },
    { id: "3", name: "Maya", color: "from-emerald-400 to-teal-500", status: "focused", isMuted: true, isCameraOff: false, isOwner: false, isProximate: true },
    { id: "4", name: "Sam", color: "from-amber-400 to-orange-500", status: "available", isMuted: false, isCameraOff: true, isOwner: false, isProximate: false },
    { id: "5", name: "Jo", color: "from-pink-400 to-rose-500", status: "in-meeting", isMuted: true, isCameraOff: false, isOwner: false, isProximate: false },
    { id: "6", name: "Lee", color: "from-indigo-400 to-blue-500", status: "available", isMuted: false, isCameraOff: false, isOwner: false, isProximate: false },
    { id: "7", name: "Kai", color: "from-teal-400 to-emerald-500", status: "away", isMuted: true, isCameraOff: true, isOwner: false, isProximate: false },
    { id: "8", name: "Rui", color: "from-fuchsia-400 to-pink-500", status: "available", isMuted: false, isCameraOff: false, isOwner: false, isProximate: false },
    { id: "9", name: "Zoe", color: "from-rose-400 to-red-500", status: "available", isMuted: false, isCameraOff: true, isOwner: false, isProximate: false },
];

interface ParticipantsListProps {
    isOpen: boolean;
    onClose: () => void;
}

const statusColors: Record<string, string> = {
    available: "bg-emerald-400",
    focused: "bg-amber-400",
    "in-meeting": "bg-violet-400",
    away: "bg-gray-400",
};

export default function ParticipantsList({ isOpen, onClose }: ParticipantsListProps) {
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
                    <div className="px-4 py-3 border-b border-white/10">
                        <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                            <span>Participants</span>
                            <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">
                                {MOCK_PARTICIPANTS.length}
                            </span>
                        </h3>
                    </div>

                    {/* List */}
                    <div className="max-h-[60vh] overflow-y-auto p-2">
                        {/* Nearby section */}
                        {MOCK_PARTICIPANTS.filter((p) => p.isProximate).length > 0 && (
                            <div className="mb-2">
                                <span className="text-[10px] text-gray-600 uppercase tracking-wider px-2 font-semibold">
                                    Nearby
                                </span>
                                {MOCK_PARTICIPANTS.filter((p) => p.isProximate).map((p) => (
                                    <ParticipantItem key={p.id} participant={p} />
                                ))}
                            </div>
                        )}

                        {/* Everyone else */}
                        <div>
                            <span className="text-[10px] text-gray-600 uppercase tracking-wider px-2 font-semibold">
                                In Room
                            </span>
                            {MOCK_PARTICIPANTS.filter((p) => !p.isProximate).map((p) => (
                                <ParticipantItem key={p.id} participant={p} />
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

function ParticipantItem({ participant }: { participant: Participant }) {
    return (
        <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group">
            {/* Avatar */}
            <div className="relative">
                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${participant.color} flex items-center justify-center text-white text-xs font-bold`}>
                    {participant.name.charAt(0)}
                </div>
                <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ${statusColors[participant.status] || "bg-gray-400"} border-2 border-gray-950`} />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                    <span className="text-sm text-white truncate">{participant.name}</span>
                    {participant.isOwner && <Crown className="w-3 h-3 text-amber-400" />}
                </div>
                <span className="text-[10px] text-gray-500 capitalize">{participant.status}</span>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {participant.isMuted ? (
                    <MicOff className="w-3 h-3 text-red-400" />
                ) : (
                    <Mic className="w-3 h-3 text-gray-400" />
                )}
                {participant.isCameraOff ? (
                    <VideoOff className="w-3 h-3 text-red-400" />
                ) : (
                    <Video className="w-3 h-3 text-gray-400" />
                )}
            </div>
        </div>
    );
}
