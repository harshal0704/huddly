"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Radio, X, Eye, Mic, MicOff, Video, VideoOff, MonitorUp, StopCircle, Users } from "lucide-react";

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
        if (videoRef.current && localCameraTrack) {
            localCameraTrack.attach(videoRef.current);
        }
        return () => {
            if (videoRef.current && localCameraTrack) {
                localCameraTrack.detach(videoRef.current);
            }
        };
    }, [localCameraTrack, isCameraOff]);

    // Attach screen share stream
    useEffect(() => {
        if (screenRef.current && localScreenTrack) {
            localScreenTrack.attach(screenRef.current);
        }
        return () => {
            if (screenRef.current && localScreenTrack) {
                localScreenTrack.detach(screenRef.current);
            }
        };
    }, [localScreenTrack]);

    // When going live, make sure media is started
    const handleGoLive = async () => {
        if (isCameraOff) {
            await localParticipant.setCameraEnabled(true);
        }
        setIsLive(true);
    };

    const handleStopBroadcast = () => {
        setIsLive(false);
    };

    // Simulate viewer count when live
    useEffect(() => {
        if (!isLive) {
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
                    transition={{ type: "spring", damping: 20, stiffness: 200 }}
                    className="fixed top-16 left-4 z-30 w-80 bg-gray-950/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl shadow-violet-500/10 flex flex-col overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                        <div className="flex items-center gap-2">
                            <Radio className={`w-4 h-4 ${isLive ? "text-red-400" : "text-violet-400"}`} />
                            <span className="text-white font-semibold text-sm">Broadcast</span>
                            {isLive && (
                                <motion.span
                                    animate={{ opacity: [1, 0.5, 1] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                    className="text-[10px] font-bold text-red-400 bg-red-500/20 px-2 py-0.5 rounded-full"
                                >
                                    LIVE
                                </motion.span>
                            )}
                        </div>
                        <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Preview area — shows real camera or screen share */}
                    <div className="px-4 py-3">
                        <div className={`relative aspect-video rounded-xl overflow-hidden ${isLive ? "ring-2 ring-red-500/50 shadow-lg shadow-red-500/10" : "ring-1 ring-white/10"
                            }`}>
                            {/* Screen share takes priority when broadcasting */}
                            {isScreenSharing && localScreenTrack ? (
                                <video
                                    ref={screenRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="w-full h-full object-contain bg-black"
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
                                <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                                    <div className="text-center">
                                        <VideoOff className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                                        <span className="text-xs text-gray-500">
                                            {localCameraTrack ? "Camera off" : "Camera not started"}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Live overlay */}
                            {isLive && (
                                <div className="absolute top-2 left-2 right-2 flex items-center justify-between">
                                    <motion.div
                                        animate={{ opacity: [1, 0.6, 1] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                        className="flex items-center gap-1 bg-red-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full"
                                    >
                                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                        LIVE
                                    </motion.div>
                                    <span className="text-[10px] text-white/80 bg-black/50 px-2 py-0.5 rounded-full font-mono">
                                        {formatDuration(duration)}
                                    </span>
                                </div>
                            )}

                            {/* Screen share badge */}
                            {isScreenSharing && isLive && (
                                <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-blue-600/90 text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
                                    <MonitorUp className="w-3 h-3" />
                                    Screen
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Stats when live */}
                    {isLive && (
                        <div className="px-4 pb-2">
                            <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
                                <span className="flex items-center gap-1">
                                    <Eye className="w-3 h-3" />
                                    {viewerCount} viewers
                                </span>
                                <span className="flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    Broadcasting to all
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Controls */}
                    <div className="px-4 py-3 border-t border-white/10 space-y-3">
                        <div className="flex items-center justify-center gap-2">
                            <button
                                onClick={async () => await localParticipant.setMicrophoneEnabled(isMuted)}
                                className={`p-2.5 rounded-xl transition-all ${isMuted ? "bg-red-500/20 text-red-400" : "bg-white/5 text-gray-300 hover:bg-white/10"
                                    }`}
                                title={isMuted ? "Unmute" : "Mute"}
                            >
                                {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                            </button>

                            <button
                                onClick={async () => await localParticipant.setCameraEnabled(isCameraOff)}
                                className={`p-2.5 rounded-xl transition-all ${isCameraOff ? "bg-red-500/20 text-red-400" : "bg-white/5 text-gray-300 hover:bg-white/10"
                                    }`}
                                title={isCameraOff ? "Camera on" : "Camera off"}
                            >
                                {isCameraOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                            </button>

                            <button
                                onClick={async () => await localParticipant.setScreenShareEnabled(!isScreenSharing)}
                                className={`p-2.5 rounded-xl transition-all ${isScreenSharing ? "bg-blue-500/20 text-blue-400" : "bg-white/5 text-gray-300 hover:bg-white/10"
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
                                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-500/20 hover:shadow-red-500/30"
                            >
                                <Radio className="w-4 h-4" />
                                Go Live
                            </button>
                        ) : (
                            <button
                                onClick={handleStopBroadcast}
                                className="w-full py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all border border-white/10"
                            >
                                <StopCircle className="w-4 h-4 text-red-400" />
                                End Broadcast
                            </button>
                        )}

                        <p className="text-[10px] text-gray-500 text-center">
                            {isLive
                                ? "You are broadcasting to everyone in the room"
                                : "Going live will broadcast your feed to all participants"
                            }
                        </p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
