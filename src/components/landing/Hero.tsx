"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Video, Users, MessageSquare, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignUpButton, useUser } from "@clerk/nextjs";
import dynamic from "next/dynamic";

const HeroScene = dynamic(() => import("./HeroScene"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full flex items-center justify-center bg-gray-50/50 rounded-3xl border border-gray-100">
            <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
                <span className="text-xs text-emerald-600 font-medium">Loading 3D World...</span>
            </div>
        </div>
    )
});

export default function Hero() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
    const { isSignedIn } = useUser();

    // Smooth parallax effects
    const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
    const y2 = useTransform(scrollYProgress, [0, 1], [0, -200]);
    const opacityFade = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
    const scaleFade = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);

    return (
        <section ref={sectionRef} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-32 pb-20 bg-[#FAFAF8]">
            {/* Ambient Background Glows */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] opacity-40">
                    <motion.div
                        className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-emerald-300/30 blur-[120px]"
                        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <motion.div
                        className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-teal-300/20 blur-[120px]"
                        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
                        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    />
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="flex flex-col items-center text-center">

                    {/* Launch Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="mb-8"
                    >
                        <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white border border-gray-200 shadow-sm">
                            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100">
                                <Zap className="w-3 h-3 text-emerald-600" />
                            </span>
                            <span className="text-sm font-medium text-gray-700 pr-2">The new standard for virtual work</span>
                        </div>
                    </motion.div>

                    {/* Highly Cinematic Typography */}
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
                        className="text-6xl md:text-7xl lg:text-[84px] font-bold tracking-tight text-gray-900 leading-[1.05] max-w-5xl"
                    >
                        Your team's <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">virtual HQ.</span><br />
                        Built for presence.
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
                        className="mt-8 text-xl md:text-2xl text-gray-500 font-light max-w-2xl leading-relaxed"
                    >
                        Stop scheduling meetings. Start working together in a spatial, frictionless environment that brings everyone closer.
                    </motion.p>

                    {/* Premium CTAs */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.3, type: "spring" }}
                        className="mt-12 flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
                    >
                        <Link href="/room/office" className="w-full sm:w-auto">
                            <Button size="xl" className="w-full sm:w-auto h-14 px-8 text-base bg-gray-900 hover:bg-gray-800 text-white rounded-2xl shadow-xl shadow-gray-900/20 group transition-all">
                                Try Demo Room
                                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>

                        {!isSignedIn ? (
                            <SignUpButton mode="modal">
                                <Button variant="outline" size="xl" className="w-full sm:w-auto h-14 px-8 text-base bg-white hover:bg-gray-50 text-gray-700 rounded-2xl border-gray-200">
                                    Create Free Account
                                </Button>
                            </SignUpButton>
                        ) : (
                            <Link href="/dashboard" className="w-full sm:w-auto">
                                <Button variant="outline" size="xl" className="w-full sm:w-auto h-14 px-8 text-base bg-white hover:bg-gray-50 text-gray-700 rounded-2xl border-gray-200">
                                    Go to Dashboard
                                </Button>
                            </Link>
                        )}
                    </motion.div>

                    {/* Render World Showcase (Replaces Abstract Mockup) */}
                    <motion.div
                        initial={{ opacity: 0, y: 60 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.4, type: "spring", damping: 20 }}
                        className="w-full mt-20 relative px-4 sm:px-0 max-w-5xl"
                    >
                        {/* Mockup Frame */}
                        <div className="relative rounded-[32px] overflow-hidden border border-gray-200/50 bg-white/40 backdrop-blur-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] p-2">
                            <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-white/20 z-0" />

                            {/* Inner Screen */}
                            <div className="relative z-10 rounded-[24px] overflow-hidden bg-[#e8e0d0] border border-gray-100 w-full aspect-[16/10] md:aspect-[21/9] flex items-center justify-center shadow-inner group">
                                <HeroScene />

                                {/* UI Overlay over the 3D scene */}
                                <div className="absolute top-4 left-4 z-20 pointer-events-none">
                                    <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-gray-200/50 shadow-sm flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-xs font-semibold text-gray-700">Huddly Office · 12 online</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
