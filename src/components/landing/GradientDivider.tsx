"use client";

import React from "react";

interface GradientDividerProps {
    from?: string;
    to?: string;
    flip?: boolean;
}

export default function GradientDivider({ from = "#8b5cf6", to = "#6366f1", flip = false }: GradientDividerProps) {
    return (
        <div className={`relative w-full h-24 overflow-hidden ${flip ? "rotate-180" : ""}`}>
            <svg
                viewBox="0 0 1440 120"
                preserveAspectRatio="none"
                className="absolute inset-0 w-full h-full"
            >
                <defs>
                    <linearGradient id={`gd-${from.replace("#", "")}`} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={from} stopOpacity="0.15" />
                        <stop offset="50%" stopColor={to} stopOpacity="0.25" />
                        <stop offset="100%" stopColor={from} stopOpacity="0.15" />
                    </linearGradient>
                </defs>
                <path
                    d="M0,60 C360,120 720,0 1080,60 C1260,90 1380,30 1440,60 L1440,120 L0,120 Z"
                    fill={`url(#gd-${from.replace("#", "")})`}
                />
                <path
                    d="M0,80 C240,40 480,100 720,60 C960,20 1200,80 1440,50 L1440,120 L0,120 Z"
                    fill={`url(#gd-${from.replace("#", "")})`}
                    opacity="0.5"
                />
            </svg>
        </div>
    );
}
