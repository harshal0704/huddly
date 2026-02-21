// ============================================
// Huddly — Room Scene (Phaser 3)
// ============================================
// Main game scene for the in-room experience.
// Handles: tilemap rendering, avatar movement,
// proximity detection, NPC simulation, interactive objects.

import * as Phaser from "phaser";
import EasyStar from "easystarjs";

// ─── Constants ───
const TILE_SIZE = 32;
const MAP_WIDTH = 40;
const MAP_HEIGHT = 30;
const PROXIMITY_RADIUS = 150;
const MOVE_SPEED = 160;
const AMBIENT_PARTICLE_COUNT = 25;

// ─── Avatar Colors ───
const AVATAR_COLORS = [
    0x8b5cf6, 0x6366f1, 0x3b82f6, 0x06b6d4, 0x10b981,
    0xf59e0b, 0xef4444, 0xec4899, 0xa855f7, 0x14b8a6,
];

// ─── Map Templates ───
export type MapTemplate = "classroom" | "office" | "cafe" | "conference" | "party" | "blank";

interface FurnitureItem {
    x: number; y: number; w: number; h: number;
    type: string; emoji: string; color: number; label?: string;
}

interface MapConfig {
    name: string;
    floorColor: number;
    stageArea?: { x: number; y: number; w: number; h: number; color: number };
    zones: { x: number; y: number; w: number; h: number; color: number; alpha: number }[];
    furniture: FurnitureItem[];
}

const MAP_TEMPLATES: Record<MapTemplate, MapConfig> = {
    classroom: {
        name: "Classroom",
        floorColor: 0x1a1025,
        stageArea: { x: 10, y: 2, w: 20, h: 5, color: 0x2d1f4e },
        zones: [
            { x: 6, y: 7, w: 24, h: 12, color: 0x1e3a5f, alpha: 0.2 },
            { x: 28, y: 20, w: 8, h: 6, color: 0x2a1f1f, alpha: 0.3 },
            { x: 2, y: 20, w: 6, h: 6, color: 0x3d2b1f, alpha: 0.3 },
        ],
        furniture: [
            // Desks - Row 1
            { x: 8, y: 8, w: 2, h: 1, type: "desk", emoji: "", color: 0x3d3040 },
            { x: 12, y: 8, w: 2, h: 1, type: "desk", emoji: "", color: 0x3d3040 },
            { x: 16, y: 8, w: 2, h: 1, type: "desk", emoji: "", color: 0x3d3040 },
            { x: 20, y: 8, w: 2, h: 1, type: "desk", emoji: "", color: 0x3d3040 },
            { x: 24, y: 8, w: 2, h: 1, type: "desk", emoji: "", color: 0x3d3040 },
            // Desks - Row 2
            { x: 8, y: 12, w: 2, h: 1, type: "desk", emoji: "", color: 0x3d3040 },
            { x: 12, y: 12, w: 2, h: 1, type: "desk", emoji: "", color: 0x3d3040 },
            { x: 16, y: 12, w: 2, h: 1, type: "desk", emoji: "", color: 0x3d3040 },
            { x: 20, y: 12, w: 2, h: 1, type: "desk", emoji: "", color: 0x3d3040 },
            { x: 24, y: 12, w: 2, h: 1, type: "desk", emoji: "", color: 0x3d3040 },
            // Desks - Row 3
            { x: 8, y: 16, w: 2, h: 1, type: "desk", emoji: "", color: 0x3d3040 },
            { x: 12, y: 16, w: 2, h: 1, type: "desk", emoji: "", color: 0x3d3040 },
            { x: 16, y: 16, w: 2, h: 1, type: "desk", emoji: "", color: 0x3d3040 },
            { x: 20, y: 16, w: 2, h: 1, type: "desk", emoji: "", color: 0x3d3040 },
            { x: 24, y: 16, w: 2, h: 1, type: "desk", emoji: "", color: 0x3d3040 },
            // Whiteboard
            { x: 14, y: 3, w: 6, h: 1, type: "whiteboard", emoji: "📋", color: 0xffffff, label: "Whiteboard" },
            // Podium
            { x: 16, y: 5, w: 2, h: 1, type: "podium", emoji: "🎤", color: 0x8b4513 },
            // Bookshelves
            { x: 34, y: 5, w: 1, h: 8, type: "bookshelf", emoji: "📚", color: 0x5c3317 },
            // Sofa
            { x: 30, y: 22, w: 3, h: 2, type: "sofa", emoji: "🛋️", color: 0x8b5cf6 },
            // Plants
            { x: 2, y: 2, w: 1, h: 1, type: "plant", emoji: "🌿", color: 0x228b22 },
            { x: 37, y: 2, w: 1, h: 1, type: "plant", emoji: "🌿", color: 0x228b22 },
            { x: 2, y: 27, w: 1, h: 1, type: "plant", emoji: "🌿", color: 0x228b22 },
            { x: 37, y: 27, w: 1, h: 1, type: "plant", emoji: "🌿", color: 0x228b22 },
            // Coffee area
            { x: 3, y: 22, w: 2, h: 2, type: "coffee", emoji: "☕", color: 0x4a2c2a },
        ],
    },
    office: {
        name: "Open Office",
        floorColor: 0x0f1923,
        zones: [
            { x: 3, y: 3, w: 16, h: 12, color: 0x1a2a3a, alpha: 0.3 },
            { x: 22, y: 3, w: 15, h: 12, color: 0x1a2a3a, alpha: 0.3 },
            { x: 3, y: 18, w: 12, h: 8, color: 0x2a1a2a, alpha: 0.25 },
            { x: 25, y: 18, w: 12, h: 8, color: 0x1a3a2a, alpha: 0.25 },
        ],
        furniture: [
            // Team pods (L-shaped desks)
            { x: 4, y: 4, w: 3, h: 1, type: "desk", emoji: "", color: 0x2a3a4a },
            { x: 4, y: 6, w: 3, h: 1, type: "desk", emoji: "", color: 0x2a3a4a },
            { x: 4, y: 8, w: 3, h: 1, type: "desk", emoji: "", color: 0x2a3a4a },
            { x: 10, y: 4, w: 3, h: 1, type: "desk", emoji: "", color: 0x2a3a4a },
            { x: 10, y: 6, w: 3, h: 1, type: "desk", emoji: "", color: 0x2a3a4a },
            { x: 10, y: 8, w: 3, h: 1, type: "desk", emoji: "", color: 0x2a3a4a },
            // Meeting room desks
            { x: 24, y: 5, w: 5, h: 2, type: "table", emoji: "", color: 0x3a3040 },
            { x: 24, y: 9, w: 5, h: 2, type: "table", emoji: "", color: 0x3a3040 },
            // Monitor wall
            { x: 23, y: 3, w: 1, h: 1, type: "monitor", emoji: "🖥️", color: 0x333333 },
            { x: 31, y: 3, w: 1, h: 1, type: "monitor", emoji: "🖥️", color: 0x333333 },
            // Whiteboard
            { x: 35, y: 5, w: 1, h: 5, type: "whiteboard", emoji: "📋", color: 0xeeeeee, label: "Board" },
            // Break area
            { x: 4, y: 20, w: 3, h: 2, type: "sofa", emoji: "🛋️", color: 0x6366f1 },
            { x: 9, y: 20, w: 2, h: 2, type: "coffee", emoji: "☕", color: 0x4a2c2a },
            // Gaming corner
            { x: 26, y: 20, w: 3, h: 2, type: "table", emoji: "🎮", color: 0x10b981 },
            // Plants
            { x: 2, y: 2, w: 1, h: 1, type: "plant", emoji: "🌿", color: 0x228b22 },
            { x: 37, y: 2, w: 1, h: 1, type: "plant", emoji: "🌿", color: 0x228b22 },
            { x: 2, y: 27, w: 1, h: 1, type: "plant", emoji: "🌿", color: 0x228b22 },
            { x: 37, y: 27, w: 1, h: 1, type: "plant", emoji: "🌿", color: 0x228b22 },
            { x: 20, y: 2, w: 1, h: 1, type: "plant", emoji: "🪴", color: 0x228b22 },
            { x: 20, y: 27, w: 1, h: 1, type: "plant", emoji: "🪴", color: 0x228b22 },
        ],
    },
    cafe: {
        name: "Cozy Café",
        floorColor: 0x1a150f,
        zones: [
            { x: 3, y: 3, w: 12, h: 10, color: 0x3d2b1f, alpha: 0.2 },
            { x: 25, y: 3, w: 12, h: 10, color: 0x3d2b1f, alpha: 0.2 },
            { x: 3, y: 18, w: 34, h: 8, color: 0x2a1f15, alpha: 0.15 },
        ],
        furniture: [
            // Round tables
            { x: 5, y: 5, w: 2, h: 2, type: "table", emoji: "☕", color: 0x5c3317 },
            { x: 10, y: 5, w: 2, h: 2, type: "table", emoji: "☕", color: 0x5c3317 },
            { x: 5, y: 9, w: 2, h: 2, type: "table", emoji: "🧁", color: 0x5c3317 },
            { x: 10, y: 9, w: 2, h: 2, type: "table", emoji: "🍰", color: 0x5c3317 },
            { x: 27, y: 5, w: 2, h: 2, type: "table", emoji: "☕", color: 0x5c3317 },
            { x: 32, y: 5, w: 2, h: 2, type: "table", emoji: "☕", color: 0x5c3317 },
            { x: 27, y: 9, w: 2, h: 2, type: "table", emoji: "🥐", color: 0x5c3317 },
            { x: 32, y: 9, w: 2, h: 2, type: "table", emoji: "🍵", color: 0x5c3317 },
            // Bar counter
            { x: 16, y: 3, w: 6, h: 1, type: "counter", emoji: "", color: 0x4a3020, label: "☕ Counter" },
            { x: 16, y: 5, w: 1, h: 1, type: "coffee", emoji: "☕", color: 0x2a1510 },
            { x: 21, y: 5, w: 1, h: 1, type: "coffee", emoji: "🫖", color: 0x2a1510 },
            // Cozy sofas bottom
            { x: 4, y: 20, w: 4, h: 2, type: "sofa", emoji: "🛋️", color: 0xd97706 },
            { x: 12, y: 20, w: 4, h: 2, type: "sofa", emoji: "🛋️", color: 0xd97706 },
            { x: 24, y: 20, w: 4, h: 2, type: "sofa", emoji: "🛋️", color: 0xd97706 },
            { x: 32, y: 20, w: 4, h: 2, type: "sofa", emoji: "🛋️", color: 0xd97706 },
            // Stage / music corner
            { x: 17, y: 22, w: 4, h: 3, type: "stage", emoji: "🎸", color: 0x2d1f4e },
            // Plants
            { x: 2, y: 2, w: 1, h: 1, type: "plant", emoji: "🌵", color: 0x228b22 },
            { x: 37, y: 2, w: 1, h: 1, type: "plant", emoji: "🌿", color: 0x228b22 },
            { x: 2, y: 27, w: 1, h: 1, type: "plant", emoji: "🌻", color: 0x228b22 },
            { x: 37, y: 27, w: 1, h: 1, type: "plant", emoji: "🌿", color: 0x228b22 },
        ],
    },
    conference: {
        name: "Conference Hall",
        floorColor: 0x0d0d1a,
        stageArea: { x: 8, y: 2, w: 24, h: 6, color: 0x1a1040 },
        zones: [
            { x: 4, y: 10, w: 32, h: 14, color: 0x15152a, alpha: 0.2 },
        ],
        furniture: [
            // Main stage podium
            { x: 18, y: 3, w: 4, h: 2, type: "podium", emoji: "🎤", color: 0x4a3870 },
            // Stage screens
            { x: 10, y: 2, w: 3, h: 2, type: "monitor", emoji: "🖥️", color: 0x333333 },
            { x: 27, y: 2, w: 3, h: 2, type: "monitor", emoji: "🖥️", color: 0x333333 },
            // Audience seats (rows)
            { x: 6, y: 11, w: 2, h: 1, type: "desk", emoji: "", color: 0x2a2040 },
            { x: 10, y: 11, w: 2, h: 1, type: "desk", emoji: "", color: 0x2a2040 },
            { x: 14, y: 11, w: 2, h: 1, type: "desk", emoji: "", color: 0x2a2040 },
            { x: 18, y: 11, w: 2, h: 1, type: "desk", emoji: "", color: 0x2a2040 },
            { x: 22, y: 11, w: 2, h: 1, type: "desk", emoji: "", color: 0x2a2040 },
            { x: 26, y: 11, w: 2, h: 1, type: "desk", emoji: "", color: 0x2a2040 },
            { x: 30, y: 11, w: 2, h: 1, type: "desk", emoji: "", color: 0x2a2040 },
            { x: 6, y: 14, w: 2, h: 1, type: "desk", emoji: "", color: 0x2a2040 },
            { x: 10, y: 14, w: 2, h: 1, type: "desk", emoji: "", color: 0x2a2040 },
            { x: 14, y: 14, w: 2, h: 1, type: "desk", emoji: "", color: 0x2a2040 },
            { x: 18, y: 14, w: 2, h: 1, type: "desk", emoji: "", color: 0x2a2040 },
            { x: 22, y: 14, w: 2, h: 1, type: "desk", emoji: "", color: 0x2a2040 },
            { x: 26, y: 14, w: 2, h: 1, type: "desk", emoji: "", color: 0x2a2040 },
            { x: 30, y: 14, w: 2, h: 1, type: "desk", emoji: "", color: 0x2a2040 },
            { x: 6, y: 17, w: 2, h: 1, type: "desk", emoji: "", color: 0x2a2040 },
            { x: 10, y: 17, w: 2, h: 1, type: "desk", emoji: "", color: 0x2a2040 },
            { x: 14, y: 17, w: 2, h: 1, type: "desk", emoji: "", color: 0x2a2040 },
            { x: 18, y: 17, w: 2, h: 1, type: "desk", emoji: "", color: 0x2a2040 },
            { x: 22, y: 17, w: 2, h: 1, type: "desk", emoji: "", color: 0x2a2040 },
            { x: 26, y: 17, w: 2, h: 1, type: "desk", emoji: "", color: 0x2a2040 },
            { x: 30, y: 17, w: 2, h: 1, type: "desk", emoji: "", color: 0x2a2040 },
            { x: 6, y: 20, w: 2, h: 1, type: "desk", emoji: "", color: 0x2a2040 },
            { x: 10, y: 20, w: 2, h: 1, type: "desk", emoji: "", color: 0x2a2040 },
            { x: 14, y: 20, w: 2, h: 1, type: "desk", emoji: "", color: 0x2a2040 },
            { x: 18, y: 20, w: 2, h: 1, type: "desk", emoji: "", color: 0x2a2040 },
            { x: 22, y: 20, w: 2, h: 1, type: "desk", emoji: "", color: 0x2a2040 },
            { x: 26, y: 20, w: 2, h: 1, type: "desk", emoji: "", color: 0x2a2040 },
            { x: 30, y: 20, w: 2, h: 1, type: "desk", emoji: "", color: 0x2a2040 },
            // Side stands
            { x: 3, y: 24, w: 2, h: 2, type: "counter", emoji: "🍿", color: 0x4a2c2a, label: "Snacks" },
            { x: 35, y: 24, w: 2, h: 2, type: "counter", emoji: "☕", color: 0x4a2c2a, label: "Drinks" },
        ],
    },
    party: {
        name: "Party Island",
        floorColor: 0x0a0a1e,
        zones: [
            { x: 12, y: 8, w: 16, h: 14, color: 0x2a1040, alpha: 0.25 },
            { x: 3, y: 3, w: 6, h: 6, color: 0x1a3030, alpha: 0.3 },
            { x: 31, y: 3, w: 6, h: 6, color: 0x301a30, alpha: 0.3 },
        ],
        furniture: [
            // DJ booth
            { x: 17, y: 3, w: 6, h: 2, type: "stage", emoji: "🎧", color: 0x6366f1 },
            // Dance floor (open, no collision items)
            // Bar area left
            { x: 3, y: 4, w: 4, h: 1, type: "counter", emoji: "🍹", color: 0x4a2c2a, label: "Bar" },
            { x: 3, y: 7, w: 2, h: 1, type: "sofa", emoji: "🛋️", color: 0xec4899 },
            // VIP area right
            { x: 32, y: 4, w: 4, h: 1, type: "counter", emoji: "🥂", color: 0xd97706, label: "VIP Bar" },
            { x: 33, y: 7, w: 2, h: 1, type: "sofa", emoji: "🛋️", color: 0xa855f7 },
            // Lounge tables scattered
            { x: 6, y: 15, w: 2, h: 2, type: "table", emoji: "🍕", color: 0x3d3040 },
            { x: 32, y: 15, w: 2, h: 2, type: "table", emoji: "🎂", color: 0x3d3040 },
            { x: 6, y: 22, w: 2, h: 2, type: "table", emoji: "🍔", color: 0x3d3040 },
            { x: 32, y: 22, w: 2, h: 2, type: "table", emoji: "🌮", color: 0x3d3040 },
            // Photo booth
            { x: 17, y: 24, w: 6, h: 2, type: "stage", emoji: "📸", color: 0xf59e0b },
            // Plants / decorations
            { x: 2, y: 2, w: 1, h: 1, type: "plant", emoji: "🎈", color: 0xef4444 },
            { x: 37, y: 2, w: 1, h: 1, type: "plant", emoji: "🎈", color: 0x6366f1 },
            { x: 2, y: 27, w: 1, h: 1, type: "plant", emoji: "🎈", color: 0x10b981 },
            { x: 37, y: 27, w: 1, h: 1, type: "plant", emoji: "🎈", color: 0xf59e0b },
            { x: 14, y: 14, w: 1, h: 1, type: "plant", emoji: "🪩", color: 0xd4d4d4 },
            { x: 25, y: 14, w: 1, h: 1, type: "plant", emoji: "🪩", color: 0xd4d4d4 },
        ],
    },
    blank: {
        name: "Blank Canvas",
        floorColor: 0x111118,
        zones: [],
        furniture: [],
    },
};

// ─── NPC Config ───
interface NPC {
    sprite: Phaser.GameObjects.Container;
    name: string;
    targetX: number;
    targetY: number;
    moveTimer: number;
    color: number;
    proximityRing?: Phaser.GameObjects.Arc;
    videoBubble?: Phaser.GameObjects.Container;
    isProximate: boolean;
}

// ─── createRoomScene factory ───
export function createRoomScene(template: MapTemplate = "classroom") {
    const mapConfig = MAP_TEMPLATES[template] || MAP_TEMPLATES.classroom;

    let player: Phaser.GameObjects.Container;
    let cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null;
    let keyW: Phaser.Input.Keyboard.Key | null = null;
    let keyA: Phaser.Input.Keyboard.Key | null = null;
    let keyS: Phaser.Input.Keyboard.Key | null = null;
    let keyD: Phaser.Input.Keyboard.Key | null = null;
    let keySpace: Phaser.Input.Keyboard.Key | null = null;
    let npcs: NPC[] = [];
    let floorGraphics: Phaser.GameObjects.Graphics;
    let easyStar: InstanceType<typeof EasyStar.js>;
    let collisionGrid: number[][] = [];
    let pathLine: Phaser.GameObjects.Graphics;
    let isClickMoving = false;
    let emoteText: Phaser.GameObjects.Text | null = null;
    let statusIndicator: Phaser.GameObjects.Arc;
    let playerIdleTween: Phaser.Tweens.Tween | null = null;
    let ambientParticles: Phaser.GameObjects.Arc[] = [];
    let walkBobOffset = 0;
    let isWalking = false;
    let interactHint: Phaser.GameObjects.Text | null = null;

    function preload(this: Phaser.Scene) {
        // All rendering is procedural — no external assets needed
    }

    function create(this: Phaser.Scene) {
        const scene = this;

        // ─── EasyStar Pathfinding ───
        easyStar = new EasyStar.js();

        // Build collision grid (0 = walkable, 1 = blocked)
        collisionGrid = [];
        for (let y = 0; y < MAP_HEIGHT; y++) {
            const row: number[] = [];
            for (let x = 0; x < MAP_WIDTH; x++) {
                row.push((x === 0 || y === 0 || x === MAP_WIDTH - 1 || y === MAP_HEIGHT - 1) ? 1 : 0);
            }
            collisionGrid.push(row);
        }

        // Mark furniture cells as blocked
        mapConfig.furniture.forEach((f) => {
            for (let dy = 0; dy < f.h; dy++) {
                for (let dx = 0; dx < f.w; dx++) {
                    const gx = f.x + dx;
                    const gy = f.y + dy;
                    if (gx < MAP_WIDTH && gy < MAP_HEIGHT) {
                        collisionGrid[gy][gx] = 1;
                    }
                }
            }
        });

        easyStar.setGrid(collisionGrid);
        easyStar.setAcceptableTiles([0]);
        easyStar.enableDiagonals();
        easyStar.enableCornerCutting();

        // ─── Draw Floor ───
        floorGraphics = scene.add.graphics();
        drawFloor(floorGraphics, mapConfig);

        // ─── Draw Furniture ───
        drawFurniture(scene, mapConfig.furniture);

        // ─── Path Line ───
        pathLine = scene.add.graphics();
        pathLine.setDepth(5);

        // ─── Player Avatar ───
        player = createAvatar(scene, 15 * TILE_SIZE, 20 * TILE_SIZE, "You", 0x8b5cf6, true);
        player.setDepth(10);

        scene.cameras.main.startFollow(player, true, 0.08, 0.08);
        scene.cameras.main.setZoom(1.2);

        // ─── Ambient Floating Particles ───
        for (let i = 0; i < AMBIENT_PARTICLE_COUNT; i++) {
            const px = Math.random() * MAP_WIDTH * TILE_SIZE;
            const py = Math.random() * MAP_HEIGHT * TILE_SIZE;
            const size = 1 + Math.random() * 2;
            const alpha = 0.1 + Math.random() * 0.2;
            const dot = scene.add.circle(px, py, size, 0x8b5cf6, alpha);
            dot.setDepth(0);
            scene.tweens.add({
                targets: dot,
                y: py - 20 - Math.random() * 30,
                alpha: 0,
                duration: 4000 + Math.random() * 4000,
                repeat: -1,
                yoyo: true,
                delay: Math.random() * 3000,
            });
            ambientParticles.push(dot);
        }

        // Status indicator (green dot)
        statusIndicator = scene.add.circle(0, 0, 4, 0x10b981);
        statusIndicator.setDepth(100);

        // ─── NPCs ───
        const npcData = [
            { name: "Alex", skin: 0 }, { name: "Maya", skin: 1 },
            { name: "Sam", skin: 2 }, { name: "Jo", skin: 3 },
            { name: "Lee", skin: 4 }, { name: "Kai", skin: 5 },
            { name: "Rui", skin: 6 }, { name: "Zoe", skin: 7 },
        ];
        for (const nd of npcData) {
            const nx = (5 + Math.floor(Math.random() * 30)) * TILE_SIZE;
            const ny = (5 + Math.floor(Math.random() * 20)) * TILE_SIZE;
            const npcSprite = createAvatar(scene, nx, ny, nd.name, AVATAR_COLORS[nd.skin], false);
            npcSprite.setDepth(9);

            npcs.push({
                sprite: npcSprite,
                name: nd.name,
                targetX: nx,
                targetY: ny,
                moveTimer: Math.random() * 3000,
                color: AVATAR_COLORS[nd.skin],
                isProximate: false,
            });
        }

        // ─── Keyboard Input ───
        // Use Phaser KeyCodes directly for reliable key capture (fixes D key)
        if (scene.input.keyboard) {
            cursors = scene.input.keyboard.createCursorKeys();
            keyW = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W, true, true);
            keyA = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A, true, true);
            keyS = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S, true, true);
            keyD = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D, true, true);
            keySpace = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE, true, true);

            // Only capture game keys, let others pass through to UI
            scene.input.keyboard.addCapture([Phaser.Input.Keyboard.KeyCodes.W,
            Phaser.Input.Keyboard.KeyCodes.A,
            Phaser.Input.Keyboard.KeyCodes.S,
            Phaser.Input.Keyboard.KeyCodes.D,
            Phaser.Input.Keyboard.KeyCodes.SPACE,
            Phaser.Input.Keyboard.KeyCodes.UP,
            Phaser.Input.Keyboard.KeyCodes.DOWN,
            Phaser.Input.Keyboard.KeyCodes.LEFT,
            Phaser.Input.Keyboard.KeyCodes.RIGHT,
            ]);
        }

        // ─── Click-to-Move ───
        scene.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
            if (pointer.rightButtonDown()) return;

            const worldX = pointer.worldX;
            const worldY = pointer.worldY;
            const tileX = Math.floor(worldX / TILE_SIZE);
            const tileY = Math.floor(worldY / TILE_SIZE);
            const playerTileX = Math.floor(player.x / TILE_SIZE);
            const playerTileY = Math.floor(player.y / TILE_SIZE);

            if (tileX >= 0 && tileX < MAP_WIDTH && tileY >= 0 && tileY < MAP_HEIGHT && collisionGrid[tileY][tileX] === 0) {
                easyStar.findPath(playerTileX, playerTileY, tileX, tileY, (path) => {
                    if (path && path.length > 1) {
                        pathLine.clear();
                        pathLine.lineStyle(2, 0x8b5cf6, 0.3);
                        pathLine.moveTo(player.x, player.y);
                        for (const point of path) {
                            pathLine.lineTo(point.x * TILE_SIZE + TILE_SIZE / 2, point.y * TILE_SIZE + TILE_SIZE / 2);
                        }
                        pathLine.strokePath();
                        moveAlongPath(scene, path);
                    }
                });
                easyStar.calculate();
            }
        });

        // ─── World bounds ───
        scene.physics.world.setBounds(0, 0, MAP_WIDTH * TILE_SIZE, MAP_HEIGHT * TILE_SIZE);
        scene.cameras.main.setBounds(0, 0, MAP_WIDTH * TILE_SIZE, MAP_HEIGHT * TILE_SIZE);
    }

    function moveAlongPath(scene: Phaser.Scene, path: { x: number; y: number }[]) {
        // Kill the idle bob when moving via click
        if (playerIdleTween) {
            playerIdleTween.stop();
            playerIdleTween = null;
        }
        isClickMoving = true;
        pathLine.clear();

        const tweenTargets = path.slice(1).map((p) => ({
            x: p.x * TILE_SIZE + TILE_SIZE / 2,
            y: p.y * TILE_SIZE + TILE_SIZE / 2,
        }));

        let currentIndex = 0;
        const moveNext = () => {
            if (currentIndex >= tweenTargets.length) {
                isClickMoving = false;
                return;
            }
            const target = tweenTargets[currentIndex];
            const dist = Phaser.Math.Distance.Between(player.x, player.y, target.x, target.y);
            const duration = (dist / MOVE_SPEED) * 1000;

            scene.tweens.add({
                targets: player,
                x: target.x,
                y: target.y,
                duration: Math.max(duration, 50),
                ease: "Linear",
                onComplete: () => {
                    currentIndex++;
                    moveNext();
                },
            });
        };
        moveNext();
    }

    function update(this: Phaser.Scene, time: number, delta: number) {
        const scene = this;
        if (!player) return;

        // ─── Keyboard Movement ───
        let vx = 0;
        let vy = 0;

        const left = cursors?.left?.isDown || keyA?.isDown;
        const right = cursors?.right?.isDown || keyD?.isDown;
        const up = cursors?.up?.isDown || keyW?.isDown;
        const down = cursors?.down?.isDown || keyS?.isDown;

        if (left) vx = -MOVE_SPEED;
        if (right) vx = MOVE_SPEED;
        if (up) vy = -MOVE_SPEED;
        if (down) vy = MOVE_SPEED;

        // If pressing keys, cancel path movement
        if (vx !== 0 || vy !== 0) {
            if (isClickMoving) {
                isClickMoving = false;
                scene.tweens.killTweensOf(player);
                pathLine.clear();
            }
            if (playerIdleTween) {
                playerIdleTween.stop();
                playerIdleTween = null;
            }
        }

        // Walking state and bob animation
        const wasWalking = isWalking;
        isWalking = (vx !== 0 || vy !== 0) || isClickMoving;
        if (isWalking) {
            walkBobOffset += delta * 0.012;
            // Subtle bob while walking
            const bobAmount = Math.sin(walkBobOffset) * 1.5;
            player.setData('bobOffset', bobAmount);
        } else {
            walkBobOffset = 0;
        }

        if (!isClickMoving) {
            // Normalize diagonal
            if (vx !== 0 && vy !== 0) {
                vx *= 0.707;
                vy *= 0.707;
            }

            const newX = player.x + vx * (delta / 1000);
            const newY = player.y + vy * (delta / 1000);

            // Separate X and Y collision checks so player slides along walls
            const ntx = Math.floor(newX / TILE_SIZE);
            const nty = Math.floor(newY / TILE_SIZE);
            const ctx = Math.floor(player.x / TILE_SIZE);
            const cty = Math.floor(player.y / TILE_SIZE);

            if (ntx >= 0 && ntx < MAP_WIDTH && cty >= 0 && cty < MAP_HEIGHT && collisionGrid[cty][ntx] === 0) {
                player.x = newX;
            }
            if (ctx >= 0 && ctx < MAP_WIDTH && nty >= 0 && nty < MAP_HEIGHT && collisionGrid[nty][ctx] === 0) {
                player.y = newY;
            }
        }

        // ─── Status indicator ───
        if (statusIndicator) {
            statusIndicator.setPosition(player.x + 12, player.y - 22);
        }

        // ─── Emote text follow ───
        if (emoteText) {
            emoteText.x = player.x;
        }

        // ─── Interactive furniture hint ───
        let nearFurniture = false;
        for (const f of mapConfig.furniture) {
            const fx = f.x * TILE_SIZE + (f.w * TILE_SIZE) / 2;
            const fy = f.y * TILE_SIZE + (f.h * TILE_SIZE) / 2;
            const dist = Phaser.Math.Distance.Between(player.x, player.y, fx, fy);
            if (dist < TILE_SIZE * 2.5 && f.label) {
                nearFurniture = true;
                if (!interactHint) {
                    interactHint = scene.add.text(fx, fy - 24, `${f.emoji || ''} ${f.label}`, {
                        fontSize: '10px', fontFamily: 'Inter, sans-serif',
                        color: '#c4b5fd', backgroundColor: 'rgba(30,20,50,0.85)',
                        padding: { x: 6, y: 3 },
                    }).setOrigin(0.5).setDepth(100);
                } else {
                    interactHint.setPosition(fx, fy - 24);
                    interactHint.setText(`${f.emoji || ''} ${f.label}`);
                }
                break;
            }
        }
        if (!nearFurniture && interactHint) {
            interactHint.destroy();
            interactHint = null;
        }

        // ─── Space → random emote ───
        if (keySpace && Phaser.Input.Keyboard.JustDown(keySpace) && !emoteText) {
            const emojis = ["👋", "💬", "🎉", "❤️", "😂", "🔥", "👍", "✨", "🙌", "💜", "🎵", "⚡"];
            showEmote(scene, emojis[Math.floor(Math.random() * emojis.length)]);
        }

        // ─── NPC logic ───
        for (const npc of npcs) {
            npc.moveTimer -= delta;
            if (npc.moveTimer <= 0) {
                const nx = (3 + Math.floor(Math.random() * 34)) * TILE_SIZE;
                const ny = (3 + Math.floor(Math.random() * 24)) * TILE_SIZE;
                const tx = Math.floor(nx / TILE_SIZE);
                const ty = Math.floor(ny / TILE_SIZE);

                if (collisionGrid[ty]?.[tx] === 0) {
                    npc.targetX = nx;
                    npc.targetY = ny;
                    scene.tweens.add({
                        targets: npc.sprite,
                        x: npc.targetX,
                        y: npc.targetY,
                        duration: 2000 + Math.random() * 3000,
                        ease: "Sine.easeInOut",
                    });
                }
                npc.moveTimer = 3000 + Math.random() * 5000;
            }

            // Proximity detection
            const dist = Phaser.Math.Distance.Between(player.x, player.y, npc.sprite.x, npc.sprite.y);

            if (dist < PROXIMITY_RADIUS && !npc.isProximate) {
                npc.isProximate = true;
                showProximityRing(scene, npc);
                showVideoBubble(scene, npc);
            } else if (dist >= PROXIMITY_RADIUS + 30 && npc.isProximate) {
                npc.isProximate = false;
                hideProximityRing(npc);
                hideVideoBubble(npc);
            }

            if (npc.proximityRing) npc.proximityRing.setPosition(npc.sprite.x, npc.sprite.y);
            if (npc.videoBubble) npc.videoBubble.setPosition(npc.sprite.x, npc.sprite.y - 45);

            // NPC idle breathing animation
            const breathe = Math.sin(time * 0.002 + npcs.indexOf(npc) * 0.5) * 0.5;
            npc.sprite.setScale(1, 1 + breathe * 0.02);
        }
    }

    // ─── Helper: show emote ───
    function showEmote(scene: Phaser.Scene, emoji: string) {
        emoteText = scene.add.text(player.x, player.y - 40, emoji, { fontSize: "24px" }).setOrigin(0.5).setDepth(100);
        scene.tweens.add({
            targets: emoteText,
            y: player.y - 80,
            alpha: 0,
            duration: 1500,
            ease: "Power2",
            onComplete: () => {
                emoteText?.destroy();
                emoteText = null;
            },
        });
    }

    // ─── Helper: proximity ring ───
    function showProximityRing(scene: Phaser.Scene, npc: NPC) {
        npc.proximityRing = scene.add.circle(npc.sprite.x, npc.sprite.y, PROXIMITY_RADIUS, npc.color, 0.08);
        npc.proximityRing.setStrokeStyle(1.5, npc.color, 0.3);
        npc.proximityRing.setDepth(1);
        scene.tweens.add({ targets: npc.proximityRing, alpha: { from: 0, to: 1 }, duration: 300 });
    }

    function hideProximityRing(npc: NPC) {
        npc.proximityRing?.destroy();
        npc.proximityRing = undefined;
    }

    // ─── Helper: video bubble ───
    function showVideoBubble(scene: Phaser.Scene, npc: NPC) {
        const bubble = scene.add.container(npc.sprite.x, npc.sprite.y - 45);
        const bg = scene.add.graphics();
        bg.fillStyle(0x1e1b2e, 0.9);
        bg.fillRoundedRect(-20, -16, 40, 32, 8);
        bg.lineStyle(1.5, npc.color, 0.6);
        bg.strokeRoundedRect(-20, -16, 40, 32, 8);
        bubble.add(bg);

        const icon = scene.add.text(0, 0, "🎥", { fontSize: "14px" }).setOrigin(0.5);
        bubble.add(icon);
        bubble.setDepth(50);
        bubble.setScale(0);

        scene.tweens.add({
            targets: bubble,
            scaleX: 1, scaleY: 1,
            duration: 300,
            ease: "Back.easeOut",
        });

        npc.videoBubble = bubble;
    }

    function hideVideoBubble(npc: NPC) {
        npc.videoBubble?.destroy();
        npc.videoBubble = undefined;
    }

    // ─── Helper: create avatar ───
    function createAvatar(
        scene: Phaser.Scene,
        x: number, y: number,
        name: string, color: number,
        isPlayer: boolean
    ): Phaser.GameObjects.Container {
        const container = scene.add.container(x, y);

        // Shadow
        const shadow = scene.add.ellipse(0, 10, 22, 8, 0x000000, 0.3);
        container.add(shadow);

        // Body
        const body = scene.add.graphics();
        body.fillStyle(color, 1);
        body.fillRoundedRect(-10, -8, 20, 22, 4);
        container.add(body);

        // Head (skin color)
        const head = scene.add.graphics();
        head.fillStyle(0xfdbcb4, 1);
        head.fillCircle(0, -14, 8);
        container.add(head);

        // Eyes
        container.add(scene.add.circle(-3, -15, 1.5, 0x2d2d2d));
        container.add(scene.add.circle(3, -15, 1.5, 0x2d2d2d));

        // Hair
        const hair = scene.add.graphics();
        const hColor = Phaser.Display.Color.IntegerToColor(color).darken(30).color;
        hair.fillStyle(hColor, 1);
        hair.fillRoundedRect(-8, -22, 16, 6, 3);
        container.add(hair);

        // Nametag
        const tag = scene.add.text(0, 16, name, {
            fontSize: "10px",
            fontFamily: "Inter, sans-serif",
            color: "#ffffff",
            backgroundColor: "rgba(0,0,0,0.5)",
            padding: { x: 4, y: 1 },
        }).setOrigin(0.5).setResolution(2);
        container.add(tag);

        // Player glow ring + pulse
        if (isPlayer) {
            const glow = scene.add.circle(0, 0, 18, color, 0.12);
            container.add(glow);
            container.sendToBack(glow);
            // Subtle pulse on player glow
            scene.tweens.add({
                targets: glow,
                scaleX: 1.3,
                scaleY: 1.3,
                alpha: 0.06,
                duration: 2000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
            });
        }

        return container;
    }

    // ─── Helper: draw floor ───
    function drawFloor(graphics: Phaser.GameObjects.Graphics, cfg: MapConfig) {
        // Base floor
        graphics.fillStyle(cfg.floorColor, 1);
        graphics.fillRect(0, 0, MAP_WIDTH * TILE_SIZE, MAP_HEIGHT * TILE_SIZE);

        // Dot grid (cleaner than line grid)
        graphics.fillStyle(0x2d2640, 0.5);
        for (let x = 0; x <= MAP_WIDTH; x++) {
            for (let y = 0; y <= MAP_HEIGHT; y++) {
                graphics.fillCircle(x * TILE_SIZE, y * TILE_SIZE, 1);
            }
        }

        // Stage area
        if (cfg.stageArea) {
            const s = cfg.stageArea;
            graphics.fillStyle(s.color, 0.5);
            graphics.fillRect(s.x * TILE_SIZE, s.y * TILE_SIZE, s.w * TILE_SIZE, s.h * TILE_SIZE);
        }

        // Zones (carpet, lounge, etc.)
        for (const z of cfg.zones) {
            graphics.fillStyle(z.color, z.alpha);
            graphics.fillRect(z.x * TILE_SIZE, z.y * TILE_SIZE, z.w * TILE_SIZE, z.h * TILE_SIZE);
        }

        // Wall outline
        graphics.lineStyle(3, 0x4a3870, 0.8);
        graphics.strokeRect(0, 0, MAP_WIDTH * TILE_SIZE, MAP_HEIGHT * TILE_SIZE);
    }

    // ─── Helper: draw furniture ───
    function drawFurniture(scene: Phaser.Scene, items: FurnitureItem[]) {
        for (const f of items) {
            const g = scene.add.graphics();
            g.setDepth(2);
            const px = f.x * TILE_SIZE;
            const py = f.y * TILE_SIZE;
            const pw = f.w * TILE_SIZE;
            const ph = f.h * TILE_SIZE;

            switch (f.type) {
                case "whiteboard":
                    g.fillStyle(0xffffff, 0.9);
                    g.fillRoundedRect(px, py, pw, ph, 4);
                    g.lineStyle(2, 0x666666, 1);
                    g.strokeRoundedRect(px, py, pw, ph, 4);
                    if (f.label) {
                        scene.add.text(px + pw / 2, py + ph / 2, `${f.emoji} ${f.label}`, {
                            fontSize: "8px", color: "#333",
                        }).setOrigin(0.5).setDepth(3);
                    }
                    break;
                case "podium":
                    g.fillStyle(f.color, 0.8);
                    g.fillRoundedRect(px, py, pw, ph, 4);
                    scene.add.text(px + pw / 2, py + ph / 2, f.emoji, { fontSize: "12px" }).setOrigin(0.5).setDepth(3);
                    break;
                case "plant":
                    g.fillStyle(f.color, 0.6);
                    g.fillCircle(px + 16, py + 16, 12);
                    scene.add.text(px + 16, py + 16, f.emoji, { fontSize: "12px" }).setOrigin(0.5).setDepth(3);
                    break;
                case "bookshelf":
                    g.fillStyle(f.color, 0.7);
                    g.fillRoundedRect(px, py, pw, ph, 2);
                    scene.add.text(px + pw / 2, py + ph / 2, f.emoji, { fontSize: "10px" }).setOrigin(0.5).setDepth(3);
                    break;
                case "sofa":
                    g.fillStyle(f.color, 0.4);
                    g.fillRoundedRect(px, py, pw, ph, 6);
                    scene.add.text(px + pw / 2, py + ph / 2, f.emoji, { fontSize: "14px" }).setOrigin(0.5).setDepth(3);
                    break;
                case "coffee":
                    g.fillStyle(f.color, 0.6);
                    g.fillRoundedRect(px, py, pw, ph, 4);
                    scene.add.text(px + pw / 2, py + ph / 2, f.emoji, { fontSize: "12px" }).setOrigin(0.5).setDepth(3);
                    break;
                case "monitor":
                    g.fillStyle(f.color, 0.8);
                    g.fillRoundedRect(px, py, pw, ph, 3);
                    scene.add.text(px + pw / 2, py + ph / 2, f.emoji, { fontSize: "12px" }).setOrigin(0.5).setDepth(3);
                    break;
                case "counter":
                    g.fillStyle(f.color, 0.7);
                    g.fillRoundedRect(px, py, pw, ph, 4);
                    g.lineStyle(1, 0x888888, 0.3);
                    g.strokeRoundedRect(px, py, pw, ph, 4);
                    if (f.label) {
                        scene.add.text(px + pw / 2, py + ph / 2, `${f.emoji} ${f.label}`, {
                            fontSize: "8px", color: "#ccc",
                        }).setOrigin(0.5).setDepth(3);
                    } else {
                        scene.add.text(px + pw / 2, py + ph / 2, f.emoji, { fontSize: "12px" }).setOrigin(0.5).setDepth(3);
                    }
                    break;
                case "stage":
                    g.fillStyle(f.color, 0.35);
                    g.fillRoundedRect(px, py, pw, ph, 6);
                    g.lineStyle(1.5, f.color, 0.5);
                    g.strokeRoundedRect(px, py, pw, ph, 6);
                    scene.add.text(px + pw / 2, py + ph / 2, f.emoji, { fontSize: "16px" }).setOrigin(0.5).setDepth(3);
                    break;
                case "table":
                    g.fillStyle(f.color, 0.5);
                    g.fillRoundedRect(px + 2, py + 2, pw - 4, ph - 4, 4);
                    g.lineStyle(1, 0x5a4d6d, 0.3);
                    g.strokeRoundedRect(px + 2, py + 2, pw - 4, ph - 4, 4);
                    if (f.emoji) scene.add.text(px + pw / 2, py + ph / 2, f.emoji, { fontSize: "12px" }).setOrigin(0.5).setDepth(3);
                    break;
                default:
                    // Desk or generic
                    g.fillStyle(f.color, 0.6);
                    g.fillRoundedRect(px + 2, py + 2, pw - 4, ph - 4, 3);
                    g.lineStyle(1, 0x5a4d6d, 0.4);
                    g.strokeRoundedRect(px + 2, py + 2, pw - 4, ph - 4, 3);
                    break;
            }
        }
    }

    return { key: "RoomScene", preload, create, update };
}
