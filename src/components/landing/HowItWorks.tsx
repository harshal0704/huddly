"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { MousePointerClick, Users, Sparkles, Building2 } from "lucide-react";

const STEPS = [
    {
        icon: Building2,
        number: "01",
        title: "Create your HQ",
        description: "Choose a template and spin up your company's virtual office in less than 60 seconds.",
        color: "text-emerald-600",
        bg: "bg-emerald-500/10",
        lineColor: "#10b981"
    },
    {
        icon: Users,
        number: "02",
        title: "Invite the team",
        description: "Share the link. No downloads, no calendar invites. They just click and drop in.",
        color: "text-amber-600",
        bg: "bg-amber-500/10",
        lineColor: "#f59e0b"
    },
    {
        icon: Sparkles,
        number: "03",
        title: "Work spatially",
        description: "Walk up to a desk to chat, grab a meeting pod for privacy, or broadcast to the room.",
        color: "text-teal-600",
        bg: "bg-teal-500/10",
        lineColor: "#14b8a6"
    },
];

export default function HowItWorks() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start 0.8", "end 0.5"] });

    // Path drawing animation
    const pathLength = useTransform(scrollYProgress, [0, 0.8], [0, 1]);

    // Step opacities
    const step1 = useTransform(scrollYProgress, [0, 0.2], [0.3, 1]);
    const step2 = useTransform(scrollYProgress, [0.3, 0.5], [0.3, 1]);
    const step3 = useTransform(scrollYProgress, [0.6, 0.8], [0.3, 1]);
    const stepOpacities = [step1, step2, step3];

    return (
        <section id="how-it-works" className="relative py-32 bg-gray-50 border-y border-gray-100 overflow-hidden" ref={sectionRef}>
            {/* Background elements */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-50" />
                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-gray-50 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-50 to-transparent" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                    >
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">
                            As easy as a <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">tap on the shoulder</span>
                        </h2>
                        <p className="text-xl text-gray-500 font-light max-w-2xl mx-auto">
                            No scheduling. No meeting links. Just presence.
                        </p>
                    </motion.div>
                </div>

                <div className="relative max-w-5xl mx-auto">
                    {/* Connecting SVG Line (Desktop) */}
                    <svg className="hidden md:block absolute top-12 left-0 w-full h-24 z-0 pointer-events-none" preserveAspectRatio="none">
                        <motion.path
                            d="M 16.66% 0 C 33.33% 50, 50% -50, 83.33% 0"
                            fill="none"
                            stroke="url(#lineGrad)"
                            strokeWidth="3"
                            strokeDasharray="6 6"
                            className="drop-shadow-sm"
                            style={{ pathLength }}
                        />
                        <defs>
                            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor={STEPS[0].lineColor} stopOpacity="0.5" />
                                <stop offset="50%" stopColor={STEPS[1].lineColor} stopOpacity="0.5" />
                                <stop offset="100%" stopColor={STEPS[2].lineColor} stopOpacity="0.5" />
                            </linearGradient>
                        </defs>
                    </svg>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
                        {STEPS.map((step, i) => (
                            <motion.div
                                key={step.number}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.6, delay: i * 0.2 }}
                                className="relative text-center"
                            >
                                <motion.div style={{ opacity: stepOpacities[i] }} className="flex flex-col items-center">
                                    <div className="relative mb-8 group">
                                        <div className={`absolute -inset-4 rounded-full ${step.bg} opacity-50 blur-xl group-hover:scale-110 transition-transform duration-500`} />
                                        <div className={`relative w-24 h-24 rounded-2xl bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.06)] flex items-center justify-center transform group-hover:-translate-y-2 transition-transform duration-300`}>
                                            <div className={`absolute top-2 left-2 text-[10px] font-bold text-gray-300`}>{step.number}</div>
                                            <step.icon className={`w-10 h-10 ${step.color}`} strokeWidth={1.5} />
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">{step.title}</h3>
                                    <p className="text-gray-500 leading-relaxed font-light">{step.description}</p>
                                </motion.div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
