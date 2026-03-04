"use client";

import React from "react";
import {
    MessageCircle, Users, Map, Mic, MicOff, Video, VideoOff,
    Monitor, LogOut, Smile, Pen, Radio, User
} from "lucide-react";
import Link from "next/link";
import { useLocalParticipant } from "@livekit/components-react";

interface RoomToolbarProps {
    isChatOpen: boolean;
    isParticipantsOpen: boolean;
    isMinimapOpen: boolean;
    isVideoCallOpen: boolean;
    isWhiteboardOpen: boolean;
    isBroadcastOpen: boolean;
    isAvatarOpen?: boolean;

    onToggleChat: () => void;
    onToggleParticipants: () => void;
    onToggleMinimap: () => void;
    onToggleEmote: () => void;
    onToggleVideoCall: () => void;
    onToggleWhiteboard: () => void;
    onToggleBroadcast: () => void;
    onToggleAvatar?: () => void;
}

export default function RoomToolbar({
    isChatOpen,
    isParticipantsOpen,
    isMinimapOpen,
    isVideoCallOpen,
    isWhiteboardOpen,
    isBroadcastOpen,
    isAvatarOpen,
    onToggleChat,
    onToggleParticipants,
    onToggleMinimap,
    onToggleEmote,
    onToggleVideoCall,
    onToggleWhiteboard,
    onToggleBroadcast,
    onToggleAvatar,
}: RoomToolbarProps) {
    const { localParticipant } = useLocalParticipant();

    const isMuted = !localParticipant.isMicrophoneEnabled;
    const isCameraOff = !localParticipant.isCameraEnabled;

    const toggleMute = async () => {
        await localParticipant.setMicrophoneEnabled(isMuted); // if Muted (true) then enable (true)
    };

    const toggleCamera = async () => {
        await localParticipant.setCameraEnabled(isCameraOff);
    };

    const toggleScreenShare = async () => {
        await localParticipant.setScreenShareEnabled(!localParticipant.isScreenShareEnabled);
    };

    return (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30">
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white/90 backdrop-blur-xl border border-gray-200 shadow-2xl">
                {/* Audio */}
                <ToolbarButton
                    icon={isMuted ? MicOff : Mic}
                    label={isMuted ? "Unmute" : "Mute"}
                    active={!isMuted}
                    danger={isMuted}
                    onClick={toggleMute}
                />

                {/* Video */}
                <ToolbarButton
                    icon={isCameraOff ? VideoOff : Video}
                    label={isCameraOff ? "Camera On" : "Camera Off"}
                    active={!isCameraOff}
                    danger={isCameraOff}
                    onClick={toggleCamera}
                />

                {/* Screen Share */}
                <ToolbarButton
                    icon={Monitor}
                    label="Screen Share"
                    onClick={toggleScreenShare}
                />

                <div className="w-px h-6 bg-gray-200 mx-1" />

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

                <div className="w-px h-6 bg-gray-200 mx-1" />

                {/* Avatar */}
                {onToggleAvatar && (
                    <ToolbarButton
                        icon={User}
                        label="Avatar"
                        active={isAvatarOpen}
                        onClick={onToggleAvatar}
                    />
                )}

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

                <div className="w-px h-6 bg-gray-200 mx-1" />

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
    icon: React.ComponentType<{ className?: string }>;
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
                ? "text-red-500 hover:bg-red-50"
                : active
                    ? "text-emerald-600 bg-emerald-50"
                    : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                }`}
        >
            <Icon className="w-5 h-5" />
        </button>
    );
}
