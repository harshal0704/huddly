"use client";

import React from "react";
import { motion } from "framer-motion";

interface LoadingScreenProps {
    roomName?: string;
}

export default function LoadingScreen({ roomName = "Room" }: LoadingScreenProps) {
    return (
        <div className="fixed inset-0 z-50 bg-[#0a0612] flex flex-col items-center justify-center gap-6">
            {/* Logo */}
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-violet-500/30"
            >
                <span className="text-2xl">🏠</span>
            </motion.div>

            {/* Spinner ring */}
            <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full border-2 border-violet-500/20" />
                <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-violet-500 animate-spin" />
            </div>

            {/* Room name */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center"
            >
                <p className="text-white font-semibold text-lg">{roomName}</p>
                <p className="text-gray-500 text-sm mt-1">Loading 3D world...</p>
            </motion.div>

            {/* Subtle tips */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ delay: 1 }}
                className="text-gray-600 text-xs absolute bottom-8"
            >
                Use WASD to move around
            </motion.p>
        </div>
    );
}
