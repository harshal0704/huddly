"use client";

import React, { useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
    Radio, Map, GraduationCap, SmilePlus, ShieldCheck,
    Monitor, Smartphone, Paintbrush
} from "lucide-react";

const FEATURES = [
    { icon: Radio, title: "Proximity Chat", description: "Walk near anyone and video & spatial audio start instantly. Step away and it fades naturally.", gradient: "from-purple-500 to-violet-600" },
    { icon: Map, title: "Custom Worlds", description: "Choose from 9 themed rooms or build your own. Desks, sofas, plants — make it yours.", gradient: "from-cyan-500 to-teal-600" },
    { icon: GraduationCap, title: "Classroom Mode", description: "Stage with broadcast screen, audience seating, and whiteboard. Perfect for lectures.", gradient: "from-blue-500 to-indigo-600" },
    { icon: SmilePlus, title: "Emotes & Status", description: "React with emotes, set your status to Free, Focused, or In Meeting.", gradient: "from-amber-500 to-orange-600" },
    { icon: ShieldCheck, title: "Private Zones", description: "Create huddle rooms where only people inside can hear each other.", gradient: "from-rose-500 to-pink-600" },
    { icon: Monitor, title: "Screen & Whiteboard", description: "Share your screen or draw together on a live shared whiteboard.", gradient: "from-indigo-500 to-purple-600" },
    { icon: Smartphone, title: "Works Everywhere", description: "Desktop, tablet, or phone. No downloads needed — just open the link.", gradient: "from-teal-500 to-cyan-600" },
    { icon: Paintbrush, title: "Beautiful Themes", description: "Every room has its own atmosphere — from cozy cafes to neon gaming lounges.", gradient: "from-fuchsia-500 to-purple-600" },
];

export default function Features() {
    const gridRef = useRef<HTMLDivElement>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!gridRef.current) return;
        const rect = gridRef.current.getBoundingClientRect();
        setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }, []);

    return (
        <section id="features" className="relative py-24 sm:py-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <span className="inline-block px-3 py-1 rounded-full bg-cyan-500/8 border border-cyan-500/15 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-4">
                        Features
                    </span>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4">
                        Everything to{" "}
                        <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">feel together</span>
                    </h2>
                    <p className="text-gray-500 text-lg max-w-lg mx-auto">
                        More than a video call. Less hassle than an office.
                    </p>
                </motion.div>

                <div
                    ref={gridRef}
                    className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
                    onMouseMove={handleMouseMove}
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                >
                    {isHovering && (
                        <div
                            className="pointer-events-none absolute -inset-px z-10 transition-opacity duration-300 rounded-2xl"
                            style={{ background: `radial-gradient(500px circle at ${mousePos.x}px ${mousePos.y}px, rgba(124, 58, 237, 0.04), rgba(6, 182, 212, 0.02), transparent 60%)` }}
                        />
                    )}

                    {FEATURES.map((f, i) => (
                        <motion.div
                            key={f.title}
                            initial={{ opacity: 0, y: 30, scale: 0.95 }}
                            whileInView={{ opacity: 1, y: 0, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.06, type: "spring", stiffness: 200, damping: 20 }}
                            className="group relative"
                        >
                            <div className="relative p-5 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/12 transition-all duration-400 h-full">
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                                    <f.icon className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-base font-bold text-white mb-1.5 group-hover:text-cyan-300 transition-colors">{f.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">{f.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
