"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
    { name: "Features", href: "#features" },
    { name: "Templates", href: "#templates" },
    { name: "Pricing", href: "#pricing" },
    { name: "How it Works", href: "#how-it-works" },
];

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
                    ? "bg-gray-950/80 backdrop-blur-xl border-b border-white/10 shadow-2xl"
                    : "bg-transparent"
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 sm:h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30 group-hover:shadow-violet-500/50 transition-shadow">
                            <span className="text-lg">🏠</span>
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-violet-300 to-indigo-300 bg-clip-text text-transparent">
                            Huddly
                        </span>
                    </Link>

                    {/* Desktop nav links */}
                    <div className="hidden md:flex items-center gap-1">
                        {NAV_LINKS.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                className="px-4 py-2 text-sm text-gray-300 hover:text-white rounded-lg hover:bg-white/5 transition-all duration-200"
                            >
                                {link.name}
                            </a>
                        ))}
                    </div>

                    {/* Desktop actions */}
                    <div className="hidden md:flex items-center gap-3">
                        <Link href="/room/demo">
                            <Button variant="ghost" size="sm" className="gap-2">
                                <Sparkles className="w-4 h-4" />
                                Enter Demo
                            </Button>
                        </Link>
                        <Link href="/login">
                            <Button variant="secondary" size="sm">
                                Log in
                            </Button>
                        </Link>
                        <Link href="/login?signup=true">
                            <Button size="sm">Sign up free</Button>
                        </Link>
                    </div>

                    {/* Mobile hamburger */}
                    <button
                        className="md:hidden p-2 text-gray-300 hover:text-white"
                        onClick={() => setMobileOpen(!mobileOpen)}
                    >
                        {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-gray-950/95 backdrop-blur-xl border-b border-white/10"
                    >
                        <div className="px-4 py-4 space-y-2">
                            {NAV_LINKS.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    className="block px-4 py-3 text-gray-300 hover:text-white rounded-xl hover:bg-white/5 transition-all"
                                    onClick={() => setMobileOpen(false)}
                                >
                                    {link.name}
                                </a>
                            ))}
                            <div className="flex flex-col gap-2 pt-4 border-t border-white/10">
                                <Link href="/room/demo" onClick={() => setMobileOpen(false)}>
                                    <Button variant="ghost" className="w-full justify-start gap-2">
                                        <Sparkles className="w-4 h-4" />
                                        Enter Demo
                                    </Button>
                                </Link>
                                <Link href="/login" onClick={() => setMobileOpen(false)}>
                                    <Button variant="secondary" className="w-full">Log in</Button>
                                </Link>
                                <Link href="/login?signup=true" onClick={() => setMobileOpen(false)}>
                                    <Button className="w-full">Sign up free</Button>
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
}
