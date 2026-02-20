"use client";

import React from "react";
import { motion } from "framer-motion";
import {
    Radio, Map, GraduationCap, SmilePlus, ShieldCheck,
    Monitor, Smartphone, Paintbrush
} from "lucide-react";

const FEATURES = [
    {
        icon: Radio,
        title: "Proximity Magic",
        description: "Walk up to anyone — video & spatial audio auto-activates. Move away and it fades out naturally.",
        gradient: "from-violet-500 to-purple-600",
        shadowColor: "shadow-violet-500/20",
    },
    {
        icon: Map,
        title: "Infinite Custom Maps",
        description: "200+ drag-and-drop objects. Build your dream office, classroom, or party island in minutes.",
        gradient: "from-blue-500 to-cyan-600",
        shadowColor: "shadow-blue-500/20",
    },
    {
        icon: GraduationCap,
        title: "Classroom Mode",
        description: "Stage tile with auto-broadcast. Seat snapping for audience. Perfect for lectures & workshops.",
        gradient: "from-emerald-500 to-teal-600",
        shadowColor: "shadow-emerald-500/20",
    },
    {
        icon: SmilePlus,
        title: "Emotes & Status",
        description: "Wave, react, set your status to Free, Focused, or In Meeting. Express yourself in pixels.",
        gradient: "from-amber-500 to-orange-600",
        shadowColor: "shadow-amber-500/20",
    },
    {
        icon: ShieldCheck,
        title: "Private Huddle Zones",
        description: "Create private zones where only people inside can hear each other. Great for breakout groups.",
        gradient: "from-pink-500 to-rose-600",
        shadowColor: "shadow-pink-500/20",
    },
    {
        icon: Monitor,
        title: "Screen Share + Whiteboard",
        description: "Share your screen or collaborate on a shared whiteboard — all synced in real-time.",
        gradient: "from-indigo-500 to-blue-600",
        shadowColor: "shadow-indigo-500/20",
    },
    {
        icon: Smartphone,
        title: "Mobile Friendly",
        description: "Touch controls, virtual joystick, and pinch zoom. Your virtual world fits in your pocket.",
        gradient: "from-teal-500 to-emerald-600",
        shadowColor: "shadow-teal-500/20",
    },
    {
        icon: Paintbrush,
        title: "Beautiful Themes",
        description: "Dark, Light, Retro-pixel — choose your vibe. Every theme is crafted with love and detail.",
        gradient: "from-fuchsia-500 to-pink-600",
        shadowColor: "shadow-fuchsia-500/20",
    },
];

export default function Features() {
    return (
        <section id="features" className="relative py-24 sm:py-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <span className="inline-block px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold uppercase tracking-wider mb-4">
                        Features
                    </span>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4">
                        Everything you need to{" "}
                        <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                            feel together
                        </span>
                    </h2>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        Built for teams who want more than a video call — but less hassle than a physical office.
                    </p>
                </motion.div>

                {/* Features grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {FEATURES.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.08 }}
                            className="group relative"
                        >
                            <div className={`relative p-6 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm hover:bg-white/[0.06] hover:border-white/10 transition-all duration-500 h-full ${feature.shadowColor} hover:shadow-xl`}>
                                {/* Icon */}
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                    <feature.icon className="w-6 h-6 text-white" />
                                </div>

                                {/* Content */}
                                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-violet-300 transition-colors">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    {feature.description}
                                </p>

                                {/* Hover glow */}
                                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
