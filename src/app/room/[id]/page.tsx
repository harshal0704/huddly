"use client";

import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import PhaserGame from "@/game/PhaserGame";
import { createRoomScene } from "@/game/scenes/RoomScene";
import ChatSidebar from "@/components/room/ChatSidebar";
import EmoteWheel from "@/components/room/EmoteWheel";
import ParticipantsList from "@/components/room/ParticipantsList";
import Minimap from "@/components/room/Minimap";
import RoomToolbar from "@/components/room/RoomToolbar";

interface RoomPageProps {
    params: Promise<{ id: string }>;
}

export default function RoomPage({ params }: RoomPageProps) {
    const [isMuted, setIsMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
    const [isMinimapOpen, setIsMinimapOpen] = useState(true);
    const [isEmoteOpen, setIsEmoteOpen] = useState(false);
    const [showControls, setShowControls] = useState(true);

    const handleEmoteSelect = useCallback((emoji: string) => {
        console.log("Emote selected:", emoji);
        // In a real app, this would broadcast the emote to other players
    }, []);

    const sceneConfig = createRoomScene();

    return (
        <div className="relative w-screen h-screen bg-[#1a1025] overflow-hidden">
            {/* Room name badge */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="fixed top-4 left-1/2 -translate-x-1/2 z-20"
            >
                <div className="px-4 py-1.5 rounded-full bg-gray-950/80 backdrop-blur-sm border border-white/10 text-sm text-gray-300 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-medium text-white">Demo Classroom</span>
                    <span className="text-gray-500">• 9 online</span>
                </div>
            </motion.div>

            {/* Keyboard shortcuts hint */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 0.6, y: 0 }}
                transition={{ delay: 1 }}
                className="fixed top-4 left-4 z-20"
            >
                <div className="space-y-1 text-[10px] text-gray-500">
                    <div className="flex items-center gap-1.5">
                        <kbd className="px-1 py-0.5 rounded bg-white/5 border border-white/10 text-gray-400 font-mono">WASD</kbd>
                        <span>Move</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <kbd className="px-1 py-0.5 rounded bg-white/5 border border-white/10 text-gray-400 font-mono">Click</kbd>
                        <span>Walk to point</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <kbd className="px-1 py-0.5 rounded bg-white/5 border border-white/10 text-gray-400 font-mono">Space</kbd>
                        <span>Emote</span>
                    </div>
                </div>
            </motion.div>

            {/* Phaser game canvas (full screen) */}
            <div className="absolute inset-0">
                <PhaserGame sceneConfig={sceneConfig} className="w-full h-full" />
            </div>

            {/* Overlay UI */}
            <ParticipantsList isOpen={isParticipantsOpen} onClose={() => setIsParticipantsOpen(false)} />
            <ChatSidebar isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
            <EmoteWheel isOpen={isEmoteOpen} onSelect={handleEmoteSelect} onClose={() => setIsEmoteOpen(false)} />
            <Minimap
                isOpen={isMinimapOpen}
                playerX={0.4}
                playerY={0.65}
                mapWidth={40}
                mapHeight={30}
                npcs={[]}
            />

            {/* Bottom toolbar */}
            <RoomToolbar
                isMuted={isMuted}
                isCameraOff={isCameraOff}
                isChatOpen={isChatOpen}
                isParticipantsOpen={isParticipantsOpen}
                isMinimapOpen={isMinimapOpen}
                onToggleMute={() => setIsMuted(!isMuted)}
                onToggleCamera={() => setIsCameraOff(!isCameraOff)}
                onToggleChat={() => setIsChatOpen(!isChatOpen)}
                onToggleParticipants={() => setIsParticipantsOpen(!isParticipantsOpen)}
                onToggleMinimap={() => setIsMinimapOpen(!isMinimapOpen)}
                onToggleEmote={() => setIsEmoteOpen(!isEmoteOpen)}
                onScreenShare={() => console.log("Screen share")}
            />
        </div>
    );
}
