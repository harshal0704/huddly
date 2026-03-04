"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, MessageCircle, Users as UsersIcon, Hash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useRealtimeStore } from "@/stores/realtimeStore";

interface ChatSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ChatSidebar({ isOpen, onClose }: ChatSidebarProps) {
    const chatMessages = useRealtimeStore(s => s.chatMessages);
    const sendChat = useRealtimeStore(s => s.sendChat);
    const connected = useRealtimeStore(s => s.connected);

    const [input, setInput] = useState("");
    const [activeTab, setActiveTab] = useState<"global" | "proximity">("global");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatMessages]);

    const sendMessage = () => {
        if (!input.trim()) return;
        sendChat(input.trim(), activeTab);
        setInput("");
    };

    const filteredMessages = chatMessages.filter(
        (m) => m.type === activeTab || m.type === "system"
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ x: 320, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 320, opacity: 0 }}
                    transition={{ type: "spring", damping: 20, stiffness: 200 }}
                    className="fixed right-0 top-0 bottom-0 w-80 bg-white/95 backdrop-blur-xl border-l border-gray-200 z-30 flex flex-col"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 h-14 border-b border-gray-100">
                        <div className="flex items-center gap-2 text-gray-900 font-semibold">
                            <MessageCircle className="w-4 h-4 text-emerald-600" />
                            Chat
                            {!connected && (
                                <span className="text-[10px] text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded-full font-medium">
                                    Offline
                                </span>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-gray-100">
                        <button
                            onClick={() => setActiveTab("global")}
                            className={`flex-1 px-4 py-2.5 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${activeTab === "global"
                                ? "text-emerald-600 border-b-2 border-emerald-500"
                                : "text-gray-400 hover:text-gray-600"
                                }`}
                        >
                            <Hash className="w-3 h-3" />
                            Global
                        </button>
                        <button
                            onClick={() => setActiveTab("proximity")}
                            className={`flex-1 px-4 py-2.5 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${activeTab === "proximity"
                                ? "text-emerald-600 border-b-2 border-emerald-500"
                                : "text-gray-400 hover:text-gray-600"
                                }`}
                        >
                            <UsersIcon className="w-3 h-3" />
                            Nearby
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {filteredMessages.length === 0 && (
                            <div className="text-center text-xs text-gray-400 py-8">
                                No messages yet. Say hi! 👋
                            </div>
                        )}
                        {filteredMessages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`${msg.type === "system"
                                    ? "text-center text-xs text-gray-400 italic py-1"
                                    : ""
                                    }`}
                            >
                                {msg.type !== "system" && (
                                    <div className={`${msg.user === "You" ? "ml-auto max-w-[85%]" : "max-w-[85%]"}`}>
                                        <div className="flex items-baseline gap-2 mb-0.5">
                                            <span className={`text-xs font-semibold ${msg.user === "You" ? "text-emerald-600" : "text-gray-700"}`}>
                                                {msg.user}
                                            </span>
                                            <span className="text-[10px] text-gray-400">{msg.time}</span>
                                        </div>
                                        <div className={`px-3 py-1.5 rounded-xl text-sm ${msg.user === "You"
                                            ? "bg-emerald-50 text-emerald-800 rounded-tr-sm"
                                            : "bg-gray-50 text-gray-700 rounded-tl-sm"
                                            }`}>
                                            {msg.text}
                                        </div>
                                    </div>
                                )}
                                {msg.type === "system" && <span>{msg.text}</span>}
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-3 border-t border-gray-100">
                        <div className="flex gap-2">
                            <Input
                                placeholder={`Message ${activeTab === "proximity" ? "nearby" : "everyone"}...`}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                                className="flex-1 h-9 text-xs bg-gray-50 border-gray-200"
                                disabled={!connected}
                            />
                            <button
                                onClick={sendMessage}
                                disabled={!connected}
                                className="p-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white rounded-lg transition-colors"
                            >
                                <Send className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

