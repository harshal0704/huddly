"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Video, VideoOff, Mic, MicOff, Pin, X, PhoneOff, Phone, Monitor } from "lucide-react";
import { useRoomContext, useLocalParticipant, useTracks, ParticipantTile } from "@livekit/components-react";
import { Track } from "livekit-client";

interface VideoCallPanelProps {
    isOpen: boolean;
    onClose: () => void;
    // We don't need manual stream props anymore, LiveKit handles this via RoomContext
}

export default function VideoCallPanel({
    isOpen,
    onClose,
}: VideoCallPanelProps) {
    const room = useRoomContext();
    const { localParticipant, isCameraEnabled, isMicrophoneEnabled } = useLocalParticipant();
    const [pinnedId, setPinnedId] = useState<string | null>(null);

    // Fetch all video tracks (local + remote) and ScreenShares
    const tracks = useTracks(
        [
            { source: Track.Source.Camera, withPlaceholder: true },
            { source: Track.Source.ScreenShare, withPlaceholder: false },
        ],
        { onlySubscribed: true }
    );

    const pinnedTrack = pinnedId ? tracks.find((t) => t.participant.identity === pinnedId) : null;
    const gridTracks = pinnedId ? tracks.filter((t) => t.participant.identity !== pinnedId) : tracks;

    // Check if we are participating with media
    const isParticipating = isCameraEnabled || isMicrophoneEnabled || localParticipant.isScreenShareEnabled;

    const handleJoinClick = async () => {
        // Optional logic: we could rely on auto-connect, or force tracks on.
        await room.localParticipant.setCameraEnabled(true);
        await room.localParticipant.setMicrophoneEnabled(true);
    };

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
                                {tracks.length}
                            </span>
                        </div>
                        <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Join call prompt if no camera enabled globally */}
                    {!isParticipating && (
                        <div className="px-4 py-6 text-center">
                            <div className="w-12 h-12 rounded-full bg-violet-500/20 flex items-center justify-center mx-auto mb-3">
                                <Video className="w-6 h-6 text-violet-400" />
                            </div>
                            <p className="text-sm text-gray-300 mb-1">Join the video call</p>
                            <p className="text-xs text-gray-500 mb-4">Start your camera and microphone</p>
                            <button
                                onClick={handleJoinClick}
                                className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-semibold flex items-center justify-center gap-2 mx-auto transition-all shadow-lg shadow-violet-500/20"
                            >
                                <Phone className="w-4 h-4" />
                                Start Video
                            </button>
                        </div>
                    )}

                    {/* Pinned video */}
                    {pinnedTrack && (
                        <div className="px-3 pt-3">
                            <div className="relative rounded-xl overflow-hidden aspect-video ring-2 ring-emerald-400 shadow-lg shadow-emerald-500/20 [&_.lk-participant-tile]:w-full [&_.lk-participant-tile]:h-full [&_video]:w-full [&_video]:h-full [&_video]:object-cover cursor-pointer" onClick={() => setPinnedId(null)}>
                                <ParticipantTile trackRef={pinnedTrack} />
                            </div>
                        </div>
                    )}

                    {/* Video grid */}
                    <div className={`p-3 grid gap-2 overflow-y-auto ${pinnedId ? "grid-cols-4" : "grid-cols-2"}`}>
                        {gridTracks.map((t) => (
                            <div key={t.participant.identity + t.source}
                                className={`relative rounded-xl overflow-hidden cursor-pointer transition-all duration-300 ring-1 ring-white/10 aspect-square [&_.lk-participant-tile]:w-full [&_.lk-participant-tile]:h-full [&_video]:w-full [&_video]:h-full [&_video]:object-cover`}
                                onClick={() => setPinnedId(t.participant.identity)}
                            >
                                <ParticipantTile trackRef={t} />
                            </div>
                        ))}
                    </div>

                    {/* Screen share indicator */}
                    {room.localParticipant.isScreenShareEnabled && (
                        <div className="mx-3 mb-3 p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center gap-2 text-xs text-blue-400">
                            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                            <Monitor className="w-3 h-3" /> You are sharing your screen
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
