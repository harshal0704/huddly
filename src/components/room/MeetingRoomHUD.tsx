"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Video, VideoOff, Mic, MicOff, Monitor, PhoneOff, Users, ExternalLink, AlertCircle, ShieldCheck } from "lucide-react";
import { useTracks, useRoomContext, ParticipantTile } from "@livekit/components-react";
import { Track } from "livekit-client";

interface MeetingRoomHUDProps {
    isInMeetingZone: boolean;
    zoneName: string;
    onLeave?: () => void;
}

export default function MeetingRoomHUD({ isInMeetingZone, zoneName, onLeave }: MeetingRoomHUDProps) {
    const [joined, setJoined] = useState(false);
    const [showConsentPrompt, setShowConsentPrompt] = useState(false);
    const [audioEnabled, setAudioEnabled] = useState(false);
    const [videoEnabled, setVideoEnabled] = useState(false);
    const [screenEnabled, setScreenEnabled] = useState(false);
    const [permissionError, setPermissionError] = useState<string | null>(null);

    const room = useRoomContext();

    // Show consent prompt when entering meeting zone
    useEffect(() => {
        if (isInMeetingZone) {
            setShowConsentPrompt(true);
            setPermissionError(null);
        } else {
            setJoined(false);
            setShowConsentPrompt(false);
            setScreenEnabled(false);
            setVideoEnabled(false);
            setAudioEnabled(false);
            setPermissionError(null);
            try {
                room.localParticipant.setMicrophoneEnabled(false);
                room.localParticipant.setCameraEnabled(false);
                room.localParticipant.setScreenShareEnabled(false);
            } catch { /* ignore cleanup errors */ }
        }
    }, [isInMeetingZone, room]);

    const handleJoinWithMedia = useCallback(async () => {
        try {
            setPermissionError(null);
            await room.localParticipant.setCameraEnabled(true);
            await room.localParticipant.setMicrophoneEnabled(true);
            setVideoEnabled(true);
            setAudioEnabled(true);
            setShowConsentPrompt(false);
            setJoined(true);
        } catch (err: any) {
            console.error("[MeetingHUD] Permission error:", err);
            if (err.name === "NotAllowedError") {
                setPermissionError("Camera/mic denied. Enable in browser settings, or join audio-only.");
            } else {
                setPermissionError("Could not access media devices. Please check connections.");
            }
        }
    }, [room]);

    const handleJoinAudioOnly = useCallback(async () => {
        try {
            setPermissionError(null);
            await room.localParticipant.setMicrophoneEnabled(true);
            setAudioEnabled(true);
            setShowConsentPrompt(false);
            setJoined(true);
        } catch (err: any) {
            console.error("[MeetingHUD] Audio permission error:", err);
            setPermissionError("Microphone access denied. Please allow in browser settings.");
        }
    }, [room]);

    const handleJoinSilent = useCallback(() => {
        setShowConsentPrompt(false);
        setJoined(true);
    }, []);

    const handleLeave = useCallback(async () => {
        setJoined(false);
        try {
            await room.localParticipant.setMicrophoneEnabled(false);
            await room.localParticipant.setCameraEnabled(false);
            await room.localParticipant.setScreenShareEnabled(false);
        } catch { /* ignore */ }
        setAudioEnabled(false);
        setVideoEnabled(false);
        setScreenEnabled(false);
        onLeave?.();
    }, [onLeave, room]);

    const handleToggleMic = useCallback(async () => {
        try {
            const nextState = !audioEnabled;
            await room.localParticipant.setMicrophoneEnabled(nextState);
            setAudioEnabled(nextState);
        } catch (err) {
            console.error("[MeetingHUD] Mic toggle failed:", err);
        }
    }, [audioEnabled, room]);

    const handleToggleCamera = useCallback(async () => {
        try {
            const nextState = !videoEnabled;
            await room.localParticipant.setCameraEnabled(nextState);
            setVideoEnabled(nextState);
        } catch (err) {
            console.error("[MeetingHUD] Camera toggle failed:", err);
        }
    }, [videoEnabled, room]);

    const handleToggleShare = useCallback(async () => {
        try {
            const nextState = !screenEnabled;
            await room.localParticipant.setScreenShareEnabled(nextState);
            setScreenEnabled(nextState);
        } catch (err) {
            console.error("[MeetingHUD] Screen share toggle failed:", err);
        }
    }, [screenEnabled, room]);

    const tracks = useTracks(
        [
            { source: Track.Source.Camera, withPlaceholder: true },
            { source: Track.Source.ScreenShare, withPlaceholder: false },
        ],
        { onlySubscribed: true }
    );

    if (!isInMeetingZone) return null;

    return (
        <AnimatePresence mode="wait">
            {/* Consent Prompt */}
            {showConsentPrompt && !joined && (
                <motion.div
                    key="consent"
                    initial={{ opacity: 0, y: 30, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ type: "spring", damping: 20, stiffness: 200 }}
                    className="fixed top-20 left-1/2 -translate-x-1/2 z-30 w-80"
                >
                    <div className="rounded-3xl bg-white/95 backdrop-blur-2xl border border-gray-200/60 shadow-[0_20px_60px_rgb(0,0,0,0.12)] overflow-hidden">
                        <div className="px-5 pt-5 pb-3 text-center">
                            <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-center mx-auto mb-3"
                            >
                                <Video className="w-6 h-6 text-blue-500" />
                            </motion.div>
                            <h3 className="text-sm font-bold text-slate-900 mb-1">Entering {zoneName}</h3>
                            <p className="text-xs text-slate-500">How would you like to join?</p>
                        </div>

                        {permissionError && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="mx-4 mb-2 px-3 py-2 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs flex items-start gap-2"
                            >
                                <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                {permissionError}
                            </motion.div>
                        )}

                        <div className="px-4 pb-4 space-y-2">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleJoinWithMedia}
                                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all"
                            >
                                <Video className="w-4 h-4" />
                                Join with Video & Audio
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleJoinAudioOnly}
                                className="w-full py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-all"
                            >
                                <Mic className="w-4 h-4" />
                                Audio Only
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleJoinSilent}
                                className="w-full py-2 rounded-xl text-gray-400 text-xs font-medium flex items-center justify-center gap-1.5 hover:text-gray-600 transition-all"
                            >
                                <ShieldCheck className="w-3.5 h-3.5" />
                                Join as listener
                            </motion.button>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Active Meeting HUD */}
            {joined && (
                <motion.div
                    key="call"
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    transition={{ type: "spring", damping: 20, stiffness: 200 }}
                    className="fixed top-20 right-4 z-30 w-72"
                >
                    <div className="rounded-3xl bg-white/95 backdrop-blur-2xl border border-gray-200/50 shadow-[0_12px_40px_rgb(0,0,0,0.10)] overflow-hidden">
                        {/* Header */}
                        <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <motion.div
                                    animate={{ scale: [1, 1.3, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                                />
                                <span className="text-sm font-bold text-slate-900 tracking-tight">{zoneName}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-semibold">
                                <a
                                    href="https://meet.google.com/new"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 hover:bg-blue-100 transition-colors bg-blue-50 text-blue-600 px-2.5 py-1 rounded-lg"
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

                        {/* Video tiles */}
                        <div className="grid grid-cols-2 gap-1 p-2 bg-slate-50 border-b border-gray-100">
                            {tracks.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="col-span-2 h-32 w-full bg-slate-100 flex flex-col items-center justify-center rounded-2xl border border-slate-200/50"
                                >
                                    <VideoOff className="w-5 h-5 text-slate-300 mb-2" />
                                    <span className="text-xs text-slate-500 font-medium">Waiting for video feeds...</span>
                                </motion.div>
                            ) : (
                                tracks.slice(0, 4).map((track, i) => (
                                    <motion.div
                                        key={track.participant.identity + track.source}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: i * 0.08 }}
                                        className={`relative rounded-xl overflow-hidden bg-slate-900 ring-1 ring-slate-200/50 shadow-sm ${i === 0 && tracks.length < 3 ? "col-span-2 h-32" : "h-24"} [&_.lk-participant-tile]:w-full [&_.lk-participant-tile]:h-full [&_video]:w-full [&_video]:h-full [&_video]:object-cover`}
                                    >
                                        <ParticipantTile trackRef={track} />
                                    </motion.div>
                                ))
                            )}
                        </div>

                        {/* Screen share indicator */}
                        <AnimatePresence>
                            {screenEnabled && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mx-3 mt-3 px-3 py-2 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 text-xs font-semibold flex items-center gap-2"
                                >
                                    <Monitor className="w-4 h-4" />
                                    You are sharing your screen
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Controls */}
                        <div className="flex items-center justify-center gap-3 px-4 py-4">
                            {[
                                { onClick: handleToggleMic, active: audioEnabled, activeIcon: <Mic className="w-4 h-4" />, inactiveIcon: <MicOff className="w-4 h-4" />, inactiveClass: "bg-red-50 text-red-600 border-red-100" },
                                { onClick: handleToggleCamera, active: videoEnabled, activeIcon: <Video className="w-4 h-4" />, inactiveIcon: <VideoOff className="w-4 h-4" />, inactiveClass: "bg-red-50 text-red-600 border-red-100" },
                                { onClick: handleToggleShare, active: screenEnabled, activeIcon: <Monitor className="w-4 h-4 text-blue-600" />, inactiveIcon: <Monitor className="w-4 h-4" />, inactiveClass: "bg-white text-slate-600 border-slate-200 hover:text-blue-600 hover:border-blue-200" },
                            ].map((btn, i) => (
                                <motion.button
                                    key={i}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.85 }}
                                    onClick={btn.onClick}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all border shadow-sm ${!btn.active ? btn.inactiveClass : "bg-white text-slate-600 border-slate-200 hover:text-blue-600 hover:border-blue-200"
                                        }`}
                                >
                                    {btn.active ? btn.activeIcon : btn.inactiveIcon}
                                </motion.button>
                            ))}

                            <div className="w-px h-6 bg-gray-200 mx-1" />

                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.85 }}
                                onClick={handleLeave}
                                className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-all shadow-[0_4px_12px_rgba(239,68,68,0.3)]"
                            >
                                <PhoneOff className="w-4 h-4" />
                            </motion.button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
