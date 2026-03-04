"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { User, Palette, Shirt, Scissors, Sparkles, X, RotateCcw } from "lucide-react";
import { useAvatarStore } from "@/stores/avatarStore";

const SKIN_COLORS = ["#f5d0b0", "#f0d5b8", "#d4a373", "#c68642", "#8d5524", "#5c3a1e"];
const HAIR_COLORS = ["#1a1a1a", "#3d2b1f", "#8B4513", "#D4A373", "#DAA520", "#C0392B", "#2980B9", "#8E44AD"];
const TOP_COLORS = ["#2D6A4F", "#1a6b8a", "#c0392b", "#8e44ad", "#2c3e50", "#e67e22", "#27ae60", "#2980b9"];
const BOTTOM_COLORS = ["#1a1a2e", "#2c3e50", "#34495e", "#7f8c8d", "#2D6A4F", "#8B4513"];
const BODY_OPTIONS = [{ id: 0, label: "Slim" }, { id: 1, label: "Average" }, { id: 2, label: "Athletic" }];
const HAIR_OPTIONS = [{ id: 0, label: "Bald" }, { id: 1, label: "Buzz" }, { id: 2, label: "Short" }, { id: 3, label: "Medium" }, { id: 4, label: "Long" }];
const ACCESSORY_OPTIONS = [{ id: 0, label: "None" }, { id: 1, label: "Glasses" }, { id: 2, label: "Sunglasses" }, { id: 3, label: "Hat" }, { id: 4, label: "Headphones" }];

type Tab = "body" | "hair" | "top" | "accessories";

interface AvatarCustomizerProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AvatarCustomizer({ isOpen, onClose }: AvatarCustomizerProps) {
    const { config, setConfig, resetConfig } = useAvatarStore();
    const [activeTab, setActiveTab] = useState<Tab>("body");

    if (!isOpen) return null;

    const tabs: { id: Tab; icon: React.ComponentType<{ className?: string }>; label: string }[] = [
        { id: "body", icon: User, label: "Body" },
        { id: "hair", icon: Scissors, label: "Hair" },
        { id: "top", icon: Shirt, label: "Clothing" },
        { id: "accessories", icon: Sparkles, label: "Extras" },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            className="fixed left-4 top-20 bottom-20 w-72 z-30 bg-white/95 backdrop-blur-xl rounded-2xl border border-gray-200 shadow-2xl flex flex-col overflow-hidden"
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <Palette className="w-4 h-4 text-emerald-600" />
                    Customize Avatar
                </h3>
                <div className="flex items-center gap-1">
                    <button onClick={resetConfig} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-all" title="Reset">
                        <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-all">
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* 3D Preview */}
            <div className="h-32 bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center relative">
                <div className="relative">
                    {/* Avatar preview (CSS-based) */}
                    <div className="w-16 h-16 rounded-full border-3 border-white shadow-lg" style={{ backgroundColor: config.skinColor }} />
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-14 h-6 rounded-t-full" style={{ backgroundColor: config.hairColor }} />
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-12 h-10 rounded-t-lg" style={{ backgroundColor: config.topColor }} />
                </div>
                <div className="absolute bottom-1 text-[10px] text-gray-400">Preview updates in real-time</div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 py-2.5 text-[10px] font-medium flex flex-col items-center gap-1 transition-colors ${activeTab === tab.id ? "text-emerald-600 border-b-2 border-emerald-500" : "text-gray-400 hover:text-gray-600"
                            }`}
                    >
                        <tab.icon className="w-3.5 h-3.5" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {activeTab === "body" && (
                    <>
                        <Section title="Build">
                            <div className="flex gap-2">
                                {BODY_OPTIONS.map(opt => (
                                    <button key={opt.id} onClick={() => setConfig({ body: opt.id })}
                                        className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${config.body === opt.id ? "bg-emerald-100 text-emerald-700 border border-emerald-200" : "bg-gray-50 text-gray-500 border border-gray-100 hover:bg-gray-100"
                                            }`}
                                    >{opt.label}</button>
                                ))}
                            </div>
                        </Section>
                        <Section title="Skin Tone">
                            <ColorPicker colors={SKIN_COLORS} active={config.skinColor} onSelect={(c) => setConfig({ skinColor: c })} />
                        </Section>
                    </>
                )}

                {activeTab === "hair" && (
                    <>
                        <Section title="Style">
                            <div className="grid grid-cols-3 gap-2">
                                {HAIR_OPTIONS.map(opt => (
                                    <button key={opt.id} onClick={() => setConfig({ hair: opt.id })}
                                        className={`py-2 rounded-lg text-xs font-medium transition-all ${config.hair === opt.id ? "bg-emerald-100 text-emerald-700 border border-emerald-200" : "bg-gray-50 text-gray-500 border border-gray-100 hover:bg-gray-100"
                                            }`}
                                    >{opt.label}</button>
                                ))}
                            </div>
                        </Section>
                        <Section title="Color">
                            <ColorPicker colors={HAIR_COLORS} active={config.hairColor} onSelect={(c) => setConfig({ hairColor: c })} />
                        </Section>
                    </>
                )}

                {activeTab === "top" && (
                    <>
                        <Section title="Top Color">
                            <ColorPicker colors={TOP_COLORS} active={config.topColor} onSelect={(c) => setConfig({ topColor: c })} />
                        </Section>
                        <Section title="Bottom Color">
                            <ColorPicker colors={BOTTOM_COLORS} active={config.bottomColor} onSelect={(c) => setConfig({ bottomColor: c })} />
                        </Section>
                    </>
                )}

                {activeTab === "accessories" && (
                    <Section title="Accessory">
                        <div className="grid grid-cols-2 gap-2">
                            {ACCESSORY_OPTIONS.map(opt => (
                                <button key={opt.id} onClick={() => setConfig({ accessory: opt.id })}
                                    className={`py-2.5 rounded-lg text-xs font-medium transition-all ${config.accessory === opt.id ? "bg-emerald-100 text-emerald-700 border border-emerald-200" : "bg-gray-50 text-gray-500 border border-gray-100 hover:bg-gray-100"
                                        }`}
                                >{opt.label}</button>
                            ))}
                        </div>
                    </Section>
                )}
            </div>
        </motion.div>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div>
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">{title}</div>
            {children}
        </div>
    );
}

function ColorPicker({ colors, active, onSelect }: { colors: string[]; active: string; onSelect: (c: string) => void }) {
    return (
        <div className="flex flex-wrap gap-2">
            {colors.map(c => (
                <button
                    key={c}
                    onClick={() => onSelect(c)}
                    className={`w-8 h-8 rounded-full transition-all ${active === c ? "ring-2 ring-emerald-500 ring-offset-2 scale-110" : "hover:scale-110"}`}
                    style={{ backgroundColor: c }}
                />
            ))}
        </div>
    );
}
