"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { MousePointerClick, Users, Sparkles } from "lucide-react";

const STEPS = [
    { icon: MousePointerClick, number: "01", title: "Create your space", description: "Pick a template or start blank. Drop in furniture — make it yours.", gradient: "from-purple-500 to-violet-600", color: "#7c3aed" },
    { icon: Users, number: "02", title: "Share the link", description: "No downloads, no installs. People join instantly in their browser.", gradient: "from-cyan-500 to-teal-600", color: "#06b6d4" },
    { icon: Sparkles, number: "03", title: "Walk up & talk", description: "Move near someone — video and audio start. Walk away, it stops.", gradient: "from-blue-500 to-indigo-600", color: "#3b82f6" },
];

export default function HowItWorks() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start 0.9", "end 0.5"] });
    const pathLength = useTransform(scrollYProgress, [0, 1], [0, 1]);
    const step1 = useTransform(scrollYProgress, [0, 0.3], [0.3, 1]);
    const step2 = useTransform(scrollYProgress, [0.25, 0.6], [0.3, 1]);
    const step3 = useTransform(scrollYProgress, [0.5, 0.85], [0.3, 1]);
    const stepOpacities = [step1, step2, step3];

    return (
        <section id="how-it-works" className="relative py-24 sm:py-32" ref={sectionRef}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-14"
                >
                    <span className="inline-block px-3 py-1 rounded-full bg-blue-500/8 border border-blue-500/15 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-4">
                        How it works
                    </span>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4">
                        Three steps to{" "}
                        <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">togetherness</span>
                    </h2>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                    <svg className="hidden md:block absolute top-16 left-[15%] h-4 z-0" viewBox="0 0 700 20" preserveAspectRatio="none" style={{ width: "70%" }}>
                        <motion.path d="M0,10 C175,10 175,10 350,10 C525,10 525,10 700,10" fill="none" strokeWidth="2" stroke="url(#pg)" strokeDasharray="8 6" style={{ pathLength }} />
                        <defs><linearGradient id="pg" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#7c3aed" /><stop offset="50%" stopColor="#06b6d4" /><stop offset="100%" stopColor="#3b82f6" /></linearGradient></defs>
                    </svg>

                    {STEPS.map((step, i) => (
                        <motion.div key={step.number} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} className="relative text-center z-10">
                            <motion.div style={{ opacity: stepOpacities[i] }}>
                                <div className="relative w-16 h-16 mx-auto mb-5">
                                    <motion.div className="absolute inset-0 rounded-2xl" style={{ background: `radial-gradient(circle, ${step.color}33 0%, transparent 70%)` }} animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }} transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }} />
                                    <div className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center mx-auto shadow-xl`}>
                                        <step.icon className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                                <p className="text-gray-500 leading-relaxed max-w-xs mx-auto text-sm">{step.description}</p>
                            </motion.div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
