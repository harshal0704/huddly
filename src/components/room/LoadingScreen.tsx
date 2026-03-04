"use client";

import React from "react";
import { motion } from "framer-motion";

interface LoadingScreenProps {
    roomName?: string;
}

export default function LoadingScreen({ roomName = "Office" }: LoadingScreenProps) {
    return (
        <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center gap-6">
            {/* Logo */}
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", damping: 10 }}
                className="relative"
            >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-500 flex items-center justify-center shadow-xl shadow-emerald-500/20">
                    <span className="text-white text-2xl font-black">H</span>
                </div>
            </motion.div>

            {/* Progress steps */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col items-center gap-3"
            >
                <h2 className="text-lg font-bold text-gray-900">{roomName}</h2>
                <div className="flex flex-col items-start gap-2 text-sm text-gray-500">
                    {["Loading 3D environment", "Preparing your avatar", "Connecting to office"].map((step, i) => (
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + i * 0.4 }}
                            className="flex items-center gap-2"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.9 + i * 0.4 }}
                                className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center"
                            >
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            </motion.div>
                            {step}
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Progress bar */}
            <motion.div className="w-48 h-1 bg-gray-100 rounded-full overflow-hidden mt-2">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2.5, ease: "easeInOut" }}
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                />
            </motion.div>

            {/* Tip */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="text-xs text-gray-400 mt-4"
            >
                💡 Use WASD to move and E to sit down
            </motion.p>
        </div>
    );
}
