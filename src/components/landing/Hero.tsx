"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import { Show, SignUpButton } from "@clerk/nextjs";

const HeroScene = dynamic(() => import("@/components/landing/HeroScene"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full bg-gradient-to-br from-[#f5f0e8] to-[#e8e0d0] flex items-center justify-center rounded-2xl">
            <div className="w-10 h-10 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
        </div>
    ),
});

export default function Hero() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
    const previewY = useTransform(scrollYProgress, [0, 1], [0, -80]);
    const previewScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);
    const bgGlowOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

    return (
        <section ref={sectionRef} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-8">
            {/* Warm gradient background */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/50 via-white to-amber-50/30" />
                <motion.div
                    className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-200/25 rounded-full blur-[150px]"
                    animate={{ x: [0, 50, 0], y: [0, -30, 0] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute top-1/3 right-1/5 w-[500px] h-[500px] bg-amber-200/20 rounded-full blur-[150px]"
                    animate={{ x: [0, -40, 0], y: [0, 40, 0] }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-teal-100/20 rounded-full blur-[150px]"
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
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-700 text-sm font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        3D Virtual Office — Free to Try
                    </span>
                </motion.div>

                {/* Headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, type: "spring", damping: 12 }}
                    className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight mb-6 leading-[0.95]"
                >
                    <span className="text-gray-900">Walk up. </span>
                    <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 bg-clip-text text-transparent animate-gradient bg-[length:200%_200%]">
                        Talk naturally.
                    </span>
                </motion.h1>

                {/* Subline */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-lg sm:text-xl text-gray-500 max-w-xl mx-auto mb-10 leading-relaxed"
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
                    <Link href="/room/office">
                        <Button size="xl" className="gap-2 group bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white border-0 shadow-lg shadow-emerald-500/25">
                            <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            Test Drive Office
                        </Button>
                    </Link>
                    <Show when="signed-in">
                        <Link href="/dashboard">
                            <Button variant="outline" size="xl" className="gap-2 border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100">
                                Enter Dashboard
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                    </Show>
                    <Show when="signed-out">
                        <SignUpButton mode="modal">
                            <Button variant="outline" size="xl" className="gap-2 border-gray-300 text-gray-600 hover:bg-gray-50">
                                Create Account
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </SignUpButton>
                    </Show>
                </motion.div>

                {/* 3D Preview */}
                <motion.div
                    initial={{ opacity: 0, y: 40, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.9, type: "spring", damping: 15 }}
                    style={{ y: previewY, scale: previewScale }}
                    className="relative max-w-4xl mx-auto"
                >
                    <div className="relative rounded-2xl overflow-hidden border border-black/10 shadow-2xl shadow-black/10">
                        {/* Fade overlays */}
                        <div className="absolute inset-0 bg-gradient-to-t from-white/30 via-transparent to-transparent z-10 pointer-events-none" />
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
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
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
