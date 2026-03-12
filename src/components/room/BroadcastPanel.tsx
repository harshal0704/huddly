"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Radio, X, Eye, Mic, MicOff, Video, VideoOff, MonitorUp, StopCircle, Users, AlertCircle } from "lucide-react";

import { useLocalParticipant, useTracks } from "@livekit/components-react";
import { Track } from "livekit-client";

interface BroadcastPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function BroadcastPanel({
    isOpen,
    onClose,
}: BroadcastPanelProps) {
    const [isLive, setIsLive] = useState(false);
    const [viewerCount, setViewerCount] = useState(0);
    const [duration, setDuration] = useState(0);
    const [errorMsg, setErrorMsg] = useState("");
    const videoRef = useRef<HTMLVideoElement>(null);
    const screenRef = useRef<HTMLVideoElement>(null);

    const { localParticipant } = useLocalParticipant();
    const tracks = useTracks([
        { source: Track.Source.Camera, withPlaceholder: false },
        { source: Track.Source.ScreenShare, withPlaceholder: false }
    ], { onlySubscribed: false });

    // Local participant tracks
    const localCameraTrack = tracks.find(t => t.participant.identity === localParticipant.identity && t.source === Track.Source.Camera)?.publication?.track;
    const localScreenTrack = tracks.find(t => t.participant.identity === localParticipant.identity && t.source === Track.Source.ScreenShare)?.publication?.track;

    const isCameraOff = !localParticipant.isCameraEnabled;
    const isMuted = !localParticipant.isMicrophoneEnabled;
    const isScreenSharing = localParticipant.isScreenShareEnabled;

    // Attach local camera stream to video element
    useEffect(() => {
        const el = videoRef.current;
        if (el && localCameraTrack) {
            localCameraTrack.attach(el);
        }
        return () => {
            if (el && localCameraTrack) {
                localCameraTrack.detach(el);
            }
        };
    }, [localCameraTrack, isCameraOff]);

    // Attach screen share stream
    useEffect(() => {
        const el = screenRef.current;
        if (el && localScreenTrack) {
            localScreenTrack.attach(el);
        }
        return () => {
            if (el && localScreenTrack) {
                localScreenTrack.detach(el);
            }
        };
    }, [localScreenTrack]);

    // When going live, make sure media is started
    const handleGoLive = async () => {
        try {
            setErrorMsg("");
            if (!isScreenSharing) {
                await localParticipant.setScreenShareEnabled(true);
            }
            if (isCameraOff) {
                await localParticipant.setCameraEnabled(true);
            }
            if (isMuted) {
                await localParticipant.setMicrophoneEnabled(true);
            }
            setIsLive(true);
        } catch (e: any) {
            console.error("Failed to go live:", e);
            setErrorMsg(e.message || "Failed to start screen share.");
        }
    };

    const handleStopBroadcast = async () => {
        try {
            if (isScreenSharing) await localParticipant.setScreenShareEnabled(false);
            if (!isCameraOff) await localParticipant.setCameraEnabled(false);
            if (!isMuted) await localParticipant.setMicrophoneEnabled(false);
        } catch (e) {
            console.error("Error stopping broadcast", e);
        }
        setIsLive(false);
    };

    // Simulate viewer count when live
    useEffect(() => {
        if (!isLive) {
            // eslint-disable-next-line
            setViewerCount(0);
            setDuration(0);
            return;
        }
        setViewerCount(3 + Math.floor(Math.random() * 5));
        const viewerInterval = setInterval(() => {
            setViewerCount((prev) => {
                const delta = Math.floor(Math.random() * 3) - 1;
                return Math.max(1, Math.min(prev + delta, 50));
            });
        }, 2000);
        const durationInterval = setInterval(() => {
            setDuration((prev) => prev + 1);
        }, 1000);
        return () => {
            clearInterval(viewerInterval);
            clearInterval(durationInterval);
        };
    }, [isLive]);

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="fixed top-16 left-4 z-30 w-80 bg-white/90 backdrop-blur-2xl rounded-3xl border border-gray-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex flex-col overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                        <div className="flex items-center gap-2.5">
                            <div className={`p-1.5 rounded-full ${isLive ? "bg-red-50 text-red-500" : "bg-blue-50 text-[#007AFF]"}`}>
                                <Radio className="w-4 h-4" />
                            </div>
                            <span className="text-slate-900 font-semibold text-sm">Broadcaster</span>
                            {isLive && (
                                <motion.span
                                    animate={{ opacity: [1, 0.5, 1] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                    className="text-[10px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full border border-red-200"
                                >
                                    LIVE
                                </motion.span>
                            )}
                        </div>
                        <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-all">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Error Toast */}
                    {errorMsg && (
                        <div className="mx-4 mt-3 p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                            <span className="text-xs text-red-700 leading-tight">{errorMsg}</span>
                        </div>
                    )}

                    {/* Preview area */}
                    <div className="px-4 py-3">
                        <div className={`relative aspect-video rounded-2xl overflow-hidden bg-slate-100 ${isLive ? "ring-2 ring-red-500/30 shadow-[0_4px_15px_rgba(239,68,68,0.2)]" : "ring-1 ring-slate-200/50"
                            }`}>
                            {/* Screen share takes priority */}
                            {isScreenSharing && localScreenTrack ? (
                                <video
                                    ref={screenRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="w-full h-full object-contain bg-slate-900"
                                />
                            ) : localCameraTrack && !isCameraOff ? (
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="w-full h-full object-cover"
                                    style={{ transform: "scaleX(-1)" }}
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center">
                                    <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-2">
                                        <VideoOff className="w-5 h-5 text-slate-400" />
                                    </div>
                                    <span className="text-xs font-medium text-slate-500">
                                        {localCameraTrack ? "Camera blocked" : "Camera inactive"}
                                    </span>
                                </div>
                            )}

                            {/* Live overlay stats */}
                            {isLive && (
                                <div className="absolute top-2 left-2 right-2 flex items-center justify-between">
                                    <motion.div
                                        animate={{ opacity: [1, 0.8, 1] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                        className="flex items-center gap-1.5 bg-red-500/90 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm"
                                    >
                                        <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                        LIVE
                                    </motion.div>
                                    <span className="text-[10px] font-medium text-slate-700 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full shadow-sm border border-slate-200/50">
                                        {formatDuration(duration)}
                                    </span>
                                </div>
                            )}

                            {/* Screen share badge */}
                            {isScreenSharing && (
                                <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-[#007AFF]/90 backdrop-blur-md text-white text-[10px] font-semibold px-2.5 py-1 rounded-full shadow-sm">
                                    <MonitorUp className="w-3 h-3" />
                                    Screen Active
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Stats when live */}
                    {isLive && (
                        <div className="px-5 pb-3">
                            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                                <span className="flex items-center gap-1.5">
                                    <Eye className="w-3.5 h-3.5 text-[#007AFF]" />
                                    {viewerCount} viewers
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Users className="w-3.5 h-3.5 text-emerald-500" />
                                    Global Room
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Controls */}
                    <div className="px-4 py-4 border-t border-gray-100 bg-slate-50/50 space-y-3">
                        <div className="flex items-center justify-center gap-3">
                            <button
                                onClick={async () => await localParticipant.setMicrophoneEnabled(isMuted)}
                                className={`p-3 rounded-full transition-all border shadow-sm ${isMuted ? "bg-red-50 text-red-600 border-red-100 hover:bg-red-100" : "bg-white text-slate-600 border-slate-200 hover:text-[#007AFF] hover:border-[#007AFF]/30"
                                    }`}
                                title={isMuted ? "Unmute" : "Mute"}
                            >
                                {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                            </button>

                            <button
                                onClick={async () => await localParticipant.setCameraEnabled(isCameraOff)}
                                className={`p-3 rounded-full transition-all border shadow-sm ${isCameraOff ? "bg-red-50 text-red-600 border-red-100 hover:bg-red-100" : "bg-white text-slate-600 border-slate-200 hover:text-[#007AFF] hover:border-[#007AFF]/30"
                                    }`}
                                title={isCameraOff ? "Camera on" : "Camera off"}
                            >
                                {isCameraOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                            </button>

                            <button
                                onClick={async () => await localParticipant.setScreenShareEnabled(!isScreenSharing)}
                                className={`p-3 rounded-full transition-all border shadow-sm ${isScreenSharing ? "bg-blue-50 text-[#007AFF] border-blue-100" : "bg-white text-slate-600 border-slate-200 hover:text-[#007AFF] hover:border-[#007AFF]/30"
                                    }`}
                                title={isScreenSharing ? "Stop sharing" : "Share screen"}
                            >
                                <MonitorUp className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Go Live / Stop */}
                        {!isLive ? (
                            <button
                                onClick={handleGoLive}
                                className="w-full py-3 rounded-xl bg-[#007AFF] hover:bg-[#0066CC] text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-[0_4px_14px_rgba(0,122,255,0.3)] hover:shadow-[0_6px_20px_rgba(0,122,255,0.4)]"
                            >
                                <Radio className="w-4 h-4" />
                                Start Broadcasting
                            </button>
                        ) : (
                            <button
                                onClick={handleStopBroadcast}
                                className="w-full py-3 rounded-xl bg-white hover:bg-red-50 text-red-600 text-sm font-semibold flex items-center justify-center gap-2 transition-all border border-red-200 shadow-sm"
                            >
                                <StopCircle className="w-4 h-4" />
                                End Broadcast
                            </button>
                        )}

                        <p className="text-[10px] text-slate-400 text-center font-medium px-4 leading-tight">
                            {isLive
                                ? "Your stream is visible to everyone in the room."
                                : "Go live to project your media onto the 3D screens."
                            }
                        </p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

