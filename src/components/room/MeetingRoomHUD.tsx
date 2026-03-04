"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Video, VideoOff, Mic, MicOff, Monitor, PhoneOff, Users, ExternalLink } from "lucide-react";
import { useTracks, useRoomContext, ParticipantTile } from "@livekit/components-react";
import { Track } from "livekit-client";

interface MeetingRoomHUDProps {
    isInMeetingZone: boolean;
    zoneName: string;
    onLeave?: () => void;
}

export default function MeetingRoomHUD({ isInMeetingZone, zoneName, onLeave }: MeetingRoomHUDProps) {
    const [joined, setJoined] = useState(false);
    const [muted, setMuted] = useState(false);
    const [cameraOff, setCameraOff] = useState(false);
    const [sharing, setSharing] = useState(false);

    const room = useRoomContext();

    // Auto-connect video/audio when entering zone
    useEffect(() => {
        if (isInMeetingZone) {
            const timer = setTimeout(async () => {
                setJoined(true);
            }, 1500);
            return () => clearTimeout(timer);
        } else {
            setJoined(false);
            setSharing(false);
            // Disable tracks when leaving
            room.localParticipant.setMicrophoneEnabled(false);
            room.localParticipant.setCameraEnabled(false);
            room.localParticipant.setScreenShareEnabled(false);
            setMuted(false);
            setCameraOff(false);
        }
    }, [isInMeetingZone, room]);

    const handleLeave = useCallback(() => {
        setJoined(false);
        room.localParticipant.setMicrophoneEnabled(false);
        room.localParticipant.setCameraEnabled(false);
        room.localParticipant.setScreenShareEnabled(false);
        setMuted(false);
        setCameraOff(false);
        onLeave?.();
    }, [onLeave, room]);

    const handleToggleMic = useCallback(async () => {
        if (muted) await room.localParticipant.setMicrophoneEnabled(true);
        else await room.localParticipant.setMicrophoneEnabled(false);
        setMuted(!muted);
    }, [muted, room]);

    const handleToggleCamera = useCallback(async () => {
        if (cameraOff) await room.localParticipant.setCameraEnabled(true);
        else await room.localParticipant.setCameraEnabled(false);
        setCameraOff(!cameraOff);
    }, [cameraOff, room]);

    const handleToggleShare = useCallback(async () => {
        if (sharing) await room.localParticipant.setScreenShareEnabled(false);
        else await room.localParticipant.setScreenShareEnabled(true);
        setSharing(!sharing);
    }, [sharing, room]);

    // Fetch all video tracks (local + remote)
    const tracks = useTracks(
        [
            { source: Track.Source.Camera, withPlaceholder: true },
            { source: Track.Source.ScreenShare, withPlaceholder: false },
        ],
        { onlySubscribed: true }
    );

    if (!isInMeetingZone) return null;

    return (
        <AnimatePresence>
            {!joined ? (
                <motion.div
                    key="prompt"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 30 }}
                    className="fixed top-20 left-1/2 -translate-x-1/2 z-30"
                >
                    <div className="px-5 py-3 rounded-2xl bg-emerald-600/90 backdrop-blur-xl text-white shadow-2xl flex items-center gap-3">
                        <Video className="w-5 h-5 animate-pulse" />
                        <div>
                            <div className="text-sm font-semibold">Joining {zoneName}...</div>
                            <div className="text-xs opacity-80">Auto-connecting video call</div>
                        </div>
                    </div>
                </motion.div>
            ) : (
                <motion.div
                    key="call"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="fixed top-20 right-4 z-30 w-72"
                >
                    <div className="rounded-2xl bg-white/95 backdrop-blur-xl border border-gray-200 shadow-2xl overflow-hidden">
                        {/* Header */}
                        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-sm font-semibold text-gray-900">{zoneName}</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                                <a
                                    href="https://meet.google.com/new"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 hover:text-blue-600 transition-colors bg-blue-50 text-blue-600 px-2 py-1 rounded"
                                    title="Start Google Meet"
                                >
                                    <ExternalLink className="w-3 h-3" />
                                    <span>Meet</span>
                                </a>
                                <div className="flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    <span>{room.remoteParticipants.size + 1} in call</span>
                                </div>
                            </div>
                        </div>

                        {/* Video tiles (LiveKit Tracks) */}
                        <div className="grid grid-cols-2 gap-1 p-2">
                            {tracks.length === 0 ? (
                                <div className="col-span-2 h-28 w-full bg-gray-100 flex items-center justify-center rounded-xl">
                                    <span className="text-xs text-gray-500 font-medium">Waiting for others...</span>
                                </div>
                            ) : (
                                tracks.slice(0, 4).map((track, i) => (
                                    <div key={track.participant.identity + track.source} className={`relative rounded-xl overflow-hidden bg-gray-900 ${i === 0 && tracks.length < 3 ? "col-span-2 h-28" : "h-20"} [&>.lk-participant-tile]:w-full [&>.lk-participant-tile]:h-full [&>div>video]:object-cover`}>
                                        <ParticipantTile
                                            trackRef={track}
                                        />
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Screen share indicator */}
                        {sharing && (
                            <div className="mx-2 mb-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium flex items-center gap-1.5">
                                <Monitor className="w-3 h-3" />
                                You are sharing your screen
                            </div>
                        )}

                        {/* Controls */}
                        <div className="flex items-center justify-center gap-2 px-4 py-3 border-t border-gray-100">
                            <button
                                onClick={handleToggleMic}
                                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${muted ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                    }`}
                            >
                                {muted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                            </button>
                            <button
                                onClick={handleToggleCamera}
                                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${cameraOff ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                    }`}
                            >
                                {cameraOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                            </button>
                            <button
                                onClick={handleToggleShare}
                                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${sharing ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                    }`}
                            >
                                <Monitor className="w-4 h-4" />
                            </button>
                            <button
                                onClick={handleLeave}
                                className="w-9 h-9 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-all"
                            >
                                <PhoneOff className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
