import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Github, Twitter, Heart } from "lucide-react";

const FOOTER_LINKS = {
    Product: [
        { name: "Features", href: "#features" },
        { name: "Zones", href: "#templates" },
        { name: "Demo", href: "/room/office" },
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
        <footer className="relative bg-white border-t border-gray-200 pt-12 pb-6">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-10">
                    {/* Brand */}
                    <div className="col-span-2 md:col-span-1">
                        <Link href="/" className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 overflow-hidden">
                                <Image src="/header-logo.png" alt="Huddly" width={32} height={32} className="object-cover" />
                            </div>
                            <span className="text-lg font-bold text-gray-900">Huddly</span>
                        </Link>
                        <p className="text-gray-500 text-sm leading-relaxed mb-4 max-w-xs">
                            The friendliest 3D virtual world for teams.
                        </p>
                        <div className="flex gap-2">
                            {SOCIALS.map((social) => (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
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
                            <h4 className="text-gray-900 font-semibold text-sm mb-3">{category}</h4>
                            <ul className="space-y-2">
                                {links.map((link) => (
                                    <li key={link.name}>
                                        <a href={link.href} className="text-gray-500 hover:text-emerald-600 text-sm transition-colors">
                                            {link.name}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom bar */}
                <div className="border-t border-gray-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-gray-400 text-xs">
                        © {new Date().getFullYear()} Huddly. All rights reserved.
                    </p>
                    <p className="text-xs text-gray-400 flex items-center gap-1.5">
                        made with love by{" "}
                        <a
                            href="https://harshalsp.vercel.app"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent hover:scale-105 transition-transform"
                        >
                            harshalsp
                        </a>
                    </p>
                </div>
            </div>
        </footer>
    );
}
