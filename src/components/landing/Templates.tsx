"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    Building2, Coffee, Mic2,
    BookOpen, Gamepad2, Trees
} from "lucide-react";

const TEMPLATES = [
    { name: "Lobby", description: "Reception desk, welcome sign, avatar kiosk.", icon: Building2, gradient: "from-emerald-600 to-teal-700", accent: "text-emerald-400", href: "/room/office" },
    { name: "Workspace", description: "Hot desks in pods, standing desks, monitor stands.", icon: Building2, gradient: "from-amber-600 to-orange-700", accent: "text-amber-400", href: "/room/office" },
    { name: "Meeting Pods", description: "Glass-walled rooms with auto video calls.", icon: Mic2, gradient: "from-teal-600 to-emerald-700", accent: "text-teal-400", href: "/room/office" },
    { name: "Café", description: "Cozy coffee bar, bistro tables, warm vibes.", icon: Coffee, gradient: "from-amber-700 to-yellow-800", accent: "text-amber-400", href: "/room/office" },
    { name: "Stage", description: "Podium, big screen, auditorium seating.", icon: Mic2, gradient: "from-emerald-700 to-green-800", accent: "text-emerald-400", href: "/room/office" },
    { name: "Library", description: "Tall bookshelves, reading nooks, warm lamps.", icon: BookOpen, gradient: "from-yellow-700 to-amber-800", accent: "text-yellow-400", href: "/room/office" },
    { name: "Gaming", description: "Gaming desks, neon accents, arcade cabinet.", icon: Gamepad2, gradient: "from-teal-500 to-cyan-600", accent: "text-teal-400", href: "/room/office" },
    { name: "Rooftop", description: "Open-air terrace, fairy lights, sky views.", icon: Trees, gradient: "from-green-600 to-emerald-700", accent: "text-green-400", href: "/room/office" },
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
                    <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-semibold uppercase tracking-wider mb-4">
                        Office Zones
                    </span>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-4">
                        Explore the{" "}
                        <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">office</span>
                    </h2>
                    <p className="text-gray-500 text-lg max-w-lg mx-auto">
                        Walk through every zone in one 3D office.
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
                                <div className="relative rounded-2xl overflow-hidden border border-black/5 hover:border-black/15 transition-all duration-400 hover:shadow-xl hover:shadow-black/5 hover:-translate-y-1 bg-white">
                                    <div className={`h-36 bg-gradient-to-br ${t.gradient} relative overflow-hidden`}>
                                        <div className="absolute inset-0 opacity-8" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <t.icon className="w-14 h-14 text-white/25 group-hover:text-white/50 group-hover:scale-125 transition-all duration-500" />
                                        </div>
                                        <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-sm text-white/0 group-hover:text-white/90 text-xs font-medium transition-all duration-300">
                                            Explore →
                                        </div>
                                    </div>
                                    <div className="p-4 bg-white">
                                        <h3 className="text-base font-bold text-gray-900 mb-0.5 group-hover:text-emerald-700 transition-colors">{t.name}</h3>
                                        <p className="text-gray-500 text-sm">{t.description}</p>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section >
    );
}
