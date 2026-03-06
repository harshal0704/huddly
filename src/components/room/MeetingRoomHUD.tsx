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
                    <div className="px-5 py-3 rounded-2xl bg-white/90 backdrop-blur-2xl border border-gray-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                            <Video className="w-5 h-5 text-[#007AFF] animate-pulse" />
                        </div>
                        <div>
                            <div className="text-sm font-semibold text-slate-900">Joining {zoneName}...</div>
                            <div className="text-xs text-slate-500 font-medium">Auto-connecting video call</div>
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
                    <div className="rounded-3xl bg-white/90 backdrop-blur-2xl border border-gray-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.08)] overflow-hidden">
                        {/* Header */}
                        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="w-2 h-2 rounded-full bg-[#007AFF] animate-pulse shadow-[0_0_8px_rgba(0,122,255,0.5)]" />
                                <span className="text-sm font-bold text-slate-900 tracking-tight">{zoneName}</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs font-semibold">
                                <a
                                    href="https://meet.google.com/new"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 hover:bg-blue-100 transition-colors bg-blue-50 text-[#007AFF] px-2.5 py-1 rounded-lg"
                                    title="Start Google Meet"
                                >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    <span>Meet</span>
                                </a>
                                <div className="flex items-center gap-1 text-slate-500 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                                    <Users className="w-3.5 h-3.5" />
                                    <span>{room.remoteParticipants.size + 1}</span>
                                </div>
                            </div>
                        </div>

                        {/* Video tiles (LiveKit Tracks) */}
                        <div className="grid grid-cols-2 gap-1 p-2 bg-slate-50 border-b border-gray-100">
                            {tracks.length === 0 ? (
                                <div className="col-span-2 h-32 w-full bg-slate-100 flex flex-col items-center justify-center rounded-2xl border border-slate-200/50">
                                    <VideoOff className="w-5 h-5 text-slate-300 mb-2" />
                                    <span className="text-xs text-slate-500 font-medium">Waiting for video feeds...</span>
                                </div>
                            ) : (
                                tracks.slice(0, 4).map((track, i) => (
                                    <div key={track.participant.identity + track.source} className={`relative rounded-xl overflow-hidden bg-slate-900 ring-1 ring-slate-200/50 shadow-sm ${i === 0 && tracks.length < 3 ? "col-span-2 h-32" : "h-24"} [&>.lk-participant-tile]:w-full [&>.lk-participant-tile]:h-full [&>div>video]:object-cover`}>
                                        <ParticipantTile trackRef={track} />
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Screen share indicator */}
                        {sharing && (
                            <div className="mx-3 mt-3 px-3 py-2 rounded-xl bg-blue-50 border border-blue-100 text-[#007AFF] text-xs font-semibold flex items-center gap-2">
                                <Monitor className="w-4 h-4" />
                                You are sharing your screen
                            </div>
                        )}

                        {/* Controls */}
                        <div className="flex items-center justify-center gap-3 px-4 py-4">
                            <button
                                onClick={handleToggleMic}
                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all border shadow-sm ${muted ? "bg-red-50 text-red-600 border-red-100" : "bg-white text-slate-600 border-slate-200 hover:text-[#007AFF] hover:border-[#007AFF]/30"
                                    }`}
                            >
                                {muted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                            </button>
                            <button
                                onClick={handleToggleCamera}
                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all border shadow-sm ${cameraOff ? "bg-red-50 text-red-600 border-red-100" : "bg-white text-slate-600 border-slate-200 hover:text-[#007AFF] hover:border-[#007AFF]/30"
                                    }`}
                            >
                                {cameraOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                            </button>
                            <button
                                onClick={handleToggleShare}
                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all border shadow-sm ${sharing ? "bg-blue-50 text-[#007AFF] border-blue-100" : "bg-white text-slate-600 border-slate-200 hover:text-[#007AFF] hover:border-[#007AFF]/30"
                                    }`}
                            >
                                <Monitor className="w-4 h-4" />
                            </button>

                            <div className="w-px h-6 bg-gray-200 mx-1" />

                            <button
                                onClick={handleLeave}
                                className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-all shadow-[0_4px_12px_rgba(239,68,68,0.3)] hover:shadow-[0_4px_16px_rgba(239,68,68,0.4)]"
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
