"use client";

import React from "react";

const MINIMAP_ZONES = [
    { name: "Lobby", emoji: "🏛️", x: 8, y: 6, w: 84, h: 12, color: "#e8ddd0" },
    { name: "Workspace", emoji: "🖥️", x: 15, y: 22, w: 55, h: 25, color: "#dce8d8" },
    { name: "Meeting 1", emoji: "📹", x: 4, y: 45, w: 12, h: 12, color: "#d0e0f0" },
    { name: "Meeting 2", emoji: "📹", x: 30, y: 45, w: 28, h: 12, color: "#d0e0f0" },
    { name: "Meeting 3", emoji: "📹", x: 75, y: 45, w: 12, h: 12, color: "#d0e0f0" },
    { name: "Café", emoji: "☕", x: 4, y: 22, w: 12, h: 25, color: "#f0e0d0" },
    { name: "Stage", emoji: "🎤", x: 30, y: 58, w: 28, h: 18, color: "#d8e8d0" },
    { name: "Library", emoji: "📖", x: 4, y: 58, w: 20, h: 18, color: "#e8dac0" },
    { name: "Gaming", emoji: "🎮", x: 65, y: 58, w: 20, h: 18, color: "#d0e8f0" },
    { name: "Rooftop", emoji: "🌳", x: 8, y: 80, w: 84, h: 8, color: "#c8d8b8" },
];

interface MinimapProps {
    isOpen: boolean;
    playerX: number;
    playerY: number;
    mapWidth: number;
    mapHeight: number;
    npcs: { x: number; y: number; name: string; color: string }[];
    currentZone?: string;
    onTeleport?: (zoneName: string) => void;
}

export default function Minimap({
    isOpen,
    playerX = 0.5,
    playerY = 0.6,
    currentZone,
    onTeleport,
}: MinimapProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed top-20 right-4 z-20">
            <div className="w-52 rounded-2xl bg-white/95 backdrop-blur-xl border border-gray-200 shadow-2xl overflow-hidden">
                {/* Title */}
                <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-900 uppercase tracking-wider">Office Map</span>
                    {currentZone && <span className="text-[10px] text-emerald-600 font-medium">{currentZone}</span>}
                </div>

                {/* Map */}
                <div className="relative w-full aspect-square p-2">
                    <div className="relative w-full h-full bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
                        {/* Zone blocks */}
                        {MINIMAP_ZONES.map(zone => (
                            <button
                                key={zone.name}
                                onClick={() => onTeleport?.(zone.name)}
                                className={`absolute rounded-sm transition-all hover:brightness-95 cursor-pointer group ${currentZone === zone.name ? "ring-1 ring-emerald-500 ring-offset-1" : ""
                                    }`}
                                style={{
                                    left: `${zone.x}%`, top: `${zone.y}%`,
                                    width: `${zone.w}%`, height: `${zone.h}%`,
                                    backgroundColor: zone.color,
                                }}
                                title={`Teleport to ${zone.name}`}
                            >
                                <span className="text-[7px] font-semibold text-gray-600 opacity-80 group-hover:opacity-100 absolute inset-0 flex items-center justify-center">
                                    {zone.emoji}
                                </span>
                            </button>
                        ))}

                        {/* Player dot */}
                        <div
                            className="absolute w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/50 animate-pulse z-10"
                            style={{ left: `${playerX * 100}%`, top: `${playerY * 100}%`, transform: "translate(-50%, -50%)" }}
                        />

                        {/* NPC dots */}
                        {[
                            { x: 25, y: 30, color: "#3498db" },
                            { x: 45, y: 35, color: "#2ecc71" },
                            { x: 65, y: 55, color: "#f39c12" },
                            { x: 35, y: 65, color: "#e74c3c" },
                            { x: 55, y: 25, color: "#9b59b6" },
                            { x: 10, y: 35, color: "#1abc9c" },
                        ].map((npc, i) => (
                            <div
                                key={i}
                                className="absolute w-1.5 h-1.5 rounded-full opacity-60"
                                style={{ left: `${npc.x}%`, top: `${npc.y}%`, backgroundColor: npc.color }}
                            />
                        ))}
                    </div>
                </div>

                {/* Legend */}
                <div className="px-3 py-2 border-t border-gray-100 flex items-center gap-3 text-[9px] text-gray-400">
                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> You</span>
                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-400 opacity-60" /> NPCs</span>
                    <span className="ml-auto">Click to teleport</span>
                </div>
            </div>
        </div>
    );
}
