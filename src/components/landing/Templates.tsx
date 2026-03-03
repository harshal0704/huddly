"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    GraduationCap, Building2, Coffee, Mic2, PartyPopper,
    BookOpen, Gamepad2, Trees, Clapperboard
} from "lucide-react";

const TEMPLATES = [
    { name: "Classroom", description: "Desks, podium, whiteboard & broadcast screen.", icon: GraduationCap, gradient: "from-blue-600 to-indigo-700", accent: "text-blue-400", href: "/room/demo" },
    { name: "Office", description: "Open plan with huddle rooms and lounge area.", icon: Building2, gradient: "from-emerald-600 to-teal-700", accent: "text-emerald-400", href: "/room/office" },
    { name: "Café", description: "Cozy coffee bar, round tables, warm vibes.", icon: Coffee, gradient: "from-amber-600 to-orange-700", accent: "text-amber-400", href: "/room/cafe" },
    { name: "Conference", description: "Big stage, tiered seating, triple screens.", icon: Mic2, gradient: "from-violet-600 to-purple-700", accent: "text-violet-400", href: "/room/conference" },
    { name: "Party", description: "DJ booth, LED dance floor, neon everywhere.", icon: PartyPopper, gradient: "from-pink-600 to-rose-700", accent: "text-pink-400", href: "/room/party" },
    { name: "Library", description: "Tall bookshelves, reading nooks, warm lamps.", icon: BookOpen, gradient: "from-yellow-700 to-amber-800", accent: "text-yellow-400", href: "/room/library" },
    { name: "Gaming", description: "Neon gaming desks, dual monitors, leaderboard.", icon: Gamepad2, gradient: "from-cyan-600 to-blue-700", accent: "text-cyan-400", href: "/room/gaming" },
    { name: "Rooftop", description: "Open-air terrace, fairy lights, sky views.", icon: Trees, gradient: "from-lime-600 to-green-700", accent: "text-lime-400", href: "/room/rooftop" },
    { name: "Theater", description: "Cinema recliners, massive curved screen.", icon: Clapperboard, gradient: "from-red-700 to-rose-800", accent: "text-red-400", href: "/room/theater" },
];

export default function Templates() {
    return (
        <section id="templates" className="relative py-24 sm:py-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-14"
                >
                    <span className="inline-block px-3 py-1 rounded-full bg-purple-500/8 border border-purple-500/15 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-4">
                        9 Rooms
                    </span>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4">
                        Pick your{" "}
                        <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">world</span>
                    </h2>
                    <p className="text-gray-500 text-lg max-w-lg mx-auto">
                        Click any room to explore it live in 3D.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {TEMPLATES.map((t, i) => (
                        <motion.div
                            key={t.name}
                            initial={{ opacity: 0, y: 30, scale: 0.95 }}
                            whileInView={{ opacity: 1, y: 0, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.05, type: "spring", stiffness: 200, damping: 20 }}
                        >
                            <Link href={t.href} className="block group">
                                <div className="relative rounded-2xl overflow-hidden border border-white/6 hover:border-white/18 transition-all duration-400 hover:shadow-xl hover:shadow-purple-500/5 hover:-translate-y-1">
                                    <div className={`h-36 bg-gradient-to-br ${t.gradient} relative overflow-hidden`}>
                                        <div className="absolute inset-0 opacity-8" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <t.icon className="w-14 h-14 text-white/25 group-hover:text-white/50 group-hover:scale-125 transition-all duration-500" />
                                        </div>
                                        <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-sm text-white/0 group-hover:text-white/90 text-xs font-medium transition-all duration-300">
                                            Explore →
                                        </div>
                                    </div>
                                    <div className="p-4 bg-[#0c0816]">
                                        <h3 className="text-base font-bold text-white mb-0.5 group-hover:text-cyan-300 transition-colors">{t.name}</h3>
                                        <p className="text-gray-500 text-sm">{t.description}</p>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
