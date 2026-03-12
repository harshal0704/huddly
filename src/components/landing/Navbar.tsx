"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs";

const NAV_LINKS = [
    { name: "Features", href: "#features" },
    { name: "Zones", href: "#templates" },
    { name: "How it Works", href: "#how-it-works" },
];

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [activeLink, setActiveLink] = useState("");

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
                ? "bg-white/90 backdrop-blur-2xl border-b border-black/5 shadow-lg shadow-black/5"
                : "bg-transparent"
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 sm:h-18">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-700 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:shadow-emerald-500/40 transition-shadow overflow-hidden">
                            <Image src="/header-logo.png" alt="Huddly" width={36} height={36} className="object-cover" />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent">
                            Huddly
                        </span>
                    </Link>

                    {/* Desktop nav */}
                    <div className="hidden md:flex items-center gap-1">
                        {NAV_LINKS.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                className="relative px-4 py-2 text-sm text-gray-600 hover:text-gray-900 rounded-lg hover:bg-black/5 transition-all duration-200"
                                onMouseEnter={() => setActiveLink(link.name)}
                                onMouseLeave={() => setActiveLink("")}
                            >
                                {link.name}
                                {activeLink === link.name && (
                                    <motion.div
                                        layoutId="navUnderline"
                                        className="absolute bottom-0 left-2 right-2 h-0.5 bg-emerald-500 rounded-full"
                                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                    />
                                )}
                            </a>
                        ))}
                    </div>

                    {/* Desktop actions */}
                    <div className="hidden md:flex items-center gap-3">
                        <Link href="/room/office">
                            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                                Try Demo
                            </Button>
                        </Link>
                        <Show when="signed-in">
                            <Link href="/dashboard">
                                <Button size="sm" variant="outline" className="text-emerald-700 border-emerald-200 bg-emerald-50 hover:bg-emerald-100">
                                    Dashboard
                                </Button>
                            </Link>
                            <UserButton signInUrl="/" />
                        </Show>
                        <Show when="signed-out">
                            <SignInButton mode="modal">
                                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                                    Log in
                                </Button>
                            </SignInButton>
                            <SignUpButton mode="modal">
                                <Button size="sm" className="bg-gradient-to-r from-emerald-700 to-teal-600 hover:from-emerald-600 hover:to-teal-500 border-0 shadow-md shadow-emerald-500/15">
                                    Get Started
                                </Button>
                            </SignUpButton>
                        </Show>
                    </div>

                    {/* Mobile hamburger */}
                    <button
                        className="md:hidden p-2 text-gray-600 hover:text-gray-900"
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
                        className="md:hidden bg-white/95 backdrop-blur-2xl border-b border-black/5"
                    >
                        <div className="px-4 py-4 space-y-2">
                            {NAV_LINKS.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    className="block px-4 py-3 text-gray-600 hover:text-gray-900 rounded-xl hover:bg-black/5 transition-all"
                                    onClick={() => setMobileOpen(false)}
                                >
                                    {link.name}
                                </a>
                            ))}
                            <div className="flex flex-col gap-2 pt-3 border-t border-black/5">
                                <Link href="/room/office" onClick={() => setMobileOpen(false)}>
                                    <Button variant="ghost" className="w-full justify-start">Try Demo</Button>
                                </Link>
                                <Show when="signed-in">
                                    <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
                                        <Button variant="outline" className="w-full justify-start text-emerald-700 border-emerald-200 bg-emerald-50">Dashboard</Button>
                                    </Link>
                                    <div className="px-4 py-2">
                                        <UserButton signInUrl="/" />
                                    </div>
                                </Show>
                                <Show when="signed-out">
                                    <SignInButton mode="modal">
                                        <Button variant="ghost" className="w-full justify-start text-gray-600">Log in</Button>
                                    </SignInButton>
                                    <SignUpButton mode="modal">
                                        <Button className="w-full bg-gradient-to-r from-emerald-700 to-teal-600 border-0">Get Started</Button>
                                    </SignUpButton>
                                </Show>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
}
