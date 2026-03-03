"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CTABanner() {
    return (
        <section className="relative py-24 overflow-hidden">
            <div className="absolute inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-950/20 to-transparent" />
                <motion.div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[130px]" animate={{ x: [0, 80, 0], y: [0, -40, 0] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }} />
                <motion.div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-cyan-600/12 rounded-full blur-[130px]" animate={{ x: [0, -60, 0], y: [0, 50, 0] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} />
            </div>

            <div className="max-w-3xl mx-auto px-4 text-center">
                <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                    <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-5 leading-tight">
                        Ready to{" "}
                        <span className="bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent animate-gradient bg-[length:200%_200%]">step in</span>?
                    </h2>
                    <p className="text-gray-500 text-lg max-w-md mx-auto mb-8">
                        Create your 3D space in seconds. Free, no credit card.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <Link href="/room/demo">
                            <Button size="xl" className="gap-2 group bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 border-0 shadow-lg shadow-purple-500/20">
                                Try Free Demo
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                        <Link href="/login">
                            <Button variant="secondary" size="xl" className="border-white/10 hover:border-white/20">
                                Create Account
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
