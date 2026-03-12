"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Video, VideoOff, Mic, MicOff, Pin, X, PhoneOff, Phone, Monitor, MonitorOff, Maximize2, Minimize2 } from "lucide-react";
import { useRoomContext, useLocalParticipant, useTracks, ParticipantTile } from "@livekit/components-react";
import { Track } from "livekit-client";

interface VideoCallPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function VideoCallPanel({ isOpen, onClose }: VideoCallPanelProps) {
    const room = useRoomContext();
    const { localParticipant, isCameraEnabled, isMicrophoneEnabled } = useLocalParticipant();
    const [pinnedId, setPinnedId] = useState<string | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [mediaError, setMediaError] = useState<string | null>(null);

    const tracks = useTracks(
        [
            { source: Track.Source.Camera, withPlaceholder: true },
            { source: Track.Source.ScreenShare, withPlaceholder: false },
        ],
        { onlySubscribed: true }
    );

    const pinnedTrack = pinnedId ? tracks.find((t) => t.participant.identity === pinnedId) : null;
    const gridTracks = pinnedId ? tracks.filter((t) => t.participant.identity !== pinnedId) : tracks;
    const isParticipating = isCameraEnabled || isMicrophoneEnabled || localParticipant.isScreenShareEnabled;

    const handleJoinClick = useCallback(async () => {
        try {
            setMediaError(null);
            await room.localParticipant.setCameraEnabled(true);
            await room.localParticipant.setMicrophoneEnabled(true);
        } catch (err: any) {
            console.error("[VideoCall] Failed to enable media:", err);
            setMediaError(
                err.name === "NotAllowedError"
                    ? "Camera/mic access denied. Please allow permissions in your browser settings."
                    : "Failed to access media devices. Check your camera and microphone."
            );
        }
    }, [room]);

    const handleToggleMic = useCallback(async () => {
        try {
            await room.localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
        } catch (err) {
            console.error("[VideoCall] Mic toggle failed:", err);
        }
    }, [room, isMicrophoneEnabled]);

    const handleToggleCamera = useCallback(async () => {
        try {
            await room.localParticipant.setCameraEnabled(!isCameraEnabled);
        } catch (err) {
            console.error("[VideoCall] Camera toggle failed:", err);
        }
    }, [room, isCameraEnabled]);

    const handleToggleScreen = useCallback(async () => {
        try {
            await room.localParticipant.setScreenShareEnabled(!localParticipant.isScreenShareEnabled);
        } catch (err) {
            console.error("[VideoCall] Screen share toggle failed:", err);
        }
    }, [room, localParticipant.isScreenShareEnabled]);

    const handleLeaveCall = useCallback(async () => {
        await room.localParticipant.setCameraEnabled(false);
        await room.localParticipant.setMicrophoneEnabled(false);
        await room.localParticipant.setScreenShareEnabled(false);
    }, [room]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    transition={{ type: "spring", damping: 22, stiffness: 250 }}
                    className={`fixed top-16 right-4 z-30 ${isExpanded ? "w-[560px]" : "w-80"} max-h-[calc(100vh-120px)] bg-gray-950/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl shadow-violet-500/10 flex flex-col overflow-hidden transition-all duration-300`}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                        <div className="flex items-center gap-2">
                            <motion.div
                                animate={{ scale: isParticipating ? [1, 1.2, 1] : 1 }}
                                transition={{ duration: 2, repeat: isParticipating ? Infinity : 0 }}
                                className={`w-2 h-2 rounded-full ${isParticipating ? "bg-emerald-400" : "bg-gray-500"}`}
                            />
                            <span className="text-white font-semibold text-sm">Video Call</span>
                            <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">
                                {tracks.length}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                            >
                                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={onClose}
                                className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                            >
                                <X className="w-4 h-4" />
                            </motion.button>
                        </div>
                    </div>

                    {/* Join call prompt */}
                    {!isParticipating && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="px-4 py-6 text-center"
                        >
                            <motion.div
                                animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 flex items-center justify-center mx-auto mb-4 border border-violet-500/20"
                            >
                                <Video className="w-7 h-7 text-violet-400" />
                            </motion.div>
                            <p className="text-sm text-gray-300 mb-1 font-medium">Join the video call</p>
                            <p className="text-xs text-gray-500 mb-5">Start your camera and microphone</p>

                            {mediaError && (
                                <motion.div
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-4 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs"
                                >
                                    {mediaError}
                                </motion.div>
                            )}

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleJoinClick}
                                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-semibold flex items-center justify-center gap-2 mx-auto transition-all shadow-lg shadow-violet-500/25"
                            >
                                <Phone className="w-4 h-4" />
                                Start Video
                            </motion.button>
                        </motion.div>
                    )}

                    {/* Pinned video */}
                    {pinnedTrack && (
                        <div className="px-3 pt-3">
                            <motion.div
                                layoutId="pinned-video"
                                className="relative rounded-xl overflow-hidden aspect-video ring-2 ring-emerald-400 shadow-lg shadow-emerald-500/20 [&_.lk-participant-tile]:w-full [&_.lk-participant-tile]:h-full [&_video]:w-full [&_video]:h-full [&_video]:object-cover cursor-pointer"
                                onClick={() => setPinnedId(null)}
                            >
                                <ParticipantTile trackRef={pinnedTrack} />
                                <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/50 text-white text-[10px] flex items-center gap-1">
                                    <Pin className="w-2.5 h-2.5" /> Pinned
                                </div>
                            </motion.div>
                        </div>
                    )}

                    {/* Video grid */}
                    {isParticipating && (
                        <div className={`p-3 grid gap-2 overflow-y-auto ${pinnedId ? "grid-cols-4" : isExpanded ? "grid-cols-3" : "grid-cols-2"}`}>
                            {gridTracks.map((t, i) => (
                                <motion.div
                                    key={t.participant.identity + t.source}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="relative rounded-xl overflow-hidden cursor-pointer transition-all duration-300 ring-1 ring-white/10 hover:ring-violet-400/50 aspect-square [&_.lk-participant-tile]:w-full [&_.lk-participant-tile]:h-full [&_video]:w-full [&_video]:h-full [&_video]:object-cover group"
                                    onClick={() => setPinnedId(t.participant.identity)}
                                >
                                    <ParticipantTile trackRef={t} />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {/* Media Controls Bar */}
                    {isParticipating && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center justify-center gap-2 px-4 py-3 border-t border-white/10 bg-gray-900/50"
                        >
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={handleToggleMic}
                                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${isMicrophoneEnabled
                                        ? "bg-white/10 text-white hover:bg-white/20"
                                        : "bg-red-500/20 text-red-400 ring-1 ring-red-500/30"
                                    }`}
                                title={isMicrophoneEnabled ? "Mute" : "Unmute"}
                            >
                                {isMicrophoneEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={handleToggleCamera}
                                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${isCameraEnabled
                                        ? "bg-white/10 text-white hover:bg-white/20"
                                        : "bg-red-500/20 text-red-400 ring-1 ring-red-500/30"
                                    }`}
                                title={isCameraEnabled ? "Turn off camera" : "Turn on camera"}
                            >
                                {isCameraEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={handleToggleScreen}
                                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${localParticipant.isScreenShareEnabled
                                        ? "bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/30"
                                        : "bg-white/10 text-white hover:bg-white/20"
                                    }`}
                                title={localParticipant.isScreenShareEnabled ? "Stop sharing" : "Share screen"}
                            >
                                {localParticipant.isScreenShareEnabled ? <MonitorOff className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
                            </motion.button>

                            <div className="w-px h-5 bg-white/10 mx-1" />

                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={handleLeaveCall}
                                className="w-9 h-9 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                                title="Leave call"
                            >
                                <PhoneOff className="w-4 h-4" />
                            </motion.button>
                        </motion.div>
                    )}

                    {/* Screen share indicator */}
                    {room.localParticipant.isScreenShareEnabled && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="mx-3 mb-3 p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center gap-2 text-xs text-blue-400"
                        >
                            <motion.div
                                animate={{ scale: [1, 1.3, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="w-2 h-2 rounded-full bg-blue-400"
                            />
                            <Monitor className="w-3 h-3" /> You are sharing your screen
                        </motion.div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
