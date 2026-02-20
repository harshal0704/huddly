"use client";

import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

interface PhaserGameProps {
    sceneConfig: {
        key: string;
        init?: (data?: Record<string, unknown>) => void;
        preload?: (this: Phaser.Scene) => void;
        create?: (this: Phaser.Scene) => void;
        update?: (this: Phaser.Scene, time: number, delta: number) => void;
    };
    width?: number;
    height?: number;
    className?: string;
}

/**
 * React component wrapper for Phaser 3 game canvas.
 * Handles lifecycle, resizing, and cleanup.
 */
function PhaserGameInner({ sceneConfig, width, height, className }: PhaserGameProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const gameRef = useRef<Phaser.Game | null>(null);

    useEffect(() => {
        if (!containerRef.current || gameRef.current) return;

        // Dynamic import of Phaser (it needs window/document)
        import("phaser").then((Phaser) => {
            if (!containerRef.current) return;

            const config: Phaser.Types.Core.GameConfig = {
                type: Phaser.AUTO,
                parent: containerRef.current,
                width: width || containerRef.current.clientWidth,
                height: height || containerRef.current.clientHeight,
                backgroundColor: "#1a1025",
                pixelArt: true,
                physics: {
                    default: "arcade",
                    arcade: {
                        gravity: { x: 0, y: 0 },
                        debug: false,
                    },
                },
                scale: {
                    mode: Phaser.Scale.RESIZE,
                    autoCenter: Phaser.Scale.CENTER_BOTH,
                },
                scene: sceneConfig,
            };

            gameRef.current = new Phaser.Game(config);
        });

        return () => {
            if (gameRef.current) {
                gameRef.current.destroy(true);
                gameRef.current = null;
            }
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div
            ref={containerRef}
            className={`phaser-container ${className || ""}`}
            style={{ width: "100%", height: "100%" }}
        />
    );
}

// Export as dynamic with no SSR (Phaser requires browser APIs)
const PhaserGame = dynamic(() => Promise.resolve(PhaserGameInner), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full flex items-center justify-center bg-gray-900/50 rounded-xl">
            <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
                <span className="text-sm text-gray-400">Loading world...</span>
            </div>
        </div>
    ),
});

export default PhaserGame;
