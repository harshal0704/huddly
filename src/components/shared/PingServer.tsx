"use client";

import { useEffect } from "react";

/**
 * Pings the Socket.IO backend to wake it up if it's sleeping on a free tier (e.g. Render).
 */
export default function PingServer() {
    useEffect(() => {
        const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";

        // Quick, non-blocking fetch to the health endpoint
        fetch(`${socketUrl}/health`).catch(() => {
            // Silently fail if backend is unreachable 
        });
    }, []);

    return null; // This component doesn't render anything
}
