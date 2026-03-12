"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { LiveKitRoom } from "@livekit/components-react";
import { motion, AnimatePresence } from "framer-motion";
import { Wifi, WifiOff, RefreshCw, AlertTriangle } from "lucide-react";
import "@livekit/components-styles";

interface LiveKitWrapperProps {
    roomId: string;
    userName?: string;
    children: React.ReactNode;
}

export default function LiveKitWrapper({ roomId, userName, children }: LiveKitWrapperProps) {
    const [token, setToken] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isReconnecting, setIsReconnecting] = useState(false);
    const [connectionState, setConnectionState] = useState<"connecting" | "connected" | "disconnected">("connecting");
    const serverUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL || "";
    const retryCountRef = useRef(0);
    const maxRetries = 5;
    const mountedRef = useRef(true);

    const fetchToken = useCallback(async () => {
        try {
            if (mountedRef.current) setError(null);
            const res = await fetch(`/api/livekit?room=${roomId}&username=${encodeURIComponent(userName || "Guest")}`);

            if (!res.ok) {
                const errData = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
                throw new Error(errData.error || `HTTP ${res.status}`);
            }

            const data = await res.json();

            if (mountedRef.current && data.token) {
                setToken(data.token);
                setIsReconnecting(false);
                retryCountRef.current = 0;
                console.log("[LiveKit] Token fetched successfully");
            } else if (data.error) {
                throw new Error(data.error);
            }
        } catch (e: any) {
            console.error("[LiveKit] Token fetch failed:", e.message);

            if (mountedRef.current && retryCountRef.current < maxRetries) {
                const backoffMs = Math.min(1000 * Math.pow(2, retryCountRef.current), 10000);
                retryCountRef.current += 1;
                console.log(`[LiveKit] Retrying in ${backoffMs}ms (attempt ${retryCountRef.current}/${maxRetries})`);
                setTimeout(() => {
                    if (mountedRef.current) fetchToken();
                }, backoffMs);
            } else if (mountedRef.current) {
                setError("Failed to connect to media server after multiple attempts.");
                setIsReconnecting(false);
            }
        }
    }, [roomId, userName]);

    useEffect(() => {
        mountedRef.current = true;
        if (serverUrl) {
            fetchToken();
        }
        return () => {
            mountedRef.current = false;
        };
    }, [roomId, userName, serverUrl, fetchToken]);

    const handleDisconnected = useCallback(() => {
        console.log("[LiveKit] Disconnected — will re-fetch token");
        setIsReconnecting(true);
        setConnectionState("disconnected");
        retryCountRef.current = 0;
        setTimeout(() => {
            if (mountedRef.current) fetchToken();
        }, 2000);
    }, [fetchToken]);

    if (!serverUrl) {
        return (
            <div className="w-full h-full relative">
                <AnimatePresence>
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-14 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 rounded-2xl bg-amber-50/95 backdrop-blur-xl border border-amber-200/60 text-amber-800 text-xs font-medium max-w-sm text-center shadow-2xl shadow-amber-500/10 flex items-center gap-3"
                    >
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                        <span>Missing NEXT_PUBLIC_LIVEKIT_URL. Audio/Video features are disabled.</span>
                    </motion.div>
                </AnimatePresence>
                {children}
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full h-full relative">
                <motion.div
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="absolute top-14 left-1/2 -translate-x-1/2 z-[100] px-5 py-4 rounded-2xl bg-red-50/95 backdrop-blur-xl border border-red-200/60 shadow-2xl shadow-red-500/10 text-red-800 text-sm font-medium max-w-sm text-center flex flex-col items-center gap-3"
                >
                    <WifiOff className="w-5 h-5 text-red-400" />
                    <span>{error}</span>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                            setError(null);
                            retryCountRef.current = 0;
                            fetchToken();
                        }}
                        className="px-4 py-1.5 bg-white rounded-full text-red-600 font-semibold hover:bg-red-50 transition-colors shadow-sm ring-1 ring-red-100 flex items-center gap-2"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Retry Connection
                    </motion.button>
                </motion.div>
                {children}
            </div>
        );
    }

    if (token === "") {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm text-slate-500 z-50">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-8 h-8 rounded-full border-[3px] border-emerald-500 border-t-transparent mb-4 shadow-sm"
                />
                <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="font-medium text-sm text-slate-700"
                >
                    Connecting to Secure Server...
                </motion.span>
            </div>
        );
    }

    return (
        <div className="w-full h-full relative">
            {/* Reconnection banner */}
            <AnimatePresence>
                {isReconnecting && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-4 right-4 z-[100] px-4 py-2 rounded-full bg-amber-50/95 backdrop-blur-xl border border-amber-200/60 text-amber-800 text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10"
                    >
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-3 h-3 rounded-full border-2 border-amber-500 border-t-transparent"
                        />
                        Reconnecting to media server...
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Connection success indicator */}
            <AnimatePresence>
                {connectionState === "connected" && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ delay: 0.2 }}
                        className="absolute top-4 right-4 z-[100] px-3 py-1.5 rounded-full bg-emerald-50/95 backdrop-blur-xl border border-emerald-200/60 text-emerald-700 text-xs font-semibold flex items-center gap-2 shadow-lg"
                    >
                        <Wifi className="w-3 h-3" />
                        Connected
                    </motion.div>
                )}
            </AnimatePresence>

            <LiveKitRoom
                video={true}
                audio={true}
                token={token}
                serverUrl={serverUrl}
                data-lk-theme="default"
                className="w-full h-full"
                connectOptions={{
                    autoSubscribe: true,
                    maxRetries: 5,
                }}
                options={{
                    audioCaptureDefaults: {
                        autoGainControl: true,
                        noiseSuppression: true,
                        echoCancellation: true,
                    },
                    videoCaptureDefaults: {
                        resolution: {
                            width: 640,
                            height: 480,
                            frameRate: 24,
                        },
                    },
                    adaptiveStream: true,
                    dynacast: true,
                }}
                onConnected={() => {
                    console.log("[LiveKit] Connected successfully");
                    setIsReconnecting(false);
                    setConnectionState("connected");
                    // Auto-hide the connected indicator after 3s
                    setTimeout(() => setConnectionState("connecting"), 3000);
                }}
                onDisconnected={handleDisconnected}
                onMediaDeviceFailure={(failure) => {
                    console.warn("[LiveKit] Media device failure:", failure);
                    // Don't show error — user may have denied permissions intentionally
                }}
                onError={(err) => {
                    console.error("[LiveKit] Room error:", err);
                }}
            >
                {children}
            </LiveKitRoom>
        </div>
    );
}
