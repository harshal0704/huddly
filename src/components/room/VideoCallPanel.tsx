"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Video, VideoOff, Mic, MicOff, Pin, X, PhoneOff, Phone } from "lucide-react";

interface Participant {
    id: string;
    name: string;
    color: string;
    isMuted: boolean;
    isCameraOn: boolean;
}

// Simulated remote participants (they won't have real streams)
const REMOTE_PARTICIPANTS: Participant[] = [
    { id: "r1", name: "Alex", color: "from-violet-400 to-purple-500", isMuted: false, isCameraOn: true },
    { id: "r2", name: "Maya", color: "from-blue-400 to-cyan-500", isMuted: false, isCameraOn: true },
    { id: "r3", name: "Sam", color: "from-emerald-400 to-teal-500", isMuted: true, isCameraOn: true },
    { id: "r4", name: "Jo", color: "from-amber-400 to-orange-500", isMuted: false, isCameraOn: false },
];

interface VideoCallPanelProps {
    isOpen: boolean;
    onClose: () => void;
    localStream: MediaStream | null;
    screenStream: MediaStream | null;
    isMuted: boolean;
    isCameraOff: boolean;
    onStartMedia: () => void;
}

export default function VideoCallPanel({
    isOpen,
    onClose,
    localStream,
    screenStream,
    isMuted,
    isCameraOff,
    onStartMedia,
}: VideoCallPanelProps) {
    const [pinnedId, setPinnedId] = useState<string | null>(null);
    const [speakingId, setSpeakingId] = useState<string>("r1");

    // Simulate remote participants speaking
    useEffect(() => {
        if (!isOpen) return;
        const interval = setInterval(() => {
            const ids = ["r1", "r2", "r3", "r4", "local"];
            setSpeakingId(ids[Math.floor(Math.random() * ids.length)]);
        }, 2500);
        return () => clearInterval(interval);
    }, [isOpen]);

    // Build full participant list: local user + simulated remotes
    const allParticipants: (Participant & { stream?: MediaStream | null })[] = [
        {
            id: "local",
            name: "You",
            color: "from-pink-400 to-rose-500",
            isMuted,
            isCameraOn: !isCameraOff && !!localStream,
            stream: localStream,
        },
        ...REMOTE_PARTICIPANTS,
    ];

    const pinnedParticipant = pinnedId ? allParticipants.find((p) => p.id === pinnedId) : null;
    const gridParticipants = pinnedId ? allParticipants.filter((p) => p.id !== pinnedId) : allParticipants;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    transition={{ type: "spring", damping: 20, stiffness: 200 }}
                    className="fixed top-16 right-4 z-30 w-80 max-h-[calc(100vh-120px)] bg-gray-950/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl shadow-violet-500/10 flex flex-col overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                        <div className="flex items-center gap-2">
                            <Video className="w-4 h-4 text-violet-400" />
                            <span className="text-white font-semibold text-sm">Video Call</span>
                            <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">
                                {allParticipants.length}
                            </span>
                        </div>
                        <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Join call prompt if no local stream */}
                    {!localStream && (
                        <div className="px-4 py-6 text-center">
                            <div className="w-12 h-12 rounded-full bg-violet-500/20 flex items-center justify-center mx-auto mb-3">
                                <Video className="w-6 h-6 text-violet-400" />
                            </div>
                            <p className="text-sm text-gray-300 mb-1">Join the video call</p>
                            <p className="text-xs text-gray-500 mb-4">Start your camera and microphone</p>
                            <button
                                onClick={onStartMedia}
                                className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-semibold flex items-center justify-center gap-2 mx-auto transition-all shadow-lg shadow-violet-500/20"
                            >
                                <Phone className="w-4 h-4" />
                                Join Call
                            </button>
                        </div>
                    )}

                    {/* Pinned video */}
                    {localStream && pinnedParticipant && (
                        <div className="px-3 pt-3">
                            <VideoTile
                                participant={pinnedParticipant}
                                stream={pinnedParticipant.id === "local" ? localStream : null}
                                isSpeaking={speakingId === pinnedParticipant.id}
                                isPinned
                                onPin={() => setPinnedId(null)}
                                large
                            />
                        </div>
                    )}

                    {/* Video grid */}
                    {localStream && (
                        <div className={`p-3 grid gap-2 overflow-y-auto ${pinnedId ? "grid-cols-4" : "grid-cols-2"}`}>
                            {gridParticipants.map((p) => (
                                <VideoTile
                                    key={p.id}
                                    participant={p}
                                    stream={p.id === "local" ? localStream : null}
                                    isSpeaking={speakingId === p.id}
                                    isPinned={false}
                                    onPin={() => setPinnedId(p.id)}
                                    large={false}
                                />
                            ))}
                        </div>
                    )}

                    {/* Screen share indicator */}
                    {screenStream && (
                        <div className="mx-3 mb-3 p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center gap-2 text-xs text-blue-400">
                            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                            You are sharing your screen
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}

/** A single video tile — shows real <video> for local user, avatars for remotes */
function VideoTile({
    participant,
    stream,
    isSpeaking,
    isPinned,
    onPin,
    large,
}: {
    participant: Participant;
    stream: MediaStream | null;
    isSpeaking: boolean;
    isPinned: boolean;
    onPin: () => void;
    large: boolean;
}) {
    const videoRef = useRef<HTMLVideoElement>(null);

    // Attach real stream to <video> element
    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    const hasRealVideo = stream && participant.isCameraOn;

    return (
        <div
            className={`relative rounded-xl overflow-hidden group cursor-pointer transition-all duration-300 ${large ? "aspect-video" : "aspect-square"
                } ${isSpeaking
                    ? "ring-2 ring-emerald-400 shadow-lg shadow-emerald-500/20"
                    : "ring-1 ring-white/10"
                }`}
        >
            {/* Real video feed for local user */}
            {hasRealVideo ? (
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover mirror"
                    style={{ transform: "scaleX(-1)" }}
                />
            ) : participant.isCameraOn ? (
                // Simulated feed for remote participants
                <div className={`w-full h-full bg-gradient-to-br ${participant.color} opacity-70 flex items-center justify-center`}>
                    <motion.div
                        animate={isSpeaking ? { scale: [1, 1.05, 1] } : {}}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="text-2xl"
                    >
                        😊
                    </motion.div>
                </div>
            ) : (
                // Camera off fallback
                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${participant.color} flex items-center justify-center text-white text-sm font-bold`}>
                        {participant.name[0]}
                    </div>
                </div>
            )}

            {/* Speaking indicator */}
            {isSpeaking && (
                <div className="absolute top-2 left-2 flex gap-0.5">
                    {[...Array(3)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="w-1 bg-emerald-400 rounded-full"
                            animate={{ height: [4, 12, 4] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                        />
                    ))}
                </div>
            )}

            {/* Mute indicator */}
            {participant.isMuted && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-red-500/80 flex items-center justify-center">
                    <MicOff className="w-3 h-3 text-white" />
                </div>
            )}

            {/* Name + pin overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-2 py-1.5 flex items-center justify-between">
                <span className="text-[10px] text-white font-medium truncate">
                    {participant.name}
                </span>
                <button
                    onClick={(e) => { e.stopPropagation(); onPin(); }}
                    className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-white/20 rounded transition-all"
                    title={isPinned ? "Unpin" : "Pin"}
                >
                    <Pin className={`w-3 h-3 ${isPinned ? "text-violet-400" : "text-white"}`} />
                </button>
            </div>
        </div>
    );
}
