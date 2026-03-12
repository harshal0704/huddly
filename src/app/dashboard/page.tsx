"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus, Users, Clock, Copy, LogOut, Settings,
    Globe, Lock, Search, ArrowRight, Palette, Trash2,
    ChevronRight, Check, Video, Sparkles, KeyRound,
    Building2, GraduationCap, Coffee, Presentation,
    PartyPopper, BookOpen, Gamepad2, Sunset, Theater, Brush
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger
} from "@/components/ui/dialog";
import { useUser, UserButton } from "@clerk/nextjs";
import { useSpacesStore } from "@/stores/spacesStore";
import { useToastStore } from "@/stores/toastStore";
import Footer from "@/components/shared/Footer";
import type { RoomTemplate } from "@/types";

const TEMPLATE_OPTIONS: { id: RoomTemplate; name: string; emoji: string; icon: React.ReactNode; desc: string; gradient: string }[] = [
    { id: "office", name: "Office", emoji: "🏢", icon: <Building2 className="w-5 h-5" />, desc: "Team pods & break area", gradient: "from-emerald-500 to-teal-500" },
    { id: "classroom", name: "Classroom", emoji: "📚", icon: <GraduationCap className="w-5 h-5" />, desc: "Learning together", gradient: "from-blue-500 to-indigo-500" },
    { id: "cafe", name: "Café", emoji: "☕", icon: <Coffee className="w-5 h-5" />, desc: "Casual hangout", gradient: "from-orange-500 to-amber-500" },
    { id: "conference", name: "Conference", emoji: "🎤", icon: <Presentation className="w-5 h-5" />, desc: "Presentations & AMAs", gradient: "from-purple-500 to-violet-500" },
    { id: "party", name: "Party", emoji: "🎉", icon: <PartyPopper className="w-5 h-5" />, desc: "DJ booth & dance floor", gradient: "from-pink-500 to-rose-500" },
    { id: "library", name: "Library", emoji: "📖", icon: <BookOpen className="w-5 h-5" />, desc: "Focus & reading nooks", gradient: "from-yellow-500 to-amber-500" },
    { id: "gaming", name: "Gaming", emoji: "🎮", icon: <Gamepad2 className="w-5 h-5" />, desc: "Arcade & neon vibes", gradient: "from-cyan-500 to-blue-500" },
    { id: "rooftop", name: "Rooftop", emoji: "🌃", icon: <Sunset className="w-5 h-5" />, desc: "Skyline lounge", gradient: "from-slate-500 to-gray-500" },
    { id: "theater", name: "Theater", emoji: "🎭", icon: <Theater className="w-5 h-5" />, desc: "Watch parties & stage", gradient: "from-red-500 to-rose-500" },
    { id: "blank", name: "Blank", emoji: "🎨", icon: <Brush className="w-5 h-5" />, desc: "Build from scratch", gradient: "from-gray-400 to-slate-400" },
];

const ZONE_QUICKLINKS = [
    { name: "Lobby", emoji: "🏛️", desc: "Welcome area", color: "bg-amber-50 border-amber-200 text-amber-700" },
    { name: "Workspace", emoji: "🖥️", desc: "Open desks", color: "bg-emerald-50 border-emerald-200 text-emerald-700" },
    { name: "Meeting", emoji: "📹", desc: "Video rooms", color: "bg-blue-50 border-blue-200 text-blue-700" },
    { name: "Café", emoji: "☕", desc: "Break room", color: "bg-orange-50 border-orange-200 text-orange-700" },
    { name: "Library", emoji: "📖", desc: "Quiet zone", color: "bg-yellow-50 border-yellow-200 text-yellow-700" },
    { name: "Gaming", emoji: "🎮", desc: "Fun zone", color: "bg-cyan-50 border-cyan-200 text-cyan-700" },
    { name: "Stage", emoji: "🎤", desc: "Presentations", color: "bg-green-50 border-green-200 text-green-700" },
    { name: "Rooftop", emoji: "🌳", desc: "Garden", color: "bg-lime-50 border-lime-200 text-lime-700" },
];

export default function DashboardPage() {
    const router = useRouter();
    const { isLoaded, isSignedIn, user } = useUser();
    const { rooms, fetchRooms, addRoom, deleteRoom } = useSpacesStore();
    const addToast = useToastStore(s => s.addToast);
    const [search, setSearch] = useState("");
    const [showCreate, setShowCreate] = useState(false);
    const [createStep, setCreateStep] = useState(1);
    const [newName, setNewName] = useState("");
    const [newDesc, setNewDesc] = useState("");
    const [newTemplate, setNewTemplate] = useState<RoomTemplate>("office");
    const [newVisibility, setNewVisibility] = useState<"public" | "private">("public");
    const [newCapacity, setNewCapacity] = useState(25);
    const [newPassword, setNewPassword] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    // Fetch rooms from API on mount
    useEffect(() => {
        fetchRooms();
    }, [fetchRooms]);

    const filteredRooms = rooms.filter(
        (r) => r.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleCreateSpace = async () => {
        if (!newName) return;
        setIsCreating(true);
        try {
            const room = await addRoom(newName, newDesc, newTemplate, newVisibility, newCapacity, newPassword || undefined);
            setShowCreate(false);
            resetCreateForm();
            addToast(`"${room.name}" created successfully!`, "success");
            router.push(`/room/${room.id}`);
        } catch {
            addToast("Failed to create room. Please try again.", "error");
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeleteRoom = async (id: string, name: string) => {
        await deleteRoom(id);
        addToast(`"${name}" has been deleted.`, "info");
    };

    const resetCreateForm = () => {
        setCreateStep(1);
        setNewName("");
        setNewDesc("");
        setNewTemplate("office");
        setNewVisibility("public");
        setNewCapacity(25);
        setNewPassword("");
    };

    const selectedTemplate = TEMPLATE_OPTIONS.find(t => t.id === newTemplate)!;

    if (!isLoaded) {
        return (
            <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent"
                />
            </div>
        );
    }

    if (!isSignedIn || !user) {
        router.push("/");
        return null;
    }

    return (
        <div className="min-h-screen bg-[#FAFAF8] flex flex-col">
            {/* Top bar */}
            <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 overflow-hidden">
                            <Image src="/header-logo.png" alt="Huddly" width={32} height={32} className="object-cover" />
                        </div>
                        <span className="text-lg font-bold text-gray-900">Huddly</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <UserButton signInUrl="/" />
                            <span className="hidden sm:block text-sm text-gray-700">{user.firstName || user.username || "User"}</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                {/* Hero Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 p-8 sm:p-10 mb-8 shadow-xl shadow-emerald-500/15"
                >
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 70% 30%, rgba(255,255,255,0.3), transparent 60%)" }} />
                    <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                        <div>
                            <motion.h1
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-3xl sm:text-4xl font-black text-white mb-2"
                            >
                                Welcome back, {user.firstName || user.username || "User"} 👋
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                                className="text-emerald-100 text-lg"
                            >
                                Step into your virtual office — everyone&apos;s waiting!
                            </motion.p>
                        </div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4, type: "spring" }}
                        >
                            <Link href="/room/office" className="shrink-0">
                                <Button className="bg-white text-emerald-700 hover:bg-emerald-50 shadow-xl px-6 py-3 text-base gap-2 font-bold">
                                    Enter Office <ArrowRight className="w-5 h-5" />
                                </Button>
                            </Link>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Zone Quick Links */}
                <div className="mb-8">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Office Zones</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {ZONE_QUICKLINKS.map((zone, i) => (
                            <motion.div
                                key={zone.name}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                whileHover={{ scale: 1.03, y: -2 }}
                            >
                                <Link href="/room/office" className={`block p-4 rounded-xl border ${zone.color} hover:shadow-md transition-all`}>
                                    <span className="text-xl mb-1 block">{zone.emoji}</span>
                                    <span className="font-semibold text-sm">{zone.name}</span>
                                    <span className="block text-xs opacity-70">{zone.desc}</span>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Spaces section header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <h2 className="text-lg font-bold text-gray-900">Your Spaces</h2>
                    <Dialog open={showCreate} onOpenChange={(open) => { setShowCreate(open); if (!open) resetCreateForm(); }}>
                        <DialogTrigger asChild>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button className="gap-2" size="sm">
                                    <Plus className="w-4 h-4" />
                                    New Space
                                </Button>
                            </motion.div>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg p-0 overflow-hidden">
                            {/* Step indicator */}
                            <div className="flex items-center gap-2 px-6 pt-6 pb-2">
                                {[1, 2, 3].map((step) => (
                                    <div key={step} className="flex items-center gap-2 flex-1">
                                        <motion.div
                                            animate={{
                                                backgroundColor: createStep >= step ? "rgb(16, 185, 129)" : "rgb(229, 231, 235)",
                                                scale: createStep === step ? 1.1 : 1,
                                            }}
                                            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                                        >
                                            {createStep > step ? <Check className="w-3.5 h-3.5" /> : step}
                                        </motion.div>
                                        {step < 3 && (
                                            <motion.div
                                                animate={{ backgroundColor: createStep > step ? "rgb(16, 185, 129)" : "rgb(229, 231, 235)" }}
                                                className="h-0.5 flex-1 rounded-full"
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>

                            <AnimatePresence mode="wait">
                                {/* Step 1: Choose Template */}
                                {createStep === 1 && (
                                    <motion.div
                                        key="step1"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="p-6"
                                    >
                                        <h3 className="text-lg font-bold text-gray-900 mb-1">Choose a Template</h3>
                                        <p className="text-sm text-gray-500 mb-5">Pick a starting layout for your virtual space</p>
                                        <div className="grid grid-cols-2 gap-2.5 max-h-[320px] overflow-y-auto pr-1">
                                            {TEMPLATE_OPTIONS.map((t) => (
                                                <motion.button
                                                    key={t.id}
                                                    whileHover={{ scale: 1.03, y: -2 }}
                                                    whileTap={{ scale: 0.97 }}
                                                    onClick={() => setNewTemplate(t.id)}
                                                    className={`relative p-4 rounded-xl border-2 text-left transition-all ${newTemplate === t.id
                                                            ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/20"
                                                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                                        }`}
                                                >
                                                    {newTemplate === t.id && (
                                                        <motion.div
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: 1 }}
                                                            className="absolute top-2 right-2 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center"
                                                        >
                                                            <Check className="w-3 h-3 text-white" />
                                                        </motion.div>
                                                    )}
                                                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${t.gradient} flex items-center justify-center text-white mb-2 shadow-sm`}>
                                                        {t.icon}
                                                    </div>
                                                    <span className="font-semibold text-sm text-gray-900 block">{t.name}</span>
                                                    <span className="text-[11px] text-gray-500">{t.desc}</span>
                                                </motion.button>
                                            ))}
                                        </div>
                                        <Button
                                            className="w-full mt-4 gap-2"
                                            onClick={() => setCreateStep(2)}
                                        >
                                            Continue <ChevronRight className="w-4 h-4" />
                                        </Button>
                                    </motion.div>
                                )}

                                {/* Step 2: Configure */}
                                {createStep === 2 && (
                                    <motion.div
                                        key="step2"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="p-6"
                                    >
                                        <h3 className="text-lg font-bold text-gray-900 mb-1">Configure Your Space</h3>
                                        <p className="text-sm text-gray-500 mb-5">Set the details for your {selectedTemplate.name} space</p>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-sm text-gray-600 mb-1.5 block font-medium">Space Name *</label>
                                                <Input
                                                    placeholder={`e.g., Team ${selectedTemplate.name}`}
                                                    value={newName}
                                                    onChange={(e) => setNewName(e.target.value)}
                                                    className="focus:ring-emerald-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm text-gray-600 mb-1.5 block font-medium">Description</label>
                                                <Input
                                                    placeholder="What's this space for?"
                                                    value={newDesc}
                                                    onChange={(e) => setNewDesc(e.target.value)}
                                                />
                                            </div>
                                            <div className="flex gap-4">
                                                <div className="flex-1">
                                                    <label className="text-sm text-gray-600 mb-1.5 block font-medium">Visibility</label>
                                                    <div className="flex gap-2">
                                                        {(["public", "private"] as const).map(v => (
                                                            <motion.button
                                                                key={v}
                                                                whileTap={{ scale: 0.95 }}
                                                                onClick={() => setNewVisibility(v)}
                                                                className={`flex-1 p-2.5 rounded-xl border text-sm flex items-center justify-center gap-2 transition-all capitalize font-medium ${newVisibility === v
                                                                        ? "border-emerald-500 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500/20"
                                                                        : "border-gray-200 text-gray-500 hover:bg-gray-50"
                                                                    }`}
                                                            >
                                                                {v === "public" ? <Globe className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                                                                {v}
                                                            </motion.button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <label className="text-sm text-gray-600 mb-1.5 block font-medium">Capacity: {newCapacity}</label>
                                                    <input
                                                        type="range"
                                                        min={8}
                                                        max={100}
                                                        value={newCapacity}
                                                        onChange={(e) => setNewCapacity(Number(e.target.value))}
                                                        className="w-full accent-emerald-600 mt-2"
                                                    />
                                                </div>
                                            </div>
                                            {newVisibility === "private" && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: "auto" }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                >
                                                    <label className="text-sm text-gray-600 mb-1.5 block font-medium flex items-center gap-1.5">
                                                        <KeyRound className="w-3.5 h-3.5" />
                                                        Room Password (optional)
                                                    </label>
                                                    <Input
                                                        type="password"
                                                        placeholder="Leave blank for invite-only"
                                                        value={newPassword}
                                                        onChange={(e) => setNewPassword(e.target.value)}
                                                    />
                                                </motion.div>
                                            )}
                                        </div>
                                        <div className="flex gap-3 mt-5">
                                            <Button variant="outline" onClick={() => setCreateStep(1)} className="flex-1">Back</Button>
                                            <Button
                                                onClick={() => setCreateStep(3)}
                                                disabled={!newName.trim()}
                                                className="flex-1 gap-2"
                                            >
                                                Review <ChevronRight className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Step 3: Confirm */}
                                {createStep === 3 && (
                                    <motion.div
                                        key="step3"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="p-6"
                                    >
                                        <h3 className="text-lg font-bold text-gray-900 mb-1">Ready to Create!</h3>
                                        <p className="text-sm text-gray-500 mb-5">Review your space settings</p>

                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="rounded-2xl border border-gray-200 overflow-hidden"
                                        >
                                            <div className={`h-24 bg-gradient-to-br ${selectedTemplate.gradient} relative flex items-center justify-center`}>
                                                <span className="text-4xl opacity-60">{selectedTemplate.emoji}</span>
                                                <div className="absolute bottom-2 right-2">
                                                    <Badge variant="secondary" className="bg-white/80 backdrop-blur text-xs">{selectedTemplate.name}</Badge>
                                                </div>
                                            </div>
                                            <div className="p-4 space-y-2">
                                                <h4 className="font-bold text-gray-900">{newName || "Untitled Space"}</h4>
                                                {newDesc && <p className="text-sm text-gray-500">{newDesc}</p>}
                                                <div className="flex items-center gap-4 text-xs text-gray-400 pt-1">
                                                    <span className="flex items-center gap-1">
                                                        {newVisibility === "public" ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                                                        {newVisibility}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Users className="w-3 h-3" /> {newCapacity} max
                                                    </span>
                                                </div>
                                            </div>
                                        </motion.div>

                                        <div className="flex gap-3 mt-5">
                                            <Button variant="outline" onClick={() => setCreateStep(2)} className="flex-1">Back</Button>
                                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                                                <Button
                                                    className="w-full gap-2"
                                                    onClick={handleCreateSpace}
                                                    disabled={isCreating}
                                                >
                                                    {isCreating ? (
                                                        <>
                                                            <motion.div
                                                                animate={{ rotate: 360 }}
                                                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                                className="w-4 h-4 rounded-full border-2 border-white border-t-transparent"
                                                            />
                                                            Creating...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Sparkles className="w-4 h-4" />
                                                            Create Space
                                                        </>
                                                    )}
                                                </Button>
                                            </motion.div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Search */}
                <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input placeholder="Search spaces..." className="pl-10 bg-white border-gray-200" value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>

                {/* Room cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredRooms.map((room, index) => {
                        const template = TEMPLATE_OPTIONS.find(t => t.id === room.template);
                        return (
                            <motion.div
                                key={room.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.04 }}
                                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                                className="group relative rounded-2xl border border-gray-200 bg-white overflow-hidden hover:border-gray-300 transition-all duration-300 hover:shadow-xl hover:shadow-gray-200/50"
                            >
                                <Link href={`/room/${room.id}`}>
                                    <div className={`h-32 bg-gradient-to-br ${template?.gradient || "from-emerald-100 to-teal-100"} relative overflow-hidden`}>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <motion.span
                                                className="text-4xl opacity-30 group-hover:opacity-50 transition-all"
                                                whileHover={{ scale: 1.2, rotate: 10 }}
                                            >
                                                {template?.emoji || "🏢"}
                                            </motion.span>
                                        </div>
                                        {room.onlineCount > 0 && (
                                            <div className="absolute top-3 right-3">
                                                <Badge variant="success" className="gap-1">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                                    {room.onlineCount} online
                                                </Badge>
                                            </div>
                                        )}
                                        <div className="absolute bottom-2 left-2">
                                            <Badge variant="secondary" className="bg-white/80 backdrop-blur text-[10px]">
                                                {template?.name || room.template}
                                            </Badge>
                                        </div>
                                    </div>
                                </Link>
                                <div className="p-4">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <Link href={`/room/${room.id}`}>
                                                <h3 className="text-gray-900 font-bold truncate hover:text-emerald-600 transition-colors">{room.name}</h3>
                                            </Link>
                                            <p className="text-gray-400 text-xs mt-0.5 truncate">{room.description}</p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => navigator.clipboard.writeText(`${window.location.origin}/room/${room.id}`).then(() => addToast("Invite link copied!", "success", 2000))}
                                                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                                                title="Copy invite link"
                                            >
                                                <Copy className="w-3.5 h-3.5" />
                                            </motion.button>
                                            {room.ownerId !== "system" && (
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => handleDeleteRoom(room.id, room.name)}
                                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Delete room"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </motion.button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                                        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {room.maxCapacity} max</span>
                                        <span className="flex items-center gap-1">{room.visibility === "public" ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />} {room.visibility}</span>
                                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {room.updatedAt instanceof Date ? room.updatedAt.toLocaleDateString() : new Date(room.updatedAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {filteredRooms.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-16"
                    >
                        <p className="text-gray-400 mb-4">No spaces found</p>
                        <Button onClick={() => setShowCreate(true)} variant="secondary">Create your first space</Button>
                    </motion.div>
                )}
            </main>
            <Footer />
        </div>
    );
}
