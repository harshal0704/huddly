"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const NAV_LINKS = [
    { name: "Features", href: "#features" },
    { name: "Rooms", href: "#templates" },
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
                ? "bg-[#050208]/85 backdrop-blur-2xl border-b border-white/8 shadow-2xl shadow-purple-950/20"
                : "bg-transparent"
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 sm:h-18">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center shadow-lg shadow-purple-500/25 group-hover:shadow-purple-500/40 transition-shadow overflow-hidden">
                            <Image src="/header-logo.png" alt="Huddly" width={36} height={36} className="object-cover" />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-purple-300 to-cyan-300 bg-clip-text text-transparent">
                            Huddly
                        </span>
                    </Link>

                    {/* Desktop nav */}
                    <div className="hidden md:flex items-center gap-1">
                        {NAV_LINKS.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                className="px-4 py-2 text-sm text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-all duration-200"
                            >
                                {link.name}
                            </a>
                        ))}
                    </div>

                    {/* Desktop actions */}
                    <div className="hidden md:flex items-center gap-3">
                        <Link href="/room/demo">
                            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                                Try Demo
                            </Button>
                        </Link>
                        <Link href="/login">
                            <Button size="sm" className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 border-0 shadow-md shadow-purple-500/15">
                                Get Started
                            </Button>
                        </Link>
                    </div>

                    {/* Mobile hamburger */}
                    <button
                        className="md:hidden p-2 text-gray-400 hover:text-white"
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
                        className="md:hidden bg-[#050208]/95 backdrop-blur-2xl border-b border-white/8"
                    >
                        <div className="px-4 py-4 space-y-2">
                            {NAV_LINKS.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    className="block px-4 py-3 text-gray-400 hover:text-white rounded-xl hover:bg-white/5 transition-all"
                                    onClick={() => setMobileOpen(false)}
                                >
                                    {link.name}
                                </a>
                            ))}
                            <div className="flex flex-col gap-2 pt-3 border-t border-white/8">
                                <Link href="/room/demo" onClick={() => setMobileOpen(false)}>
                                    <Button variant="ghost" className="w-full justify-start">Try Demo</Button>
                                </Link>
                                <Link href="/login" onClick={() => setMobileOpen(false)}>
                                    <Button className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 border-0">Get Started</Button>
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
}
