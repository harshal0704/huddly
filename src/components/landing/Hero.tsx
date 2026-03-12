"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Video, Users, MessageSquare, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignUpButton, useUser } from "@clerk/nextjs";

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

                    {/* UI Mockup Showcase (Replaces 3D Canvas) */}
                    <motion.div
                        style={{ y: y1, opacity: opacityFade, scale: scaleFade }}
                        initial={{ opacity: 0, y: 60 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.4, type: "spring", damping: 20 }}
                        className="w-full mt-20 relative px-4 sm:px-0 max-w-5xl"
                    >
                        {/* Mockup Frame */}
                        <div className="relative rounded-[32px] overflow-hidden border border-gray-200/50 bg-white/40 backdrop-blur-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] p-2">
                            <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-white/20 z-0" />

                            {/* Inner Screen */}
                            <div className="relative z-10 rounded-[24px] overflow-hidden bg-gray-50 border border-gray-100 w-full aspect-[16/10] md:aspect-[21/9] flex items-center justify-center shadow-inner">

                                {/* Abstract UI Elements */}
                                <div className="absolute inset-0" style={{
                                    backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)',
                                    backgroundSize: '24px 24px',
                                }}>
                                    <div className="absolute inset-0 bg-gradient-to-t from-gray-50 via-transparent to-transparent" />
                                </div>

                                {/* Mock floating video panels */}
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.8, type: "spring" }}
                                    className="absolute left-[15%] top-[20%] w-48 h-32 bg-white rounded-2xl shadow-xl border border-gray-100 flex items-center justify-center rotate-[-2deg]"
                                >
                                    <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                                        <Users className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <div className="absolute bottom-3 left-4 right-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <motion.div
                                            animate={{ width: ["20%", "80%", "40%"] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                            className="h-full bg-emerald-400"
                                        />
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 1, type: "spring" }}
                                    className="absolute right-[15%] bottom-[20%] w-56 h-36 bg-gray-900 rounded-2xl shadow-xl shadow-gray-900/20 border border-gray-800 flex items-center justify-center rotate-[3deg]"
                                >
                                    <div className="absolute top-4 left-4 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center border border-gray-700">
                                        <Video className="w-5 h-5 text-gray-300" />
                                    </div>
                                    <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                                        <div className="flex-1 h-8 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center">
                                            <MessageSquare className="w-3.5 h-3.5 text-gray-400" />
                                        </div>
                                        <div className="flex-1 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                            <span className="text-xs text-emerald-400 font-medium font-mono">LIVE</span>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Center Hub */}
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.6, type: "spring", bounce: 0.4 }}
                                    className="relative w-24 h-24 rounded-3xl bg-white shadow-2xl shadow-emerald-500/20 border border-gray-100 flex items-center justify-center z-20"
                                >
                                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-500/5 to-teal-500/5 pointer-events-none" />
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-inner">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                                    </div>

                                    {/* Ripples */}
                                    <motion.div
                                        className="absolute inset-0 rounded-3xl border border-emerald-500"
                                        animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                                    />
                                    <motion.div
                                        className="absolute inset-0 rounded-3xl border border-teal-500"
                                        animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                                        transition={{ duration: 2, repeat: Infinity, delay: 1, ease: "easeOut" }}
                                    />
                                </motion.div>

                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
