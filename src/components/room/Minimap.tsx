"use client";

import React from "react";

/**
 * Minimap component — shows a small top-down overview of the room.
 * Rendered as a CSS overlay in the top-right corner.
 */
interface MinimapProps {
    isOpen: boolean;
    playerX: number;
    playerY: number;
    mapWidth: number;
    mapHeight: number;
    npcs: { x: number; y: number; name: string; color: string }[];
}

export default function Minimap({
    isOpen,
    playerX = 0.5,
    playerY = 0.6,
    mapWidth = 40,
    mapHeight = 30,
}: MinimapProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed top-20 right-4 z-20">
            <div className="w-40 h-28 rounded-xl bg-gray-900/90 border border-white/10 backdrop-blur-sm overflow-hidden shadow-xl">
                {/* Map background */}
                <div className="relative w-full h-full">
                    {/* Floor */}
                    <div className="absolute inset-1 bg-gray-800/50 rounded-lg">
                        {/* Grid */}
                        <div className="absolute inset-0 opacity-20"
                            style={{
                                backgroundImage: `
                  linear-gradient(rgba(139,92,246,0.3) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(139,92,246,0.3) 1px, transparent 1px)
                `,
                                backgroundSize: "10px 10px",
                            }}
                        />

                        {/* Stage area */}
                        <div className="absolute top-1 left-[25%] w-[50%] h-[18%] bg-violet-900/30 rounded-sm" />

                        {/* Desk dots */}
                        {[
                            [20, 30], [30, 30], [40, 30], [50, 30], [60, 30],
                            [20, 45], [30, 45], [40, 45], [50, 45], [60, 45],
                            [20, 60], [30, 60], [40, 60], [50, 60], [60, 60],
                        ].map(([x, y], i) => (
                            <div
                                key={i}
                                className="absolute w-1.5 h-1 bg-gray-600/40 rounded-sm"
                                style={{ left: `${x}%`, top: `${y}%` }}
                            />
                        ))}

                        {/* NPC dots */}
                        {[
                            { x: 25, y: 40, color: "bg-blue-400" },
                            { x: 45, y: 35, color: "bg-emerald-400" },
                            { x: 65, y: 55, color: "bg-amber-400" },
                            { x: 35, y: 65, color: "bg-pink-400" },
                            { x: 55, y: 25, color: "bg-indigo-400" },
                            { x: 75, y: 70, color: "bg-teal-400" },
                            { x: 15, y: 75, color: "bg-red-400" },
                            { x: 80, y: 45, color: "bg-purple-400" },
                        ].map((npc, i) => (
                            <div
                                key={i}
                                className={`absolute w-1.5 h-1.5 ${npc.color} rounded-full opacity-60`}
                                style={{ left: `${npc.x}%`, top: `${npc.y}%` }}
                            />
                        ))}

                        {/* Player dot (pulsing) */}
                        <div
                            className="absolute w-2 h-2 bg-violet-400 rounded-full shadow-lg shadow-violet-500/50 animate-pulse"
                            style={{ left: `${playerX * 100}%`, top: `${playerY * 100}%`, transform: "translate(-50%, -50%)" }}
                        />
                    </div>

                    {/* Label */}
                    <div className="absolute bottom-1 left-2 text-[8px] text-gray-500 font-medium">
                        MINIMAP
                    </div>
                </div>
            </div>
        </div>
    );
}
