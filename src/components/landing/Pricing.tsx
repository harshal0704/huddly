"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check, Zap, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const PLANS = [
    {
        name: "Free",
        price: "$0",
        period: "forever",
        description: "Perfect for small teams getting started",
        icon: Zap,
        gradient: "from-gray-600 to-gray-700",
        borderColor: "border-white/10",
        features: [
            "Up to 8 people per space",
            "1 custom space",
            "Basic map editor",
            "Proximity video & audio",
            "Global chat",
            "Mobile friendly",
        ],
        cta: "Get Started Free",
        ctaVariant: "secondary" as const,
        popular: false,
    },
    {
        name: "Pro",
        price: "$9",
        period: "per user/month",
        description: "For growing teams who need more power",
        icon: Crown,
        gradient: "from-violet-600 to-indigo-600",
        borderColor: "border-violet-500/30",
        features: [
            "Unlimited users per space",
            "Unlimited spaces",
            "Advanced map editor + 200+ objects",
            "Private huddle zones",
            "Screen sharing",
            "Collaborative whiteboard",
            "Recording & playback",
            "AI meeting summaries",
            "Custom domain",
            "Priority support",
        ],
        cta: "Start Pro Trial",
        ctaVariant: "default" as const,
        popular: true,
    },
    {
        name: "Enterprise",
        price: "Custom",
        period: "let's talk",
        description: "For organizations with special needs",
        icon: Crown,
        gradient: "from-emerald-600 to-teal-600",
        borderColor: "border-emerald-500/30",
        features: [
            "Everything in Pro",
            "SSO / SAML",
            "99.99% SLA",
            "Dedicated infrastructure",
            "Custom integrations",
            "Admin dashboard & analytics",
            "Dedicated account manager",
            "On-premise option",
        ],
        cta: "Contact Sales",
        ctaVariant: "outline" as const,
        popular: false,
    },
];

export default function Pricing() {
    return (
        <section id="pricing" className="relative py-24 sm:py-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <span className="inline-block px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold uppercase tracking-wider mb-4">
                        Pricing
                    </span>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4">
                        Simple,{" "}
                        <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                            transparent
                        </span>{" "}
                        pricing
                    </h2>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        Free forever for small teams. Scale up when you&apos;re ready.
                    </p>
                </motion.div>

                {/* Pricing cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                    {PLANS.map((plan, index) => (
                        <motion.div
                            key={plan.name}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className={`relative rounded-2xl border ${plan.borderColor} ${plan.popular
                                    ? "bg-gradient-to-b from-violet-950/50 to-gray-900/50 scale-[1.03] shadow-2xl shadow-violet-500/10"
                                    : "bg-white/[0.02]"
                                } p-7 hover:border-white/20 transition-all duration-300`}
                        >
                            {/* Popular badge */}
                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold shadow-lg">
                                    Most Popular
                                </div>
                            )}

                            {/* Header */}
                            <div className="mb-6">
                                <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                                <p className="text-gray-500 text-sm">{plan.description}</p>
                            </div>

                            {/* Price */}
                            <div className="mb-6">
                                <span className="text-4xl font-black text-white">{plan.price}</span>
                                <span className="text-gray-500 text-sm ml-2">/ {plan.period}</span>
                            </div>

                            {/* CTA */}
                            <Link href="/login" className="block mb-6">
                                <Button variant={plan.ctaVariant} className="w-full">
                                    {plan.cta}
                                </Button>
                            </Link>

                            {/* Features */}
                            <ul className="space-y-3">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-start gap-3 text-sm">
                                        <Check className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                                        <span className="text-gray-300">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
