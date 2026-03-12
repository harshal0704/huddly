"use client";

import React, { useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
    Radio, Map, GraduationCap, SmilePlus, ShieldCheck,
    Monitor, Smartphone, Paintbrush, Sparkles
} from "lucide-react";

const FEATURES = [
    { icon: Radio, title: "Proximity Audio", description: "Walk near anyone and hear them instantly. Step away and it fades naturally.", color: "text-emerald-600", bg: "bg-emerald-500/10", border: "group-hover:border-emerald-500/30" },
    { icon: Map, title: "Dynamic Zones", description: "Workspace, café, meeting pods — every zone has its own vibe and purpose.", color: "text-amber-600", bg: "bg-amber-500/10", border: "group-hover:border-amber-500/30" },
    { icon: GraduationCap, title: "Meeting Pods", description: "Walk into a pod and video calls start automatically with screen sharing.", color: "text-blue-600", bg: "bg-blue-500/10", border: "group-hover:border-blue-500/30" },
    { icon: SmilePlus, title: "Expressive Emotes", description: "React with emotes, set your status to Free, Focused, or In Meeting.", color: "text-rose-600", bg: "bg-rose-500/10", border: "group-hover:border-rose-500/30" },
    { icon: ShieldCheck, title: "Private Rooms", description: "Glass-walled meeting rooms where only people inside can hear each other.", color: "text-indigo-600", bg: "bg-indigo-500/10", border: "group-hover:border-indigo-500/30" },
    { icon: Monitor, title: "Instant Screen Share", description: "Share your screen or draw together on a live interactive whiteboard.", color: "text-cyan-600", bg: "bg-cyan-500/10", border: "group-hover:border-cyan-500/30" },
    { icon: Smartphone, title: "Works Everywhere", description: "Desktop, tablet, or mobile. No downloads needed — just open the link.", color: "text-violet-600", bg: "bg-violet-500/10", border: "group-hover:border-violet-500/30" },
    { icon: Paintbrush, title: "Avatar Studio", description: "Personalize your 3D avatar with unique styles, accessories and fits.", color: "text-pink-600", bg: "bg-pink-500/10", border: "group-hover:border-pink-500/30" },
];

export default function Features() {
    return (
        <section id="features" className="relative py-32 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="flex flex-col items-center text-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 bg-gray-50 mb-6"
                    >
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm font-medium text-gray-800 tracking-wide">Premium Features</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-6 tracking-tight max-w-3xl"
                    >
                        Everything you need to <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
                            feel together.
                        </span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-gray-500 font-light max-w-2xl"
                    >
                        Replace endless video links with a persistent spatial environment that brings back serendipitous moments.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {FEATURES.map((f, i) => (
                        <motion.div
                            key={f.title}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.5, delay: i * 0.1, type: "spring", bounce: 0.2 }}
                            className="group relative h-full"
                        >
                            <div className={`relative p-8 rounded-[24px] bg-white border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] transition-all duration-300 h-full flex flex-col ${f.border}`}>
                                <div className={`w-12 h-12 rounded-2xl ${f.bg} flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                                    <f.icon className={`w-6 h-6 ${f.color}`} strokeWidth={2} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3 tracking-tight">{f.title}</h3>
                                <p className="text-gray-500 leading-relaxed font-light">{f.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
