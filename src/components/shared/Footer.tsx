import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Github, Twitter, Heart } from "lucide-react";

const FOOTER_LINKS = {
    Product: [
        { name: "Features", href: "#features" },
        { name: "Templates", href: "#templates" },
        { name: "Demo", href: "/room/demo" },
        { name: "Dashboard", href: "/dashboard" },
    ],
    Company: [
        { name: "Privacy", href: "/privacy" },
        { name: "Terms", href: "/terms" },
    ],
};

const SOCIALS = [
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Github, href: "#", label: "GitHub" },
];

export default function Footer() {
    return (
        <footer className="relative bg-[#050208] border-t border-white/5 pt-12 pb-6">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-10">
                    {/* Brand */}
                    <div className="col-span-2 md:col-span-1">
                        <Link href="/" className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center shadow-lg shadow-purple-500/20 overflow-hidden">
                                <Image src="/header-logo.png" alt="Huddly" width={32} height={32} className="object-cover" />
                            </div>
                            <span className="text-lg font-bold text-white">Huddly</span>
                        </Link>
                        <p className="text-gray-500 text-sm leading-relaxed mb-4 max-w-xs">
                            The friendliest 3D virtual world for teams.
                        </p>
                        <div className="flex gap-2">
                            {SOCIALS.map((social) => (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    className="w-8 h-8 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-all"
                                    aria-label={social.label}
                                >
                                    <social.icon className="w-3.5 h-3.5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links */}
                    {Object.entries(FOOTER_LINKS).map(([category, links]) => (
                        <div key={category}>
                            <h4 className="text-white font-semibold text-sm mb-3">{category}</h4>
                            <ul className="space-y-2">
                                {links.map((link) => (
                                    <li key={link.name}>
                                        <a href={link.href} className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
                                            {link.name}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom bar */}
                <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-gray-600 text-xs">
                        © {new Date().getFullYear()} Huddly. All rights reserved.
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1.5">
                        Made with <Heart className="w-3 h-3 fill-red-500 text-red-500" /> by{" "}
                        <span className="font-semibold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Harshal</span>
                    </p>
                </div>
            </div>
        </footer>
    );
}
