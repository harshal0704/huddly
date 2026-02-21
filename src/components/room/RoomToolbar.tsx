"use client";

import React from "react";
import {
    MessageCircle, Users, Map, Mic, MicOff, Video, VideoOff,
    Monitor, LogOut, Smile, Pen, Radio
} from "lucide-react";
import Link from "next/link";

interface RoomToolbarProps {
    isMuted: boolean;
    isCameraOff: boolean;
    isChatOpen: boolean;
    isParticipantsOpen: boolean;
    isMinimapOpen: boolean;
    isVideoCallOpen: boolean;
    isWhiteboardOpen: boolean;
    isBroadcastOpen: boolean;

    onToggleMute: () => void;
    onToggleCamera: () => void;
    onToggleChat: () => void;
    onToggleParticipants: () => void;
    onToggleMinimap: () => void;
    onToggleEmote: () => void;
    onScreenShare: () => void;
    onToggleVideoCall: () => void;
    onToggleWhiteboard: () => void;
    onToggleBroadcast: () => void;
}

export default function RoomToolbar({
    isMuted,
    isCameraOff,
    isChatOpen,
    isParticipantsOpen,
    isMinimapOpen,
    isVideoCallOpen,
    isWhiteboardOpen,
    isBroadcastOpen,
    onToggleMute,
    onToggleCamera,
    onToggleChat,
    onToggleParticipants,
    onToggleMinimap,
    onToggleEmote,
    onScreenShare,
    onToggleVideoCall,
    onToggleWhiteboard,
    onToggleBroadcast,
}: RoomToolbarProps) {
    return (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30">
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-gray-950/90 backdrop-blur-xl border border-white/10 shadow-2xl">
                {/* Audio */}
                <ToolbarButton
                    icon={isMuted ? MicOff : Mic}
                    label={isMuted ? "Unmute" : "Mute"}
                    active={!isMuted}
                    danger={isMuted}
                    onClick={onToggleMute}
                />

                {/* Video */}
                <ToolbarButton
                    icon={isCameraOff ? VideoOff : Video}
                    label={isCameraOff ? "Camera On" : "Camera Off"}
                    active={!isCameraOff}
                    danger={isCameraOff}
                    onClick={onToggleCamera}
                />

                {/* Screen Share */}
                <ToolbarButton
                    icon={Monitor}
                    label="Screen Share"
                    onClick={onScreenShare}
                />

                <div className="w-px h-6 bg-white/10 mx-1" />

                {/* Video Call Panel */}
                <ToolbarButton
                    icon={Video}
                    label="Video Call"
                    active={isVideoCallOpen}
                    onClick={onToggleVideoCall}
                />

                {/* Whiteboard */}
                <ToolbarButton
                    icon={Pen}
                    label="Whiteboard"
                    active={isWhiteboardOpen}
                    onClick={onToggleWhiteboard}
                />

                {/* Broadcast */}
                <ToolbarButton
                    icon={Radio}
                    label="Broadcast"
                    active={isBroadcastOpen}
                    onClick={onToggleBroadcast}
                />

                <div className="w-px h-6 bg-white/10 mx-1" />

                {/* Emote */}
                <ToolbarButton
                    icon={Smile}
                    label="Emote (Space)"
                    onClick={onToggleEmote}
                />

                {/* Chat */}
                <ToolbarButton
                    icon={MessageCircle}
                    label="Chat"
                    active={isChatOpen}
                    onClick={onToggleChat}
                />

                {/* Participants */}
                <ToolbarButton
                    icon={Users}
                    label="Participants"
                    active={isParticipantsOpen}
                    onClick={onToggleParticipants}
                />

                {/* Minimap */}
                <ToolbarButton
                    icon={Map}
                    label="Minimap"
                    active={isMinimapOpen}
                    onClick={onToggleMinimap}
                />

                <div className="w-px h-6 bg-white/10 mx-1" />

                {/* Leave */}
                <Link href="/dashboard">
                    <ToolbarButton
                        icon={LogOut}
                        label="Leave Room"
                        danger
                        onClick={() => { }}
                    />
                </Link>
            </div>
        </div>
    );
}

function ToolbarButton({
    icon: Icon,
    label,
    active,
    danger,
    onClick,
}: {
    icon: React.ElementType;
    label: string;
    active?: boolean;
    danger?: boolean;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            title={label}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${danger
                ? "text-red-400 hover:bg-red-500/20"
                : active
                    ? "text-violet-400 bg-violet-500/15"
                    : "text-gray-400 hover:text-white hover:bg-white/10"
                }`}
        >
            <Icon className="w-4.5 h-4.5" />
        </button>
    );
}
