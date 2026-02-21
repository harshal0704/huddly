"use client";

import ContentPageLayout from "@/components/shared/ContentPageLayout";
import { motion } from "framer-motion";
import { Sparkles, Bug, Zap, Shield } from "lucide-react";

const CHANGELOG = [
    {
        version: "2.4.0",
        date: "February 21, 2026",
        type: "feature",
        items: [
            "Added real-time whiteboard with shapes, sticky notes, and text tool",
            "Broadcast mode — go live and stream to all room participants",
            "Video call panel with pin, speaking indicators, and grid layout",
            "Screen sharing via browser getDisplayMedia API",
            "Mute and camera controls now toggle actual media tracks",
        ],
    },
    {
        version: "2.3.0",
        date: "February 15, 2026",
        type: "feature",
        items: [
            "Added 5 map templates: Classroom, Office, Café, Conference, Party",
            "Click-to-walk pathfinding using EasyStar.js A* algorithm",
            "Proximity-based video/audio auto-connect within 4-tile radius",
            "Emote wheel with 12 emoji reactions (press Space)",
            "Minimap showing player and NPC positions",
        ],
    },
    {
        version: "2.2.1",
        date: "February 10, 2026",
        type: "fix",
        items: [
            "Fixed avatar flickering when switching between keyboard and mouse movement",
            "Resolved WebSocket reconnection issue after tab sleep",
            "Fixed chat message ordering when multiple messages arrive simultaneously",
        ],
    },
    {
        version: "2.2.0",
        date: "February 5, 2026",
        type: "feature",
        items: [
            "Chat sidebar with Global and Proximity tabs",
            "Participants list panel with online status indicators",
            "Room toolbar redesign with grouped controls",
            "Dashboard page with room management",
        ],
    },
    {
        version: "2.1.0",
        date: "January 28, 2026",
        type: "improvement",
        items: [
            "Performance optimization: reduced canvas redraws by 40%",
            "Improved avatar sprite rendering with smooth interpolation",
            "Added keyboard shortcut hints overlay in rooms",
            "Reduced WebSocket payload size by 30% with delta updates",
        ],
    },
    {
        version: "2.0.0",
        date: "January 15, 2026",
        type: "feature",
        items: [
            "Complete rewrite using Next.js 16 and Phaser 3",
            "New landing page with animated hero and feature sections",
            "Dark theme redesign with glassmorphism UI",
            "WASD and arrow key movement controls",
            "Room page with procedurally rendered 2D world",
        ],
    },
    {
        version: "1.0.0",
        date: "December 1, 2025",
        type: "feature",
        items: [
            "Initial release of Huddly virtual world platform",
            "Basic 2D room with avatar movement",
            "Simple text chat functionality",
            "Single room template",
        ],
    },
];

const typeConfig = {
    feature: { icon: Sparkles, color: "text-violet-400", bg: "bg-violet-500/10", label: "New" },
    fix: { icon: Bug, color: "text-amber-400", bg: "bg-amber-500/10", label: "Fix" },
    improvement: { icon: Zap, color: "text-emerald-400", bg: "bg-emerald-500/10", label: "Improved" },
    security: { icon: Shield, color: "text-blue-400", bg: "bg-blue-500/10", label: "Security" },
};

export default function ChangelogPage() {
    return (
        <ContentPageLayout
            title="Changelog"
            subtitle="Track every update, improvement, and bug fix we ship."
            badge="Resources"
        >
            <div className="not-prose space-y-8">
                {CHANGELOG.map((release, i) => {
                    const config = typeConfig[release.type as keyof typeof typeConfig];
                    const Icon = config.icon;
                    return (
                        <motion.div
                            key={release.version}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08 }}
                            className="relative pl-8 border-l-2 border-white/5"
                        >
                            {/* Timeline dot */}
                            <div className={`absolute left-[-9px] top-1 w-4 h-4 rounded-full ${config.bg} border-2 border-gray-950 flex items-center justify-center`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${config.color.replace("text-", "bg-")}`} />
                            </div>

                            {/* Version header */}
                            <div className="flex items-center gap-3 mb-3">
                                <h3 className="text-lg font-bold text-white">v{release.version}</h3>
                                <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}>
                                    {config.label}
                                </span>
                                <span className="text-xs text-gray-600">{release.date}</span>
                            </div>

                            {/* Items */}
                            <ul className="space-y-2">
                                {release.items.map((item, j) => (
                                    <li key={j} className="flex items-start gap-2 text-sm text-gray-400">
                                        <Icon className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${config.color}`} />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    );
                })}
            </div>
        </ContentPageLayout>
    );
}
