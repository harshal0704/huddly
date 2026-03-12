"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, MessageCircle, Users as UsersIcon, Hash, ChevronDown, Smile } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useRealtimeStore } from "@/stores/realtimeStore";

interface ChatSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const QUICK_REACTIONS = ["👍", "❤️", "😂", "🎉", "🤔", "👀"];

export default function ChatSidebar({ isOpen, onClose }: ChatSidebarProps) {
    const chatMessages = useRealtimeStore(s => s.chatMessages);
    const sendChat = useRealtimeStore(s => s.sendChat);
    const connected = useRealtimeStore(s => s.connected);
    const typingUsers = useRealtimeStore(s => s.typingUsers);
    const setTyping = useRealtimeStore(s => s.setTyping);
    const addReaction = useRealtimeStore(s => s.addReaction);

    const [input, setInput] = useState("");
    const [activeTab, setActiveTab] = useState<"global" | "proximity">("global");
    const [showScrollButton, setShowScrollButton] = useState(false);
    const [reactingMessageId, setReactingMessageId] = useState<string | null>(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isAtBottomRef = useRef(true);

    // Auto-scroll when new messages + user is at bottom
    useEffect(() => {
        if (isAtBottomRef.current) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
            // eslint-disable-next-line
            setUnreadCount(0);
        } else {
            // eslint-disable-next-line
            setUnreadCount(prev => prev + 1);
        }
    }, [chatMessages]);

    // Reset unread when opened
    useEffect(() => {
        // eslint-disable-next-line
        if (isOpen) setUnreadCount(0);
    }, [isOpen]);

    const handleScroll = useCallback(() => {
        const container = scrollContainerRef.current;
        if (!container) return;
        const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 60;
        isAtBottomRef.current = isNearBottom;
        setShowScrollButton(!isNearBottom);
        if (isNearBottom) setUnreadCount(0);
    }, []);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        setUnreadCount(0);
    }, []);

    const sendMessage = () => {
        if (!input.trim()) return;
        sendChat(input.trim(), activeTab);
        setInput("");
        setTyping(false);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };

    const handleInputChange = (value: string) => {
        setInput(value);
        // Typing indicator
        setTyping(true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setTyping(false), 2000);
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
                    transition={{ type: "spring", damping: 22, stiffness: 250 }}
                    className="fixed right-0 top-0 bottom-0 w-80 bg-white/98 backdrop-blur-xl border-l border-gray-200/60 z-30 flex flex-col shadow-2xl shadow-black/5"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 h-14 border-b border-gray-100">
                        <div className="flex items-center gap-2 text-gray-900 font-semibold">
                            <MessageCircle className="w-4 h-4 text-emerald-600" />
                            Chat
                            {!connected && (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="text-[10px] text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded-full font-medium"
                                >
                                    Offline
                                </motion.span>
                            )}
                            {unreadCount > 0 && !isOpen && (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="text-[10px] text-white bg-red-500 px-1.5 py-0.5 rounded-full font-bold min-w-[18px] text-center"
                                >
                                    {unreadCount}
                                </motion.span>
                            )}
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={onClose}
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                        >
                            <X className="w-4 h-4" />
                        </motion.button>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-gray-100 relative">
                        {(["global", "proximity"] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 px-4 py-2.5 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors relative ${activeTab === tab
                                    ? "text-emerald-600"
                                    : "text-gray-400 hover:text-gray-600"
                                    }`}
                            >
                                {tab === "global" ? <Hash className="w-3 h-3" /> : <UsersIcon className="w-3 h-3" />}
                                {tab === "global" ? "Global" : "Nearby"}
                                {activeTab === tab && (
                                    <motion.div
                                        layoutId="chatTab"
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500"
                                        transition={{ type: "spring", damping: 20, stiffness: 300 }}
                                    />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Messages */}
                    <div
                        ref={scrollContainerRef}
                        className="flex-1 overflow-y-auto p-4 space-y-2 relative"
                        onScroll={handleScroll}
                    >
                        {filteredMessages.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center text-xs text-gray-400 py-8"
                            >
                                No messages yet. Say hi! 👋
                            </motion.div>
                        )}
                        <AnimatePresence initial={false}>
                            {filteredMessages.map((msg, i) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ duration: 0.2 }}
                                    className={`${msg.type === "system"
                                        ? "text-center text-[11px] text-gray-400 italic py-1"
                                        : ""
                                        }`}
                                >
                                    {msg.type !== "system" && (
                                        <div
                                            className={`group ${msg.user === "You" ? "ml-auto max-w-[85%]" : "max-w-[85%]"}`}
                                        >
                                            <div className="flex items-baseline gap-2 mb-0.5">
                                                <span className={`text-xs font-semibold ${msg.user === "You" ? "text-emerald-600" : "text-gray-700"
                                                    }`}>
                                                    {msg.user}
                                                </span>
                                                <span className="text-[10px] text-gray-400">{msg.time}</span>
                                            </div>
                                            <div className={`px-3 py-1.5 rounded-xl text-sm relative ${msg.user === "You"
                                                ? "bg-emerald-50 text-emerald-800 rounded-tr-sm"
                                                : "bg-gray-50 text-gray-700 rounded-tl-sm"
                                                }`}>
                                                {msg.text}
                                                {/* Reaction button */}
                                                <button
                                                    onClick={() => setReactingMessageId(
                                                        reactingMessageId === msg.id ? null : msg.id
                                                    )}
                                                    className="absolute -right-1 -top-1 opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm"
                                                >
                                                    <Smile className="w-3 h-3 text-gray-400" />
                                                </button>
                                            </div>
                                            {/* Reactions display */}
                                            {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {Object.entries(msg.reactions).map(([emoji, users]) => (
                                                        <button
                                                            key={emoji}
                                                            onClick={() => addReaction(msg.id, emoji)}
                                                            className={`text-[11px] px-1.5 py-0.5 rounded-full border transition-all ${(users as string[]).includes("You")
                                                                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                                                                : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"
                                                                }`}
                                                        >
                                                            {emoji} {(users as string[]).length}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                            {/* Reaction picker */}
                                            <AnimatePresence>
                                                {reactingMessageId === msg.id && (
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0.8, y: -5 }}
                                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                                        exit={{ opacity: 0, scale: 0.8, y: -5 }}
                                                        className="flex gap-1 mt-1 p-1 rounded-lg bg-white border border-gray-200 shadow-lg w-fit"
                                                    >
                                                        {QUICK_REACTIONS.map((emoji) => (
                                                            <button
                                                                key={emoji}
                                                                onClick={() => {
                                                                    addReaction(msg.id, emoji);
                                                                    setReactingMessageId(null);
                                                                }}
                                                                className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors text-sm"
                                                            >
                                                                {emoji}
                                                            </button>
                                                        ))}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    )}
                                    {msg.type === "system" && <span>{msg.text}</span>}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Scroll to bottom button */}
                    <AnimatePresence>
                        {showScrollButton && (
                            <motion.button
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                onClick={scrollToBottom}
                                className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10 px-3 py-1.5 rounded-full bg-gray-900/80 text-white text-xs font-medium flex items-center gap-1.5 shadow-lg backdrop-blur-sm"
                            >
                                <ChevronDown className="w-3 h-3" />
                                {unreadCount > 0 ? `${unreadCount} new` : "Scroll down"}
                            </motion.button>
                        )}
                    </AnimatePresence>

                    {/* Typing indicator */}
                    <AnimatePresence>
                        {typingUsers.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="px-4 py-1"
                            >
                                <div className="text-xs text-gray-400 flex items-center gap-1.5">
                                    <div className="flex gap-0.5">
                                        {[0, 1, 2].map((i) => (
                                            <motion.span
                                                key={i}
                                                animate={{ opacity: [0.3, 1, 0.3] }}
                                                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                                                className="w-1 h-1 rounded-full bg-gray-400"
                                            />
                                        ))}
                                    </div>
                                    <span>
                                        {typingUsers.length === 1
                                            ? `${typingUsers[0]} is typing`
                                            : `${typingUsers.length} people typing`}
                                    </span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Input */}
                    <div className="p-3 border-t border-gray-100">
                        <div className="flex gap-2">
                            <Input
                                placeholder={`Message ${activeTab === "proximity" ? "nearby" : "everyone"}...`}
                                value={input}
                                onChange={(e) => handleInputChange(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                                className="flex-1 h-9 text-xs bg-gray-50 border-gray-200 focus:ring-emerald-500 focus:border-emerald-500"
                                disabled={!connected}
                            />
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={sendMessage}
                                disabled={!connected}
                                className="p-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white rounded-lg transition-colors"
                            >
                                <Send className="w-3.5 h-3.5" />
                            </motion.button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
