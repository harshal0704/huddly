"use client";

import React, { useState, useCallback, useEffect, use } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import ChatSidebar from "@/components/room/ChatSidebar";
import EmoteWheel from "@/components/room/EmoteWheel";
import ParticipantsList from "@/components/room/ParticipantsList";
import Minimap from "@/components/room/Minimap";
import RoomToolbar from "@/components/room/RoomToolbar";
import VideoCallPanel from "@/components/room/VideoCallPanel";
import WhiteboardPanel from "@/components/room/WhiteboardPanel";
import BroadcastPanel from "@/components/room/BroadcastPanel";
import MeetingRoomHUD from "@/components/room/MeetingRoomHUD";
import AvatarCustomizer from "@/components/room/AvatarCustomizer";
import RoomBuilder from "@/components/room/RoomBuilder";
import { useSpacesStore } from "@/stores/spacesStore";
import { useRealtimeStore } from "@/stores/realtimeStore";
import LiveKitWrapper from "@/components/room/LiveKitWrapper";
import { useUser } from "@clerk/nextjs";

const ThreeRoom = dynamic(() => import("@/game/three/ThreeRoom"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full flex items-center justify-center bg-white">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
                <span className="text-sm text-gray-400 font-medium">Loading 3D Office...</span>
            </div>
        </div>
    ),
});



const MEETING_ZONES = ["Meeting Room 1", "Meeting Room 2", "Meeting Room 3"];

interface RoomPageProps {
    params: Promise<{ id: string }>;
}

export default function RoomPage({ params }: RoomPageProps) {
    const { id } = use(params);
    const rooms = useSpacesStore((state) => state.rooms);
    const roomInfo = rooms.find((r) => r.id === id) || {
        name: "Huddly Office",
        onlineCount: 0,
        template: "office"
    };

    const playerCount = useRealtimeStore(s => s.players.size);

    const { user } = useUser();
    const userName = user?.firstName || user?.username || `Guest_${Math.floor(Math.random() * 1000)}`;

    // UI panel states
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
    const [isMinimapOpen, setIsMinimapOpen] = useState(true);
    const [isEmoteOpen, setIsEmoteOpen] = useState(false);
    const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);
    const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(false);
    const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
    const [isAvatarOpen, setIsAvatarOpen] = useState(false);
    const [isBuilderOpen, setIsBuilderOpen] = useState(false);
    const [currentZone, setCurrentZone] = useState("Lobby");

    const isInMeeting = MEETING_ZONES.includes(currentZone);

    const handleEmoteSelect = useCallback((emoji: string) => {
        console.log("Emote selected:", emoji);
    }, []);

    // Listen for object interaction events from ThreeRoom
    useEffect(() => {
        const handler = (e: Event) => {
            const detail = (e as CustomEvent).detail;
            if (detail.type === "broadcast") {
                setIsBroadcastOpen(true);
            } else if (detail.type === "whiteboard") {
                setIsWhiteboardOpen(true);
            }
        };
        window.addEventListener("huddly:interact", handler);
        return () => window.removeEventListener("huddly:interact", handler);
    }, []);

    // B key to toggle room builder
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key.toLowerCase() === "b" && !isChatOpen && !isWhiteboardOpen) {
                setIsBuilderOpen(prev => !prev);
            }
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [isChatOpen, isWhiteboardOpen]);

    return (
        <LiveKitWrapper roomId={id as string} userName={userName}>
            <div className="relative w-screen h-screen bg-white overflow-hidden">
                {/* Room name badge */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="fixed top-4 left-1/2 -translate-x-1/2 z-20"
                >
                    <div className="px-5 py-2 rounded-full bg-gray-900/70 backdrop-blur-xl border border-white/10 text-sm text-gray-300 flex items-center gap-3 shadow-lg">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="font-semibold text-white">{roomInfo.name}</span>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-400">{playerCount} online</span>
                    </div>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 0.7, y: 0 }}
                    transition={{ delay: 1.5 }}
                    className="fixed top-4 left-4 z-20"
                >
                    <div className="space-y-1.5 text-[10px] text-gray-500 bg-white/70 backdrop-blur-sm rounded-lg p-2.5 border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-1.5">
                            <kbd className="px-1.5 py-0.5 rounded bg-gray-100 border border-gray-200 text-gray-500 font-mono text-[9px]">WASD</kbd>
                            <span>Move</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <kbd className="px-1.5 py-0.5 rounded bg-gray-100 border border-gray-200 text-gray-500 font-mono text-[9px]">E</kbd>
                            <span>Sit / Interact</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <kbd className="px-1.5 py-0.5 rounded bg-gray-100 border border-gray-200 text-gray-500 font-mono text-[9px]">Tab</kbd>
                            <span>Toggle Mode</span>
                        </div>
                    </div>
                </motion.div>

                {/* 3D Three.js room canvas */}
                <div className="absolute inset-0 z-0">
                    <ThreeRoom
                        roomId={id as string}
                        userName={userName}
                        template={roomInfo.template}
                        customObjects={(roomInfo as any).customObjects}
                    />
                </div>

                {/* Meeting Room HUD — auto-joins when in meeting zone */}
                <MeetingRoomHUD isInMeetingZone={isInMeeting} zoneName={currentZone} />

                {/* Avatar Customizer */}
                <AvatarCustomizer isOpen={isAvatarOpen} onClose={() => setIsAvatarOpen(false)} />

                {/* Overlay UI */}
                <ParticipantsList isOpen={isParticipantsOpen} onClose={() => setIsParticipantsOpen(false)} />
                <ChatSidebar isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
                <EmoteWheel isOpen={isEmoteOpen} onSelect={handleEmoteSelect} onClose={() => setIsEmoteOpen(false)} />
                <Minimap
                    isOpen={isMinimapOpen}
                    playerX={0.4}
                    playerY={0.65}
                    mapWidth={60}
                    mapHeight={60}
                    npcs={[]}
                    currentZone={currentZone}
                />

                <VideoCallPanel
                    isOpen={isVideoCallOpen}
                    onClose={() => setIsVideoCallOpen(false)}
                />

                <WhiteboardPanel isOpen={isWhiteboardOpen} onClose={() => setIsWhiteboardOpen(false)} />

                <BroadcastPanel
                    isOpen={isBroadcastOpen}
                    onClose={() => setIsBroadcastOpen(false)}
                />

                {/* Room Builder */}
                <RoomBuilder
                    isOpen={isBuilderOpen}
                    onClose={() => setIsBuilderOpen(false)}
                    roomId={id as string}
                />

                {/* Build button */}
                <button
                    onClick={() => setIsBuilderOpen(true)}
                    className="fixed bottom-20 right-4 z-20 w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-lg transition-all hover:scale-110"
                    title="Room Builder (B)"
                >
                    🏗️
                </button>

                {/* Bottom toolbar */}
                <RoomToolbar
                    isChatOpen={isChatOpen}
                    isParticipantsOpen={isParticipantsOpen}
                    isMinimapOpen={isMinimapOpen}
                    isVideoCallOpen={isVideoCallOpen}
                    isWhiteboardOpen={isWhiteboardOpen}
                    isBroadcastOpen={isBroadcastOpen}
                    isAvatarOpen={isAvatarOpen}
                    onToggleChat={() => setIsChatOpen(!isChatOpen)}
                    onToggleParticipants={() => setIsParticipantsOpen(!isParticipantsOpen)}
                    onToggleMinimap={() => setIsMinimapOpen(!isMinimapOpen)}
                    onToggleEmote={() => setIsEmoteOpen(!isEmoteOpen)}
                    onToggleVideoCall={() => setIsVideoCallOpen(!isVideoCallOpen)}
                    onToggleWhiteboard={() => setIsWhiteboardOpen(!isWhiteboardOpen)}
                    onToggleBroadcast={() => setIsBroadcastOpen(!isBroadcastOpen)}
                    onToggleAvatar={() => setIsAvatarOpen(!isAvatarOpen)}
                />
            </div>
        </LiveKitWrapper >
    );
}
