import React from "react";
import Link from "next/link";
import { Github, Twitter, Youtube, Heart } from "lucide-react";

const FOOTER_LINKS = {
    Product: [
        { name: "Features", href: "#features" },
        { name: "Templates", href: "#templates" },
        { name: "Pricing", href: "#pricing" },
        { name: "Demo", href: "/room/demo" },
    ],
    Company: [
        { name: "About", href: "#" },
        { name: "Blog", href: "#" },
        { name: "Careers", href: "#" },
        { name: "Contact", href: "#" },
    ],
    Resources: [
        { name: "Documentation", href: "#" },
        { name: "API Reference", href: "#" },
        { name: "Status", href: "#" },
        { name: "Changelog", href: "#" },
    ],
    Legal: [
        { name: "Privacy", href: "#" },
        { name: "Terms", href: "#" },
        { name: "Security", href: "#" },
    ],
};

const SOCIALS = [
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Github, href: "#", label: "GitHub" },
    { icon: Youtube, href: "#", label: "YouTube" },
];

export default function Footer() {
    return (
        <footer className="relative bg-gray-950 border-t border-white/5 pt-16 pb-8">
            {/* Subtle top glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Top section */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
                    {/* Brand */}
                    <div className="col-span-2 md:col-span-1">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                                <span className="text-sm">🏠</span>
                            </div>
                            <span className="text-lg font-bold text-white">Huddly</span>
                        </Link>
                        <p className="text-gray-500 text-sm leading-relaxed mb-4">
                            The friendliest virtual world for classrooms, offices, and communities.
                        </p>
                        <div className="flex gap-3">
                            {SOCIALS.map((social) => (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                                    aria-label={social.label}
                                >
                                    <social.icon className="w-4 h-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Link columns */}
                    {Object.entries(FOOTER_LINKS).map(([category, links]) => (
                        <div key={category}>
                            <h4 className="text-white font-semibold text-sm mb-4">{category}</h4>
                            <ul className="space-y-2.5">
                                {links.map((link) => (
                                    <li key={link.name}>
                                        <a
                                            href={link.href}
                                            className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
                                        >
                                            {link.name}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Divider */}
                <div className="border-t border-white/5 pt-8">
                    {/* Made with love */}
                    <div className="text-center mb-6">
                        <p className="text-lg font-medium text-gray-300 flex items-center justify-center gap-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                            Made with <Heart className="w-5 h-5 fill-red-500 text-red-500 animate-pulse" /> by{" "}
                            <span className="font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                                Harshal
                            </span>
                        </p>
                    </div>

                    {/* Copyright */}
                    <div className="text-center">
                        <p className="text-gray-600 text-sm">
                            © {new Date().getFullYear()} Huddly. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
