"use client";

import React from "react";
import { motion } from "framer-motion";
import { GraduationCap, Building2, Coffee, Mic2, PartyPopper } from "lucide-react";

const TEMPLATES = [
    {
        name: "Classroom",
        description: "Rows of desks, a podium stage, whiteboard, and cozy reading corner.",
        icon: GraduationCap,
        gradient: "from-blue-600 to-indigo-700",
        accentColor: "text-blue-400",
        objects: "25 desks • Podium • Whiteboard • Bookshelf",
    },
    {
        name: "Modern Office",
        description: "Open floor plan with huddle rooms, standing desks, and a kitchen area.",
        icon: Building2,
        gradient: "from-emerald-600 to-teal-700",
        accentColor: "text-emerald-400",
        objects: "40 desks • 4 Meeting Rooms • Kitchen • Lounge",
    },
    {
        name: "Pixel Café",
        description: "Cozy café vibes with coffee machines, sofas, and ambient jazz.",
        icon: Coffee,
        gradient: "from-amber-600 to-orange-700",
        accentColor: "text-amber-400",
        objects: "12 Tables • Sofas • Coffee Bar • Plants",
    },
    {
        name: "Conference Hall",
        description: "Big stage, audience seating, and breakout rooms for Q&A sessions.",
        icon: Mic2,
        gradient: "from-violet-600 to-purple-700",
        accentColor: "text-violet-400",
        objects: "100 Seats • Stage • 3 Breakout Rooms",
    },
    {
        name: "Party Island",
        description: "Tropical beach with fire pits, dance floor, arcade games, and DJ booth.",
        icon: PartyPopper,
        gradient: "from-pink-600 to-rose-700",
        accentColor: "text-pink-400",
        objects: "Dance Floor • Arcade • DJ Booth • Beach",
    },
];

export default function Templates() {
    return (
        <section id="templates" className="relative py-24 sm:py-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-4">
                        Templates
                    </span>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4">
                        Start with a beautiful{" "}
                        <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                            template
                        </span>
                    </h2>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        Pick a pre-built space and customize it — or start from scratch. Your world, your rules.
                    </p>
                </motion.div>

                {/* Templates grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {TEMPLATES.map((template, index) => (
                        <motion.div
                            key={template.name}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className={`group relative rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-500 cursor-pointer ${index === 0 ? "sm:col-span-2 lg:col-span-1" : ""}`}
                        >
                            {/* Preview area */}
                            <div className={`h-48 bg-gradient-to-br ${template.gradient} relative overflow-hidden`}>
                                {/* Grid overlay */}
                                <div className="absolute inset-0 opacity-10"
                                    style={{
                                        backgroundImage: `
                      linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)
                    `,
                                        backgroundSize: "24px 24px",
                                    }}
                                />

                                {/* Icon centered */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <template.icon className="w-16 h-16 text-white/30 group-hover:text-white/50 group-hover:scale-110 transition-all duration-500" />
                                </div>

                                {/* Floating mini objects */}
                                <motion.div
                                    className="absolute top-4 right-4 text-2xl"
                                    animate={{ y: [0, -5, 0] }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                >
                                    {template.name === "Classroom" ? "📚" : template.name === "Modern Office" ? "💻" : template.name === "Pixel Café" ? "☕" : template.name === "Conference Hall" ? "🎤" : "🎉"}
                                </motion.div>
                            </div>

                            {/* Info */}
                            <div className="p-5 bg-gray-900/80">
                                <h3 className="text-lg font-bold text-white mb-1">{template.name}</h3>
                                <p className="text-gray-400 text-sm mb-3">{template.description}</p>
                                <p className={`text-xs font-medium ${template.accentColor}`}>{template.objects}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
