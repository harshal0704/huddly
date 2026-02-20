"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    Plus, Users, Clock, MoreVertical, Copy, QrCode,
    LogOut, Settings, Crown, Globe, Lock, Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger
} from "@/components/ui/dialog";
import { useAuthStore } from "@/stores/authStore";
import { useSpacesStore } from "@/stores/spacesStore";
import Footer from "@/components/shared/Footer";
import type { RoomTemplate } from "@/types";

const TEMPLATE_OPTIONS: { value: RoomTemplate; label: string; emoji: string }[] = [
    { value: "classroom", label: "Classroom", emoji: "📚" },
    { value: "office", label: "Office", emoji: "🏢" },
    { value: "cafe", label: "Café", emoji: "☕" },
    { value: "conference", label: "Conference", emoji: "🎤" },
    { value: "party", label: "Party Island", emoji: "🎉" },
    { value: "blank", label: "Blank Canvas", emoji: "🎨" },
];

export default function DashboardPage() {
    const router = useRouter();
    const { user, logout } = useAuthStore();
    const { rooms, addRoom, deleteRoom, duplicateRoom } = useSpacesStore();
    const [search, setSearch] = useState("");
    const [showCreate, setShowCreate] = useState(false);

    // Create space form
    const [newName, setNewName] = useState("");
    const [newDesc, setNewDesc] = useState("");
    const [newTemplate, setNewTemplate] = useState<RoomTemplate>("classroom");
    const [newVisibility, setNewVisibility] = useState<"public" | "private">("public");
    const [newCapacity, setNewCapacity] = useState(25);

    const filteredRooms = rooms.filter(
        (r) => r.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleCreateSpace = () => {
        if (!newName) return;
        const room = addRoom(newName, newDesc, newTemplate, newVisibility, newCapacity);
        setShowCreate(false);
        setNewName("");
        setNewDesc("");
        router.push(`/room/${room.id}`);
    };

    const handleLogout = () => {
        logout();
        router.push("/");
    };

    // If not authenticated, redirect
    if (!user) {
        return (
            <div className="min-h-screen bg-[#030014] flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-white mb-4">Please log in first</h1>
                    <Link href="/login">
                        <Button>Go to Login</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#030014] flex flex-col">
            {/* Top bar */}
            <header className="sticky top-0 z-40 bg-gray-950/80 backdrop-blur-xl border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                            <span className="text-sm">🏠</span>
                        </div>
                        <span className="text-lg font-bold text-white">Huddly</span>
                    </Link>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="hidden sm:block text-sm text-gray-300">{user.name}</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                            title="Log out"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main */}
            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                {/* Welcome + actions */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-white mb-1">
                            Welcome, {user.name} 👋
                        </h1>
                        <p className="text-gray-400">Your virtual spaces</p>
                    </div>

                    <Dialog open={showCreate} onOpenChange={setShowCreate}>
                        <DialogTrigger asChild>
                            <Button className="gap-2">
                                <Plus className="w-4 h-4" />
                                Create New Space
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg">
                            <DialogHeader>
                                <DialogTitle>Create a New Space</DialogTitle>
                                <DialogDescription>Design your perfect virtual world</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 mt-2">
                                <div>
                                    <label className="text-sm text-gray-400 mb-1.5 block">Space Name</label>
                                    <Input
                                        placeholder="e.g., Team Standups"
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-400 mb-1.5 block">Description</label>
                                    <Input
                                        placeholder="What's this space for?"
                                        value={newDesc}
                                        onChange={(e) => setNewDesc(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-400 mb-2 block">Template</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {TEMPLATE_OPTIONS.map((t) => (
                                            <button
                                                key={t.value}
                                                onClick={() => setNewTemplate(t.value)}
                                                className={`p-3 rounded-xl border text-center transition-all ${newTemplate === t.value
                                                        ? "border-violet-500 bg-violet-500/10 text-white"
                                                        : "border-white/10 bg-white/5 text-gray-400 hover:border-white/20"
                                                    }`}
                                            >
                                                <span className="text-xl block mb-1">{t.emoji}</span>
                                                <span className="text-xs">{t.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label className="text-sm text-gray-400 mb-1.5 block">Visibility</label>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setNewVisibility("public")}
                                                className={`flex-1 p-2 rounded-lg border text-sm flex items-center justify-center gap-2 transition-all ${newVisibility === "public"
                                                        ? "border-violet-500 bg-violet-500/10 text-white"
                                                        : "border-white/10 text-gray-400"
                                                    }`}
                                            >
                                                <Globe className="w-3.5 h-3.5" />
                                                Public
                                            </button>
                                            <button
                                                onClick={() => setNewVisibility("private")}
                                                className={`flex-1 p-2 rounded-lg border text-sm flex items-center justify-center gap-2 transition-all ${newVisibility === "private"
                                                        ? "border-violet-500 bg-violet-500/10 text-white"
                                                        : "border-white/10 text-gray-400"
                                                    }`}
                                            >
                                                <Lock className="w-3.5 h-3.5" />
                                                Private
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-sm text-gray-400 mb-1.5 block">Capacity: {newCapacity}</label>
                                        <input
                                            type="range"
                                            min={8}
                                            max={100}
                                            value={newCapacity}
                                            onChange={(e) => setNewCapacity(Number(e.target.value))}
                                            className="w-full accent-violet-500"
                                        />
                                    </div>
                                </div>
                                <Button className="w-full" onClick={handleCreateSpace}>
                                    Create Space
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Search */}
                <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input
                        placeholder="Search spaces..."
                        className="pl-10"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* Room cards grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredRooms.map((room, index) => (
                        <motion.div
                            key={room.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="group relative rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden hover:border-white/20 transition-all duration-300 hover:shadow-xl hover:shadow-violet-500/5"
                        >
                            {/* Thumbnail */}
                            <Link href={`/room/${room.id}`}>
                                <div className={`h-36 bg-gradient-to-br ${room.template === "classroom" ? "from-blue-900/50 to-indigo-900/50" :
                                        room.template === "office" ? "from-emerald-900/50 to-teal-900/50" :
                                            room.template === "cafe" ? "from-amber-900/50 to-orange-900/50" :
                                                room.template === "conference" ? "from-violet-900/50 to-purple-900/50" :
                                                    "from-pink-900/50 to-rose-900/50"
                                    } relative`}>
                                    <div className="absolute inset-0 opacity-20"
                                        style={{
                                            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                                            backgroundSize: "24px 24px",
                                        }}
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-3xl opacity-40 group-hover:opacity-60 group-hover:scale-110 transition-all">
                                            {room.template === "classroom" ? "📚" : room.template === "office" ? "🏢" : room.template === "cafe" ? "☕" : room.template === "conference" ? "🎤" : "🎉"}
                                        </span>
                                    </div>
                                    {/* Online badge */}
                                    {room.onlineCount > 0 && (
                                        <div className="absolute top-3 right-3">
                                            <Badge variant="success" className="gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                                {room.onlineCount} online
                                            </Badge>
                                        </div>
                                    )}
                                    {/* Owner crown */}
                                    {room.ownerId === user.id && (
                                        <div className="absolute top-3 left-3">
                                            <Crown className="w-4 h-4 text-amber-400" />
                                        </div>
                                    )}
                                </div>
                            </Link>

                            {/* Info */}
                            <div className="p-4">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <Link href={`/room/${room.id}`}>
                                            <h3 className="text-white font-bold truncate hover:text-violet-300 transition-colors">
                                                {room.name}
                                            </h3>
                                        </Link>
                                        <p className="text-gray-500 text-xs mt-0.5 truncate">{room.description}</p>
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => navigator.clipboard.writeText(`${window.location.origin}/room/${room.id}`)}
                                            className="p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                                            title="Copy invite link"
                                        >
                                            <Copy className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => duplicateRoom(room.id)}
                                            className="p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                                            title="Duplicate"
                                        >
                                            <MoreVertical className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <Users className="w-3 h-3" />
                                        {room.maxCapacity} max
                                    </span>
                                    <span className="flex items-center gap-1">
                                        {room.visibility === "public" ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                                        {room.visibility}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {room.updatedAt instanceof Date ? room.updatedAt.toLocaleDateString() : new Date(room.updatedAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {filteredRooms.length === 0 && (
                    <div className="text-center py-16">
                        <p className="text-gray-500 mb-4">No spaces found</p>
                        <Button onClick={() => setShowCreate(true)} variant="secondary">
                            Create your first space
                        </Button>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
