"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

interface ContentPageLayoutProps {
    title: string;
    subtitle?: string;
    badge?: string;
    children: React.ReactNode;
    lastUpdated?: string;
}

export default function ContentPageLayout({
    title,
    subtitle,
    badge,
    children,
    lastUpdated,
}: ContentPageLayoutProps) {
    return (
        <div className="min-h-screen bg-[#030014]">
            {/* Top nav */}
            <nav className="sticky top-0 z-50 bg-[#030014]/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm">Back to Home</span>
                    </Link>
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                            <span className="text-xs">🏠</span>
                        </div>
                        <span className="text-sm font-bold text-white">Huddly</span>
                    </Link>
                </div>
            </nav>

            {/* Hero section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto px-4 sm:px-6 pt-16 pb-8"
            >
                {badge && (
                    <span className="inline-block px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold uppercase tracking-wider mb-4">
                        {badge}
                    </span>
                )}
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-3">
                    {title}
                </h1>
                {subtitle && (
                    <p className="text-lg text-gray-400 max-w-2xl">{subtitle}</p>
                )}
                {lastUpdated && (
                    <p className="text-xs text-gray-600 mt-4">Last updated: {lastUpdated}</p>
                )}
            </motion.div>

            {/* Content */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="max-w-4xl mx-auto px-4 sm:px-6 pb-24"
            >
                <div className="prose prose-invert prose-violet max-w-none
                    prose-headings:font-bold prose-headings:text-white
                    prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4 prose-h2:pb-2 prose-h2:border-b prose-h2:border-white/10
                    prose-h3:text-lg prose-h3:mt-8 prose-h3:mb-3
                    prose-p:text-gray-400 prose-p:leading-relaxed
                    prose-a:text-violet-400 prose-a:no-underline hover:prose-a:underline
                    prose-strong:text-white prose-strong:font-semibold
                    prose-code:text-violet-300 prose-code:bg-violet-500/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
                    prose-pre:bg-gray-900/50 prose-pre:border prose-pre:border-white/5 prose-pre:rounded-xl
                    prose-li:text-gray-400
                    prose-table:border-collapse
                    prose-th:text-left prose-th:text-white prose-th:font-semibold prose-th:border-b prose-th:border-white/10 prose-th:py-3 prose-th:px-4
                    prose-td:text-gray-400 prose-td:border-b prose-td:border-white/5 prose-td:py-3 prose-td:px-4
                ">
                    {children}
                </div>
            </motion.div>

            {/* Footer */}
            <footer className="border-t border-white/5 py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center text-gray-600 text-sm">
                    © {new Date().getFullYear()} Huddly. All rights reserved.
                </div>
            </footer>
        </div>
    );
}
