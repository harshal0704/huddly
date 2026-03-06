"use client";

import React, { useEffect, useState, useRef } from "react";
import { LiveKitRoom } from "@livekit/components-react";
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
    const serverUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL || "";
    const retryCountRef = useRef(0);
    const maxRetries = 5;

    useEffect(() => {
        let mounted = true;
        let timeoutId: NodeJS.Timeout;

        const fetchToken = async () => {
            try {
                if (mounted) setError(null);
                const res = await fetch(`/api/livekit?room=${roomId}&username=${encodeURIComponent(userName || "Guest")}`);
                const data = await res.json();

                if (mounted && data.token) {
                    setToken(data.token);
                    retryCountRef.current = 0; // Reset on success
                } else if (data.error) {
                    if (mounted) setError(data.error);
                    console.error("LiveKit token error:", data.error);
                }
            } catch (e) {
                console.error("Failed to fetch LiveKit token", e);

                // Exponential backoff
                if (mounted && retryCountRef.current < maxRetries) {
                    const backoffMs = Math.min(1000 * Math.pow(2, retryCountRef.current), 10000);
                    retryCountRef.current += 1;
                    console.log(`Retrying token fetch in ${backoffMs}ms (Attempt ${retryCountRef.current}/${maxRetries})`);
                    timeoutId = setTimeout(fetchToken, backoffMs);
                } else if (mounted) {
                    setError("Failed to connect to media server after multiple attempts.");
                }
            }
        };

        if (serverUrl) {
            fetchToken();
        }

        return () => {
            mounted = false;
            clearTimeout(timeoutId);
        };
    }, [roomId, userName, serverUrl]);

    if (!serverUrl) {
        return (
            <div className="w-full h-full relative">
                <div className="absolute top-14 left-1/2 -translate-x-1/2 z-[100] px-4 py-3 rounded-2xl bg-orange-100/90 backdrop-blur-md border border-orange-200 text-orange-800 text-xs font-medium max-w-sm text-center shadow-2xl">
                    Missing NEXT_PUBLIC_LIVEKIT_URL. Audio/Video features are disabled. Check SETUP.md.
                </div>
                {children}
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full h-full relative">
                <div className="absolute top-14 left-1/2 -translate-x-1/2 z-[100] px-5 py-4 rounded-2xl bg-red-50/90 backdrop-blur-xl border border-red-200 shadow-2xl text-red-800 text-sm font-medium max-w-sm text-center flex flex-col items-center gap-3">
                    <span>{error}</span>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-1.5 bg-white rounded-full text-red-600 font-semibold hover:bg-red-50 transition-colors shadow-sm ring-1 ring-red-100"
                    >
                        Retry Connection
                    </button>
                </div>
                {children}
            </div>
        );
    }

    if (token === "") {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm text-slate-500 z-50">
                <div className="w-8 h-8 rounded-full border-[3px] border-[#007AFF] border-t-transparent animate-spin mb-4 shadow-sm" />
                <span className="font-medium text-sm text-slate-700">Connecting to Secure Server...</span>
            </div>
        );
    }

    return (
        <div className="w-full h-full relative">
            {isReconnecting && (
                <div className="absolute top-4 right-4 z-[100] px-4 py-2 rounded-full bg-amber-50/90 backdrop-blur-xl border border-amber-200 text-amber-800 text-xs font-semibold flex items-center justify-center gap-2 shadow-lg">
                    <div className="w-3 h-3 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
                    Reconnecting to media server...
                </div>
            )}

            <LiveKitRoom
                video={false}
                audio={false}
                token={token}
                serverUrl={serverUrl}
                data-lk-theme="default"
                className="w-full h-full"
                connectOptions={{
                    autoSubscribe: true,
                    maxRetries: 5,
                }}
                onConnected={() => setIsReconnecting(false)}
                onDisconnected={() => {
                    console.log("LiveKit disconnected");
                    setIsReconnecting(true);
                }}
            >
                {children}
            </LiveKitRoom>
        </div>
    );
}
