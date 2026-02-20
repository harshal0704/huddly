"use client";

import React from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

const TESTIMONIALS = [
    {
        name: "Sarah Chen",
        role: "Engineering Lead, Figma",
        avatar: "SC",
        avatarColor: "from-violet-400 to-purple-500",
        text: "Huddly replaced our daily standups with something way more organic. People just walk up to each other — it feels like a real office, but better.",
        stars: 5,
    },
    {
        name: "Marcus Johnson",
        role: "CS Professor, MIT",
        avatar: "MJ",
        avatarColor: "from-blue-400 to-indigo-500",
        text: "My students actually look forward to virtual lectures now. The proximity audio makes group work feel natural, and the classroom mode is perfect for presentations.",
        stars: 5,
    },
    {
        name: "Priya Patel",
        role: "CEO, RemoteFirst.io",
        avatar: "PP",
        avatarColor: "from-emerald-400 to-teal-500",
        text: "We moved our entire company of 40 people to Huddly. Onboarding new hires is 10x better — they just walk around and meet everyone naturally.",
        stars: 5,
    },
    {
        name: "Tom Bradley",
        role: "Community Manager",
        avatar: "TB",
        avatarColor: "from-amber-400 to-orange-500",
        text: "Hosted a 200-person virtual conference on Huddly. The breakout zones and stage mode made it feel like a real event. People were amazed.",
        stars: 5,
    },
];

export default function Testimonials() {
    return (
        <section className="relative py-24 sm:py-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <span className="inline-block px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-4">
                        Loved by teams
                    </span>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4">
                        Don&apos;t take our word for it
                    </h2>
                </motion.div>

                {/* Testimonial grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {TESTIMONIALS.map((t, index) => (
                        <motion.div
                            key={t.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm hover:bg-white/[0.05] transition-all duration-300"
                        >
                            {/* Stars */}
                            <div className="flex gap-1 mb-4">
                                {[...Array(t.stars)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                                ))}
                            </div>

                            {/* Quote */}
                            <p className="text-gray-300 leading-relaxed mb-6">&ldquo;{t.text}&rdquo;</p>

                            {/* Author */}
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.avatarColor} flex items-center justify-center text-white text-sm font-bold`}>
                                    {t.avatar}
                                </div>
                                <div>
                                    <p className="text-white font-semibold text-sm">{t.name}</p>
                                    <p className="text-gray-500 text-xs">{t.role}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
