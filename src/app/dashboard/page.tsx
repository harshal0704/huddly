"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    Plus, Users, Clock, Copy, LogOut, Settings,
    Globe, Lock, Search, ArrowRight, Palette
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger
} from "@/components/ui/dialog";
import { useUser, UserButton } from "@clerk/nextjs";
import { useSpacesStore } from "@/stores/spacesStore";
import Footer from "@/components/shared/Footer";
import type { RoomTemplate } from "@/types";

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
    const { rooms, addRoom, deleteRoom, duplicateRoom } = useSpacesStore();
    const [search, setSearch] = useState("");
    const [showCreate, setShowCreate] = useState(false);
    const [newName, setNewName] = useState("");
    const [newDesc, setNewDesc] = useState("");
    const [newTemplate, setNewTemplate] = useState<RoomTemplate>("office");
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

    if (!isLoaded) {
        return <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">Loading...</div>;
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
                {/* Enter Office Hero Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 p-8 sm:p-10 mb-8 shadow-xl shadow-emerald-500/15"
                >
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 70% 30%, rgba(255,255,255,0.3), transparent 60%)" }} />
                    <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">
                                Welcome back, {user.firstName || user.username || "User"} 👋
                            </h1>
                            <p className="text-emerald-100 text-lg">Step into your virtual office — everyone&apos;s waiting!</p>
                        </div>
                        <Link href="/room/office" className="shrink-0">
                            <Button className="bg-white text-emerald-700 hover:bg-emerald-50 shadow-xl px-6 py-3 text-base gap-2 font-bold">
                                Enter Office <ArrowRight className="w-5 h-5" />
                            </Button>
                        </Link>
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

                {/* Spaces section */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <h2 className="text-lg font-bold text-gray-900">Your Spaces</h2>
                    <Dialog open={showCreate} onOpenChange={setShowCreate}>
                        <DialogTrigger asChild>
                            <Button className="gap-2" size="sm">
                                <Plus className="w-4 h-4" />
                                New Space
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg">
                            <DialogHeader>
                                <DialogTitle>Create a New Space</DialogTitle>
                                <DialogDescription>Design your perfect virtual world</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 mt-2">
                                <div>
                                    <label className="text-sm text-gray-600 mb-1.5 block">Space Name</label>
                                    <Input placeholder="e.g., Team Standups" value={newName} onChange={(e) => setNewName(e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-600 mb-1.5 block">Description</label>
                                    <Input placeholder="What's this space for?" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} />
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label className="text-sm text-gray-600 mb-1.5 block">Visibility</label>
                                        <div className="flex gap-2">
                                            {(["public", "private"] as const).map(v => (
                                                <button key={v} onClick={() => setNewVisibility(v)}
                                                    className={`flex-1 p-2 rounded-lg border text-sm flex items-center justify-center gap-2 transition-all capitalize ${newVisibility === v ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-gray-200 text-gray-500 hover:bg-gray-50"
                                                        }`}
                                                >
                                                    {v === "public" ? <Globe className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                                                    {v}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-sm text-gray-600 mb-1.5 block">Capacity: {newCapacity}</label>
                                        <input type="range" min={8} max={100} value={newCapacity} onChange={(e) => setNewCapacity(Number(e.target.value))} className="w-full accent-emerald-600" />
                                    </div>
                                </div>
                                <Button className="w-full" onClick={handleCreateSpace}>Create Space</Button>
                            </div>
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
                    {filteredRooms.map((room, index) => (
                        <motion.div
                            key={room.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="group relative rounded-2xl border border-gray-200 bg-white overflow-hidden hover:border-gray-300 transition-all duration-300 hover:shadow-lg"
                        >
                            <Link href={`/room/${room.id}`}>
                                <div className="h-32 bg-gradient-to-br from-emerald-100 to-teal-100 relative">
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-3xl opacity-40 group-hover:opacity-60 group-hover:scale-110 transition-all">🏢</span>
                                    </div>
                                    {room.onlineCount > 0 && (
                                        <div className="absolute top-3 right-3">
                                            <Badge variant="success" className="gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                                {room.onlineCount} online
                                            </Badge>
                                        </div>
                                    )}
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
                                    <button onClick={() => navigator.clipboard.writeText(`${window.location.origin}/room/${room.id}`)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all" title="Copy invite link">
                                        <Copy className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                                <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {room.maxCapacity} max</span>
                                    <span className="flex items-center gap-1">{room.visibility === "public" ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />} {room.visibility}</span>
                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {room.updatedAt instanceof Date ? room.updatedAt.toLocaleDateString() : new Date(room.updatedAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {filteredRooms.length === 0 && (
                    <div className="text-center py-16">
                        <p className="text-gray-400 mb-4">No spaces found</p>
                        <Button onClick={() => setShowCreate(true)} variant="secondary">Create your first space</Button>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}
