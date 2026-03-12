"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    Building2, Coffee, Mic2,
    BookOpen, Gamepad2, Trees, ArrowRight
} from "lucide-react";

const TEMPLATES = [
    { name: "Lobby", description: "Reception desk, welcome sign, avatar kiosk.", icon: Building2, gradient: "from-emerald-500 to-teal-600", color: "text-emerald-700", bg: "bg-emerald-50", href: "/room/office" },
    { name: "Workspace", description: "Hot desks in pods, standing desks, monitor stands.", icon: Building2, gradient: "from-amber-500 to-orange-600", color: "text-amber-700", bg: "bg-amber-50", href: "/room/office" },
    { name: "Meeting Pods", description: "Glass-walled rooms with auto video calls.", icon: Mic2, gradient: "from-blue-500 to-indigo-600", color: "text-blue-700", bg: "bg-blue-50", href: "/room/office" },
    { name: "Café", description: "Cozy coffee bar, bistro tables, warm vibes.", icon: Coffee, gradient: "from-rose-400 to-red-500", color: "text-rose-700", bg: "bg-rose-50", href: "/room/office" },
    { name: "Stage", description: "Podium, big screen, auditorium seating.", icon: Mic2, gradient: "from-indigo-500 to-violet-600", color: "text-indigo-700", bg: "bg-indigo-50", href: "/room/office" },
    { name: "Library", description: "Tall bookshelves, reading nooks, warm lamps.", icon: BookOpen, gradient: "from-yellow-400 to-amber-500", color: "text-yellow-700", bg: "bg-yellow-50", href: "/room/office" },
    { name: "Gaming", description: "Gaming desks, neon accents, arcade cabinet.", icon: Gamepad2, gradient: "from-cyan-400 to-blue-500", color: "text-cyan-700", bg: "bg-cyan-50", href: "/room/office" },
    { name: "Rooftop", description: "Open-air terrace, fairy lights, sky views.", icon: Trees, gradient: "from-lime-400 to-green-500", color: "text-lime-700", bg: "bg-lime-50", href: "/room/office" },
];

export default function Templates() {
    return (
        <section id="templates" className="relative py-32 bg-white">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-50/50 pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        className="max-w-2xl"
                    >
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">
                            Explore the{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
                                office zones
                            </span>
                        </h2>
                        <p className="text-xl text-gray-500 font-light leading-relaxed">
                            Walk seamlessly between different areas in one unified 3D space, just like a real building.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                    >
                        <Link href="/dashboard" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-900 text-white font-medium hover:bg-emerald-600 transition-colors group shadow-lg shadow-gray-900/10">
                            Create your own
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {TEMPLATES.map((t, i) => (
                        <motion.div
                            key={t.name}
                            initial={{ opacity: 0, y: 30, scale: 0.95 }}
                            whileInView={{ opacity: 1, y: 0, scale: 1 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.5, delay: i * 0.05, type: "spring", bounce: 0.3 }}
                        >
                            <Link href={t.href} className="block group h-full">
                                <div className="relative rounded-[24px] overflow-hidden border border-gray-100 bg-white hover:border-emerald-500/30 transition-all duration-400 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 h-full flex flex-col">
                                    <div className={`h-40 bg-gradient-to-br ${t.gradient} relative overflow-hidden flex-shrink-0`}>
                                        <div className="absolute inset-0 opacity-10 mix-blend-overlay" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
                                        <div className="absolute inset-0 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-700 ease-out">
                                            <t.icon className="w-16 h-16 text-white opacity-80 drop-shadow-md" strokeWidth={1.5} />
                                        </div>
                                    </div>
                                    <div className="p-6 flex-1 flex flex-col">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-600 transition-colors tracking-tight">{t.name}</h3>
                                            <div className={`w-8 h-8 rounded-full ${t.bg} flex items-center justify-center opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300`}>
                                                <ArrowRight className={`w-4 h-4 ${t.color}`} />
                                            </div>
                                        </div>
                                        <p className="text-gray-500 text-sm font-light leading-relaxed flex-1">{t.description}</p>
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
