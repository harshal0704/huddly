"use client";

import React, { useState, useCallback, use } from "react";
import { motion } from "framer-motion";
import PhaserGame from "@/game/PhaserGame";
import { createRoomScene } from "@/game/scenes/RoomScene";
import type { MapTemplate } from "@/game/scenes/RoomScene";
import ChatSidebar from "@/components/room/ChatSidebar";
import EmoteWheel from "@/components/room/EmoteWheel";
import ParticipantsList from "@/components/room/ParticipantsList";
import Minimap from "@/components/room/Minimap";
import RoomToolbar from "@/components/room/RoomToolbar";
import VideoCallPanel from "@/components/room/VideoCallPanel";
import WhiteboardPanel from "@/components/room/WhiteboardPanel";
import BroadcastPanel from "@/components/room/BroadcastPanel";
import { useMediaStream } from "@/hooks/useMediaStream";

// Demo room metadata
const DEMO_ROOMS: Record<string, { name: string; template: MapTemplate; online: number }> = {
    demo: { name: "Demo Classroom", template: "classroom", online: 9 },
    office: { name: "Team Office", template: "office", online: 5 },
    cafe: { name: "Coffee Lounge", template: "cafe", online: 7 },
    conference: { name: "Tech Talk Hall", template: "conference", online: 12 },
    party: { name: "Friday Vibes 🎉", template: "party", online: 15 },
};

interface RoomPageProps {
    params: Promise<{ id: string }>;
}

export default function RoomPage({ params }: RoomPageProps) {
    const { id } = use(params);
    const roomInfo = DEMO_ROOMS[id] || DEMO_ROOMS.demo;

    // Real media streams
    const media = useMediaStream();

    // UI panel states
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
    const [isMinimapOpen, setIsMinimapOpen] = useState(true);
    const [isEmoteOpen, setIsEmoteOpen] = useState(false);
    const [isVideoCallOpen, setIsVideoCallOpen] = useState(true);
    const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(false);
    const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);

    const handleEmoteSelect = useCallback((emoji: string) => {
        console.log("Emote selected:", emoji);
    }, []);

    const handleScreenShare = useCallback(() => {
        if (media.isScreenSharing) {
            media.stopScreenShare();
        } else {
            media.startScreenShare();
        }
    }, [media]);

    const sceneConfig = createRoomScene(roomInfo.template);

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
                    <span className="font-medium text-white">{roomInfo.name}</span>
                    <span className="text-gray-500">• {roomInfo.online} online</span>
                </div>
            </motion.div>

            {/* Media error banner */}
            {media.error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="fixed top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-red-600/90 backdrop-blur-sm text-white text-xs font-medium max-w-sm text-center"
                >
                    {media.error}
                </motion.div>
            )}

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

            {/* Overlay UI — all panels can be open simultaneously */}
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

            {/* Video Call Panel — shows real webcam */}
            <VideoCallPanel
                isOpen={isVideoCallOpen}
                onClose={() => setIsVideoCallOpen(false)}
                localStream={media.localStream}
                screenStream={media.screenStream}
                isMuted={media.isMuted}
                isCameraOff={media.isCameraOff}
                onStartMedia={media.startMedia}
            />

            {/* Whiteboard Panel */}
            <WhiteboardPanel
                isOpen={isWhiteboardOpen}
                onClose={() => setIsWhiteboardOpen(false)}
            />

            {/* Broadcast Panel — shows real camera/screen */}
            <BroadcastPanel
                isOpen={isBroadcastOpen}
                onClose={() => setIsBroadcastOpen(false)}
                localStream={media.localStream}
                screenStream={media.screenStream}
                isMuted={media.isMuted}
                isCameraOff={media.isCameraOff}
                isScreenSharing={media.isScreenSharing}
                onToggleMute={media.toggleMute}
                onToggleCamera={media.toggleCamera}
                onStartScreenShare={media.startScreenShare}
                onStopScreenShare={media.stopScreenShare}
                onStartMedia={media.startMedia}
            />

            {/* Bottom toolbar — controls real media tracks */}
            <RoomToolbar
                isMuted={media.isMuted}
                isCameraOff={media.isCameraOff}
                isChatOpen={isChatOpen}
                isParticipantsOpen={isParticipantsOpen}
                isMinimapOpen={isMinimapOpen}
                isVideoCallOpen={isVideoCallOpen}
                isWhiteboardOpen={isWhiteboardOpen}
                isBroadcastOpen={isBroadcastOpen}
                onToggleMute={media.toggleMute}
                onToggleCamera={media.toggleCamera}
                onToggleChat={() => setIsChatOpen(!isChatOpen)}
                onToggleParticipants={() => setIsParticipantsOpen(!isParticipantsOpen)}
                onToggleMinimap={() => setIsMinimapOpen(!isMinimapOpen)}
                onToggleEmote={() => setIsEmoteOpen(!isEmoteOpen)}
                onScreenShare={handleScreenShare}
                onToggleVideoCall={() => setIsVideoCallOpen(!isVideoCallOpen)}
                onToggleWhiteboard={() => setIsWhiteboardOpen(!isWhiteboardOpen)}
                onToggleBroadcast={() => setIsBroadcastOpen(!isBroadcastOpen)}
            />
        </div>
    );
}
