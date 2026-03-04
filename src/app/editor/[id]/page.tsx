"use client";

import React, { useState, useCallback, useRef, useEffect, use } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft, Save, Eye, Plus, Trash2, Grid3X3, Layers, Settings2,
    ChevronDown, MousePointer, RotateCw, Undo2, Redo2, ZoomIn, ZoomOut,
    Copy, Download, Upload, Maximize2, Hand
} from "lucide-react";
import { Button } from "@/components/ui/button";

/* ═══════════════════════════════════════════════════════════════
   OBJECT CATALOG
   ═══════════════════════════════════════════════════════════════ */

const OBJECT_CATEGORIES = [
    {
        name: "Furniture", icon: "🪑",
        items: [
            { id: "desk", emoji: "🖥️", label: "Desk", w: 2, h: 1, color: "#8B6B4A" },
            { id: "standing-desk", emoji: "📐", label: "Standing Desk", w: 1.5, h: 0.7, color: "#a07e5a" },
            { id: "chair", emoji: "💺", label: "Chair", w: 0.6, h: 0.6, color: "#3d8b6a" },
            { id: "sofa", emoji: "🛋️", label: "Sofa", w: 2, h: 0.8, color: "#3d8b6a" },
            { id: "meeting-table", emoji: "⬜", label: "Meeting Table", w: 2.5, h: 1.5, color: "#a07e5a" },
            { id: "reception", emoji: "🏢", label: "Reception Desk", w: 4, h: 1.2, color: "#8B6B4A" },
        ],
    },
    {
        name: "Tech", icon: "📺",
        items: [
            { id: "tv-small", emoji: "📺", label: "Small Screen", w: 1.5, h: 0.1, color: "#111" },
            { id: "tv-large", emoji: "🖥️", label: "Large Screen", w: 3, h: 0.1, color: "#111" },
            { id: "whiteboard", emoji: "📋", label: "Whiteboard", w: 2.5, h: 0.1, color: "#fafafa" },
            { id: "scrum-board", emoji: "📝", label: "Scrum Board", w: 3, h: 0.1, color: "#f5f5f4" },
        ],
    },
    {
        name: "Decoration", icon: "🌿",
        items: [
            { id: "plant", emoji: "🌿", label: "Plant", w: 0.5, h: 0.5, color: "#166534" },
            { id: "bookshelf", emoji: "📚", label: "Bookshelf", w: 1.2, h: 0.35, color: "#5C3A1E" },
            { id: "floor-lamp", emoji: "💡", label: "Floor Lamp", w: 0.4, h: 0.4, color: "#f5f0e0" },
            { id: "water-cooler", emoji: "🚰", label: "Water Cooler", w: 0.5, h: 0.5, color: "#93c5fd" },
            { id: "coffee-machine", emoji: "☕", label: "Coffee Machine", w: 0.5, h: 0.4, color: "#292524" },
            { id: "poster", emoji: "🖼️", label: "Wall Poster", w: 1.2, h: 0.1, color: "#e54c4c" },
            { id: "clock", emoji: "🕐", label: "Wall Clock", w: 0.6, h: 0.1, color: "#fff" },
            { id: "rug", emoji: "🟫", label: "Rug", w: 3, h: 2, color: "#8B6B4A" },
        ],
    },
    {
        name: "Fun", icon: "🎮",
        items: [
            { id: "arcade", emoji: "🕹️", label: "Arcade Cabinet", w: 0.8, h: 0.6, color: "#1a1a2e" },
            { id: "jukebox", emoji: "🎵", label: "Jukebox", w: 0.7, h: 0.5, color: "#78350f" },
            { id: "podium", emoji: "🎤", label: "Podium", w: 0.8, h: 0.5, color: "#8B6B4A" },
            { id: "neon-sign", emoji: "✨", label: "Neon Sign", w: 2, h: 0.1, color: "#E9C46A" },
        ],
    },
    {
        name: "Structure", icon: "🧱",
        items: [
            { id: "wall", emoji: "🧱", label: "Wall", w: 3, h: 0.2, color: "#e8e0d0" },
            { id: "glass-wall", emoji: "🪟", label: "Glass Wall", w: 3, h: 0.1, color: "#a8dfc8" },
            { id: "door", emoji: "🚪", label: "Door", w: 1, h: 0.2, color: "#8B6B4A" },
        ],
    },
];

const FLOOR_TILES = [
    { id: "wood", color: "#d4cfc4", label: "Wood" },
    { id: "carpet-blue", color: "#d0e0f0", label: "Blue Carpet" },
    { id: "carpet-green", color: "#dce8d8", label: "Green Carpet" },
    { id: "tile-white", color: "#f0f0f0", label: "White Tile" },
    { id: "warm", color: "#f0e0d0", label: "Warm Tone" },
    { id: "dark", color: "#222", label: "Dark" },
    { id: "grass", color: "#c8d8b8", label: "Grass" },
    { id: "concrete", color: "#9a9a9a", label: "Concrete" },
];

/* ═══════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════ */

interface PlacedObject {
    id: string;
    objectId: string;
    emoji: string;
    label: string;
    x: number;
    y: number;
    w: number;
    h: number;
    rotation: number;
    color: string;
}

type EditorTool = "select" | "place" | "erase" | "pan";

interface EditorPageProps {
    params: Promise<{ id: string }>;
}

/* ═══════════════════════════════════════════════════════════════
   EDITOR PAGE
   ═══════════════════════════════════════════════════════════════ */

export default function EditorPage({ params }: EditorPageProps) {
    const { id } = use(params);

    // Tool state
    const [activeTool, setActiveTool] = useState<EditorTool>("select");
    const [selectedCatalogItem, setSelectedCatalogItem] = useState<string | null>(null);
    const [showGrid, setShowGrid] = useState(true);
    const [sidebarTab, setSidebarTab] = useState<"objects" | "floors" | "layers">("objects");
    const [expandedCategory, setExpandedCategory] = useState<string>("Furniture");
    const [floorColor, setFloorColor] = useState("#d4cfc4");

    // Canvas state
    const [placedObjects, setPlacedObjects] = useState<PlacedObject[]>([]);
    const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
    const [zoom, setZoom] = useState(1);
    const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
    const [ghostPos, setGhostPos] = useState<{ x: number; y: number } | null>(null);
    const canvasRef = useRef<HTMLDivElement>(null);

    // History for undo/redo
    const [history, setHistory] = useState<PlacedObject[][]>([[]]);
    const [historyIndex, setHistoryIndex] = useState(0);

    const GRID_SIZE = 32;
    const ROOM_W = 800;
    const ROOM_H = 600;

    // Snap to grid
    const snapToGrid = (val: number) => Math.round(val / GRID_SIZE) * GRID_SIZE;

    // Push state to history
    const pushHistory = useCallback((newObjects: PlacedObject[]) => {
        setHistory(prev => {
            const trimmed = prev.slice(0, historyIndex + 1);
            return [...trimmed, newObjects];
        });
        setHistoryIndex(prev => prev + 1);
    }, [historyIndex]);

    // Undo / Redo
    const undo = useCallback(() => {
        if (historyIndex > 0) {
            setHistoryIndex(prev => prev - 1);
            setPlacedObjects(history[historyIndex - 1]);
        }
    }, [historyIndex, history]);

    const redo = useCallback(() => {
        if (historyIndex < history.length - 1) {
            setHistoryIndex(prev => prev + 1);
            setPlacedObjects(history[historyIndex + 1]);
        }
    }, [historyIndex, history]);

    // Place object on canvas
    const handleCanvasClick = useCallback((e: React.MouseEvent) => {
        if (activeTool !== "place" || !selectedCatalogItem) return;

        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;

        const allItems = OBJECT_CATEGORIES.flatMap(c => c.items);
        const item = allItems.find(i => i.id === selectedCatalogItem);
        if (!item) return;

        const rawX = (e.clientX - rect.left - panOffset.x) / zoom;
        const rawY = (e.clientY - rect.top - panOffset.y) / zoom;
        const x = snapToGrid(rawX - (item.w * GRID_SIZE) / 2);
        const y = snapToGrid(rawY - (item.h * GRID_SIZE) / 2);

        const newObj: PlacedObject = {
            id: `obj-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            objectId: item.id,
            emoji: item.emoji,
            label: item.label,
            x, y,
            w: item.w * GRID_SIZE,
            h: item.h * GRID_SIZE,
            rotation: 0,
            color: item.color,
        };

        const next = [...placedObjects, newObj];
        setPlacedObjects(next);
        pushHistory(next);
        setSelectedObjectId(newObj.id);
    }, [activeTool, selectedCatalogItem, placedObjects, pushHistory, zoom, panOffset]);

    // Ghost preview position
    const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
        if (activeTool !== "place" || !selectedCatalogItem) { setGhostPos(null); return; }

        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;

        const allItems = OBJECT_CATEGORIES.flatMap(c => c.items);
        const item = allItems.find(i => i.id === selectedCatalogItem);
        if (!item) return;

        const rawX = (e.clientX - rect.left - panOffset.x) / zoom;
        const rawY = (e.clientY - rect.top - panOffset.y) / zoom;
        setGhostPos({
            x: snapToGrid(rawX - (item.w * GRID_SIZE) / 2),
            y: snapToGrid(rawY - (item.h * GRID_SIZE) / 2),
        });
    }, [activeTool, selectedCatalogItem, zoom, panOffset]);

    // Select / delete objects
    const handleObjectClick = useCallback((e: React.MouseEvent, objId: string) => {
        e.stopPropagation();
        if (activeTool === "erase") {
            const next = placedObjects.filter(o => o.id !== objId);
            setPlacedObjects(next);
            pushHistory(next);
            setSelectedObjectId(null);
        } else {
            setSelectedObjectId(objId);
            setActiveTool("select");
        }
    }, [activeTool, placedObjects, pushHistory]);

    // Rotate selected object
    const rotateSelected = useCallback(() => {
        if (!selectedObjectId) return;
        const next = placedObjects.map(o =>
            o.id === selectedObjectId ? { ...o, rotation: (o.rotation + 90) % 360 } : o
        );
        setPlacedObjects(next);
        pushHistory(next);
    }, [selectedObjectId, placedObjects, pushHistory]);

    // Delete selected object
    const deleteSelected = useCallback(() => {
        if (!selectedObjectId) return;
        const next = placedObjects.filter(o => o.id !== selectedObjectId);
        setPlacedObjects(next);
        pushHistory(next);
        setSelectedObjectId(null);
    }, [selectedObjectId, placedObjects, pushHistory]);

    // Duplicate selected object
    const duplicateSelected = useCallback(() => {
        if (!selectedObjectId) return;
        const obj = placedObjects.find(o => o.id === selectedObjectId);
        if (!obj) return;
        const dup = { ...obj, id: `obj-${Date.now()}`, x: obj.x + GRID_SIZE, y: obj.y + GRID_SIZE };
        const next = [...placedObjects, dup];
        setPlacedObjects(next);
        pushHistory(next);
        setSelectedObjectId(dup.id);
    }, [selectedObjectId, placedObjects, pushHistory]);

    // Keyboard shortcuts
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Delete" || e.key === "Backspace") deleteSelected();
            if (e.key === "r") rotateSelected();
            if (e.key === "d" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); duplicateSelected(); }
            if (e.key === "z" && (e.ctrlKey || e.metaKey) && !e.shiftKey) { e.preventDefault(); undo(); }
            if ((e.key === "z" && (e.ctrlKey || e.metaKey) && e.shiftKey) || (e.key === "y" && (e.ctrlKey || e.metaKey))) { e.preventDefault(); redo(); }
            if (e.key === "Escape") { setSelectedObjectId(null); setSelectedCatalogItem(null); setActiveTool("select"); }
            if (e.key === "g") setShowGrid(prev => !prev);
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [deleteSelected, rotateSelected, duplicateSelected, undo, redo]);

    const selectedObj = placedObjects.find(o => o.id === selectedObjectId);
    const ghostItem = selectedCatalogItem ? OBJECT_CATEGORIES.flatMap(c => c.items).find(i => i.id === selectedCatalogItem) : null;

    return (
        <div className="h-screen bg-[#0a0a12] flex flex-col overflow-hidden">
            {/* ── TOP TOOLBAR ──────────────────────────── */}
            <header className="h-12 bg-[#12121e]/95 backdrop-blur-xl border-b border-white/[0.06] flex items-center px-3 gap-2 z-50 shrink-0">
                <Link href="/dashboard" className="flex items-center gap-1.5 text-gray-500 hover:text-white transition-colors text-xs px-2 py-1 rounded-lg hover:bg-white/5">
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                </Link>
                <div className="w-px h-5 bg-white/10" />
                <h1 className="text-white font-bold text-sm">Room Editor</h1>
                <span className="text-gray-600 text-xs">— {id}</span>
                <div className="flex-1" />

                {/* Tools */}
                <div className="flex items-center gap-0.5 bg-white/[0.03] rounded-lg p-0.5 border border-white/[0.06]">
                    {([
                        { tool: "select" as EditorTool, icon: MousePointer, label: "Select (V)", shortcut: "V" },
                        { tool: "place" as EditorTool, icon: Plus, label: "Place (P)", shortcut: "P" },
                        { tool: "erase" as EditorTool, icon: Trash2, label: "Erase (X)", shortcut: "X" },
                        { tool: "pan" as EditorTool, icon: Hand, label: "Pan (Space)", shortcut: "" },
                    ]).map(({ tool, icon: Icon, label }) => (
                        <button
                            key={tool}
                            onClick={() => setActiveTool(tool)}
                            title={label}
                            className={`p-1.5 rounded-md transition-all text-xs ${activeTool === tool
                                ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20"
                                : "text-gray-500 hover:text-white hover:bg-white/5"
                                }`}
                        >
                            <Icon className="w-3.5 h-3.5" />
                        </button>
                    ))}
                </div>

                <div className="w-px h-5 bg-white/10" />

                {/* Undo / Redo */}
                <div className="flex items-center gap-0.5">
                    <button onClick={undo} disabled={historyIndex <= 0} title="Undo (Ctrl+Z)" className="p-1.5 text-gray-500 hover:text-white disabled:opacity-30 hover:bg-white/5 rounded-md transition-all">
                        <Undo2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={redo} disabled={historyIndex >= history.length - 1} title="Redo (Ctrl+Shift+Z)" className="p-1.5 text-gray-500 hover:text-white disabled:opacity-30 hover:bg-white/5 rounded-md transition-all">
                        <Redo2 className="w-3.5 h-3.5" />
                    </button>
                </div>

                <div className="w-px h-5 bg-white/10" />

                <button onClick={() => setShowGrid(!showGrid)} title="Toggle Grid (G)" className={`p-1.5 rounded-md transition-all ${showGrid ? "text-violet-400 bg-violet-500/10" : "text-gray-500 hover:text-white"}`}>
                    <Grid3X3 className="w-3.5 h-3.5" />
                </button>

                {/* Zoom */}
                <div className="flex items-center gap-1 bg-white/[0.03] rounded-lg px-1 py-0.5 border border-white/[0.06]">
                    <button onClick={() => setZoom(z => Math.max(0.25, z - 0.25))} className="p-1 text-gray-500 hover:text-white"><ZoomOut className="w-3 h-3" /></button>
                    <span className="text-[10px] text-gray-400 w-10 text-center font-mono">{Math.round(zoom * 100)}%</span>
                    <button onClick={() => setZoom(z => Math.min(3, z + 0.25))} className="p-1 text-gray-500 hover:text-white"><ZoomIn className="w-3 h-3" /></button>
                    <button onClick={() => { setZoom(1); setPanOffset({ x: 0, y: 0 }); }} className="p-1 text-gray-500 hover:text-white" title="Reset"><Maximize2 className="w-3 h-3" /></button>
                </div>

                <div className="flex-1" />

                <Link href={`/room/${id}`}>
                    <Button variant="secondary" size="sm" className="gap-1.5 h-7 text-xs">
                        <Eye className="w-3 h-3" />
                        Preview
                    </Button>
                </Link>
                <Button size="sm" className="gap-1.5 h-7 text-xs bg-violet-600 hover:bg-violet-500">
                    <Save className="w-3 h-3" />
                    Save
                </Button>
            </header>

            {/* ── MAIN AREA ────────────────────────────── */}
            <div className="flex flex-1 overflow-hidden">

                {/* ── LEFT SIDEBAR ────────────────────── */}
                <div className="w-60 bg-[#0e0e18] border-r border-white/[0.06] flex flex-col overflow-hidden shrink-0">
                    {/* Sidebar tabs */}
                    <div className="flex border-b border-white/[0.06] shrink-0">
                        {([
                            { id: "objects" as const, label: "Objects", icon: "🧩" },
                            { id: "floors" as const, label: "Floor", icon: "🎨" },
                            { id: "layers" as const, label: "Layers", icon: "📑" },
                        ]).map(({ id: tabId, label, icon }) => (
                            <button
                                key={tabId}
                                onClick={() => setSidebarTab(tabId)}
                                className={`flex-1 py-2 text-[10px] font-medium flex flex-col items-center gap-0.5 transition-colors ${sidebarTab === tabId
                                    ? "text-violet-400 border-b-2 border-violet-500 bg-violet-500/5"
                                    : "text-gray-600 hover:text-gray-400"
                                    }`}
                            >
                                <span>{icon}</span>
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* Objects tab */}
                    <div className="flex-1 overflow-y-auto custom-scroll">
                        {sidebarTab === "objects" && (
                            <div className="p-1.5">
                                {OBJECT_CATEGORIES.map((cat) => (
                                    <div key={cat.name} className="mb-0.5">
                                        <button
                                            onClick={() => setExpandedCategory(expandedCategory === cat.name ? "" : cat.name)}
                                            className="w-full flex items-center justify-between px-2.5 py-1.5 text-[11px] font-semibold text-gray-500 hover:text-white rounded-lg hover:bg-white/5 transition-all"
                                        >
                                            <span className="flex items-center gap-1.5">
                                                <span>{cat.icon}</span>
                                                {cat.name}
                                            </span>
                                            <ChevronDown className={`w-3 h-3 transition-transform ${expandedCategory === cat.name ? "rotate-180" : ""}`} />
                                        </button>
                                        <AnimatePresence>
                                            {expandedCategory === cat.name && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: "auto" }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="grid grid-cols-3 gap-1 px-1 pb-1.5 overflow-hidden"
                                                >
                                                    {cat.items.map((item) => (
                                                        <motion.button
                                                            key={item.id}
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={() => {
                                                                setSelectedCatalogItem(item.id);
                                                                setActiveTool("place");
                                                            }}
                                                            className={`p-1.5 rounded-lg border text-center transition-all ${selectedCatalogItem === item.id
                                                                ? "border-violet-500 bg-violet-500/15 shadow-lg shadow-violet-500/10"
                                                                : "border-white/[0.04] bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/10"
                                                                }`}
                                                        >
                                                            <span className="text-base block">{item.emoji}</span>
                                                            <span className="text-[8px] text-gray-600 block mt-0.5 leading-tight truncate">{item.label}</span>
                                                        </motion.button>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Floors tab */}
                        {sidebarTab === "floors" && (
                            <div className="p-2 grid grid-cols-2 gap-1.5">
                                {FLOOR_TILES.map((tile) => (
                                    <button
                                        key={tile.id}
                                        onClick={() => setFloorColor(tile.color)}
                                        className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all ${floorColor === tile.color
                                            ? "border-violet-500 bg-violet-500/10"
                                            : "border-white/[0.04] hover:border-white/10"
                                            }`}
                                    >
                                        <div className="w-full aspect-square rounded-md border border-white/10" style={{ backgroundColor: tile.color }} />
                                        <span className="text-[9px] text-gray-500">{tile.label}</span>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Layers tab */}
                        {sidebarTab === "layers" && (
                            <div className="p-2 space-y-1">
                                <div className="text-[10px] text-gray-600 uppercase tracking-wider px-2 py-1">Placed Objects ({placedObjects.length})</div>
                                {placedObjects.length === 0 && (
                                    <p className="text-[10px] text-gray-700 text-center py-6">No objects placed yet. Select an object and click on the canvas.</p>
                                )}
                                {placedObjects.map((obj) => (
                                    <button
                                        key={obj.id}
                                        onClick={() => { setSelectedObjectId(obj.id); setActiveTool("select"); }}
                                        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-all ${selectedObjectId === obj.id
                                            ? "bg-violet-500/15 border border-violet-500/30"
                                            : "hover:bg-white/5"
                                            }`}
                                    >
                                        <span className="text-sm">{obj.emoji}</span>
                                        <span className="text-[10px] text-gray-400 flex-1 truncate">{obj.label}</span>
                                        <span className="text-[9px] text-gray-700 font-mono">{Math.round(obj.x)},{Math.round(obj.y)}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── CANVAS AREA ─────────────────────── */}
                <div className="flex-1 relative overflow-hidden bg-[#0c0c16]">
                    <div
                        ref={canvasRef}
                        className="absolute inset-0 overflow-hidden"
                        style={{ cursor: activeTool === "place" ? "crosshair" : activeTool === "erase" ? "not-allowed" : activeTool === "pan" ? "grab" : "default" }}
                        onClick={handleCanvasClick}
                        onMouseMove={handleCanvasMouseMove}
                        onMouseLeave={() => setGhostPos(null)}
                    >
                        <div
                            className="absolute"
                            style={{
                                transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
                                transformOrigin: "0 0",
                                left: "50%",
                                top: "50%",
                                marginLeft: -ROOM_W / 2,
                                marginTop: -ROOM_H / 2,
                            }}
                        >
                            {/* Room floor */}
                            <div
                                className="relative border border-white/10 rounded-lg overflow-hidden"
                                style={{ width: ROOM_W, height: ROOM_H, backgroundColor: floorColor }}
                            >
                                {/* Grid overlay */}
                                {showGrid && (
                                    <div
                                        className="absolute inset-0 pointer-events-none"
                                        style={{
                                            backgroundImage: `
                                                linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
                                                linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)
                                            `,
                                            backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
                                        }}
                                    />
                                )}

                                {/* Placed objects */}
                                {placedObjects.map((obj) => (
                                    <div
                                        key={obj.id}
                                        onClick={(e) => handleObjectClick(e, obj.id)}
                                        className={`absolute flex items-center justify-center cursor-pointer transition-all group ${selectedObjectId === obj.id
                                            ? "ring-2 ring-violet-500 ring-offset-1 ring-offset-transparent z-20"
                                            : "hover:ring-1 hover:ring-white/30 z-10"
                                            }`}
                                        style={{
                                            left: obj.x,
                                            top: obj.y,
                                            width: obj.w,
                                            height: obj.h,
                                            backgroundColor: obj.color + "40",
                                            borderRadius: 4,
                                            transform: `rotate(${obj.rotation}deg)`,
                                            border: `1px solid ${obj.color}80`,
                                        }}
                                    >
                                        <span className="text-lg select-none drop-shadow-md" style={{ fontSize: Math.min(obj.w, obj.h) * 0.5 }}>
                                            {obj.emoji}
                                        </span>
                                        {/* Label on hover */}
                                        <div className="absolute -top-5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                            <span className="text-[8px] text-white bg-black/70 px-1.5 py-0.5 rounded whitespace-nowrap">{obj.label}</span>
                                        </div>
                                    </div>
                                ))}

                                {/* Ghost preview */}
                                {ghostPos && ghostItem && (
                                    <div
                                        className="absolute flex items-center justify-center pointer-events-none z-30 animate-pulse"
                                        style={{
                                            left: ghostPos.x,
                                            top: ghostPos.y,
                                            width: ghostItem.w * GRID_SIZE,
                                            height: ghostItem.h * GRID_SIZE,
                                            backgroundColor: ghostItem.color + "20",
                                            borderRadius: 4,
                                            border: `2px dashed ${ghostItem.color}80`,
                                        }}
                                    >
                                        <span className="text-lg opacity-50">{ghostItem.emoji}</span>
                                    </div>
                                )}

                                {/* Room dimensions label */}
                                <div className="absolute bottom-1 right-2 text-[8px] text-white/20 font-mono pointer-events-none">
                                    {ROOM_W / GRID_SIZE}×{ROOM_H / GRID_SIZE} tiles
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Placing indicator */}
                    {activeTool === "place" && selectedCatalogItem && (
                        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30">
                            <div className="px-3 py-1.5 bg-violet-600/90 backdrop-blur-sm rounded-full text-xs text-white flex items-center gap-2 shadow-lg shadow-violet-500/20">
                                <Plus className="w-3 h-3" />
                                Placing: {OBJECT_CATEGORIES.flatMap(c => c.items).find(i => i.id === selectedCatalogItem)?.label}
                                <button onClick={() => { setSelectedCatalogItem(null); setActiveTool("select"); }} className="ml-1 p-0.5 rounded-full hover:bg-white/20">✕</button>
                            </div>
                        </div>
                    )}

                    {/* Status bar */}
                    <div className="absolute bottom-0 left-0 right-0 h-6 bg-[#0a0a12]/90 border-t border-white/[0.06] flex items-center px-3 text-[10px] text-gray-600 gap-4 z-20">
                        <span>Tool: <span className="text-gray-400 capitalize">{activeTool}</span></span>
                        <span>Objects: <span className="text-gray-400">{placedObjects.length}</span></span>
                        <span>Zoom: <span className="text-gray-400">{Math.round(zoom * 100)}%</span></span>
                        <span className="ml-auto text-gray-700">
                            <kbd className="px-1 py-0.5 rounded bg-white/5 text-[8px] font-mono">Del</kbd> Delete ·
                            <kbd className="px-1 py-0.5 rounded bg-white/5 text-[8px] font-mono ml-1">R</kbd> Rotate ·
                            <kbd className="px-1 py-0.5 rounded bg-white/5 text-[8px] font-mono ml-1">G</kbd> Grid ·
                            <kbd className="px-1 py-0.5 rounded bg-white/5 text-[8px] font-mono ml-1">Esc</kbd> Deselect
                        </span>
                    </div>
                </div>

                {/* ── RIGHT SIDEBAR — PROPERTIES ──────── */}
                <div className="w-52 bg-[#0e0e18] border-l border-white/[0.06] overflow-y-auto shrink-0">
                    <div className="flex items-center gap-2 p-3 border-b border-white/[0.06]">
                        <Settings2 className="w-3.5 h-3.5 text-gray-600" />
                        <h3 className="text-xs font-semibold text-gray-400">Properties</h3>
                    </div>

                    {selectedObj ? (
                        <div className="p-3 space-y-3">
                            {/* Object info */}
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-violet-500/10 border border-violet-500/20">
                                <span className="text-xl">{selectedObj.emoji}</span>
                                <div>
                                    <div className="text-xs text-white font-medium">{selectedObj.label}</div>
                                    <div className="text-[9px] text-gray-500">{selectedObj.objectId}</div>
                                </div>
                            </div>

                            {/* Position */}
                            <div>
                                <label className="text-[10px] text-gray-600 block mb-1 uppercase tracking-wider">Position</label>
                                <div className="grid grid-cols-2 gap-1.5">
                                    <div>
                                        <span className="text-[9px] text-gray-700">X</span>
                                        <input
                                            type="number"
                                            value={Math.round(selectedObj.x)}
                                            onChange={(e) => {
                                                const next = placedObjects.map(o => o.id === selectedObjectId ? { ...o, x: Number(e.target.value) } : o);
                                                setPlacedObjects(next);
                                            }}
                                            className="w-full px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] text-white font-mono focus:border-violet-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <span className="text-[9px] text-gray-700">Y</span>
                                        <input
                                            type="number"
                                            value={Math.round(selectedObj.y)}
                                            onChange={(e) => {
                                                const next = placedObjects.map(o => o.id === selectedObjectId ? { ...o, y: Number(e.target.value) } : o);
                                                setPlacedObjects(next);
                                            }}
                                            className="w-full px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] text-white font-mono focus:border-violet-500 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Rotation */}
                            <div>
                                <label className="text-[10px] text-gray-600 block mb-1 uppercase tracking-wider">Rotation</label>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-white font-mono">{selectedObj.rotation}°</span>
                                    <button onClick={rotateSelected} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all">
                                        <RotateCw className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>

                            {/* Size */}
                            <div>
                                <label className="text-[10px] text-gray-600 block mb-1 uppercase tracking-wider">Size</label>
                                <p className="text-[10px] text-gray-400 font-mono">{Math.round(selectedObj.w / GRID_SIZE * 10) / 10} × {Math.round(selectedObj.h / GRID_SIZE * 10) / 10} tiles</p>
                            </div>

                            {/* Actions */}
                            <div className="pt-2 border-t border-white/[0.06] flex gap-1.5">
                                <button onClick={duplicateSelected} title="Duplicate (Ctrl+D)" className="flex-1 py-1.5 text-[10px] rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all flex items-center justify-center gap-1">
                                    <Copy className="w-3 h-3" />
                                    Duplicate
                                </button>
                                <button onClick={deleteSelected} title="Delete" className="flex-1 py-1.5 text-[10px] rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all flex items-center justify-center gap-1">
                                    <Trash2 className="w-3 h-3" />
                                    Delete
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 text-center">
                            <div className="w-10 h-10 rounded-full bg-white/[0.03] flex items-center justify-center mx-auto mb-3">
                                <MousePointer className="w-4 h-4 text-gray-700" />
                            </div>
                            <p className="text-[10px] text-gray-700 leading-relaxed">
                                Select an object on the canvas to view and edit its properties.
                            </p>
                            <div className="mt-4 text-[9px] text-gray-800 space-y-1">
                                <p><kbd className="px-1 py-0.5 rounded bg-white/5">Click</kbd> to select</p>
                                <p><kbd className="px-1 py-0.5 rounded bg-white/5">R</kbd> to rotate</p>
                                <p><kbd className="px-1 py-0.5 rounded bg-white/5">Del</kbd> to delete</p>
                                <p><kbd className="px-1 py-0.5 rounded bg-white/5">Ctrl+D</kbd> to duplicate</p>
                            </div>
                        </div>
                    )}

                    {/* Room settings */}
                    <div className="p-3 border-t border-white/[0.06] mt-auto">
                        <div className="text-[10px] text-gray-600 uppercase tracking-wider mb-2">Room Settings</div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-[10px]">
                                <span className="text-gray-500">Room Size</span>
                                <span className="text-gray-400 font-mono">{ROOM_W / GRID_SIZE}×{ROOM_H / GRID_SIZE}</span>
                            </div>
                            <div className="flex items-center justify-between text-[10px]">
                                <span className="text-gray-500">Tile Size</span>
                                <span className="text-gray-400 font-mono">{GRID_SIZE}px</span>
                            </div>
                            <div className="flex items-center justify-between text-[10px]">
                                <span className="text-gray-500">Floor</span>
                                <div className="w-4 h-4 rounded border border-white/20" style={{ backgroundColor: floorColor }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
