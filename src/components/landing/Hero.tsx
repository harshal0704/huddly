"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";

const HeroScene = dynamic(() => import("@/components/landing/HeroScene"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full bg-gradient-to-br from-[#0c0816] via-[#12091e] to-[#0c0816] flex items-center justify-center rounded-2xl">
            <div className="w-10 h-10 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
        </div>
    ),
});

export default function Hero() {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-8">
            {/* Gradient background */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-b from-purple-950/40 via-[#050208] to-[#050208]" />
                <motion.div
                    className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-600/15 rounded-full blur-[150px]"
                    animate={{ x: [0, 50, 0], y: [0, -30, 0] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute top-1/3 right-1/5 w-[500px] h-[500px] bg-cyan-600/12 rounded-full blur-[150px]"
                    animate={{ x: [0, -40, 0], y: [0, 40, 0] }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[150px]"
                    animate={{ x: [0, 30, -30, 0] }}
                    transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
                />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-8"
                >
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/8 border border-cyan-500/15 text-cyan-300 text-sm font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                        3D Virtual World — Free to Try
                    </span>
                </motion.div>

                {/* Headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, type: "spring", damping: 12 }}
                    className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight mb-6 leading-[0.95]"
                >
                    <span className="text-white">Walk up. </span>
                    <span className="bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent animate-gradient bg-[length:200%_200%]">
                        Talk naturally.
                    </span>
                </motion.h1>

                {/* Subline */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-lg sm:text-xl text-gray-400 max-w-xl mx-auto mb-10 leading-relaxed"
                >
                    A 3D world where your team meets by walking up to each other. No links. No scheduling. Just presence.
                </motion.p>

                {/* CTAs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
                >
                    <Link href="/room/demo">
                        <Button size="xl" className="gap-2 group bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 border-0 shadow-lg shadow-purple-500/20">
                            <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            Try Free Demo
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                    <Link href="/dashboard">
                        <Button variant="secondary" size="xl" className="gap-2 border-white/10 hover:border-white/20">
                            Create My Space
                        </Button>
                    </Link>
                </motion.div>

                {/* 3D Preview */}
                <motion.div
                    initial={{ opacity: 0, y: 40, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.9, type: "spring", damping: 15 }}
                    className="relative max-w-4xl mx-auto"
                >
                    <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-purple-500/10">
                        {/* Top fade */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#050208] via-transparent to-transparent z-10 pointer-events-none" />
                        <div
                            id="demo-canvas-container"
                            className="w-full aspect-[16/9]"
                        >
                            <HeroScene />
                        </div>
                    </div>

                    {/* Labels */}
                    <div className="flex items-center justify-center gap-4 mt-5 text-sm text-gray-500">
                        <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            Live 3D Preview
                        </span>
                        <span>•</span>
                        <span>Drag to explore</span>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
