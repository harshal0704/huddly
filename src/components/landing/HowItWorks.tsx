"use client";

import React from "react";
import { motion } from "framer-motion";
import { MousePointerClick, Users, Sparkles } from "lucide-react";

const STEPS = [
    {
        icon: MousePointerClick,
        number: "01",
        title: "Create your space",
        description: "Choose a template or start blank. Drop in desks, whiteboards, sofas — make it yours in minutes.",
        gradient: "from-violet-500 to-purple-600",
    },
    {
        icon: Users,
        number: "02",
        title: "Invite your crew",
        description: "Share a single link. No downloads, no installs. People join instantly in their browser.",
        gradient: "from-blue-500 to-indigo-600",
    },
    {
        icon: Sparkles,
        number: "03",
        title: "Walk up & talk",
        description: "Move your avatar near someone — video and audio start automatically. Move away, and it stops. Magic.",
        gradient: "from-emerald-500 to-teal-600",
    },
];

export default function HowItWorks() {
    return (
        <section id="how-it-works" className="relative py-24 sm:py-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <span className="inline-block px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-4">
                        How it works
                    </span>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4">
                        Three steps to{" "}
                        <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                            togetherness
                        </span>
                    </h2>
                </motion.div>

                {/* Steps */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                    {/* Connecting line (desktop) */}
                    <div className="hidden md:block absolute top-20 left-[20%] right-[20%] h-px bg-gradient-to-r from-violet-500/30 via-blue-500/30 to-emerald-500/30" />

                    {STEPS.map((step, index) => (
                        <motion.div
                            key={step.number}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.15 }}
                            className="relative text-center"
                        >
                            {/* Step number */}
                            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center mx-auto mb-6 shadow-xl relative z-10`}>
                                <step.icon className="w-7 h-7 text-white" />
                            </div>

                            {/* Number label */}
                            <span className="text-5xl font-black text-white/5 absolute -top-2 left-1/2 -translate-x-1/2">
                                {step.number}
                            </span>

                            <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                            <p className="text-gray-400 leading-relaxed max-w-xs mx-auto">{step.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
