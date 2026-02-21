"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Pen, Eraser, Trash2, X, Minus, Plus, MousePointer,
    Square, Circle, Type, Download, Undo, Redo, Palette,
    StickyNote, Minus as LineIcon, Move, ZoomIn, ZoomOut,
} from "lucide-react";

interface WhiteboardPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

const COLORS = [
    "#ffffff", "#ef4444", "#f59e0b", "#10b981",
    "#3b82f6", "#8b5cf6", "#ec4899", "#06b6d4",
    "#f97316", "#84cc16", "#14b8a6", "#6366f1",
];

const STICKY_COLORS = [
    "#fef08a", "#fca5a5", "#86efac", "#93c5fd", "#d8b4fe", "#fdba74",
];

type Tool = "pen" | "eraser" | "rectangle" | "circle" | "line" | "text" | "sticky" | "select";

interface StickyNote {
    id: string;
    x: number;
    y: number;
    text: string;
    color: string;
    width: number;
    height: number;
}

interface TextAnnotation {
    id: string;
    x: number;
    y: number;
    text: string;
    color: string;
    fontSize: number;
}

export default function WhiteboardPanel({ isOpen, onClose }: WhiteboardPanelProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [tool, setTool] = useState<Tool>("pen");
    const [color, setColor] = useState("#ffffff");
    const [lineWidth, setLineWidth] = useState(3);
    const [showColors, setShowColors] = useState(false);
    const [zoom, setZoom] = useState(100);
    const lastPos = useRef<{ x: number; y: number } | null>(null);
    const shapeStart = useRef<{ x: number; y: number } | null>(null);
    const historyRef = useRef<ImageData[]>([]);
    const redoRef = useRef<ImageData[]>([]);
    const [stickies, setStickies] = useState<StickyNote[]>([]);
    const [textAnnotations, setTextAnnotations] = useState<TextAnnotation[]>([]);
    const [editingStickyId, setEditingStickyId] = useState<string | null>(null);
    const [editingTextId, setEditingTextId] = useState<string | null>(null);
    const [cursorPos, setCursorPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

    // Initialize canvas
    useEffect(() => {
        if (!isOpen || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const container = canvas.parentElement;
        if (!container) return;

        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Dark background
        ctx.fillStyle = "#0f0a1a";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Dot grid
        ctx.fillStyle = "rgba(139, 92, 246, 0.12)";
        for (let x = 0; x < canvas.width; x += 24) {
            for (let y = 0; y < canvas.height; y += 24) {
                ctx.beginPath();
                ctx.arc(x, y, 1, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        historyRef.current = [ctx.getImageData(0, 0, canvas.width, canvas.height)];
        redoRef.current = [];
    }, [isOpen]);

    const saveState = useCallback(() => {
        if (!canvasRef.current) return;
        const ctx = canvasRef.current.getContext("2d");
        if (!ctx) return;
        historyRef.current.push(ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height));
        if (historyRef.current.length > 80) historyRef.current.shift();
        redoRef.current = [];
    }, []);

    const undo = useCallback(() => {
        if (!canvasRef.current || historyRef.current.length <= 1) return;
        const popped = historyRef.current.pop()!;
        redoRef.current.push(popped);
        const ctx = canvasRef.current.getContext("2d");
        if (!ctx) return;
        ctx.putImageData(historyRef.current[historyRef.current.length - 1], 0, 0);
    }, []);

    const redo = useCallback(() => {
        if (!canvasRef.current || redoRef.current.length === 0) return;
        const state = redoRef.current.pop()!;
        historyRef.current.push(state);
        const ctx = canvasRef.current.getContext("2d");
        if (!ctx) return;
        ctx.putImageData(state, 0, 0);
    }, []);

    const getPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left) * (canvas.width / rect.width),
            y: (e.clientY - rect.top) * (canvas.height / rect.height),
        };
    };

    const startDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const pos = getPos(e);

        if (tool === "text") {
            const id = `txt_${Date.now()}`;
            setTextAnnotations((prev) => [...prev, { id, x: pos.x, y: pos.y, text: "", color, fontSize: 16 }]);
            setEditingTextId(id);
            return;
        }

        if (tool === "sticky") {
            const id = `sticky_${Date.now()}`;
            const stickyColor = STICKY_COLORS[Math.floor(Math.random() * STICKY_COLORS.length)];
            setStickies((prev) => [...prev, { id, x: pos.x - 60, y: pos.y - 40, text: "Note...", color: stickyColor, width: 120, height: 80 }]);
            setEditingStickyId(id);
            return;
        }

        if (tool === "rectangle" || tool === "circle" || tool === "line") {
            shapeStart.current = pos;
        }

        setIsDrawing(true);
        lastPos.current = pos;
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const pos = getPos(e);
        setCursorPos(pos);

        if (!isDrawing || !canvasRef.current || !lastPos.current) return;
        const ctx = canvasRef.current.getContext("2d");
        if (!ctx) return;

        if (tool === "pen" || tool === "eraser") {
            ctx.beginPath();
            ctx.moveTo(lastPos.current.x, lastPos.current.y);
            ctx.lineTo(pos.x, pos.y);
            ctx.strokeStyle = tool === "eraser" ? "#0f0a1a" : color;
            ctx.lineWidth = tool === "eraser" ? lineWidth * 5 : lineWidth;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";

            // Smooth pen with shadow
            if (tool === "pen") {
                ctx.shadowColor = color;
                ctx.shadowBlur = lineWidth * 0.5;
            } else {
                ctx.shadowBlur = 0;
            }

            ctx.stroke();
            ctx.shadowBlur = 0;
            lastPos.current = pos;
        }

        // Live shape preview
        if ((tool === "rectangle" || tool === "circle" || tool === "line") && shapeStart.current) {
            const lastState = historyRef.current[historyRef.current.length - 1];
            ctx.putImageData(lastState, 0, 0);
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.lineWidth = lineWidth;
            ctx.lineCap = "round";

            if (tool === "rectangle") {
                const w = pos.x - shapeStart.current.x;
                const h = pos.y - shapeStart.current.y;
                ctx.strokeRect(shapeStart.current.x, shapeStart.current.y, w, h);
            } else if (tool === "circle") {
                const rx = Math.abs(pos.x - shapeStart.current.x) / 2;
                const ry = Math.abs(pos.y - shapeStart.current.y) / 2;
                const cx = shapeStart.current.x + (pos.x - shapeStart.current.x) / 2;
                const cy = shapeStart.current.y + (pos.y - shapeStart.current.y) / 2;
                ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
                ctx.stroke();
            } else if (tool === "line") {
                ctx.moveTo(shapeStart.current.x, shapeStart.current.y);
                ctx.lineTo(pos.x, pos.y);
                ctx.stroke();
            }
        }
    };

    const endDraw = () => {
        if (isDrawing) {
            saveState();
        }
        setIsDrawing(false);
        lastPos.current = null;
        shapeStart.current = null;
    };

    const clearCanvas = () => {
        if (!canvasRef.current) return;
        const ctx = canvasRef.current.getContext("2d");
        if (!ctx) return;

        ctx.fillStyle = "#0f0a1a";
        ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        ctx.fillStyle = "rgba(139, 92, 246, 0.12)";
        for (let x = 0; x < canvasRef.current.width; x += 24) {
            for (let y = 0; y < canvasRef.current.height; y += 24) {
                ctx.beginPath();
                ctx.arc(x, y, 1, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        setStickies([]);
        setTextAnnotations([]);
        saveState();
    };

    const downloadCanvas = () => {
        if (!canvasRef.current) return;
        // Draw text annotations and stickies onto canvas before download
        const ctx = canvasRef.current.getContext("2d");
        if (ctx) {
            textAnnotations.forEach((t) => {
                ctx.fillStyle = t.color;
                ctx.font = `${t.fontSize}px Inter, sans-serif`;
                ctx.fillText(t.text, t.x, t.y + t.fontSize);
            });
        }
        const link = document.createElement("a");
        link.download = `whiteboard-${Date.now()}.png`;
        link.href = canvasRef.current.toDataURL();
        link.click();
    };

    const getCursorClass = () => {
        switch (tool) {
            case "pen": return "cursor-crosshair";
            case "eraser": return "cursor-cell";
            case "rectangle": return "cursor-crosshair";
            case "circle": return "cursor-crosshair";
            case "line": return "cursor-crosshair";
            case "text": return "cursor-text";
            case "sticky": return "cursor-pointer";
            case "select": return "cursor-default";
            default: return "cursor-crosshair";
        }
    };

    const ToolButton = ({ icon: Icon, toolName, label }: { icon: any; toolName: Tool; label: string }) => (
        <button
            onClick={() => setTool(toolName)}
            className={`p-2 rounded-lg transition-all group relative ${tool === toolName
                    ? "bg-violet-500/20 text-violet-400 shadow-lg shadow-violet-500/10"
                    : "text-gray-400 hover:text-white hover:bg-white/10"
                }`}
            title={label}
        >
            <Icon className="w-4 h-4" />
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none bg-gray-900 px-1.5 py-0.5 rounded">
                {label}
            </span>
        </button>
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: "spring", damping: 20, stiffness: 200 }}
                    className="fixed inset-6 sm:inset-10 z-40 bg-gray-950/[0.98] backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl shadow-violet-500/10 flex flex-col overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 bg-gray-950/50">
                        <div className="flex items-center gap-2">
                            <Pen className="w-4 h-4 text-violet-400" />
                            <span className="text-white font-semibold text-sm">Whiteboard</span>
                            <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">Shared</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Zoom controls */}
                            <div className="flex items-center gap-1 bg-white/5 rounded-lg px-1">
                                <button
                                    onClick={() => setZoom(Math.max(50, zoom - 10))}
                                    className="p-1 text-gray-400 hover:text-white transition-colors"
                                >
                                    <ZoomOut className="w-3 h-3" />
                                </button>
                                <span className="text-[10px] text-gray-400 w-8 text-center">{zoom}%</span>
                                <button
                                    onClick={() => setZoom(Math.min(200, zoom + 10))}
                                    className="p-1 text-gray-400 hover:text-white transition-colors"
                                >
                                    <ZoomIn className="w-3 h-3" />
                                </button>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Toolbar */}
                    <div className="flex items-center gap-0.5 px-3 py-2 border-b border-white/5 bg-gray-950/30 flex-wrap">
                        {/* Drawing tools */}
                        <div className="flex items-center gap-0.5 bg-white/[0.03] rounded-lg px-1 py-0.5">
                            <ToolButton icon={Pen} toolName="pen" label="Pen" />
                            <ToolButton icon={Eraser} toolName="eraser" label="Eraser" />
                        </div>

                        <div className="w-px h-6 bg-white/10 mx-1.5" />

                        {/* Shape tools */}
                        <div className="flex items-center gap-0.5 bg-white/[0.03] rounded-lg px-1 py-0.5">
                            <ToolButton icon={Square} toolName="rectangle" label="Rectangle" />
                            <ToolButton icon={Circle} toolName="circle" label="Circle" />
                            <ToolButton icon={LineIcon} toolName="line" label="Line" />
                        </div>

                        <div className="w-px h-6 bg-white/10 mx-1.5" />

                        {/* Annotation tools */}
                        <div className="flex items-center gap-0.5 bg-white/[0.03] rounded-lg px-1 py-0.5">
                            <ToolButton icon={Type} toolName="text" label="Text" />
                            <ToolButton icon={StickyNote} toolName="sticky" label="Sticky Note" />
                        </div>

                        <div className="w-px h-6 bg-white/10 mx-1.5" />

                        {/* Color picker */}
                        <div className="relative">
                            <button
                                onClick={() => setShowColors(!showColors)}
                                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all flex items-center gap-1.5"
                            >
                                <div
                                    className="w-4 h-4 rounded-full border-2 transition-all"
                                    style={{
                                        backgroundColor: color,
                                        borderColor: color === "#ffffff" ? "rgba(255,255,255,0.3)" : "transparent",
                                        boxShadow: `0 0 8px ${color}40`,
                                    }}
                                />
                                <Palette className="w-3 h-3" />
                            </button>
                            {showColors && (
                                <motion.div
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="absolute top-full left-0 mt-1 p-2.5 bg-gray-900/95 backdrop-blur-xl rounded-xl border border-white/10 grid grid-cols-6 gap-1.5 z-50 shadow-xl"
                                >
                                    {COLORS.map((c) => (
                                        <button
                                            key={c}
                                            onClick={() => { setColor(c); setShowColors(false); }}
                                            className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-125 ${color === c ? "border-white scale-110 shadow-lg" : "border-transparent"
                                                }`}
                                            style={{ backgroundColor: c, boxShadow: color === c ? `0 0 12px ${c}60` : undefined }}
                                        />
                                    ))}
                                </motion.div>
                            )}
                        </div>

                        <div className="w-px h-6 bg-white/10 mx-1.5" />

                        {/* Line width slider */}
                        <div className="flex items-center gap-1.5 bg-white/[0.03] rounded-lg px-2 py-1">
                            <button
                                onClick={() => setLineWidth(Math.max(1, lineWidth - 1))}
                                className="p-0.5 text-gray-400 hover:text-white transition-colors"
                            >
                                <Minus className="w-3 h-3" />
                            </button>
                            <div className="relative w-16 h-4 flex items-center">
                                <input
                                    type="range"
                                    min={1}
                                    max={20}
                                    value={lineWidth}
                                    onChange={(e) => setLineWidth(parseInt(e.target.value))}
                                    className="w-full h-1 appearance-none bg-white/10 rounded-full outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-violet-400 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
                                />
                            </div>
                            <span className="text-[10px] text-gray-400 w-4 text-center font-mono">{lineWidth}</span>
                            <button
                                onClick={() => setLineWidth(Math.min(20, lineWidth + 1))}
                                className="p-0.5 text-gray-400 hover:text-white transition-colors"
                            >
                                <Plus className="w-3 h-3" />
                            </button>
                        </div>

                        <div className="w-px h-6 bg-white/10 mx-1.5" />

                        {/* Actions */}
                        <div className="flex items-center gap-0.5 bg-white/[0.03] rounded-lg px-1 py-0.5">
                            <button
                                onClick={undo}
                                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                                title="Undo (Ctrl+Z)"
                            >
                                <Undo className="w-4 h-4" />
                            </button>
                            <button
                                onClick={redo}
                                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                                title="Redo (Ctrl+Y)"
                            >
                                <Redo className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="w-px h-6 bg-white/10 mx-1.5" />

                        <button
                            onClick={clearCanvas}
                            className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                            title="Clear all"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>

                        <button
                            onClick={downloadCanvas}
                            className="p-2 rounded-lg text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
                            title="Download as PNG"
                        >
                            <Download className="w-4 h-4" />
                        </button>

                        {/* Coordinates */}
                        <div className="ml-auto text-[10px] text-gray-600 font-mono">
                            {Math.round(cursorPos.x)}, {Math.round(cursorPos.y)}
                        </div>
                    </div>

                    {/* Canvas area */}
                    <div
                        ref={overlayRef}
                        className={`flex-1 relative ${getCursorClass()}`}
                        style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top left" }}
                    >
                        <canvas
                            ref={canvasRef}
                            onMouseDown={startDraw}
                            onMouseMove={draw}
                            onMouseUp={endDraw}
                            onMouseLeave={endDraw}
                            className="w-full h-full"
                        />

                        {/* Sticky notes overlay */}
                        {stickies.map((sticky) => (
                            <StickyNoteWidget
                                key={sticky.id}
                                sticky={sticky}
                                isEditing={editingStickyId === sticky.id}
                                onStartEdit={() => setEditingStickyId(sticky.id)}
                                onUpdate={(updates) =>
                                    setStickies((prev) =>
                                        prev.map((s) => (s.id === sticky.id ? { ...s, ...updates } : s))
                                    )
                                }
                                onDelete={() => setStickies((prev) => prev.filter((s) => s.id !== sticky.id))}
                                onStopEdit={() => setEditingStickyId(null)}
                            />
                        ))}

                        {/* Text annotations overlay */}
                        {textAnnotations.map((textAnn) => (
                            <TextWidget
                                key={textAnn.id}
                                annotation={textAnn}
                                isEditing={editingTextId === textAnn.id}
                                onUpdate={(updates) =>
                                    setTextAnnotations((prev) =>
                                        prev.map((t) => (t.id === textAnn.id ? { ...t, ...updates } : t))
                                    )
                                }
                                onDelete={() => setTextAnnotations((prev) => prev.filter((t) => t.id !== textAnn.id))}
                                onStopEdit={() => setEditingTextId(null)}
                            />
                        ))}
                    </div>

                    {/* Bottom status bar */}
                    <div className="px-4 py-1.5 border-t border-white/5 flex items-center justify-between text-[10px] text-gray-600">
                        <span>Tool: {tool.charAt(0).toUpperCase() + tool.slice(1)}</span>
                        <span>{stickies.length} notes • {historyRef.current.length - 1} strokes</span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

/** Draggable sticky note */
function StickyNoteWidget({
    sticky,
    isEditing,
    onStartEdit,
    onUpdate,
    onDelete,
    onStopEdit,
}: {
    sticky: StickyNote;
    isEditing: boolean;
    onStartEdit: () => void;
    onUpdate: (updates: Partial<StickyNote>) => void;
    onDelete: () => void;
    onStopEdit: () => void;
}) {
    const [isDragging, setIsDragging] = useState(false);
    const dragStart = useRef<{ x: number; y: number; stickyX: number; stickyY: number } | null>(null);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (isEditing) return;
        e.stopPropagation();
        setIsDragging(true);
        dragStart.current = { x: e.clientX, y: e.clientY, stickyX: sticky.x, stickyY: sticky.y };

        const handleMove = (me: MouseEvent) => {
            if (!dragStart.current) return;
            onUpdate({
                x: dragStart.current.stickyX + (me.clientX - dragStart.current.x),
                y: dragStart.current.stickyY + (me.clientY - dragStart.current.y),
            });
        };
        const handleUp = () => {
            setIsDragging(false);
            dragStart.current = null;
            document.removeEventListener("mousemove", handleMove);
            document.removeEventListener("mouseup", handleUp);
        };
        document.addEventListener("mousemove", handleMove);
        document.addEventListener("mouseup", handleUp);
    };

    return (
        <div
            className="absolute group"
            style={{
                left: sticky.x,
                top: sticky.y,
                width: sticky.width,
                zIndex: isEditing || isDragging ? 60 : 50,
            }}
            onMouseDown={handleMouseDown}
            onDoubleClick={(e) => { e.stopPropagation(); onStartEdit(); }}
        >
            <div
                className="rounded-lg shadow-xl transition-shadow hover:shadow-2xl"
                style={{ backgroundColor: sticky.color, minHeight: sticky.height }}
            >
                {/* Delete button */}
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-400"
                >
                    ×
                </button>

                {isEditing ? (
                    <textarea
                        autoFocus
                        value={sticky.text}
                        onChange={(e) => onUpdate({ text: e.target.value })}
                        onBlur={onStopEdit}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full h-full min-h-[60px] p-2 text-xs text-gray-900 bg-transparent resize-none outline-none font-medium"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                    />
                ) : (
                    <div className="p-2 text-xs text-gray-900 font-medium cursor-move select-none whitespace-pre-wrap" style={{ fontFamily: "'Inter', sans-serif" }}>
                        {sticky.text || "Double-click to edit"}
                    </div>
                )}
            </div>
        </div>
    );
}

/** Inline text annotation */
function TextWidget({
    annotation,
    isEditing,
    onUpdate,
    onDelete,
    onStopEdit,
}: {
    annotation: TextAnnotation;
    isEditing: boolean;
    onUpdate: (updates: Partial<TextAnnotation>) => void;
    onDelete: () => void;
    onStopEdit: () => void;
}) {
    return (
        <div
            className="absolute group"
            style={{ left: annotation.x, top: annotation.y, zIndex: isEditing ? 60 : 45 }}
        >
            {isEditing ? (
                <input
                    autoFocus
                    type="text"
                    value={annotation.text}
                    onChange={(e) => onUpdate({ text: e.target.value })}
                    onBlur={onStopEdit}
                    onKeyDown={(e) => { if (e.key === "Enter") onStopEdit(); }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-transparent outline-none border-b border-violet-400 text-white px-1"
                    style={{ fontSize: annotation.fontSize, color: annotation.color, fontFamily: "'Inter', sans-serif" }}
                    placeholder="Type here..."
                />
            ) : (
                <span
                    className="cursor-text select-none hover:bg-white/5 px-1 rounded"
                    style={{ fontSize: annotation.fontSize, color: annotation.color, fontFamily: "'Inter', sans-serif" }}
                    onDoubleClick={(e) => { e.stopPropagation(); onUpdate({}); }}
                >
                    {annotation.text || "Text"}
                    {/* Delete button */}
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(); }}
                        className="ml-1 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity text-[10px]"
                    >
                        ×
                    </button>
                </span>
            )}
        </div>
    );
}
