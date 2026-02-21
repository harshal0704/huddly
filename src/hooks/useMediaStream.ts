"use client";

import { useState, useRef, useCallback, useEffect } from "react";

export interface MediaStreamState {
    /** The user's camera+mic stream */
    localStream: MediaStream | null;
    /** Screen capture stream */
    screenStream: MediaStream | null;
    /** Is microphone currently muted? */
    isMuted: boolean;
    /** Is camera currently off? */
    isCameraOff: boolean;
    /** Is screen being shared? */
    isScreenSharing: boolean;
    /** Error message if media access fails */
    error: string | null;

    // Actions
    startMedia: () => Promise<void>;
    stopMedia: () => void;
    toggleMute: () => void;
    toggleCamera: () => void;
    startScreenShare: () => Promise<void>;
    stopScreenShare: () => void;
}

export function useMediaStream(): MediaStreamState {
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const localStreamRef = useRef<MediaStream | null>(null);
    const screenStreamRef = useRef<MediaStream | null>(null);

    // Start camera + microphone
    const startMedia = useCallback(async () => {
        try {
            setError(null);
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: "user",
                },
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                },
            });
            localStreamRef.current = stream;
            setLocalStream(stream);
            setIsMuted(false);
            setIsCameraOff(false);
        } catch (err: any) {
            console.error("Failed to access media devices:", err);
            if (err.name === "NotAllowedError") {
                setError("Camera/mic access denied. Please allow access in your browser settings.");
            } else if (err.name === "NotFoundError") {
                setError("No camera or microphone found.");
            } else {
                setError("Could not access camera/microphone.");
            }
        }
    }, []);

    // Stop all local media tracks
    const stopMedia = useCallback(() => {
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((t) => t.stop());
            localStreamRef.current = null;
            setLocalStream(null);
        }
    }, []);

    // Toggle microphone mute (enables/disables audio tracks)
    const toggleMute = useCallback(() => {
        if (localStreamRef.current) {
            const audioTracks = localStreamRef.current.getAudioTracks();
            audioTracks.forEach((track) => {
                track.enabled = !track.enabled;
            });
            setIsMuted((prev) => !prev);
        }
    }, []);

    // Toggle camera (enables/disables video tracks)
    const toggleCamera = useCallback(() => {
        if (localStreamRef.current) {
            const videoTracks = localStreamRef.current.getVideoTracks();
            videoTracks.forEach((track) => {
                track.enabled = !track.enabled;
            });
            setIsCameraOff((prev) => !prev);
        }
    }, []);

    // Start screen share
    const startScreenShare = useCallback(async () => {
        try {
            setError(null);
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: { cursor: "always" } as any,
                audio: false,
            });
            screenStreamRef.current = stream;
            setScreenStream(stream);
            setIsScreenSharing(true);

            // Listen for user stopping screen share via browser UI
            stream.getVideoTracks()[0].addEventListener("ended", () => {
                screenStreamRef.current = null;
                setScreenStream(null);
                setIsScreenSharing(false);
            });
        } catch (err: any) {
            console.error("Failed to start screen share:", err);
            if (err.name !== "AbortError") {
                setError("Screen sharing failed or was cancelled.");
            }
        }
    }, []);

    // Stop screen share
    const stopScreenShare = useCallback(() => {
        if (screenStreamRef.current) {
            screenStreamRef.current.getTracks().forEach((t) => t.stop());
            screenStreamRef.current = null;
            setScreenStream(null);
            setIsScreenSharing(false);
        }
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            localStreamRef.current?.getTracks().forEach((t) => t.stop());
            screenStreamRef.current?.getTracks().forEach((t) => t.stop());
        };
    }, []);

    return {
        localStream,
        screenStream,
        isMuted,
        isCameraOff,
        isScreenSharing,
        error,
        startMedia,
        stopMedia,
        toggleMute,
        toggleCamera,
        startScreenShare,
        stopScreenShare,
    };
}
