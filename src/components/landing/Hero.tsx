"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Play, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Hero() {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
            {/* Animated gradient background */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-b from-violet-950/50 via-gray-950 to-gray-950" />
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[128px] animate-pulse" />
                <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-indigo-600/20 rounded-full blur-[128px] animate-pulse delay-1000" />
                <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] bg-fuchsia-600/15 rounded-full blur-[128px] animate-pulse delay-500" />
            </div>

            {/* Floating particles */}
            <div className="absolute inset-0 -z-5 overflow-hidden">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-violet-400/30 rounded-full"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            y: [0, -30, 0],
                            opacity: [0.2, 0.8, 0.2],
                        }}
                        transition={{
                            duration: 3 + Math.random() * 4,
                            repeat: Infinity,
                            delay: Math.random() * 3,
                        }}
                    />
                ))}
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-6"
                >
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm font-medium">
                        <Sparkles className="w-3.5 h-3.5" />
                        The friendliest virtual world for teams
                    </span>
                </motion.div>

                {/* Headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, type: "spring", damping: 12 }}
                    className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight mb-6"
                >
                    <span className="text-white">Walk up. </span>
                    <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">
                        Talk naturally.
                    </span>
                </motion.h1>

                {/* Subheadline */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
                >
                    Huddly is a beautiful 2D virtual world where your team can meet, collaborate, and hang out —
                    just by walking up to each other. No awkward meeting links ever again.
                </motion.p>

                {/* CTAs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
                >
                    <Link href="/room/demo">
                        <Button size="xl" className="gap-2 group">
                            <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            Try Free Demo
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                    <Link href="/dashboard">
                        <Button variant="secondary" size="xl" className="gap-2">
                            Create My Space
                        </Button>
                    </Link>
                </motion.div>

                {/* Demo preview area */}
                <motion.div
                    initial={{ opacity: 0, y: 40, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.9, type: "spring", damping: 15 }}
                    className="relative max-w-4xl mx-auto"
                >
                    <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-violet-500/10">
                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent z-10 pointer-events-none" />

                        {/* Demo canvas placeholder - will be replaced by PhaserDemo */}
                        <div
                            id="demo-canvas-container"
                            className="w-full aspect-[16/9] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center"
                        >
                            {/* Animated demo preview */}
                            <div className="relative w-full h-full overflow-hidden">
                                {/* Floor grid */}
                                <div className="absolute inset-0 opacity-10"
                                    style={{
                                        backgroundImage: `
                      linear-gradient(rgba(139, 92, 246, 0.3) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(139, 92, 246, 0.3) 1px, transparent 1px)
                    `,
                                        backgroundSize: "32px 32px",
                                    }}
                                />

                                {/* Animated avatars */}
                                {[
                                    { x: "20%", y: "30%", color: "from-violet-400 to-purple-500", delay: 0, name: "Alex" },
                                    { x: "35%", y: "45%", color: "from-blue-400 to-cyan-500", delay: 0.5, name: "Maya" },
                                    { x: "55%", y: "35%", color: "from-emerald-400 to-teal-500", delay: 1, name: "Sam" },
                                    { x: "70%", y: "55%", color: "from-amber-400 to-orange-500", delay: 1.5, name: "Jo" },
                                    { x: "40%", y: "65%", color: "from-pink-400 to-rose-500", delay: 2, name: "Lee" },
                                    { x: "60%", y: "25%", color: "from-indigo-400 to-blue-500", delay: 2.5, name: "Kai" },
                                ].map((avatar, i) => (
                                    <motion.div
                                        key={i}
                                        className="absolute flex flex-col items-center"
                                        style={{ left: avatar.x, top: avatar.y }}
                                        animate={{
                                            x: [0, 20 * Math.sin(i * 1.5), -15 * Math.cos(i), 0],
                                            y: [0, -15 * Math.cos(i * 0.8), 20 * Math.sin(i * 1.2), 0],
                                        }}
                                        transition={{
                                            duration: 8 + i * 2,
                                            repeat: Infinity,
                                            delay: avatar.delay,
                                            ease: "easeInOut",
                                        }}
                                    >
                                        {/* Proximity ring (shows between nearby avatars) */}
                                        {i < 2 && (
                                            <motion.div
                                                className="absolute w-20 h-20 rounded-full border-2 border-violet-400/30"
                                                animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                            />
                                        )}

                                        {/* Video bubble (for proximate avatars) */}
                                        {i < 2 && (
                                            <motion.div
                                                className="absolute -top-10 w-12 h-12 rounded-xl bg-gray-700/80 border border-white/20 overflow-hidden"
                                                animate={{ scale: [0.9, 1, 0.9] }}
                                                transition={{ duration: 3, repeat: Infinity }}
                                            >
                                                <div className={`w-full h-full bg-gradient-to-br ${avatar.color} opacity-60`} />
                                            </motion.div>
                                        )}

                                        {/* Avatar body */}
                                        <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${avatar.color} shadow-lg`}>
                                            <div className="w-full h-full rounded-xl flex items-center justify-center text-xs">
                                                😊
                                            </div>
                                        </div>

                                        {/* Name tag */}
                                        <span className="mt-1 text-[10px] text-white/80 font-medium bg-black/40 px-1.5 rounded-full">
                                            {avatar.name}
                                        </span>
                                    </motion.div>
                                ))}

                                {/* Furniture items */}
                                <div className="absolute left-[15%] top-[60%] w-16 h-8 rounded bg-amber-900/60 border border-amber-700/30 flex items-center justify-center text-xs text-amber-200/60">
                                    🪑
                                </div>
                                <div className="absolute right-[20%] top-[40%] w-20 h-12 rounded bg-gray-700/60 border border-gray-600/30 flex items-center justify-center text-xs">
                                    🖥️
                                </div>
                                <div className="absolute left-[45%] top-[15%] w-24 h-6 rounded bg-emerald-900/40 border border-emerald-700/30 flex items-center justify-center text-[10px] text-emerald-300/60">
                                    Whiteboard
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Labels */}
                    <div className="flex items-center justify-center gap-4 mt-6 text-sm text-gray-500">
                        <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            6 people online
                        </span>
                        <span>•</span>
                        <span>Live demo classroom</span>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
