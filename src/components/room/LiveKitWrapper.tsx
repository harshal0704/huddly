"use client";

import React, { useEffect, useState } from "react";
import { LiveKitRoom } from "@livekit/components-react";
import "@livekit/components-styles";

interface LiveKitWrapperProps {
    roomId: string;
    userName?: string;
    children: React.ReactNode;
}

export default function LiveKitWrapper({ roomId, userName, children }: LiveKitWrapperProps) {
    const [token, setToken] = useState("");
    const serverUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL || "";

    useEffect(() => {
        let mounted = true;
        const fetchToken = async () => {
            try {
                const res = await fetch(`/api/livekit?room=${roomId}&username=${encodeURIComponent(userName || "Guest")}`);
                const data = await res.json();

                if (mounted && data.token) {
                    setToken(data.token);
                } else if (data.error) {
                    console.error("LiveKit token error:", data.error);
                }
            } catch (e) {
                console.error("Failed to fetch LiveKit token", e);
            }
        };

        fetchToken();
        return () => { mounted = false; };
    }, [roomId, userName]);

    if (!serverUrl) {
        return (
            <div className="w-full h-full relative">
                <div className="absolute top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-amber-600/90 backdrop-blur-sm text-white text-xs font-medium max-w-sm text-center">
                    Missing NEXT_PUBLIC_LIVEKIT_URL. Audio/Video features are disabled. Check SETUP.md.
                </div>
                {children}
            </div>
        );
    }

    if (token === "") {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center bg-white text-gray-500">
                <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin mb-4" />
                Connecting to Secure Server...
            </div>
        );
    }

    return (
        <LiveKitRoom
            video={false}
            audio={false}
            token={token}
            serverUrl={serverUrl}
            data-lk-theme="default"
            className="w-full h-full"
        >
            {children}
        </LiveKitRoom>
    );
}
