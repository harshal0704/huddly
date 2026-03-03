"use client";

import React, { useRef, useMemo, useEffect, useCallback, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  Stars,
  Text,
  RoundedBox,
  MeshReflectorMaterial,
  Float,
  Sparkles,
  Sky,
} from "@react-three/drei";
import * as THREE from "three";

// ─── Types ───────────────────────────────────────────────────────
type RoomTemplate = "classroom" | "office" | "cafe" | "conference" | "party" | "library" | "gaming" | "rooftop" | "theater";

interface ThreeRoomProps {
  template?: RoomTemplate;
  roomName?: string;
  broadcastStream?: MediaStream | null;
  onBroadcast?: () => void;
}

// ─── Colour Palettes Per Template ────────────────────────────────
const PALETTES: Record<RoomTemplate, { primary: string; accent: string; floor: string; wall: string; emissive: string }> = {
  classroom: { primary: "#7c3aed", accent: "#a78bfa", floor: "#08041a", wall: "#1a0a3e", emissive: "#c4b5fd" },
  office: { primary: "#0891b2", accent: "#22d3ee", floor: "#041318", wall: "#0c2d3a", emissive: "#67e8f9" },
  cafe: { primary: "#d97706", accent: "#fbbf24", floor: "#120c04", wall: "#3d2200", emissive: "#fde68a" },
  conference: { primary: "#7c3aed", accent: "#c4b5fd", floor: "#06031a", wall: "#200d50", emissive: "#ddd6fe" },
  party: { primary: "#db2777", accent: "#f472b6", floor: "#140610", wall: "#3b0a28", emissive: "#fbcfe8" },
  library: { primary: "#b45309", accent: "#f59e0b", floor: "#0e0a04", wall: "#332000", emissive: "#fcd34d" },
  gaming: { primary: "#0891b2", accent: "#06b6d4", floor: "#040e12", wall: "#082830", emissive: "#22d3ee" },
  rooftop: { primary: "#65a30d", accent: "#a3e635", floor: "#080e04", wall: "#1a3008", emissive: "#d9f99d" },
  theater: { primary: "#dc2626", accent: "#f87171", floor: "#120404", wall: "#350a0a", emissive: "#fecaca" },
};

// ─── AABB Collision Box ──────────────────────────────────────────
interface AABB { minX: number; maxX: number; minZ: number; maxZ: number; }

function makeAABB(cx: number, cz: number, hw: number, hd: number): AABB {
  return { minX: cx - hw, maxX: cx + hw, minZ: cz - hd, maxZ: cz + hd };
}

function checkCollision(x: number, z: number, boxes: AABB[], radius = 0.35): boolean {
  for (const b of boxes) {
    if (x + radius > b.minX && x - radius < b.maxX && z + radius > b.minZ && z - radius < b.maxZ) return true;
  }
  return false;
}

// Per-template collision boxes (walls + major furniture)
const ROOM_COLLIDERS: Record<RoomTemplate, AABB[]> = {
  classroom: [
    makeAABB(0, -12, 12, 0.2), makeAABB(-12, 0, 0.2, 12), makeAABB(12, 0, 0.2, 12), // walls
    ...Array.from({ length: 3 }, (_, r) => Array.from({ length: 4 }, (_, c) => makeAABB((c - 1.5) * 3, r * 3 + 1, 1, 0.5))).flat(), // desks
    makeAABB(0, -7, 1, 0.5), // teacher desk
  ],
  office: [
    makeAABB(0, -10, 10, 0.2), makeAABB(-10, 0, 0.2, 10), makeAABB(10, 0, 0.2, 10),
    ...([[-4, -3], [-4, 0], [-4, 3], [4, -3], [4, 0], [4, 3]] as [number, number][]).map(([x, z]) => makeAABB(x, z, 1, 0.5)),
    makeAABB(0, 6, 1, 0.4), // sofa
  ],
  cafe: [
    makeAABB(0, -8, 8, 0.2), makeAABB(-8, 0, 0.2, 8), makeAABB(8, 0, 0.2, 8),
    makeAABB(0, -6, 4, 0.4), // bar counter
    ...[[-4, 0], [0, 2], [4, 0], [-3, 5], [3, 5]].map(([x, z]) => makeAABB(x, z, 0.5, 0.5)),
  ],
  conference: [
    makeAABB(0, -14, 14, 0.2), makeAABB(-14, 0, 0.2, 14), makeAABB(14, 0, 0.2, 14),
    makeAABB(0, -8, 7, 3), // stage
  ],
  party: [
    makeAABB(0, -12, 12, 0.2), makeAABB(-12, 0, 0.2, 12), makeAABB(12, 0, 0.2, 12),
    makeAABB(0, -9, 1.5, 0.75), // DJ booth
    makeAABB(-8, 4, 1, 0.4), makeAABB(8, 4, 1, 0.4), // sofas
  ],
  library: [
    makeAABB(0, -10, 10, 0.2), makeAABB(-10, 0, 0.2, 10), makeAABB(10, 0, 0.2, 10),
    ...[-7, -4.5, -2, 0.5, 3, 5.5, 8].map(x => makeAABB(x, -9.3, 0.75, 0.2)),
    ...[-6, -3, 0, 3, 6].map(z => makeAABB(-9.3, z, 0.2, 0.75)),
    ...[[-1.5, 2], [1.5, 2], [-1.5, 5], [1.5, 5]].map(([x, z]) => makeAABB(x, z, 1, 0.5)),
  ],
  gaming: [
    makeAABB(0, -10, 10, 0.2), makeAABB(-10, 0, 0.2, 10), makeAABB(10, 0, 0.2, 10),
    ...[[-6, -4], [-3, -4], [0, -4], [3, -4], [6, -4]].map(([x, z]) => makeAABB(x, z, 1, 0.5)),
    makeAABB(9.2, 0, 1, 0.25), // trophy case
  ],
  rooftop: [
    makeAABB(0, -10, 10, 0.1), makeAABB(-10, 0, 0.1, 10), makeAABB(10, 0, 0.1, 10), makeAABB(0, 10, 10, 0.1),
    ...[[-7, -5], [-7, 0], [-7, 5], [7, -5], [7, 0], [7, 5]].map(([x, z]) => makeAABB(x, z, 0.75, 0.4)),
  ],
  theater: [
    makeAABB(0, -14, 14, 0.2), makeAABB(-14, 0, 0.2, 14), makeAABB(14, 0, 0.2, 14),
  ],
};

// ─── WASD Keyboard State Hook ────────────────────────────────────
function useKeyboard() {
  const keys = useRef<Record<string, boolean>>({});
  useEffect(() => {
    const down = (e: KeyboardEvent) => { keys.current[e.key.toLowerCase()] = true; };
    const up = (e: KeyboardEvent) => { keys.current[e.key.toLowerCase()] = false; };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, []);
  return keys;
}

// ─── Neon Strip ──────────────────────────────────────────────────
function NeonStrip({ start, end, color }: { start: [number, number, number]; end: [number, number, number]; color: string }) {
  const obj = useMemo(() => {
    const g = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...start), new THREE.Vector3(...end)]);
    return new THREE.Line(g, new THREE.LineBasicMaterial({ color, linewidth: 2 }));
  }, [start, end, color]);
  return <primitive object={obj} />;
}

// ─── Reflective Floor ────────────────────────────────────────────
function ReflectiveFloor({ color }: { color: string }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[80, 80]} />
      <MeshReflectorMaterial
        blur={[300, 100]} resolution={1024} mixBlur={1} mixStrength={40}
        roughness={1} depthScale={1.2} minDepthThreshold={0.4} maxDepthThreshold={1.4}
        color={color} metalness={0.5} mirror={0.5}
      />
    </mesh>
  );
}

// ─── Floor Grid ──────────────────────────────────────────────────
function FloorGrid({ color }: { color: string }) {
  return <gridHelper args={[80, 80, color, color]} position={[0, 0.01, 0]} material-opacity={0.07} material-transparent={true} />;
}

// ─── Wall Panel ──────────────────────────────────────────────────
function WallPanel({ position, size, color, emissiveColor }: {
  position: [number, number, number]; size: [number, number, number]; color: string; emissiveColor: string;
}) {
  return (
    <RoundedBox args={size} position={position} radius={0.05} smoothness={4} castShadow receiveShadow>
      <meshStandardMaterial color={color} emissive={emissiveColor} emissiveIntensity={0.03} roughness={0.6} metalness={0.3} />
    </RoundedBox>
  );
}

// ─── Live Broadcast Screen (shows webcam/screenshare when active) ─
function LiveBroadcastScreen({ position, rotation = [0, 0, 0], size = [6, 3.5, 0.15], playerRef, stream, onActivate }: {
  position: [number, number, number]; rotation?: [number, number, number]; size?: [number, number, number];
  playerRef: React.RefObject<THREE.Vector3>; stream?: MediaStream | null; onActivate?: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const textureRef = useRef<THREE.CanvasTexture | null>(null);
  const [near, setNear] = useState(false);
  const [broadcasting, setBroadcasting] = useState(false);

  // Create video element for stream
  useEffect(() => {
    if (stream && stream.active) {
      const video = document.createElement("video");
      video.srcObject = stream;
      video.muted = true;
      video.playsInline = true;
      video.play().catch(() => { });
      videoRef.current = video;
      setBroadcasting(true);
      return () => {
        video.pause();
        video.srcObject = null;
        videoRef.current = null;
        setBroadcasting(false);
      };
    } else {
      setBroadcasting(false);
    }
  }, [stream]);

  useFrame((s) => {
    // Pulse emissive when idle
    if (meshRef.current && !broadcasting) {
      (meshRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.5 + Math.sin(s.clock.elapsedTime * 0.5) * 0.15;
    }
    // Update video texture
    if (broadcasting && videoRef.current && meshRef.current) {
      if (!textureRef.current) {
        const canvas = document.createElement("canvas");
        canvas.width = 640;
        canvas.height = 360;
        textureRef.current = new THREE.CanvasTexture(canvas);
      }
      const ctx = textureRef.current.image.getContext("2d");
      if (ctx && videoRef.current.readyState >= 2) {
        ctx.drawImage(videoRef.current, 0, 0, 640, 360);
        textureRef.current.needsUpdate = true;
        (meshRef.current.material as THREE.MeshStandardMaterial).map = textureRef.current;
        (meshRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.1;
        (meshRef.current.material as THREE.MeshStandardMaterial).needsUpdate = true;
      }
    }
    // Proximity check
    if (playerRef.current) {
      const d = new THREE.Vector3(position[0], 0, position[2]).distanceTo(
        new THREE.Vector3(playerRef.current.x, 0, playerRef.current.z)
      );
      setNear(d < 5);
    }
  });

  const handleClick = () => {
    if (near && onActivate) onActivate();
  };

  return (
    <group position={position} rotation={rotation}>
      {/* Frame */}
      <RoundedBox args={[size[0] + 0.3, size[1] + 0.3, 0.1]} radius={0.08} smoothness={4}>
        <meshStandardMaterial color={broadcasting ? "#1a1a2e" : "#111"} metalness={0.8} roughness={0.2}
          emissive={broadcasting ? "#7c3aed" : "#000"} emissiveIntensity={broadcasting ? 0.1 : 0} />
      </RoundedBox>
      {/* Screen surface */}
      <mesh ref={meshRef} position={[0, 0, 0.08]} onClick={handleClick}>
        <planeGeometry args={[size[0], size[1]]} />
        <meshStandardMaterial color={broadcasting ? "#fff" : "#0a0520"}
          emissive={broadcasting ? "#000" : "#7c3aed"} emissiveIntensity={0.5}
          roughness={0.1} metalness={broadcasting ? 0.1 : 0.9} />
      </mesh>
      {/* Label */}
      {!broadcasting && (
        <Text position={[0, 0, 0.12]} fontSize={0.35} color="#c4b5fd" anchorX="center" anchorY="middle" fillOpacity={0.9}>
          {"🎥  BROADCAST LIVE"}
        </Text>
      )}
      {broadcasting && (
        <Text position={[0, size[1] / 2 + 0.3, 0.08]} fontSize={0.2} color="#ef4444" anchorX="center" fillOpacity={0.95}>
          {"● LIVE"}
        </Text>
      )}
      {/* Proximity prompt */}
      {near && !broadcasting && (
        <group position={[0, -(size[1] / 2) - 0.8, 0.1]}>
          <Text fontSize={0.22} color="#22d3ee" anchorX="center" fillOpacity={0.9} outlineWidth={0.01} outlineColor="#000">
            Click to Start Broadcasting
          </Text>
          <mesh position={[0, -0.01, -0.05]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.5, 2, 32]} />
            <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.4} transparent opacity={0.12} side={THREE.DoubleSide} />
          </mesh>
        </group>
      )}
      {/* Stand */}
      <mesh position={[0, -(size[1] / 2) - 0.6, -0.05]}>
        <cylinderGeometry args={[0.08, 0.12, 1.2, 16]} />
        <meshStandardMaterial color="#222" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  );
}

// ─── Wall Art (decorative frame) ─────────────────────────────────
function WallArt({ position, color = "#7c3aed", rotation = [0, 0, 0] }: {
  position: [number, number, number]; color?: string; rotation?: [number, number, number];
}) {
  return (
    <group position={position} rotation={rotation}>
      <RoundedBox args={[1.5, 1, 0.06]} radius={0.03} smoothness={4}>
        <meshStandardMaterial color="#111" metalness={0.6} roughness={0.3} />
      </RoundedBox>
      <RoundedBox args={[1.3, 0.8, 0.02]} position={[0, 0, 0.04]} radius={0.02} smoothness={4}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.06} roughness={0.4} metalness={0.4} />
      </RoundedBox>
    </group>
  );
}

// ─── Area Rug ────────────────────────────────────────────────────
function AreaRug({ position, size = [4, 3], color = "#2d1b69" }: {
  position: [number, number, number]; size?: [number, number]; color?: string;
}) {
  return (
    <mesh position={[position[0], 0.02, position[2]]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.95} metalness={0} side={THREE.FrontSide} />
    </mesh>
  );
}

// ─── Wall Clock ──────────────────────────────────────────────────
function WallClock({ position, color = "#c4b5fd" }: { position: [number, number, number]; color?: string }) {
  const handRef = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (handRef.current) handRef.current.rotation.z = -s.clock.elapsedTime * 0.5;
  });
  return (
    <group position={position}>
      <mesh><circleGeometry args={[0.4, 32]} /><meshStandardMaterial color="#111" metalness={0.8} roughness={0.2} /></mesh>
      <mesh position={[0, 0, 0.02]}><circleGeometry args={[0.35, 32]} /><meshStandardMaterial color="#0a0a0a" /></mesh>
      <mesh ref={handRef} position={[0, 0, 0.04]}>
        <boxGeometry args={[0.02, 0.25, 0.01]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0, 0, 0.04]}>
        <boxGeometry args={[0.015, 0.15, 0.01]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

// ─── Desk ────────────────────────────────────────────────────────
function Desk({ position, color = "#334155" }: { position: [number, number, number]; color?: string }) {
  return (
    <group position={position}>
      <RoundedBox args={[2, 0.08, 1]} position={[0, 0.75, 0]} radius={0.02} smoothness={4} castShadow>
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.6} />
      </RoundedBox>
      {[[-0.85, 0.375, -0.4], [0.85, 0.375, -0.4], [-0.85, 0.375, 0.4], [0.85, 0.375, 0.4]].map((lp, i) => (
        <mesh key={i} position={lp as [number, number, number]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.75, 8]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
        </mesh>
      ))}
      <group position={[0, 1.15, -0.2]}>
        <RoundedBox args={[0.8, 0.5, 0.03]} radius={0.02} smoothness={4}>
          <meshStandardMaterial color="#0a0a0a" emissive="#7c3aed" emissiveIntensity={0.2} />
        </RoundedBox>
      </group>
    </group>
  );
}

// ─── Chair ───────────────────────────────────────────────────────
function Chair({ position, color = "#4338ca" }: { position: [number, number, number]; color?: string }) {
  return (
    <group position={position}>
      <RoundedBox args={[0.45, 0.06, 0.45]} position={[0, 0.45, 0]} radius={0.03} smoothness={4} castShadow>
        <meshStandardMaterial color={color} roughness={0.5} />
      </RoundedBox>
      <RoundedBox args={[0.45, 0.5, 0.06]} position={[0, 0.73, -0.2]} radius={0.03} smoothness={4} castShadow>
        <meshStandardMaterial color={color} roughness={0.5} />
      </RoundedBox>
      <mesh position={[0, 0.22, 0]}><cylinderGeometry args={[0.03, 0.03, 0.44, 8]} /><meshStandardMaterial color="#1e1b4b" metalness={0.8} /></mesh>
    </group>
  );
}

// ─── Auditorium Seats ────────────────────────────────────────────
function AuditoriumSeats({ rows = 5, seatsPerRow = 8, color }: { rows?: number; seatsPerRow?: number; color: string }) {
  const seats = useMemo(() => {
    const r: { pos: [number, number, number] }[] = [];
    for (let row = 0; row < rows; row++) for (let s = 0; s < seatsPerRow; s++) r.push({ pos: [(s - (seatsPerRow - 1) / 2) * 1.2, row * 0.4, 3 + row * 1.8] });
    return r;
  }, [rows, seatsPerRow]);
  return (
    <group>
      {seats.map((s, i) => <Chair key={i} position={s.pos} color={color} />)}
      {Array.from({ length: rows }).map((_, r) => (
        <mesh key={r} position={[0, r * 0.4 - 0.02, 3 + r * 1.8]} receiveShadow>
          <boxGeometry args={[seatsPerRow * 1.2 + 1, 0.04, 1.6]} />
          <meshStandardMaterial color="#1a1a2e" roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

// ─── Sofa ────────────────────────────────────────────────────────
function Sofa({ position, color = "#7c3aed", rotation = 0 }: { position: [number, number, number]; color?: string; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <RoundedBox args={[2, 0.4, 0.8]} position={[0, 0.3, 0]} radius={0.08} smoothness={4} castShadow><meshStandardMaterial color={color} roughness={0.7} /></RoundedBox>
      <RoundedBox args={[2, 0.6, 0.12]} position={[0, 0.55, -0.35]} radius={0.05} smoothness={4} castShadow><meshStandardMaterial color={color} roughness={0.7} /></RoundedBox>
    </group>
  );
}

// ─── Coffee Table ────────────────────────────────────────────────
function CoffeeTable({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.35, 0]} castShadow><cylinderGeometry args={[0.5, 0.5, 0.04, 32]} /><meshStandardMaterial color="#92400e" roughness={0.3} metalness={0.5} /></mesh>
      <mesh position={[0, 0.17, 0]}><cylinderGeometry args={[0.06, 0.06, 0.34, 8]} /><meshStandardMaterial color="#333" metalness={0.8} /></mesh>
    </group>
  );
}

// ─── Plant ───────────────────────────────────────────────────────
function Plant({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.25, 0]} castShadow><cylinderGeometry args={[0.15, 0.2, 0.5, 8]} /><meshStandardMaterial color="#44403c" roughness={0.8} /></mesh>
      <Float speed={2} rotationIntensity={0.1} floatIntensity={0.3}>
        <mesh position={[0, 0.7, 0]} castShadow><sphereGeometry args={[0.35, 16, 16]} /><meshStandardMaterial color="#166534" roughness={0.8} /></mesh>
      </Float>
    </group>
  );
}

// ─── Glow Pillar ─────────────────────────────────────────────────
function GlowPillar({ position, color }: { position: [number, number, number]; color: string }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s) => { if (ref.current) (ref.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.3 + Math.sin(s.clock.elapsedTime * 1.5 + position[0]) * 0.15; });
  return (
    <mesh ref={ref} position={position} castShadow>
      <cylinderGeometry args={[0.15, 0.15, 4, 16]} />
      <meshStandardMaterial color="#111" emissive={color} emissiveIntensity={0.3} roughness={0.1} metalness={0.9} />
    </mesh>
  );
}

// ─── Bookshelf ───────────────────────────────────────────────────
function Bookshelf({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <RoundedBox args={[1.5, 3, 0.4]} position={[0, 1.5, 0]} radius={0.03} smoothness={4} castShadow>
        <meshStandardMaterial color="#5c3a1e" roughness={0.7} metalness={0.2} />
      </RoundedBox>
      {[0.5, 1.1, 1.7, 2.3].map((y, i) => (
        <RoundedBox key={i} args={[1.3, 0.06, 0.35]} position={[0, y, 0.01]} radius={0.01} smoothness={4}>
          <meshStandardMaterial color="#4a2e14" roughness={0.8} />
        </RoundedBox>
      ))}
      {/* Books */}
      {[0.7, 1.3, 1.9].map((y, i) => (
        <group key={`books-${i}`} position={[0, y, 0.05]}>
          {[-0.4, -0.2, 0, 0.15, 0.35].map((x, j) => (
            <mesh key={j} position={[x, 0, 0]}>
              <boxGeometry args={[0.12, 0.3, 0.2]} />
              <meshStandardMaterial color={["#8b5cf6", "#ef4444", "#3b82f6", "#10b981", "#f59e0b"][j]} roughness={0.7} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

// ─── Reading Lamp ────────────────────────────────────────────────
function ReadingLamp({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.5, 0]}><cylinderGeometry args={[0.02, 0.02, 1, 8]} /><meshStandardMaterial color="#333" metalness={0.8} /></mesh>
      <mesh position={[0, 1, 0]}><coneGeometry args={[0.2, 0.25, 16]} /><meshStandardMaterial color="#d97706" emissive="#fbbf24" emissiveIntensity={0.4} /></mesh>
      <pointLight position={position} intensity={0.3} color="#fbbf24" distance={4} />
    </group>
  );
}

// ─── Armchair ────────────────────────────────────────────────────
function Armchair({ position, color = "#78350f", rotation = 0 }: { position: [number, number, number]; color?: string; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <RoundedBox args={[0.7, 0.35, 0.7]} position={[0, 0.3, 0]} radius={0.06} smoothness={4} castShadow>
        <meshStandardMaterial color={color} roughness={0.8} />
      </RoundedBox>
      <RoundedBox args={[0.7, 0.5, 0.1]} position={[0, 0.55, -0.3]} radius={0.05} smoothness={4} castShadow>
        <meshStandardMaterial color={color} roughness={0.8} />
      </RoundedBox>
      <RoundedBox args={[0.1, 0.3, 0.5]} position={[-0.35, 0.45, 0]} radius={0.04} smoothness={4} castShadow>
        <meshStandardMaterial color={color} roughness={0.8} />
      </RoundedBox>
      <RoundedBox args={[0.1, 0.3, 0.5]} position={[0.35, 0.45, 0]} radius={0.04} smoothness={4} castShadow>
        <meshStandardMaterial color={color} roughness={0.8} />
      </RoundedBox>
    </group>
  );
}

// ─── Neon Sign ───────────────────────────────────────────────────
function NeonSign({ position, text, color }: { position: [number, number, number]; text: string; color: string }) {
  return (
    <group position={position}>
      <Text fontSize={0.5} color={color} anchorX="center" anchorY="middle" fillOpacity={0.9} outlineWidth={0.02} outlineColor="#000">
        {text}
      </Text>
    </group>
  );
}

// ─── String Lights (fairy lights) ────────────────────────────────
function StringLights({ from, to, color = "#fbbf24", count = 10 }: { from: [number, number, number]; to: [number, number, number]; color?: string; count?: number }) {
  const bulbs = useMemo(() => {
    const result: [number, number, number][] = [];
    for (let i = 0; i < count; i++) {
      const t = i / (count - 1);
      const x = from[0] + (to[0] - from[0]) * t;
      const y = from[1] + (to[1] - from[1]) * t - Math.sin(t * Math.PI) * 0.5;
      const z = from[2] + (to[2] - from[2]) * t;
      result.push([x, y, z]);
    }
    return result;
  }, [from, to, count]);
  return (
    <group>
      {bulbs.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} />
        </mesh>
      ))}
    </group>
  );
}

// ─── Proximity Ring ──────────────────────────────────────────────
function ProximityRing({ position, color = "#fff", radius = 0.5, opacity = 0.2 }: { position: [number, number, number]; color?: string; radius?: number; opacity?: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (ref.current) {
      ref.current.scale.setScalar(1 + Math.sin(s.clock.elapsedTime * 4) * 0.1);
      (ref.current.material as THREE.MeshStandardMaterial).opacity = opacity + Math.sin(s.clock.elapsedTime * 4) * 0.05;
    }
  });
  return (
    <mesh ref={ref} position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[radius * 0.8, radius, 32]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} transparent opacity={opacity} side={THREE.DoubleSide} />
    </mesh>
  );
}

// ─── 3D Avatar ───────────────────────────────────────────────────
function Avatar({ position, name, bodyColor = "#7c3aed", headColor = "#f0edff" }: {
  position: [number, number, number]; name: string; bodyColor?: string; headColor?: string;
}) {
  const group = useRef<THREE.Group>(null);
  useFrame((s) => { if (group.current) group.current.position.y = position[1] + Math.sin(s.clock.elapsedTime * 2 + position[0]) * 0.06; });
  return (
    <group ref={group} position={position}>
      <mesh position={[0, -0.4, 0]} castShadow><capsuleGeometry args={[0.25, 0.6, 16, 16]} /><meshStandardMaterial color={bodyColor} roughness={0.4} metalness={0.3} /></mesh>
      <mesh position={[0, 0.35, 0]} castShadow><sphereGeometry args={[0.25, 32, 32]} /><meshStandardMaterial color={headColor} roughness={0.3} /></mesh>
      <mesh position={[0, -0.7, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.3, 0.4, 32]} />
        <meshStandardMaterial color={bodyColor} emissive={bodyColor} emissiveIntensity={0.5} transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
      <Text position={[0, 1, 0]} fontSize={0.15} color="white" anchorX="center" anchorY="bottom" fillOpacity={0.85} outlineWidth={0.01} outlineColor="#000">
        {name}
      </Text>
    </group>
  );
}

// ─── Interactive Object (glows when player is near, clickable) ───
function InteractiveObject({ position, label, color = "#7c3aed", playerRef, children }: {
  position: [number, number, number]; label: string; color?: string;
  playerRef: React.RefObject<THREE.Vector3>; children: React.ReactNode;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [near, setNear] = useState(false);
  const [clicked, setClicked] = useState(false);

  useFrame(() => {
    if (!playerRef.current || !groupRef.current) return;
    const d = new THREE.Vector3(...position).distanceTo(playerRef.current);
    setNear(d < 3);
  });

  return (
    <group ref={groupRef} position={position} onClick={() => setClicked(c => !c)}>
      {children}
      {near && (
        <>
          <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.2, 1.5, 32]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} transparent opacity={0.2} side={THREE.DoubleSide} />
          </mesh>
          <Text position={[0, 2.5, 0]} fontSize={0.18} color="#fff" anchorX="center" anchorY="bottom" fillOpacity={0.9} outlineWidth={0.01} outlineColor="#000">
            {clicked ? `✓ ${label}` : `● ${label}`}
          </Text>
        </>
      )}
    </group>
  );
}

// ─── Wandering NPC ───────────────────────────────────────────────
function WanderingNPC({ name, bodyColor = "#3b82f6", startPos, bounds = 4, playerRef }: {
  name: string; bodyColor?: string; startPos: [number, number, number];
  bounds?: number; playerRef: React.RefObject<THREE.Vector3>;
}) {
  const group = useRef<THREE.Group>(null);
  const target = useRef(new THREE.Vector3(startPos[0], startPos[1], startPos[2]));
  const timer = useRef(0);
  const [talking, setTalking] = useState(false);

  useFrame((state, delta) => {
    if (!group.current) return;
    timer.current += delta;
    // Pick new wander target every 3-6s
    if (timer.current > 3 + Math.random() * 3) {
      timer.current = 0;
      target.current.set(
        startPos[0] + (Math.random() - 0.5) * bounds * 2,
        startPos[1],
        startPos[2] + (Math.random() - 0.5) * bounds * 2
      );
    }
    // Check proximity to player
    if (playerRef.current) {
      const d = group.current.position.distanceTo(playerRef.current);
      setTalking(d < 3.5);
      if (d < 3.5) {
        // Face toward player
        const dir = playerRef.current.clone().sub(group.current.position);
        const angle = Math.atan2(dir.x, dir.z);
        group.current.rotation.y += (angle - group.current.rotation.y) * 0.05;
      }
    }
    // Move toward target
    group.current.position.lerp(target.current, 0.01);
    group.current.position.y = startPos[1] + Math.sin(state.clock.elapsedTime * 2 + startPos[0]) * 0.06;
  });

  return (
    <group ref={group} position={startPos}>
      <mesh position={[0, -0.4, 0]} castShadow><capsuleGeometry args={[0.25, 0.6, 16, 16]} /><meshStandardMaterial color={bodyColor} roughness={0.4} metalness={0.3} /></mesh>
      <mesh position={[0, 0.35, 0]} castShadow><sphereGeometry args={[0.25, 32, 32]} /><meshStandardMaterial color="#f0edff" roughness={0.3} /></mesh>
      <mesh position={[0, -0.7, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.3, 0.4, 32]} />
        <meshStandardMaterial color={bodyColor} emissive={bodyColor} emissiveIntensity={0.5} transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
      <Text position={[0, 1, 0]} fontSize={0.15} color="white" anchorX="center" anchorY="bottom" fillOpacity={0.85} outlineWidth={0.01} outlineColor="#000">
        {name}
      </Text>
      {talking && (
        <>
          <mesh position={[0, -0.7, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.8, 1.0, 32]} />
            <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.6} transparent opacity={0.25} side={THREE.DoubleSide} />
          </mesh>
          <Text position={[0, 1.3, 0]} fontSize={0.12} color="#22d3ee" anchorX="center" anchorY="bottom" fillOpacity={0.8}>
            🎤 Nearby
          </Text>
        </>
      )}
    </group>
  );
}

// (ceiling removed — obstructed isometric camera view)

// ─── Player Avatar (WASD controllable with collision) ────────────
function PlayerAvatar({ keys, onPositionChange, colliders }: {
  keys: React.RefObject<Record<string, boolean>>;
  onPositionChange: (pos: THREE.Vector3) => void;
  colliders: AABB[];
}) {
  const ref = useRef<THREE.Group>(null);
  const pos = useRef(new THREE.Vector3(0, 0.6, 5));
  const speed = 0.08;

  useFrame(() => {
    if (!keys.current || !ref.current) return;
    const k = keys.current;
    const dir = new THREE.Vector3();
    if (k["w"] || k["arrowup"]) dir.z -= 1;
    if (k["s"] || k["arrowdown"]) dir.z += 1;
    if (k["a"] || k["arrowleft"]) dir.x -= 1;
    if (k["d"] || k["arrowright"]) dir.x += 1;
    if (dir.length() > 0) {
      dir.normalize().multiplyScalar(speed);
      const nextX = pos.current.x + dir.x;
      const nextZ = pos.current.z + dir.z;
      // Axis-separated collision: try X, then Z independently
      if (!checkCollision(nextX, pos.current.z, colliders)) pos.current.x = nextX;
      if (!checkCollision(pos.current.x, nextZ, colliders)) pos.current.z = nextZ;
      // Hard boundary clamp
      pos.current.x = Math.max(-15, Math.min(15, pos.current.x));
      pos.current.z = Math.max(-15, Math.min(15, pos.current.z));
    }
    ref.current.position.lerp(pos.current, 0.15);
    ref.current.position.y = 0.6 + Math.sin(Date.now() * 0.003) * 0.04;
    onPositionChange(ref.current.position);
  });

  return (
    <group ref={ref} position={[0, 0.6, 5]}>
      <mesh position={[0, -0.4, 0]} castShadow><capsuleGeometry args={[0.25, 0.6, 16, 16]} /><meshStandardMaterial color="#7c3aed" roughness={0.4} metalness={0.3} /></mesh>
      <mesh position={[0, 0.35, 0]} castShadow><sphereGeometry args={[0.25, 32, 32]} /><meshStandardMaterial color="#f0edff" roughness={0.3} /></mesh>
      <mesh position={[0, -0.7, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.3, 0.45, 32]} />
        <meshStandardMaterial color="#7c3aed" emissive="#7c3aed" emissiveIntensity={0.6} transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>
      <Text position={[0, 1, 0]} fontSize={0.15} color="#fff" anchorX="center" anchorY="bottom" fillOpacity={0.9} outlineWidth={0.015} outlineColor="#000">
        You
      </Text>
    </group>
  );
}

// ─── Camera that follows player ──────────────────────────────────
function FollowCamera({ target }: { target: React.RefObject<THREE.Vector3> }) {
  const { camera } = useThree();
  const offset = useMemo(() => new THREE.Vector3(0, 10, 14), []);

  useFrame(() => {
    if (!target.current) return;
    const desired = target.current.clone().add(offset);
    camera.position.lerp(desired, 0.04);
    const lookTarget = target.current.clone();
    lookTarget.y += 1;
    camera.lookAt(lookTarget);
  });

  return null;
}

// ═══ Room Layouts ════════════════════════════════════════════════
// Each layout is a self-contained component.

function ClassroomLayout({ palette }: { palette: typeof PALETTES.classroom }) {
  return (
    <group>
      <WallPanel position={[0, 2, -12]} size={[24, 4, 0.3]} color={palette.wall} emissiveColor={palette.emissive} />
      <WallPanel position={[-12, 2, 0]} size={[0.3, 4, 24]} color={palette.wall} emissiveColor={palette.emissive} />
      <WallPanel position={[12, 2, 0]} size={[0.3, 4, 24]} color={palette.wall} emissiveColor={palette.emissive} />
      {/* Whiteboard */}
      <RoundedBox args={[4, 2.5, 0.1]} position={[-6, 2.5, -11.5]} radius={0.05} smoothness={4}>
        <meshStandardMaterial color="#1e1b4b" emissive="#c4b5fd" emissiveIntensity={0.02} roughness={0.4} metalness={0.3} />
      </RoundedBox>
      <Text position={[-6, 3.2, -11.3]} fontSize={0.2} color="#c4b5fd" anchorX="center" fillOpacity={0.6}>Whiteboard</Text>
      {/* Desks & chairs */}
      {Array.from({ length: 3 }).flatMap((_, r) => Array.from({ length: 4 }).map((_, c) => <Desk key={`d-${r}-${c}`} position={[(c - 1.5) * 3, 0, r * 3 + 1]} />))}
      {Array.from({ length: 3 }).flatMap((_, r) => Array.from({ length: 4 }).map((_, c) => <Chair key={`c-${r}-${c}`} position={[(c - 1.5) * 3, 0, r * 3 + 1.7]} color={palette.primary} />))}
      <Desk position={[0, 0, -7]} color="#4c1d95" />
      {/* Decorations */}
      <Plant position={[-10, 0, -10]} /><Plant position={[10, 0, -10]} /><Plant position={[-10, 0, 8]} /><Plant position={[10, 0, 8]} />
      <WallClock position={[6, 3.2, -11.7]} color={palette.emissive} />
      <WallArt position={[-10, 2.5, -11.7]} color={palette.primary} />
      <WallArt position={[10, 2.5, -11.7]} color={palette.accent} />
      <AreaRug position={[0, 0, -6.5]} size={[3, 2]} color="#1a0a3e" />
      <NeonStrip start={[-12, 0.1, -12]} end={[12, 0.1, -12]} color={palette.accent} />
      {/* NPCs */}
      <Avatar position={[0, 1, -6]} name="Teacher" bodyColor="#7c3aed" headColor="#f5f3ff" />
      <Avatar position={[-3, 1, 1.7]} name="Alex" bodyColor="#3b82f6" />
      <Avatar position={[0, 1, 1.7]} name="Maya" bodyColor="#ec4899" />
      <Avatar position={[3, 1, 1.7]} name="Sam" bodyColor="#10b981" />
      <ProximityRing position={[-3, 0.05, 1.7]} color="#3b82f6" radius={1.2} opacity={0.15} />
      <ProximityRing position={[0, 0.05, 1.7]} color="#ec4899" radius={1.2} opacity={0.15} />
      <ProximityRing position={[3, 0.05, 1.7]} color="#10b981" radius={1.2} opacity={0.15} />
    </group>
  );
}

function OfficeLayout({ palette }: { palette: typeof PALETTES.office }) {
  return (
    <group>
      <WallPanel position={[0, 2, -10]} size={[20, 4, 0.3]} color={palette.wall} emissiveColor={palette.emissive} />
      <WallPanel position={[-10, 2, 0]} size={[0.3, 4, 20]} color={palette.wall} emissiveColor={palette.emissive} />
      <WallPanel position={[10, 2, 0]} size={[0.3, 4, 20]} color={palette.wall} emissiveColor={palette.emissive} />
      {[[-4, 0, -3], [-4, 0, 0], [-4, 0, 3], [4, 0, -3], [4, 0, 0], [4, 0, 3]].map((p, i) => <Desk key={i} position={p as [number, number, number]} color="#1e3a5f" />)}
      <Sofa position={[0, 0, 6]} color="#1e40af" /><CoffeeTable position={[0, 0, 4.5]} />
      <Plant position={[-8, 0, -8]} /><Plant position={[8, 0, -8]} /><Plant position={[-8, 0, 8]} /><Plant position={[8, 0, 8]} />
      <GlowPillar position={[-9.5, 2, -9.5]} color={palette.emissive} /><GlowPillar position={[9.5, 2, -9.5]} color={palette.emissive} />
      {/* Decorations */}
      <WallClock position={[-5, 3, -9.7]} color={palette.emissive} />
      <WallArt position={[5, 2.5, -9.7]} color={palette.accent} />
      <AreaRug position={[0, 0, 5]} size={[4, 3]} color="#0c2d3a" />
      <Avatar position={[-4, 1, -2.3]} name="Dev 1" bodyColor="#0891b2" /><Avatar position={[4, 1, 0.7]} name="Dev 2" bodyColor="#06b6d4" />
      <ProximityRing position={[-4, 0.05, -2.3]} color="#0891b2" radius={1.5} opacity={0.12} />
      <ProximityRing position={[4, 0.05, 0.7]} color="#06b6d4" radius={1.5} opacity={0.12} />
    </group>
  );
}

function ConferenceLayout({ palette }: { palette: typeof PALETTES.conference }) {
  return (
    <group>
      <WallPanel position={[0, 2.5, -14]} size={[28, 5, 0.3]} color={palette.wall} emissiveColor={palette.emissive} />
      <WallPanel position={[-14, 2.5, 0]} size={[0.3, 5, 28]} color={palette.wall} emissiveColor={palette.emissive} />
      <WallPanel position={[14, 2.5, 0]} size={[0.3, 5, 28]} color={palette.wall} emissiveColor={palette.emissive} />
      <mesh position={[0, 0.15, -8]} receiveShadow castShadow><boxGeometry args={[14, 0.3, 6]} /><meshStandardMaterial color="#1e1b4b" roughness={0.3} metalness={0.5} /></mesh>
      <AuditoriumSeats rows={6} seatsPerRow={10} color={palette.primary} />
      <GlowPillar position={[-6, 2, -10.5]} color="#a78bfa" /><GlowPillar position={[6, 2, -10.5]} color="#a78bfa" />
      <Avatar position={[0, 1.3, -7]} name="Speaker" bodyColor="#7c3aed" headColor="#f5f3ff" />
    </group>
  );
}

function CafeLayout({ palette }: { palette: typeof PALETTES.cafe }) {
  return (
    <group>
      <WallPanel position={[0, 2, -8]} size={[16, 4, 0.3]} color={palette.wall} emissiveColor={palette.emissive} />
      <WallPanel position={[-8, 2, 0]} size={[0.3, 4, 16]} color={palette.wall} emissiveColor={palette.emissive} />
      <WallPanel position={[8, 2, 0]} size={[0.3, 4, 16]} color={palette.wall} emissiveColor={palette.emissive} />
      <RoundedBox args={[8, 1.1, 0.8]} position={[0, 0.55, -6]} radius={0.05} smoothness={4} castShadow><meshStandardMaterial color="#78350f" roughness={0.5} metalness={0.3} /></RoundedBox>
      <Text position={[0, 3.4, -7.4]} fontSize={0.3} color="#fbbf24" anchorX="center">{"☕  HUDDLY CAFE  ☕"}</Text>
      {[[-4, 0, 0], [0, 0, 2], [4, 0, 0], [-3, 0, 5], [3, 0, 5]].map((p, i) => (<group key={i}><CoffeeTable position={p as [number, number, number]} /><Chair position={[p[0] - 0.7, p[1], p[2] + 0.7]} color="#92400e" /><Chair position={[p[0] + 0.7, p[1], p[2] + 0.7]} color="#92400e" /></group>))}
      <Sofa position={[-6, 0, 6]} color="#92400e" rotation={Math.PI / 4} />
      <Plant position={[-7, 0, -7]} /><Plant position={[7, 0, -7]} /><Plant position={[0, 0, 7]} />
      <AreaRug position={[0, 0, 2]} size={[5, 4]} color="#3d2200" />
      <WallClock position={[7.5, 3, -7.7]} color={palette.emissive} />
      <Avatar position={[-4, 1, 0.7]} name="Barista" bodyColor="#d97706" /><Avatar position={[0, 1, 2.7]} name="Alice" bodyColor="#f59e0b" />
    </group>
  );
}

function PartyLayout({ palette }: { palette: typeof PALETTES.party }) {
  const danceColors = ["#ec4899", "#8b5cf6", "#06b6d4", "#f59e0b", "#10b981", "#ef4444"];
  return (
    <group>
      <WallPanel position={[0, 2.5, -12]} size={[24, 5, 0.3]} color={palette.wall} emissiveColor={palette.emissive} />
      <WallPanel position={[-12, 2.5, 0]} size={[0.3, 5, 24]} color={palette.wall} emissiveColor={palette.emissive} />
      <WallPanel position={[12, 2.5, 0]} size={[0.3, 5, 24]} color={palette.wall} emissiveColor={palette.emissive} />
      <RoundedBox args={[3, 1, 1.5]} position={[0, 0.5, -9]} radius={0.1} smoothness={4} castShadow><meshStandardMaterial color="#831843" emissive="#ec4899" emissiveIntensity={0.15} roughness={0.3} metalness={0.5} /></RoundedBox>
      {Array.from({ length: 6 }).flatMap((_, r) => Array.from({ length: 6 }).map((_, c) => (
        <mesh key={`t-${r}-${c}`} position={[(c - 2.5) * 1.5, 0.02, (r - 1) * 1.5]} receiveShadow>
          <boxGeometry args={[1.4, 0.04, 1.4]} /><meshStandardMaterial color="#111" emissive={danceColors[(r + c) % 6]} emissiveIntensity={0.15} roughness={0.1} metalness={0.8} />
        </mesh>
      )))}
      <Sofa position={[-8, 0, 4]} color="#be185d" rotation={Math.PI / 6} /><Sofa position={[8, 0, 4]} color="#9333ea" rotation={-Math.PI / 6} />
      <GlowPillar position={[-11, 2, -11]} color="#ec4899" /><GlowPillar position={[11, 2, -11]} color="#8b5cf6" /><GlowPillar position={[-11, 2, 11]} color="#06b6d4" /><GlowPillar position={[11, 2, 11]} color="#f59e0b" />
      <Avatar position={[0, 1, -8.5]} name="DJ" bodyColor="#ec4899" /><Avatar position={[-2, 1, 2]} name="Dancer" bodyColor="#8b5cf6" />
    </group>
  );
}

// ─── Library Layout ──────────────────────────────────────────────
function LibraryLayout({ palette }: { palette: typeof PALETTES.library }) {
  return (
    <group>
      <WallPanel position={[0, 2.5, -10]} size={[20, 5, 0.3]} color={palette.wall} emissiveColor={palette.emissive} />
      <WallPanel position={[-10, 2.5, 0]} size={[0.3, 5, 20]} color={palette.wall} emissiveColor={palette.emissive} />
      <WallPanel position={[10, 2.5, 0]} size={[0.3, 5, 20]} color={palette.wall} emissiveColor={palette.emissive} />
      {/* Bookshelves along walls */}
      {[-7, -4.5, -2, 0.5, 3, 5.5, 8].map((x, i) => <Bookshelf key={`bs-${i}`} position={[x, 0, -9.3]} />)}
      {[-6, -3, 0, 3, 6].map((z, i) => <Bookshelf key={`bsl-${i}`} position={[-9.3, 0, z]} rotation={Math.PI / 2} />)}
      {/* Reading nooks */}
      <Armchair position={[-5, 0, 0]} color="#78350f" rotation={Math.PI / 4} />
      <Armchair position={[-5, 0, 3]} color="#78350f" rotation={Math.PI / 6} />
      <Armchair position={[5, 0, 0]} color="#92400e" rotation={-Math.PI / 4} />
      <Armchair position={[5, 0, 3]} color="#92400e" rotation={-Math.PI / 6} />
      {/* Central study tables */}
      <Desk position={[-1.5, 0, 2]} color="#5c3a1e" /><Desk position={[1.5, 0, 2]} color="#5c3a1e" />
      <Desk position={[-1.5, 0, 5]} color="#5c3a1e" /><Desk position={[1.5, 0, 5]} color="#5c3a1e" />
      <Chair position={[-1.5, 0, 2.7]} color="#92400e" /><Chair position={[1.5, 0, 2.7]} color="#92400e" />
      <Chair position={[-1.5, 0, 5.7]} color="#92400e" /><Chair position={[1.5, 0, 5.7]} color="#92400e" />
      {/* Reading lamps */}
      <ReadingLamp position={[-5, 0, 1.5]} /><ReadingLamp position={[5, 0, 1.5]} />
      {/* Quiet zone sign */}
      <NeonSign position={[0, 3.5, -9.4]} text="📚 Quiet Zone" color="#fbbf24" />
      <Plant position={[-8, 0, 8]} /><Plant position={[8, 0, 8]} /><Plant position={[0, 0, -5]} />
      <Avatar position={[-5, 1, 0.7]} name="Reader" bodyColor="#d97706" /><Avatar position={[1.5, 1, 2.7]} name="Student" bodyColor="#92400e" />
    </group>
  );
}

// ─── Gaming Lounge Layout ────────────────────────────────────────
function GamingLayout({ palette }: { palette: typeof PALETTES.gaming }) {
  return (
    <group>
      <WallPanel position={[0, 2.5, -10]} size={[20, 5, 0.3]} color={palette.wall} emissiveColor={palette.emissive} />
      <WallPanel position={[-10, 2.5, 0]} size={[0.3, 5, 20]} color={palette.wall} emissiveColor={palette.emissive} />
      <WallPanel position={[10, 2.5, 0]} size={[0.3, 5, 20]} color={palette.wall} emissiveColor={palette.emissive} />
      {/* Gaming desks with dual monitors */}
      {[[-6, 0, -4], [-3, 0, -4], [0, 0, -4], [3, 0, -4], [6, 0, -4]].map((p, i) => (
        <group key={i}>
          <Desk position={p as [number, number, number]} color="#0e3740" />
          <Chair position={[p[0], p[1], p[2] + 0.8]} color="#06b6d4" />
          <RoundedBox args={[0.6, 0.4, 0.025]} position={[p[0] + 0.5, 1.15, p[2] - 0.2]} radius={0.02} smoothness={4}>
            <meshStandardMaterial color="#0a0a0a" emissive="#06b6d4" emissiveIntensity={0.25} />
          </RoundedBox>
        </group>
      ))}
      {/* Neon signs */}
      <NeonSign position={[-7, 3.5, -9.4]} text="🎮 GAME ON" color="#22d3ee" />
      <NeonSign position={[7, 3.5, -9.4]} text="🏆 TOP SCORE" color="#f59e0b" />
      {/* Trophy case */}
      <RoundedBox args={[2, 2.5, 0.5]} position={[9.2, 1.25, 0]} radius={0.05} smoothness={4} castShadow>
        <meshStandardMaterial color="#0e3740" emissive="#06b6d4" emissiveIntensity={0.05} roughness={0.3} metalness={0.6} />
      </RoundedBox>
      <Text position={[9.2, 2.8, 0.3]} fontSize={0.2} color="#fbbf24" anchorX="center">{"🏆 TROPHIES"}</Text>
      {/* LED strip accents */}
      <NeonStrip start={[-10, 0.1, -10]} end={[10, 0.1, -10]} color="#22d3ee" />
      <NeonStrip start={[-10, 4.5, -10]} end={[10, 4.5, -10]} color="#06b6d4" />
      <NeonStrip start={[-10, 0.1, 10]} end={[10, 0.1, 10]} color="#22d3ee" />
      {/* Lounge */}
      <Sofa position={[-6, 0, 5]} color="#164e63" /><Sofa position={[6, 0, 5]} color="#164e63" />
      <CoffeeTable position={[-6, 0, 3.5]} /><CoffeeTable position={[6, 0, 3.5]} />
      <GlowPillar position={[-9.5, 2, -9.5]} color="#22d3ee" /><GlowPillar position={[9.5, 2, -9.5]} color="#67e8f9" /><GlowPillar position={[-9.5, 2, 9.5]} color="#06b6d4" /><GlowPillar position={[9.5, 2, 9.5]} color="#22d3ee" />
      <Avatar position={[-6, 1, -3.2]} name="Gamer 1" bodyColor="#06b6d4" /><Avatar position={[0, 1, -3.2]} name="Gamer 2" bodyColor="#22d3ee" /><Avatar position={[6, 1, -3.2]} name="Gamer 3" bodyColor="#0ea5e9" />
    </group>
  );
}

// ─── Rooftop Garden Layout ───────────────────────────────────────
function RooftopLayout({ palette }: { palette: typeof PALETTES.rooftop }) {
  return (
    <group>
      {/* Low walls (railing) */}
      <WallPanel position={[0, 0.5, -10]} size={[20, 1, 0.15]} color="#374151" emissiveColor={palette.emissive} />
      <WallPanel position={[-10, 0.5, 0]} size={[0.15, 1, 20]} color="#374151" emissiveColor={palette.emissive} />
      <WallPanel position={[10, 0.5, 0]} size={[0.15, 1, 20]} color="#374151" emissiveColor={palette.emissive} />
      <WallPanel position={[0, 0.5, 10]} size={[20, 1, 0.15]} color="#374151" emissiveColor={palette.emissive} />
      {/* Pergola structure */}
      {[[-3, 3, -3], [3, 3, -3], [-3, 3, 3], [3, 3, 3]].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]}><cylinderGeometry args={[0.08, 0.08, 6, 8]} /><meshStandardMaterial color="#78350f" roughness={0.7} /></mesh>
      ))}
      {/* Pergola beams */}
      {[-2, -1, 0, 1, 2].map((x, i) => (
        <mesh key={`beam-${i}`} position={[x, 5.8, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.05, 0.05, 7, 8]} /><meshStandardMaterial color="#78350f" roughness={0.7} />
        </mesh>
      ))}
      {/* String/fairy lights */}
      <StringLights from={[-8, 4, -8]} to={[8, 4, -8]} color="#fbbf24" count={12} />
      <StringLights from={[-8, 4.5, 0]} to={[8, 4.5, 0]} color="#fbbf24" count={12} />
      <StringLights from={[-8, 4, 8]} to={[8, 4, 8]} color="#fde68a" count={12} />
      {/* Planter boxes */}
      {[[-7, 0, -5], [-7, 0, 0], [-7, 0, 5], [7, 0, -5], [7, 0, 0], [7, 0, 5]].map((p, i) => (
        <group key={`planter-${i}`} position={p as [number, number, number]}>
          <RoundedBox args={[1.5, 0.6, 0.8]} position={[0, 0.3, 0]} radius={0.05} smoothness={4} castShadow>
            <meshStandardMaterial color="#78350f" roughness={0.8} />
          </RoundedBox>
          <mesh position={[0, 0.7, 0]}><sphereGeometry args={[0.3, 12, 12]} /><meshStandardMaterial color="#166534" roughness={0.8} /></mesh>
        </group>
      ))}
      {/* Wooden benches */}
      {[[0, 0, -6], [-4, 0, 6], [4, 0, 6]].map((p, i) => (
        <RoundedBox key={`bench-${i}`} args={[2, 0.15, 0.6]} position={[p[0], 0.5, p[2]]} radius={0.03} smoothness={4} castShadow>
          <meshStandardMaterial color="#92400e" roughness={0.6} />
        </RoundedBox>
      ))}
      <Plant position={[-3, 0, -7]} /><Plant position={[3, 0, -7]} /><Plant position={[0, 0, 7]} />
      <Avatar position={[0, 1, -5.5]} name="Zen" bodyColor="#84cc16" /><Avatar position={[-4, 1, 6.5]} name="Sky" bodyColor="#10b981" />
    </group>
  );
}

// ─── Theater Layout ──────────────────────────────────────────────
function TheaterLayout({ palette }: { palette: typeof PALETTES.theater }) {
  return (
    <group>
      <WallPanel position={[0, 3, -14]} size={[28, 6, 0.3]} color={palette.wall} emissiveColor={palette.emissive} />
      <WallPanel position={[-14, 3, 0]} size={[0.3, 6, 28]} color={palette.wall} emissiveColor={palette.emissive} />
      <WallPanel position={[14, 3, 0]} size={[0.3, 6, 28]} color={palette.wall} emissiveColor={palette.emissive} />
      {/* Stage curtains (simplified as colored panels) */}
      <RoundedBox args={[2, 7, 0.15]} position={[-8, 3.5, -13]} radius={0.05} smoothness={4}><meshStandardMaterial color="#7f1d1d" roughness={0.8} /></RoundedBox>
      <RoundedBox args={[2, 7, 0.15]} position={[8, 3.5, -13]} radius={0.05} smoothness={4}><meshStandardMaterial color="#7f1d1d" roughness={0.8} /></RoundedBox>
      {/* Recliner seats (tiered like auditorium but wider) */}
      <AuditoriumSeats rows={7} seatsPerRow={12} color={palette.primary} />
      {/* Aisle lights */}
      {Array.from({ length: 7 }).flatMap((_, r) => [
        <mesh key={`al-${r}`} position={[-7.5, r * 0.4 + 0.1, 3 + r * 1.8]}><sphereGeometry args={[0.06, 8, 8]} /><meshStandardMaterial color="#fca5a5" emissive="#ef4444" emissiveIntensity={0.4} /></mesh>,
        <mesh key={`ar-${r}`} position={[7.5, r * 0.4 + 0.1, 3 + r * 1.8]}><sphereGeometry args={[0.06, 8, 8]} /><meshStandardMaterial color="#fca5a5" emissive="#ef4444" emissiveIntensity={0.4} /></mesh>,
      ])}
      <GlowPillar position={[-13, 3, -13]} color="#fca5a5" /><GlowPillar position={[13, 3, -13]} color="#fca5a5" />
      <Plant position={[-12, 0, 12]} /><Plant position={[12, 0, 12]} />
      <Avatar position={[-2, 1, 5]} name="Viewer 1" bodyColor="#ef4444" /><Avatar position={[2, 1, 5]} name="Viewer 2" bodyColor="#f87171" />
    </group>
  );
}

// ─── Scene Lighting ──────────────────────────────────────────────
function SceneLighting({ palette }: { palette: typeof PALETTES.classroom }) {
  return (
    <>
      <ambientLight intensity={0.25} color="#b8c0ff" />
      <directionalLight castShadow position={[15, 25, 15]} intensity={1.2} shadow-mapSize={[2048, 2048]} shadow-camera-left={-20} shadow-camera-right={20} shadow-camera-top={20} shadow-camera-bottom={-20} color="#fff5f5" />
      <pointLight position={[0, 6, 0]} intensity={0.8} color={palette.emissive} distance={30} decay={2} />
      <pointLight position={[-10, 3, -5]} intensity={0.4} color={palette.accent} distance={20} decay={2} />
      <pointLight position={[10, 3, 5]} intensity={0.4} color={palette.primary} distance={20} decay={2} />
    </>
  );
}

// Screen positions per template
const SCREEN_POS: Record<RoomTemplate, { pos: [number, number, number]; size?: [number, number, number] }> = {
  classroom: { pos: [0, 3, -11.5] },
  office: { pos: [0, 3, -9.5], size: [5, 3, 0.15] },
  cafe: { pos: [0, 3, -7.5], size: [4, 2.5, 0.15] },
  conference: { pos: [0, 4, -13.5], size: [10, 5, 0.2] },
  party: { pos: [0, 3, -11.5], size: [8, 4, 0.15] },
  library: { pos: [0, 3, -9.5], size: [5, 3, 0.15] },
  gaming: { pos: [0, 3.5, -9.5], size: [6, 3, 0.15] },
  rooftop: { pos: [0, 3, -9.5], size: [5, 3, 0.15] },
  theater: { pos: [0, 4.5, -13.4], size: [14, 7, 0.2] },
};

export default function ThreeRoom({ template = "classroom", roomName = "Room", broadcastStream, onBroadcast }: ThreeRoomProps) {
  const palette = PALETTES[template] || PALETTES.classroom;
  const keys = useKeyboard();
  const playerPos = useRef(new THREE.Vector3(0, 0.6, 5));
  const colliders = useMemo(() => ROOM_COLLIDERS[template] || ROOM_COLLIDERS.classroom, [template]);
  const screenCfg = SCREEN_POS[template] || SCREEN_POS.classroom;

  const handlePositionChange = useCallback((pos: THREE.Vector3) => {
    playerPos.current.copy(pos);
  }, []);

  const RoomContent = useMemo(() => {
    switch (template) {
      case "office": return <OfficeLayout palette={palette} />;
      case "cafe": return <CafeLayout palette={palette} />;
      case "conference": return <ConferenceLayout palette={palette} />;
      case "party": return <PartyLayout palette={palette} />;
      case "library": return <LibraryLayout palette={palette} />;
      case "gaming": return <GamingLayout palette={palette} />;
      case "rooftop": return <RooftopLayout palette={palette} />;
      case "theater": return <TheaterLayout palette={palette} />;
      default: return <ClassroomLayout palette={palette} />;
    }
  }, [template, palette]);

  const usesSky = template === "rooftop";

  return (
    <div className="w-full h-full" style={{ background: "#050208" }}>
      <Canvas
        shadows
        camera={{ position: [0, 12, 20], fov: 50, near: 0.1, far: 200 }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: usesSky ? 1.5 : 1.2 }}
      >
        <color attach="background" args={[usesSky ? "#1a1a2e" : palette.floor]} />
        {!usesSky && <fog attach="fog" args={[palette.floor, 20, 60]} />}
        {usesSky && <Sky sunPosition={[100, 20, 100]} turbidity={8} rayleigh={2} />}

        <SceneLighting palette={palette} />
        <FollowCamera target={playerPos} />

        <Stars radius={80} depth={50} count={4000} factor={4} saturation={0.5} fade speed={0.8} />
        <Sparkles count={60} scale={30} size={3} speed={0.3} color={palette.emissive} opacity={0.15} />

        <ReflectiveFloor color={palette.floor} />
        <FloorGrid color={palette.accent} />


        {RoomContent}

        {/* Central live broadcast screen — any user can activate when near */}
        <LiveBroadcastScreen
          position={screenCfg.pos}
          size={screenCfg.size}
          playerRef={playerPos}
          stream={broadcastStream}
          onActivate={onBroadcast}
        />

        {/* Wandering NPCs */}
        <WanderingNPC name="Roaming 1" bodyColor={palette.primary} startPos={[5, 1, 3]} bounds={3} playerRef={playerPos} />
        <WanderingNPC name="Roaming 2" bodyColor={palette.accent} startPos={[-5, 1, 0]} bounds={4} playerRef={playerPos} />

        <PlayerAvatar keys={keys} onPositionChange={handlePositionChange} colliders={colliders} />

        <OrbitControls
          makeDefault
          enablePan enableZoom enableRotate
          maxPolarAngle={Math.PI / 2.1}
          minDistance={5} maxDistance={40}
          target={[0, 1, 0]}
        />
      </Canvas>
    </div>
  );
}
