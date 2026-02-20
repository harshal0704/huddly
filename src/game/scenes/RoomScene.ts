// ============================================
// Huddly — Room Scene (Phaser 3)
// ============================================
// Main game scene for the in-room experience.
// Handles: tilemap rendering, avatar movement,
// proximity detection, NPC simulation, interactive objects.

import EasyStar from "easystarjs";

// Colors for NPC avatars
const AVATAR_COLORS = [
    0x8b5cf6, 0x6366f1, 0x3b82f6, 0x06b6d4, 0x10b981,
    0xf59e0b, 0xef4444, 0xec4899, 0xa855f7, 0x14b8a6,
];

const TILE_SIZE = 32;
const MAP_WIDTH = 40;
const MAP_HEIGHT = 30;
const PROXIMITY_RADIUS = 150;
const MOVE_SPEED = 120;

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

// We export functions to be used as a Phaser scene config
export function createRoomScene() {
    let player: Phaser.GameObjects.Container;
    let cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    let wasdKeys: Record<string, Phaser.Input.Keyboard.Key>;
    let npcs: NPC[] = [];
    let floorGraphics: Phaser.GameObjects.Graphics;
    let furnitureGroup: Phaser.GameObjects.Group;
    let easyStar: EasyStar.js;
    let collisionGrid: number[][] = [];
    let playerTargetX: number | null = null;
    let playerTargetY: number | null = null;
    let pathLine: Phaser.GameObjects.Graphics;
    let isClickMoving = false;
    let emoteText: Phaser.GameObjects.Text | null = null;
    let statusIndicator: Phaser.GameObjects.Arc;

    function preload(this: Phaser.Scene) {
        // No external assets needed — we draw everything procedurally
    }

    function create(this: Phaser.Scene) {
        const scene = this;

        // Initialize EasyStar pathfinding
        easyStar = new EasyStar.js();

        // Build collision grid (0 = walkable, 1 = blocked)
        collisionGrid = [];
        for (let y = 0; y < MAP_HEIGHT; y++) {
            const row: number[] = [];
            for (let x = 0; x < MAP_WIDTH; x++) {
                // Border walls
                if (x === 0 || y === 0 || x === MAP_WIDTH - 1 || y === MAP_HEIGHT - 1) {
                    row.push(1);
                } else {
                    row.push(0);
                }
            }
            collisionGrid.push(row);
        }

        // Furniture collision areas (desks, whiteboard, etc.)
        const furniturePositions = [
            // Desks (classroom style rows)
            { x: 8, y: 8, w: 2, h: 1 }, { x: 12, y: 8, w: 2, h: 1 }, { x: 16, y: 8, w: 2, h: 1 },
            { x: 20, y: 8, w: 2, h: 1 }, { x: 24, y: 8, w: 2, h: 1 },
            { x: 8, y: 12, w: 2, h: 1 }, { x: 12, y: 12, w: 2, h: 1 }, { x: 16, y: 12, w: 2, h: 1 },
            { x: 20, y: 12, w: 2, h: 1 }, { x: 24, y: 12, w: 2, h: 1 },
            { x: 8, y: 16, w: 2, h: 1 }, { x: 12, y: 16, w: 2, h: 1 }, { x: 16, y: 16, w: 2, h: 1 },
            { x: 20, y: 16, w: 2, h: 1 }, { x: 24, y: 16, w: 2, h: 1 },
            // Whiteboard at front
            { x: 14, y: 3, w: 6, h: 1 },
            // Podium
            { x: 16, y: 5, w: 2, h: 1 },
            // Bookshelves on right wall
            { x: 34, y: 5, w: 1, h: 8 },
            // Sofa area bottom-right
            { x: 30, y: 22, w: 3, h: 2 },
            // Plants
            { x: 2, y: 2, w: 1, h: 1 }, { x: 37, y: 2, w: 1, h: 1 },
            { x: 2, y: 27, w: 1, h: 1 }, { x: 37, y: 27, w: 1, h: 1 },
            // Coffee area bottom-left
            { x: 3, y: 22, w: 2, h: 2 },
        ];

        // Mark furniture in collision grid
        furniturePositions.forEach((f) => {
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

        // Draw floor
        floorGraphics = scene.add.graphics();
        drawFloor(floorGraphics);

        // Draw furniture
        furnitureGroup = scene.add.group();
        drawFurniture(scene, furniturePositions);

        // Path line for click-to-move
        pathLine = scene.add.graphics();
        pathLine.setDepth(5);

        // Create player avatar
        player = createAvatar(scene, 15 * TILE_SIZE, 20 * TILE_SIZE, "You", 0x8b5cf6, true);
        player.setDepth(10);
        scene.cameras.main.startFollow(player, true, 0.08, 0.08);
        scene.cameras.main.setZoom(1.2);

        // Status indicator
        statusIndicator = scene.add.circle(0, 0, 4, 0x10b981);
        statusIndicator.setDepth(100);

        // Create NPC avatars
        const npcNames = ["Alex", "Maya", "Sam", "Jo", "Lee", "Kai", "Rui", "Zoe"];
        for (let i = 0; i < 8; i++) {
            const nx = (5 + Math.floor(Math.random() * 30)) * TILE_SIZE;
            const ny = (5 + Math.floor(Math.random() * 20)) * TILE_SIZE;
            const npcSprite = createAvatar(scene, nx, ny, npcNames[i], AVATAR_COLORS[i], false);
            npcSprite.setDepth(9);

            npcs.push({
                sprite: npcSprite,
                name: npcNames[i],
                targetX: nx,
                targetY: ny,
                moveTimer: Math.random() * 3000,
                color: AVATAR_COLORS[i],
                isProximate: false,
            });
        }

        // Input: keyboard
        if (scene.input.keyboard) {
            cursors = scene.input.keyboard.createCursorKeys();
            wasdKeys = {
                W: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
                A: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
                S: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
                D: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
                SPACE: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
            };
        }

        // Input: click-to-move
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
                        // Draw path line
                        pathLine.clear();
                        pathLine.lineStyle(2, 0x8b5cf6, 0.3);
                        pathLine.moveTo(player.x, player.y);
                        for (const point of path) {
                            pathLine.lineTo(point.x * TILE_SIZE + TILE_SIZE / 2, point.y * TILE_SIZE + TILE_SIZE / 2);
                        }
                        pathLine.strokePath();

                        // Move along path
                        moveAlongPath(scene, path);
                    }
                });
                easyStar.calculate();
            }
        });

        // Set world bounds
        scene.physics.world.setBounds(0, 0, MAP_WIDTH * TILE_SIZE, MAP_HEIGHT * TILE_SIZE);
        scene.cameras.main.setBounds(0, 0, MAP_WIDTH * TILE_SIZE, MAP_HEIGHT * TILE_SIZE);
    }

    function moveAlongPath(scene: Phaser.Scene, path: { x: number; y: number }[]) {
        isClickMoving = true;
        pathLine.clear();

        const tweenTargets: { x: number; y: number }[] = path.slice(1).map((p) => ({
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
        if (!player || !cursors) return;

        // Keyboard movement (WASD + arrows)
        let vx = 0;
        let vy = 0;

        if (cursors.left?.isDown || wasdKeys?.A?.isDown) vx = -MOVE_SPEED;
        if (cursors.right?.isDown || wasdKeys?.D?.isDown) vx = MOVE_SPEED;
        if (cursors.up?.isDown || wasdKeys?.W?.isDown) vy = -MOVE_SPEED;
        if (cursors.down?.isDown || wasdKeys?.S?.isDown) vy = MOVE_SPEED;

        if (vx !== 0 || vy !== 0) {
            isClickMoving = false;
            scene.tweens.killAll();
            pathLine.clear();
        }

        if (!isClickMoving) {
            // Normalize diagonal movement
            if (vx !== 0 && vy !== 0) {
                vx *= 0.707;
                vy *= 0.707;
            }

            const newX = player.x + vx * (delta / 1000);
            const newY = player.y + vy * (delta / 1000);

            // Collision check
            const tileX = Math.floor(newX / TILE_SIZE);
            const tileY = Math.floor(newY / TILE_SIZE);

            if (tileX >= 0 && tileX < MAP_WIDTH && tileY >= 0 && tileY < MAP_HEIGHT) {
                if (collisionGrid[tileY]?.[Math.floor(newX / TILE_SIZE)] === 0) {
                    player.x = newX;
                }
                if (collisionGrid[Math.floor(newY / TILE_SIZE)]?.[Math.floor(player.x / TILE_SIZE)] === 0) {
                    player.y = newY;
                }
            }
        }

        // Update status indicator position
        if (statusIndicator) {
            statusIndicator.setPosition(player.x + 12, player.y - 22);
        }

        // Emote text follow
        if (emoteText) {
            emoteText.setPosition(player.x, player.y - 40);
        }

        // Space key for quick emote
        if (wasdKeys?.SPACE?.isDown && !emoteText) {
            showEmote(scene, ["👋", "💬", "🎉", "❤️", "😂", "🔥"][Math.floor(Math.random() * 6)]);
        }

        // Move NPCs
        for (const npc of npcs) {
            npc.moveTimer -= delta;
            if (npc.moveTimer <= 0) {
                // Pick a new random target
                const nx = (3 + Math.floor(Math.random() * 34)) * TILE_SIZE;
                const ny = (3 + Math.floor(Math.random() * 24)) * TILE_SIZE;
                const targetTileX = Math.floor(nx / TILE_SIZE);
                const targetTileY = Math.floor(ny / TILE_SIZE);

                if (collisionGrid[targetTileY]?.[targetTileX] === 0) {
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
            const dist = Phaser.Math.Distance.Between(
                player.x, player.y,
                npc.sprite.x, npc.sprite.y
            );

            if (dist < PROXIMITY_RADIUS && !npc.isProximate) {
                npc.isProximate = true;
                showProximityRing(scene, npc);
                showVideoBubble(scene, npc);
            } else if (dist >= PROXIMITY_RADIUS + 30 && npc.isProximate) {
                npc.isProximate = false;
                hideProximityRing(npc);
                hideVideoBubble(npc);
            }

            // Update proximity ring position
            if (npc.proximityRing) {
                npc.proximityRing.setPosition(npc.sprite.x, npc.sprite.y);
            }

            // Update video bubble position
            if (npc.videoBubble) {
                npc.videoBubble.setPosition(npc.sprite.x, npc.sprite.y - 45);
            }
        }
    }

    function showEmote(scene: Phaser.Scene, emoji: string) {
        emoteText = scene.add.text(player.x, player.y - 40, emoji, {
            fontSize: "24px",
        }).setOrigin(0.5).setDepth(100);

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

    function showProximityRing(scene: Phaser.Scene, npc: NPC) {
        npc.proximityRing = scene.add.circle(
            npc.sprite.x, npc.sprite.y,
            PROXIMITY_RADIUS, npc.color, 0.08
        );
        npc.proximityRing.setStrokeStyle(1.5, npc.color, 0.3);
        npc.proximityRing.setDepth(1);

        scene.tweens.add({
            targets: npc.proximityRing,
            alpha: { from: 0, to: 1 },
            duration: 300,
        });
    }

    function hideProximityRing(npc: NPC) {
        if (npc.proximityRing) {
            npc.proximityRing.destroy();
            npc.proximityRing = undefined;
        }
    }

    function showVideoBubble(scene: Phaser.Scene, npc: NPC) {
        const bubble = scene.add.container(npc.sprite.x, npc.sprite.y - 45);

        // Background
        const bg = scene.add.graphics();
        bg.fillStyle(0x1e1b2e, 0.9);
        bg.fillRoundedRect(-20, -16, 40, 32, 8);
        bg.lineStyle(1.5, npc.color, 0.6);
        bg.strokeRoundedRect(-20, -16, 40, 32, 8);
        bubble.add(bg);

        // Fake video avatar icon
        const icon = scene.add.text(0, 0, "🎥", { fontSize: "14px" }).setOrigin(0.5);
        bubble.add(icon);

        bubble.setDepth(50);
        bubble.setScale(0);

        scene.tweens.add({
            targets: bubble,
            scaleX: 1,
            scaleY: 1,
            duration: 300,
            ease: "Back.easeOut",
        });

        npc.videoBubble = bubble;
    }

    function hideVideoBubble(npc: NPC) {
        if (npc.videoBubble) {
            npc.videoBubble.destroy();
            npc.videoBubble = undefined;
        }
    }

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

        // Head
        const head = scene.add.graphics();
        head.fillStyle(0xfdbcb4, 1);
        head.fillCircle(0, -14, 8);
        container.add(head);

        // Eyes
        const leftEye = scene.add.circle(-3, -15, 1.5, 0x2d2d2d);
        const rightEye = scene.add.circle(3, -15, 1.5, 0x2d2d2d);
        container.add(leftEye);
        container.add(rightEye);

        // Hair
        const hair = scene.add.graphics();
        hair.fillStyle(Phaser.Display.Color.IntegerToColor(color).darken(30).color, 1);
        hair.fillRoundedRect(-8, -22, 16, 6, 3);
        container.add(hair);

        // Name tag
        const nameTag = scene.add.text(0, 16, name, {
            fontSize: "10px",
            fontFamily: "Inter, sans-serif",
            color: "#ffffff",
            backgroundColor: "rgba(0,0,0,0.5)",
            padding: { x: 4, y: 1 },
        }).setOrigin(0.5);
        nameTag.setResolution(2);
        container.add(nameTag);

        // Player glow
        if (isPlayer) {
            const glow = scene.add.circle(0, 0, 16, color, 0.15);
            container.add(glow);
            container.sendToBack(glow);

            // Idle float animation
            scene.tweens.add({
                targets: container,
                y: y - 2,
                duration: 1500,
                yoyo: true,
                repeat: -1,
                ease: "Sine.easeInOut",
            });
        }

        return container;
    }

    function drawFloor(graphics: Phaser.GameObjects.Graphics) {
        // Main floor - warm dark wood tint
        graphics.fillStyle(0x1a1025, 1);
        graphics.fillRect(0, 0, MAP_WIDTH * TILE_SIZE, MAP_HEIGHT * TILE_SIZE);

        // Grid lines
        graphics.lineStyle(0.5, 0x2d2640, 0.5);
        for (let x = 0; x <= MAP_WIDTH; x++) {
            graphics.moveTo(x * TILE_SIZE, 0);
            graphics.lineTo(x * TILE_SIZE, MAP_HEIGHT * TILE_SIZE);
        }
        for (let y = 0; y <= MAP_HEIGHT; y++) {
            graphics.moveTo(0, y * TILE_SIZE);
            graphics.lineTo(MAP_WIDTH * TILE_SIZE, y * TILE_SIZE);
        }
        graphics.strokePath();

        // Stage area (lighter)
        graphics.fillStyle(0x2d1f4e, 0.5);
        graphics.fillRect(10 * TILE_SIZE, 2 * TILE_SIZE, 20 * TILE_SIZE, 5 * TILE_SIZE);

        // Carpet area
        graphics.fillStyle(0x1e3a5f, 0.2);
        graphics.fillRect(6 * TILE_SIZE, 7 * TILE_SIZE, 24 * TILE_SIZE, 12 * TILE_SIZE);

        // Lounge area
        graphics.fillStyle(0x2a1f1f, 0.3);
        graphics.fillRect(28 * TILE_SIZE, 20 * TILE_SIZE, 8 * TILE_SIZE, 6 * TILE_SIZE);

        // Coffee corner
        graphics.fillStyle(0x3d2b1f, 0.3);
        graphics.fillRect(2 * TILE_SIZE, 20 * TILE_SIZE, 6 * TILE_SIZE, 6 * TILE_SIZE);

        // Wall outlines
        graphics.lineStyle(3, 0x4a3870, 0.8);
        graphics.strokeRect(0, 0, MAP_WIDTH * TILE_SIZE, MAP_HEIGHT * TILE_SIZE);
    }

    function drawFurniture(scene: Phaser.Scene, positions: { x: number; y: number; w: number; h: number }[]) {
        positions.forEach((f, i) => {
            const g = scene.add.graphics();
            g.setDepth(2);

            // Determine furniture type by position
            if (f.y === 3 && f.x === 14) {
                // Whiteboard
                g.fillStyle(0xffffff, 0.9);
                g.fillRoundedRect(f.x * TILE_SIZE, f.y * TILE_SIZE, f.w * TILE_SIZE, f.h * TILE_SIZE, 4);
                g.lineStyle(2, 0x666666, 1);
                g.strokeRoundedRect(f.x * TILE_SIZE, f.y * TILE_SIZE, f.w * TILE_SIZE, f.h * TILE_SIZE, 4);

                const label = scene.add.text(
                    f.x * TILE_SIZE + (f.w * TILE_SIZE) / 2, f.y * TILE_SIZE + (f.h * TILE_SIZE) / 2,
                    "📋 Whiteboard", { fontSize: "8px", color: "#333333" }
                ).setOrigin(0.5).setDepth(3);
            } else if (f.y === 5 && f.x === 16) {
                // Podium
                g.fillStyle(0x8b4513, 0.8);
                g.fillRoundedRect(f.x * TILE_SIZE, f.y * TILE_SIZE, f.w * TILE_SIZE, f.h * TILE_SIZE, 4);
                const label = scene.add.text(
                    f.x * TILE_SIZE + (f.w * TILE_SIZE) / 2, f.y * TILE_SIZE + (f.h * TILE_SIZE) / 2,
                    "🎤", { fontSize: "12px" }
                ).setOrigin(0.5).setDepth(3);
            } else if (f.w === 1 && f.h === 1 && i >= positions.length - 6) {
                // Plants
                g.fillStyle(0x228b22, 0.6);
                g.fillCircle(f.x * TILE_SIZE + 16, f.y * TILE_SIZE + 16, 12);
                const label = scene.add.text(
                    f.x * TILE_SIZE + 16, f.y * TILE_SIZE + 16,
                    "🌿", { fontSize: "12px" }
                ).setOrigin(0.5).setDepth(3);
            } else if (f.x === 34) {
                // Bookshelf
                g.fillStyle(0x5c3317, 0.7);
                g.fillRoundedRect(f.x * TILE_SIZE, f.y * TILE_SIZE, f.w * TILE_SIZE, f.h * TILE_SIZE, 2);
                const label = scene.add.text(
                    f.x * TILE_SIZE + (f.w * TILE_SIZE) / 2, f.y * TILE_SIZE + (f.h * TILE_SIZE) / 2,
                    "📚", { fontSize: "10px" }
                ).setOrigin(0.5).setDepth(3);
            } else if (f.x === 30 && f.y === 22) {
                // Sofa
                g.fillStyle(0x8b5cf6, 0.4);
                g.fillRoundedRect(f.x * TILE_SIZE, f.y * TILE_SIZE, f.w * TILE_SIZE, f.h * TILE_SIZE, 6);
                const label = scene.add.text(
                    f.x * TILE_SIZE + (f.w * TILE_SIZE) / 2, f.y * TILE_SIZE + (f.h * TILE_SIZE) / 2,
                    "🛋️", { fontSize: "14px" }
                ).setOrigin(0.5).setDepth(3);
            } else if (f.x === 3 && f.y === 22) {
                // Coffee machine
                g.fillStyle(0x4a2c2a, 0.6);
                g.fillRoundedRect(f.x * TILE_SIZE, f.y * TILE_SIZE, f.w * TILE_SIZE, f.h * TILE_SIZE, 4);
                const label = scene.add.text(
                    f.x * TILE_SIZE + (f.w * TILE_SIZE) / 2, f.y * TILE_SIZE + (f.h * TILE_SIZE) / 2,
                    "☕", { fontSize: "12px" }
                ).setOrigin(0.5).setDepth(3);
            } else {
                // Regular desks
                g.fillStyle(0x3d3040, 0.6);
                g.fillRoundedRect(f.x * TILE_SIZE + 2, f.y * TILE_SIZE + 2, f.w * TILE_SIZE - 4, f.h * TILE_SIZE - 4, 3);
                g.lineStyle(1, 0x5a4d6d, 0.4);
                g.strokeRoundedRect(f.x * TILE_SIZE + 2, f.y * TILE_SIZE + 2, f.w * TILE_SIZE - 4, f.h * TILE_SIZE - 4, 3);
            }
        });
    }

    return { key: "RoomScene", preload, create, update };
}
