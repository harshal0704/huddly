"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    ArrowLeft, Save, Eye, EyeOff, Plus, Trash2,
    Square, Circle, Minus, Grid3X3, Layers, Settings2,
    ChevronDown, MousePointer, Move
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/shared/Footer";

const OBJECT_CATEGORIES = [
    {
        name: "Furniture",
        items: [
            { id: "desk", emoji: "🪑", label: "Desk" },
            { id: "chair", emoji: "💺", label: "Chair" },
            { id: "sofa", emoji: "🛋️", label: "Sofa" },
            { id: "table", emoji: "🔲", label: "Table" },
            { id: "bed", emoji: "🛏️", label: "Bed" },
        ],
    },
    {
        name: "Tech",
        items: [
            { id: "whiteboard", emoji: "📋", label: "Whiteboard" },
            { id: "tv", emoji: "📺", label: "TV" },
            { id: "computer", emoji: "💻", label: "Computer" },
            { id: "projector", emoji: "📽️", label: "Projector" },
        ],
    },
    {
        name: "Decoration",
        items: [
            { id: "plant", emoji: "🌿", label: "Plant" },
            { id: "bookshelf", emoji: "📚", label: "Bookshelf" },
            { id: "lamp", emoji: "💡", label: "Lamp" },
            { id: "painting", emoji: "🖼️", label: "Painting" },
            { id: "rug", emoji: "🟫", label: "Rug" },
        ],
    },
    {
        name: "Interactive",
        items: [
            { id: "podium", emoji: "🎤", label: "Podium" },
            { id: "door", emoji: "🚪", label: "Door" },
            { id: "coffee", emoji: "☕", label: "Coffee Machine" },
            { id: "arcade", emoji: "🕹️", label: "Arcade" },
            { id: "vending", emoji: "🥤", label: "Vending Machine" },
        ],
    },
    {
        name: "Zones",
        items: [
            { id: "zone-private", emoji: "🔒", label: "Private Zone" },
            { id: "zone-stage", emoji: "🎭", label: "Stage Zone" },
        ],
    },
];

const FLOOR_TILES = [
    { id: "wood", color: "#3d2b1f", label: "Wood" },
    { id: "carpet-blue", color: "#1e3a5f", label: "Blue Carpet" },
    { id: "carpet-red", color: "#5f1e1e", label: "Red Carpet" },
    { id: "tile-white", color: "#d4d4d4", label: "White Tile" },
    { id: "grass", color: "#2d5a27", label: "Grass" },
    { id: "stone", color: "#4a4a4a", label: "Stone" },
];

type EditorTool = "select" | "place" | "erase" | "zone";

export default function EditorPage() {
    const [activeTool, setActiveTool] = useState<EditorTool>("select");
    const [selectedObject, setSelectedObject] = useState<string | null>(null);
    const [showGrid, setShowGrid] = useState(true);
    const [activeLayer, setActiveLayer] = useState("objects");
    const [sidebarTab, setSidebarTab] = useState<"objects" | "floors" | "layers">("objects");
    const [expandedCategory, setExpandedCategory] = useState<string>("Furniture");

    return (
        <div className="min-h-screen bg-[#030014] flex flex-col">
            {/* Top toolbar */}
            <header className="sticky top-0 z-40 bg-gray-950/90 backdrop-blur-xl border-b border-white/10 h-14 flex items-center px-4 gap-3">
                <Link href="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm">Back</span>
                </Link>

                <div className="w-px h-6 bg-white/10" />

                <div className="flex items-center gap-1">
                    <h1 className="text-white font-bold text-sm">Map Editor</h1>
                    <span className="text-gray-500 text-xs">— Demo Classroom</span>
                </div>

                <div className="flex-1" />

                {/* Tools */}
                <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1">
                    {[
                        { tool: "select" as EditorTool, icon: MousePointer, label: "Select" },
                        { tool: "place" as EditorTool, icon: Plus, label: "Place" },
                        { tool: "erase" as EditorTool, icon: Trash2, label: "Erase" },
                    ].map(({ tool, icon: Icon, label }) => (
                        <button
                            key={tool}
                            onClick={() => setActiveTool(tool)}
                            title={label}
                            className={`p-2 rounded-lg transition-all ${activeTool === tool
                                    ? "bg-violet-600 text-white"
                                    : "text-gray-400 hover:text-white hover:bg-white/10"
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                        </button>
                    ))}
                </div>

                <div className="w-px h-6 bg-white/10" />

                <button
                    onClick={() => setShowGrid(!showGrid)}
                    title="Toggle Grid"
                    className={`p-2 rounded-lg transition-all ${showGrid ? "text-violet-400 bg-violet-500/15" : "text-gray-400 hover:text-white"
                        }`}
                >
                    <Grid3X3 className="w-4 h-4" />
                </button>

                <div className="flex-1" />

                <Button variant="secondary" size="sm" className="gap-2">
                    <Eye className="w-3.5 h-3.5" />
                    Preview
                </Button>
                <Button size="sm" className="gap-2">
                    <Save className="w-3.5 h-3.5" />
                    Save
                </Button>
            </header>

            {/* Main content */}
            <div className="flex flex-1 overflow-hidden">
                {/* Left sidebar */}
                <div className="w-64 bg-gray-950/50 border-r border-white/10 overflow-y-auto">
                    {/* Sidebar tabs */}
                    <div className="flex border-b border-white/10">
                        {[
                            { id: "objects" as const, label: "Objects", icon: Square },
                            { id: "floors" as const, label: "Floors", icon: Grid3X3 },
                            { id: "layers" as const, label: "Layers", icon: Layers },
                        ].map(({ id, label, icon: Icon }) => (
                            <button
                                key={id}
                                onClick={() => setSidebarTab(id)}
                                className={`flex-1 py-2.5 text-xs font-medium flex flex-col items-center gap-1 transition-colors ${sidebarTab === id
                                        ? "text-violet-400 border-b-2 border-violet-500"
                                        : "text-gray-500 hover:text-gray-300"
                                    }`}
                            >
                                <Icon className="w-3.5 h-3.5" />
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* Objects tab */}
                    {sidebarTab === "objects" && (
                        <div className="p-2">
                            {OBJECT_CATEGORIES.map((cat) => (
                                <div key={cat.name} className="mb-1">
                                    <button
                                        onClick={() => setExpandedCategory(expandedCategory === cat.name ? "" : cat.name)}
                                        className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-all"
                                    >
                                        {cat.name}
                                        <ChevronDown className={`w-3 h-3 transition-transform ${expandedCategory === cat.name ? "rotate-180" : ""}`} />
                                    </button>
                                    {expandedCategory === cat.name && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            className="grid grid-cols-3 gap-1.5 px-2 pb-2"
                                        >
                                            {cat.items.map((item) => (
                                                <button
                                                    key={item.id}
                                                    onClick={() => {
                                                        setSelectedObject(item.id);
                                                        setActiveTool("place");
                                                    }}
                                                    className={`p-2 rounded-lg border text-center transition-all ${selectedObject === item.id
                                                            ? "border-violet-500 bg-violet-500/15 shadow-lg shadow-violet-500/10"
                                                            : "border-white/5 bg-white/[0.02] hover:bg-white/5 hover:border-white/10"
                                                        }`}
                                                >
                                                    <span className="text-lg block">{item.emoji}</span>
                                                    <span className="text-[9px] text-gray-500 block mt-0.5">{item.label}</span>
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Floors tab */}
                    {sidebarTab === "floors" && (
                        <div className="p-3 grid grid-cols-2 gap-2">
                            {FLOOR_TILES.map((tile) => (
                                <button
                                    key={tile.id}
                                    className="flex flex-col items-center gap-1.5 p-2 rounded-lg border border-white/5 hover:border-white/20 transition-all"
                                >
                                    <div
                                        className="w-full aspect-square rounded-lg"
                                        style={{ backgroundColor: tile.color }}
                                    />
                                    <span className="text-[10px] text-gray-400">{tile.label}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Layers tab */}
                    {sidebarTab === "layers" && (
                        <div className="p-3 space-y-1">
                            {["Objects", "Walls", "Floor"].map((layer) => (
                                <div
                                    key={layer}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all cursor-pointer ${activeLayer === layer.toLowerCase()
                                            ? "bg-violet-500/15 border border-violet-500/30"
                                            : "hover:bg-white/5"
                                        }`}
                                    onClick={() => setActiveLayer(layer.toLowerCase())}
                                >
                                    <button className="text-gray-400 hover:text-white">
                                        <Eye className="w-3.5 h-3.5" />
                                    </button>
                                    <span className="text-sm text-gray-300 flex-1">{layer}</span>
                                    <Layers className="w-3 h-3 text-gray-600" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Canvas area */}
                <div className="flex-1 relative overflow-hidden bg-[#12091c]">
                    {/* Grid canvas */}
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundImage: showGrid
                                ? `
                  linear-gradient(rgba(139, 92, 246, 0.06) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(139, 92, 246, 0.06) 1px, transparent 1px)
                `
                                : "none",
                            backgroundSize: "32px 32px",
                        }}
                    >
                        {/* Room preview */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[640px] h-[480px] border border-white/10 rounded-lg overflow-hidden bg-[#1a1025]">
                            {/* Floor */}
                            <div className="absolute inset-0 opacity-30"
                                style={{
                                    backgroundImage: `
                    linear-gradient(rgba(139,92,246,0.2) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(139,92,246,0.2) 1px, transparent 1px)
                  `,
                                    backgroundSize: "32px 32px",
                                }}
                            />

                            {/* Stage area */}
                            <div className="absolute top-[10%] left-[25%] w-[50%] h-[15%] bg-violet-900/30 border border-violet-700/30 rounded flex items-center justify-center text-xs text-violet-300/50">
                                Stage Area
                            </div>

                            {/* Example placed objects */}
                            <div className="absolute top-[30%] left-[20%] text-xl cursor-move hover:scale-110 transition-transform">🪑</div>
                            <div className="absolute top-[30%] left-[35%] text-xl cursor-move hover:scale-110 transition-transform">🪑</div>
                            <div className="absolute top-[30%] left-[50%] text-xl cursor-move hover:scale-110 transition-transform">🪑</div>
                            <div className="absolute top-[50%] left-[20%] text-xl cursor-move hover:scale-110 transition-transform">🪑</div>
                            <div className="absolute top-[50%] left-[35%] text-xl cursor-move hover:scale-110 transition-transform">🪑</div>
                            <div className="absolute top-[50%] left-[50%] text-xl cursor-move hover:scale-110 transition-transform">🪑</div>
                            <div className="absolute top-[10%] left-[40%] text-xl cursor-move hover:scale-110 transition-transform">📋</div>
                            <div className="absolute top-[20%] left-[45%] text-lg cursor-move hover:scale-110 transition-transform">🎤</div>
                            <div className="absolute top-[70%] right-[10%] text-xl cursor-move hover:scale-110 transition-transform">🛋️</div>
                            <div className="absolute top-[70%] left-[10%] text-xl cursor-move hover:scale-110 transition-transform">☕</div>
                            <div className="absolute top-[5%] left-[5%] text-xl cursor-move hover:scale-110 transition-transform">🌿</div>
                            <div className="absolute top-[5%] right-[5%] text-xl cursor-move hover:scale-110 transition-transform">🌿</div>
                            <div className="absolute top-[80%] right-[5%] text-xl cursor-move hover:scale-110 transition-transform">📚</div>

                            {/* Tool cursor indicator */}
                            {activeTool === "place" && selectedObject && (
                                <div className="absolute bottom-2 right-2 px-2 py-1 bg-violet-600/80 rounded text-xs text-white">
                                    Placing: {OBJECT_CATEGORIES.flatMap(c => c.items).find(i => i.id === selectedObject)?.label}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Status bar */}
                    <div className="absolute bottom-0 left-0 right-0 h-8 bg-gray-950/80 border-t border-white/10 flex items-center px-4 text-xs text-gray-500 gap-4">
                        <span>Tool: {activeTool}</span>
                        <span>Layer: {activeLayer}</span>
                        <span>Grid: {showGrid ? "On" : "Off"}</span>
                        <span className="ml-auto">40×30 tiles • 32px/tile</span>
                    </div>
                </div>

                {/* Right sidebar - Properties */}
                <div className="w-56 bg-gray-950/50 border-l border-white/10 overflow-y-auto p-3">
                    <div className="flex items-center gap-2 mb-4">
                        <Settings2 className="w-4 h-4 text-gray-500" />
                        <h3 className="text-sm font-semibold text-gray-300">Properties</h3>
                    </div>

                    {selectedObject ? (
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">Object</label>
                                <div className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white">
                                    {OBJECT_CATEGORIES.flatMap(c => c.items).find(i => i.id === selectedObject)?.label || selectedObject}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-xs text-gray-500 block mb-1">X</label>
                                    <input className="w-full px-2 py-1 rounded bg-white/5 border border-white/10 text-xs text-white" defaultValue="128" />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 block mb-1">Y</label>
                                    <input className="w-full px-2 py-1 rounded bg-white/5 border border-white/10 text-xs text-white" defaultValue="96" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">Collision</label>
                                <div className="flex gap-2">
                                    <button className="flex-1 py-1 text-xs rounded bg-violet-600/20 text-violet-300 border border-violet-500/30">On</button>
                                    <button className="flex-1 py-1 text-xs rounded bg-white/5 text-gray-500 border border-white/10">Off</button>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">Interactable</label>
                                <div className="flex gap-2">
                                    <button className="flex-1 py-1 text-xs rounded bg-violet-600/20 text-violet-300 border border-violet-500/30">Yes</button>
                                    <button className="flex-1 py-1 text-xs rounded bg-white/5 text-gray-500 border border-white/10">No</button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="text-xs text-gray-600 text-center py-8">
                            Select an object to view properties
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
