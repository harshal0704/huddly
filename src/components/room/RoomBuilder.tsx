"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, RotateCw, Trash2, Save, Grid3X3 } from "lucide-react";
import { useSpacesStore } from "@/stores/spacesStore";

/* ── Object Catalog ─────────────────────────────────────── */
const OBJECT_CATALOG = [
    { id: "desk", label: "Desk", category: "furniture", icon: "🪑", w: 2, d: 1 },
    { id: "chair", label: "Chair", category: "furniture", icon: "💺", w: 0.6, d: 0.6 },
    { id: "plant", label: "Plant", category: "decor", icon: "🌱", w: 0.5, d: 0.5 },
    { id: "whiteboard", label: "Whiteboard", category: "interactive", icon: "📋", w: 2.5, d: 0.2 },
    { id: "broadcast_screen", label: "Screen", category: "interactive", icon: "📺", w: 3, d: 0.2 },
    { id: "bookshelf", label: "Bookshelf", category: "furniture", icon: "📚", w: 1.5, d: 0.4 },
    { id: "coffee_machine", label: "Coffee Machine", category: "interactive", icon: "☕", w: 0.5, d: 0.4 },
    { id: "vending_machine", label: "Vending Machine", category: "furniture", icon: "🥤", w: 0.9, d: 0.7 },
    { id: "ping_pong", label: "Ping Pong", category: "gaming", icon: "🏓", w: 2.7, d: 1.5 },
    { id: "printer", label: "Printer", category: "furniture", icon: "🖨️", w: 0.5, d: 0.4 },
    { id: "arcade", label: "Arcade", category: "gaming", icon: "🕹️", w: 0.6, d: 0.6 },
    { id: "floor_lamp", label: "Floor Lamp", category: "decor", icon: "💡", w: 0.3, d: 0.3 },
];

const CATEGORIES = ["all", "furniture", "interactive", "decor", "gaming"];

const CATEGORY_COLORS: Record<string, string> = {
    furniture: "#4B5563",
    interactive: "#059669",
    decor: "#D97706",
    gaming: "#7C3AED",
};

interface PlacedObject {
    id: string;
    type: string;
    x: number;
    z: number;
    rotation: number;
}

interface RoomBuilderProps {
    isOpen: boolean;
    onClose: () => void;
    roomId: string;
}

const GRID_SIZE = 40; // 40x30 units
const GRID_DEPTH = 30;
const CELL_SIZE = 16; // px per unit on the grid

export default function RoomBuilder({ isOpen, onClose, roomId }: RoomBuilderProps) {
    const rooms = useSpacesStore(s => s.rooms);
    const updateRoom = useSpacesStore(s => s.updateRoom);
    const room = rooms.find(r => r.id === roomId);

    const [objects, setObjects] = useState<PlacedObject[]>(
        () => (room as any)?.customObjects ?? []
    );
    const [selectedTool, setSelectedTool] = useState<string | null>(null);
    const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
    const [category, setCategory] = useState("all");

    const filteredCatalog = category === "all"
        ? OBJECT_CATALOG
        : OBJECT_CATALOG.filter(o => o.category === category);

    const handleGridClick = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            if (!selectedTool) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const px = e.clientX - rect.left;
            const py = e.clientY - rect.top;
            const x = Math.round((px / CELL_SIZE) - GRID_SIZE / 2);
            const z = Math.round((py / CELL_SIZE) - GRID_DEPTH / 2);

            const newObj: PlacedObject = {
                id: `obj_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                type: selectedTool,
                x,
                z,
                rotation: 0,
            };
            setObjects(prev => [...prev, newObj]);
        },
        [selectedTool]
    );

    const handleObjectClick = (e: React.MouseEvent, objId: string) => {
        e.stopPropagation();
        setSelectedObjectId(objId === selectedObjectId ? null : objId);
    };

    const rotateSelected = () => {
        if (!selectedObjectId) return;
        setObjects(prev =>
            prev.map(o =>
                o.id === selectedObjectId ? { ...o, rotation: (o.rotation + 90) % 360 } : o
            )
        );
    };

    const deleteSelected = () => {
        if (!selectedObjectId) return;
        setObjects(prev => prev.filter(o => o.id !== selectedObjectId));
        setSelectedObjectId(null);
    };

    const handleSave = () => {
        updateRoom(roomId, {
            customObjects: objects,
            template: "blank" as any,
        } as any);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-gray-900/95 backdrop-blur-sm flex"
                >
                    {/* Left: Object Palette */}
                    <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
                        <div className="p-4 border-b border-gray-700">
                            <h2 className="text-white font-bold text-lg flex items-center gap-2">
                                <Grid3X3 className="w-5 h-5 text-indigo-400" />
                                Room Builder
                            </h2>
                            <p className="text-gray-400 text-xs mt-1">Click an object, then click on the grid to place it</p>
                        </div>

                        {/* Category tabs */}
                        <div className="flex flex-wrap gap-1 p-2 border-b border-gray-700">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setCategory(cat)}
                                    className={`px-2 py-1 rounded text-[10px] font-semibold uppercase tracking-wider transition-colors ${category === cat
                                        ? "bg-indigo-600 text-white"
                                        : "bg-gray-700 text-gray-400 hover:text-white"
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        {/* Objects list */}
                        <div className="flex-1 overflow-y-auto p-2 space-y-1">
                            {filteredCatalog.map(obj => (
                                <button
                                    key={obj.id}
                                    onClick={() => {
                                        setSelectedTool(selectedTool === obj.id ? null : obj.id);
                                        setSelectedObjectId(null);
                                    }}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${selectedTool === obj.id
                                        ? "bg-indigo-600 text-white ring-2 ring-indigo-400"
                                        : "bg-gray-700/50 text-gray-300 hover:bg-gray-700"
                                        }`}
                                >
                                    <span className="text-lg">{obj.icon}</span>
                                    <div className="text-left">
                                        <div className="text-sm font-medium">{obj.label}</div>
                                        <div className="text-[10px] opacity-60">{obj.w}×{obj.d}m</div>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Action buttons */}
                        <div className="p-3 border-t border-gray-700 space-y-2">
                            <div className="flex gap-2">
                                <button
                                    onClick={rotateSelected}
                                    disabled={!selectedObjectId}
                                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-30 text-white text-xs rounded-lg transition-colors"
                                >
                                    <RotateCw className="w-3.5 h-3.5" /> Rotate
                                </button>
                                <button
                                    onClick={deleteSelected}
                                    disabled={!selectedObjectId}
                                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-red-600/80 hover:bg-red-600 disabled:opacity-30 text-white text-xs rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-3.5 h-3.5" /> Delete
                                </button>
                            </div>
                            <button
                                onClick={handleSave}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm rounded-lg transition-colors"
                            >
                                <Save className="w-4 h-4" /> Save & Close
                            </button>
                        </div>
                    </div>

                    {/* Center: Grid area */}
                    <div className="flex-1 flex flex-col">
                        {/* Toolbar */}
                        <div className="h-12 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4">
                            <div className="flex items-center gap-3">
                                <span className="text-gray-400 text-xs">
                                    {objects.length} objects placed
                                </span>
                                {selectedTool && (
                                    <span className="text-xs text-indigo-400 bg-indigo-500/20 px-2 py-0.5 rounded-full">
                                        Placing: {OBJECT_CATALOG.find(o => o.id === selectedTool)?.label}
                                    </span>
                                )}
                                {selectedObjectId && (
                                    <span className="text-xs text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full">
                                        Selected — R to rotate, Del to remove
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Grid */}
                        <div className="flex-1 overflow-auto flex items-center justify-center bg-gray-900 p-4">
                            <div
                                className="relative border border-gray-600 bg-gray-800/50"
                                style={{
                                    width: GRID_SIZE * CELL_SIZE,
                                    height: GRID_DEPTH * CELL_SIZE,
                                    cursor: selectedTool ? "crosshair" : "default",
                                    backgroundImage: `
                                        linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                                        linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
                                    `,
                                    backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`,
                                }}
                                onClick={handleGridClick}
                            >
                                {/* Grid labels */}
                                <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] text-gray-500">
                                    {GRID_SIZE}m wide
                                </div>
                                <div className="absolute -left-5 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] text-gray-500">
                                    {GRID_DEPTH}m deep
                                </div>

                                {/* Center marker */}
                                <div
                                    className="absolute w-1 h-1 bg-white/20 rounded-full"
                                    style={{
                                        left: (GRID_SIZE / 2) * CELL_SIZE - 2,
                                        top: (GRID_DEPTH / 2) * CELL_SIZE - 2,
                                    }}
                                />

                                {/* Placed objects */}
                                {objects.map(obj => {
                                    const catalog = OBJECT_CATALOG.find(c => c.id === obj.type);
                                    const color = CATEGORY_COLORS[catalog?.category || "furniture"];
                                    const isSelected = obj.id === selectedObjectId;
                                    const px = (obj.x + GRID_SIZE / 2) * CELL_SIZE;
                                    const pz = (obj.z + GRID_DEPTH / 2) * CELL_SIZE;
                                    const w = (catalog?.w || 1) * CELL_SIZE;
                                    const d = (catalog?.d || 1) * CELL_SIZE;

                                    return (
                                        <div
                                            key={obj.id}
                                            onClick={(e) => handleObjectClick(e, obj.id)}
                                            className={`absolute flex items-center justify-center text-xs font-bold cursor-pointer transition-all ${isSelected ? "ring-2 ring-white z-10" : "hover:ring-1 hover:ring-white/50"
                                                }`}
                                            style={{
                                                left: px - w / 2,
                                                top: pz - d / 2,
                                                width: obj.rotation % 180 === 0 ? w : d,
                                                height: obj.rotation % 180 === 0 ? d : w,
                                                backgroundColor: color + "90",
                                                border: `1px solid ${color}`,
                                                borderRadius: 3,
                                                transform: `rotate(${obj.rotation}deg)`,
                                            }}
                                            title={`${catalog?.label} (${obj.x}, ${obj.z})`}
                                        >
                                            <span style={{ transform: `rotate(-${obj.rotation}deg)` }}>
                                                {catalog?.icon}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
