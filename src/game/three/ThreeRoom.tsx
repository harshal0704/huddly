"use client";

import React, { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Text, RoundedBox, Float, Sparkles, Sky, Html, Billboard } from "@react-three/drei";
import * as THREE from "three";
import { useRealtimeStore } from "@/stores/realtimeStore";
import { useTracks, ParticipantTile } from "@livekit/components-react";
import { Track } from "livekit-client";

/* ═══════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════ */
interface ThreeRoomProps {
  roomId: string;
  userName?: string;
  template?: string;
  customObjects?: { type: string; x: number; z: number; rotation: number }[];
}

interface AABB { minX: number; maxX: number; minZ: number; maxZ: number; }

/* ═══════════════════════════════════════════════════════════════
   OFFICE PALETTE
   ═══════════════════════════════════════════════════════════════ */
const P = {
  floor: "#d4cfc4",
  wall: "#e8e0d0",
  desk: "#8B6B4A",
  deskTop: "#a07e5a",
  chair: "#3d8b6a",
  glass: "#a8dfc8",
  accent: "#E9C46A",
  warmLight: "#D4A373",
  neon: "#E9C46A",
  skin: "#f0d5b8",
  green: "#3d8b6a",
  greenLight: "#6ecfa0",
  cream: "#3a3a3a",
};

/* ═══════════════════════════════════════════════════════════════
   ZONE DEFINITIONS
   ═══════════════════════════════════════════════════════════════ */
const ZONES: { name: string; emoji: string; bounds: AABB; color: string }[] = [
  { name: "Lobby", emoji: "🏛️", bounds: { minX: -28, maxX: 28, minZ: 20, maxZ: 28 }, color: P.warmLight },
  { name: "Workspace", emoji: "🖥️", bounds: { minX: -18, maxX: 18, minZ: 2, maxZ: 18 }, color: P.desk },
  { name: "Meeting Room 1", emoji: "📹", bounds: { minX: -28, maxX: -20, minZ: -8, maxZ: 0 }, color: P.glass },
  { name: "Meeting Room 2", emoji: "📹", bounds: { minX: -10, maxX: 10, minZ: -10, maxZ: -2 }, color: P.glass },
  { name: "Meeting Room 3", emoji: "📹", bounds: { minX: 20, maxX: 28, minZ: -8, maxZ: 0 }, color: P.glass },
  { name: "Café", emoji: "☕", bounds: { minX: -28, maxX: -20, minZ: 2, maxZ: 18 }, color: P.warmLight },
  { name: "Stage", emoji: "🎤", bounds: { minX: -10, maxX: 10, minZ: -24, maxZ: -12 }, color: P.green },
  { name: "Library", emoji: "📖", bounds: { minX: -28, maxX: -14, minZ: -24, maxZ: -12 }, color: "#8B6914" },
  { name: "Gaming", emoji: "🎮", bounds: { minX: 14, maxX: 28, minZ: -24, maxZ: -12 }, color: "#06b6d4" },
  { name: "Rooftop", emoji: "🌳", bounds: { minX: -28, maxX: 28, minZ: -28, maxZ: -26 }, color: P.greenLight },
];

/* ═══════════════════════════════════════════════════════════════
   UNIFIED COLLIDERS
   ═══════════════════════════════════════════════════════════════ */
const COLLIDERS: AABB[] = [
  // Outer walls
  { minX: -30, maxX: 30, minZ: 29, maxZ: 30 },  // north wall
  { minX: -30, maxX: 30, minZ: -30, maxZ: -29 }, // south wall
  { minX: -30, maxX: -29, minZ: -30, maxZ: 30 }, // west wall
  { minX: 29, maxX: 30, minZ: -30, maxZ: 30 },   // east wall
  // Meeting room 1 walls
  { minX: -28, maxX: -20, minZ: -0.2, maxZ: 0.2 },
  { minX: -20.2, maxX: -19.8, minZ: -8, maxZ: 0 },
  // Meeting room 2 walls
  { minX: -10.2, maxX: -9.8, minZ: -10, maxZ: -2 },
  { minX: 9.8, maxX: 10.2, minZ: -10, maxZ: -2 },
  { minX: -10, maxX: 10, minZ: -10.2, maxZ: -9.8 },
  // Meeting room 3 walls
  { minX: 20, maxX: 28, minZ: -0.2, maxZ: 0.2 },
  { minX: 19.8, maxX: 20.2, minZ: -8, maxZ: 0 },
  // Desk pods (simplified)
  { minX: -16, maxX: -8, minZ: 6, maxZ: 6.8 },
  { minX: -4, maxX: 4, minZ: 6, maxZ: 6.8 },
  { minX: 8, maxX: 16, minZ: 6, maxZ: 6.8 },
  { minX: -16, maxX: -8, minZ: 12, maxZ: 12.8 },
  { minX: -4, maxX: 4, minZ: 12, maxZ: 12.8 },
  { minX: 8, maxX: 16, minZ: 12, maxZ: 12.8 },
  // Café counter
  { minX: -27, maxX: -22, minZ: 9.5, maxZ: 10.5 },
  // Stage platform edge
  { minX: -6, maxX: 6, minZ: -20, maxZ: -19.8 },
  // Reception desk
  { minX: -4, maxX: 4, minZ: 22, maxZ: 23.5 },
  // Whiteboards (solid — can't walk through)
  { minX: -1.25, maxX: 1.25, minZ: 1.3, maxZ: 1.7 },
  { minX: -25.25, maxX: -22.75, minZ: -7.7, maxZ: -7.3 },
  // Vending machines
  { minX: -28.5, maxX: -27.5, minZ: 1.5, maxZ: 2.5 },
  { minX: 27.5, maxX: 28.5, minZ: 9.5, maxZ: 10.5 },
  // Ping pong table
  { minX: 22.5, maxX: 25.5, minZ: -21, maxZ: -19 },
];

/* ═══════════════════════════════════════════════════════════════
   COLLISION HELPER
   ═══════════════════════════════════════════════════════════════ */
function wouldCollide(x: number, z: number, r: number = 0.4): boolean {
  for (const c of COLLIDERS) {
    if (x + r > c.minX && x - r < c.maxX && z + r > c.minZ && z - r < c.maxZ) return true;
  }
  return false;
}

function getZone(x: number, z: number): string {
  for (const z2 of ZONES) {
    if (x >= z2.bounds.minX && x <= z2.bounds.maxX && z >= z2.bounds.minZ && z <= z2.bounds.maxZ) return z2.name;
  }
  return "Office";
}

/* ═══════════════════════════════════════════════════════════════
   BASIC 3D COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

function Desk({ position, rotation = [0, 0, 0] as [number, number, number] }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  return (
    <group position={position} rotation={rotation}>
      <RoundedBox args={[2, 0.08, 1]} position={[0, 0.75, 0]} radius={0.02} smoothness={4} castShadow>
        <meshStandardMaterial color={P.deskTop} roughness={0.4} metalness={0.3} />
      </RoundedBox>
      {[[-0.85, 0.37, -0.4], [0.85, 0.37, -0.4], [-0.85, 0.37, 0.4], [0.85, 0.37, 0.4]].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]}>
          <cylinderGeometry args={[0.03, 0.03, 0.74, 6]} />
          <meshStandardMaterial color="#333" metalness={0.8} />
        </mesh>
      ))}
      {/* Monitor */}
      <RoundedBox args={[0.7, 0.5, 0.03]} position={[0, 1.1, -0.3]} radius={0.02} smoothness={4}>
        <meshStandardMaterial color="#111" emissive={P.green} emissiveIntensity={0.08} />
      </RoundedBox>
    </group>
  );
}

function StandingDesk({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <RoundedBox args={[1.4, 0.06, 0.7]} position={[0, 1.1, 0]} radius={0.02} smoothness={4} castShadow>
        <meshStandardMaterial color={P.deskTop} roughness={0.4} metalness={0.3} />
      </RoundedBox>
      <mesh position={[-0.55, 0.55, 0]}><cylinderGeometry args={[0.04, 0.04, 1.1, 8]} /><meshStandardMaterial color="#333" metalness={0.8} /></mesh>
      <mesh position={[0.55, 0.55, 0]}><cylinderGeometry args={[0.04, 0.04, 1.1, 8]} /><meshStandardMaterial color="#333" metalness={0.8} /></mesh>
      <RoundedBox args={[0.5, 0.35, 0.025]} position={[0, 1.45, -0.2]} radius={0.02} smoothness={4}>
        <meshStandardMaterial color="#111" emissive={P.green} emissiveIntensity={0.08} />
      </RoundedBox>
    </group>
  );
}

function Chair({ position, rotation = [0, 0, 0] as [number, number, number], color = P.chair }: { position: [number, number, number]; rotation?: [number, number, number]; color?: string }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.45, 0]}><boxGeometry args={[0.5, 0.08, 0.5]} /><meshStandardMaterial color={color} /></mesh>
      <mesh position={[0, 0.7, -0.22]}><boxGeometry args={[0.5, 0.5, 0.06]} /><meshStandardMaterial color={color} /></mesh>
      <mesh position={[0, 0.22, 0]}><cylinderGeometry args={[0.03, 0.03, 0.44, 6]} /><meshStandardMaterial color="#333" metalness={0.8} /></mesh>
    </group>
  );
}

function GlassPartition({ position, size }: { position: [number, number, number]; size: [number, number, number] }) {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={P.glass} transparent opacity={0.12} roughness={0.05} metalness={0.9} />
    </mesh>
  );
}

function ZoneLabel({ position, text, emoji }: { position: [number, number, number]; text: string; emoji: string }) {
  return (
    <Float speed={1.5} floatIntensity={0.15} rotationIntensity={0}>
      <group position={position}>
        <Text fontSize={0.4} color={P.cream} anchorX="center" fillOpacity={0.7}>{emoji} {text}</Text>
      </group>
    </Float>
  );
}

function Plant({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.2, 0]}><cylinderGeometry args={[0.12, 0.15, 0.4, 8]} /><meshStandardMaterial color="#44403c" roughness={0.8} /></mesh>
      <Float speed={2} rotationIntensity={0.1} floatIntensity={0.15}>
        <mesh position={[0, 0.55, 0]}><sphereGeometry args={[0.25, 12, 12]} /><meshStandardMaterial color="#166534" roughness={0.7} /></mesh>
      </Float>
    </group>
  );
}

function WaterCooler({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.5, 0]}><cylinderGeometry args={[0.2, 0.2, 1, 12]} /><meshStandardMaterial color="#e2e8f0" roughness={0.3} metalness={0.5} /></mesh>
      <mesh position={[0, 1.15, 0]}><cylinderGeometry args={[0.22, 0.18, 0.3, 12]} /><meshStandardMaterial color="#93c5fd" transparent opacity={0.5} /></mesh>
    </group>
  );
}

function CoffeeMachine({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <RoundedBox args={[0.5, 0.7, 0.4]} position={[0, 0.35, 0]} radius={0.03} smoothness={4}>
        <meshStandardMaterial color="#292524" roughness={0.3} metalness={0.6} />
      </RoundedBox>
      <mesh position={[0, 0.75, 0]}><cylinderGeometry args={[0.06, 0.08, 0.1, 8]} /><meshStandardMaterial color="#78350f" /></mesh>
    </group>
  );
}

function Bookshelf({ position, rotation = [0, 0, 0] as [number, number, number] }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  return (
    <group position={position} rotation={rotation}>
      <RoundedBox args={[1.2, 2.4, 0.35]} position={[0, 1.2, 0]} radius={0.02} smoothness={4}>
        <meshStandardMaterial color="#5C3A1E" roughness={0.7} />
      </RoundedBox>
      {/* Book rows */}
      {[0.4, 0.9, 1.4, 1.9].map((y, i) => (
        <mesh key={i} position={[0, y, 0.02]}>
          <boxGeometry args={[1, 0.3, 0.25]} />
          <meshStandardMaterial color={["#991b1b", "#1e3a5f", "#365314", "#78350f"][i]} roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

function ArcadeCabinet({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <RoundedBox args={[0.8, 1.8, 0.6]} position={[0, 0.9, 0]} radius={0.03} smoothness={4}>
        <meshStandardMaterial color="#1a1a2e" roughness={0.4} metalness={0.5} />
      </RoundedBox>
      <mesh position={[0, 1.3, 0.31]}>
        <planeGeometry args={[0.6, 0.5]} />
        <meshStandardMaterial color="#000" emissive="#06b6d4" emissiveIntensity={0.6} />
      </mesh>
      <Text position={[0, 1.75, 0.32]} fontSize={0.1} color="#E9C46A" anchorX="center">ARCADE</Text>
    </group>
  );
}

function JukeBox({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <RoundedBox args={[0.7, 1.4, 0.5]} position={[0, 0.7, 0]} radius={0.05} smoothness={4}>
        <meshStandardMaterial color="#78350f" roughness={0.5} metalness={0.4} />
      </RoundedBox>
      <mesh position={[0, 1.1, 0.26]}>
        <planeGeometry args={[0.5, 0.4]} />
        <meshStandardMaterial color="#000" emissive={P.neon} emissiveIntensity={0.5} />
      </mesh>
      <Text position={[0, 1.4, 0.3]} fontSize={0.08} color={P.neon} anchorX="center">♪ JUKEBOX ♪</Text>
    </group>
  );
}

function ScrumBoard({ position, rotation = [0, 0, 0] as [number, number, number] }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  return (
    <group position={position} rotation={rotation}>
      <RoundedBox args={[3, 2, 0.08]} position={[0, 1.5, 0]} radius={0.02} smoothness={4}>
        <meshStandardMaterial color="#f5f5f4" roughness={0.8} />
      </RoundedBox>
      {/* Sticky notes */}
      {[[-0.8, 1.8], [-0.3, 1.3], [0.2, 1.7], [0.7, 1.4], [-0.5, 1.6], [0.5, 1.2]].map(([x, y], i) => (
        <mesh key={i} position={[x, y, 0.05]}>
          <planeGeometry args={[0.35, 0.3]} />
          <meshStandardMaterial color={["#fef08a", "#bbf7d0", "#fecaca", "#bfdbfe", "#e9d5ff", "#fed7aa"][i]} />
        </mesh>
      ))}
      <Text position={[-0.8, 2.35, 0.06]} fontSize={0.12} color="#333" anchorX="center">TODO</Text>
      <Text position={[0, 2.35, 0.06]} fontSize={0.12} color="#333" anchorX="center">IN PROGRESS</Text>
      <Text position={[0.8, 2.35, 0.06]} fontSize={0.12} color="#333" anchorX="center">DONE</Text>
    </group>
  );
}

function MeetingTable({ position, size = "small" }: { position: [number, number, number]; size?: "small" | "large" }) {
  const w = size === "large" ? 4 : 2.5;
  const d = size === "large" ? 2 : 1.5;
  return (
    <group position={position}>
      <RoundedBox args={[w, 0.08, d]} position={[0, 0.75, 0]} radius={0.04} smoothness={4} castShadow>
        <meshStandardMaterial color={P.deskTop} roughness={0.3} metalness={0.3} />
      </RoundedBox>
      <mesh position={[0, 0.37, 0]}><cylinderGeometry args={[0.15, 0.25, 0.74, 12]} /><meshStandardMaterial color="#333" metalness={0.8} /></mesh>
    </group>
  );
}

function BroadcastScreen({ position, rotation = [0, 0, 0] as [number, number, number], size = [3, 1.8] }: { position: [number, number, number]; rotation?: [number, number, number]; size?: [number, number] }) {
  const ref = useRef<THREE.Mesh>(null);
  const { camera } = useThree();
  const [isNear, setIsNear] = useState(false);

  const { activeScreenTrack: activeTrack } = React.useContext(LiveKitTrackContext);

  useFrame((s) => {
    if (ref.current) {
      const dist = camera.position.distanceTo(ref.current.position);
      const near = dist < 12; // Adjust distance as needed
      if (near !== isNear) setIsNear(near);

      if (!activeTrack || !near) {
        (ref.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.3 + Math.sin(s.clock.elapsedTime * 0.5) * 0.1;
      }
    }
  });

  return (
    <group position={position} rotation={rotation}>
      <RoundedBox args={[size[0] + 0.2, size[1] + 0.15, 0.08]} radius={0.04} smoothness={4}>
        <meshStandardMaterial color="#111" metalness={0.8} roughness={0.2} />
      </RoundedBox>
      <mesh ref={ref} position={[0, 0, 0.05]}>
        <planeGeometry args={size} />
        {activeTrack && isNear ? (
          <meshBasicMaterial color="#000" />
        ) : (
          <meshStandardMaterial color="#0a1a10" emissive={P.green} emissiveIntensity={0.3} roughness={0.1} metalness={0.9} />
        )}
      </mesh>
      {activeTrack && isNear && (
        <Html position={[0, 0, 0.06]} transform distanceFactor={1.5} center zIndexRange={[100, 0]} style={{ width: `${size[0] * 200}px`, height: `${size[1] * 200}px` }}>
          <div className="w-full h-full overflow-hidden [&_.lk-participant-tile]:w-full [&_.lk-participant-tile]:h-full [&_video]:w-full [&_video]:h-full [&_video]:object-cover" style={{ pointerEvents: 'none' }}>
            <ParticipantTile trackRef={activeTrack} />
          </div>
        </Html>
      )}
      {!activeTrack && isNear && (
        <Html position={[0, 0, 0.06]} transform distanceFactor={1.5} center zIndexRange={[100, 0]}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              window.dispatchEvent(new CustomEvent("huddly:interact", { detail: { type: "broadcast" } }));
            }}
            className="px-4 py-2 bg-[#007AFF]/90 hover:bg-[#007AFF] text-white rounded-lg text-sm font-semibold shadow-lg backdrop-blur-md transition-all flex items-center gap-2 pointer-events-auto cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Share Screen
          </button>
        </Html>
      )}
    </group>
  );
}

function NeonSign({ position, text, color = P.neon }: { position: [number, number, number]; text: string; color?: string }) {
  return (
    <Text position={position} fontSize={0.35} color={color} anchorX="center" fillOpacity={0.9}
      outlineWidth={0.02} outlineColor={color} outlineOpacity={0.3}>
      {text}
    </Text>
  );
}

function PendantLight({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0, 0]}><cylinderGeometry args={[0.01, 0.01, 0.5, 6]} /><meshStandardMaterial color="#333" /></mesh>
      <mesh position={[0, -0.3, 0]}><coneGeometry args={[0.2, 0.15, 12]} /><meshStandardMaterial color={P.warmLight} emissive={P.warmLight} emissiveIntensity={0.3} /></mesh>
      <pointLight position={[0, -0.4, 0]} intensity={0.4} color={P.warmLight} distance={4} />
    </group>
  );
}

function Sofa({ position, rotation = [0, 0, 0] as [number, number, number], color = P.chair }: { position: [number, number, number]; rotation?: [number, number, number]; color?: string }) {
  return (
    <group position={position} rotation={rotation}>
      <RoundedBox args={[2, 0.4, 0.8]} position={[0, 0.3, 0]} radius={0.06} smoothness={4}><meshStandardMaterial color={color} roughness={0.7} /></RoundedBox>
      <RoundedBox args={[2, 0.6, 0.15]} position={[0, 0.5, -0.35]} radius={0.04} smoothness={4}><meshStandardMaterial color={color} roughness={0.7} /></RoundedBox>
    </group>
  );
}

function ReceptionDesk({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Main curved desk */}
      <RoundedBox args={[6, 1.1, 1.2]} position={[0, 0.55, 0]} radius={0.06} smoothness={4} castShadow>
        <meshStandardMaterial color={P.desk} roughness={0.5} metalness={0.3} />
      </RoundedBox>
      {/* Top surface */}
      <RoundedBox args={[6.2, 0.06, 1.4]} position={[0, 1.12, 0]} radius={0.03} smoothness={4}>
        <meshStandardMaterial color={P.deskTop} roughness={0.3} metalness={0.4} />
      </RoundedBox>
      {/* Monitor */}
      <RoundedBox args={[1, 0.7, 0.04]} position={[0, 1.6, -0.3]} radius={0.02} smoothness={4}>
        <meshStandardMaterial color="#111" emissive={P.green} emissiveIntensity={0.1} />
      </RoundedBox>
      {/* Huddly sign */}
      <Text position={[0, 2.0, -0.3]} fontSize={0.25} color={P.greenLight} anchorX="center" fillOpacity={0.9}>
        Welcome to Huddly Office
      </Text>
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════
   DELETED NPCS
   ═══════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════
   AVATAR (enhanced)
   ═══════════════════════════════════════════════════════════════ */
function Avatar({ color, name, cameraTrack, audioTrack }: { color: string; name: string; cameraTrack?: any; audioTrack?: any }) {
  const ref = useRef<THREE.Group>(null);
  const videoRef = useRef<HTMLDivElement>(null);
  const audioHtmlRef = useRef<HTMLAudioElement>(null);
  const { camera } = useThree();
  const [isNear, setIsNear] = useState(false);

  useEffect(() => {
    if (audioHtmlRef.current && audioTrack?.publication?.track) {
      audioTrack.publication.track.attach(audioHtmlRef.current);
    }
    return () => {
      if (audioHtmlRef.current && audioTrack?.publication?.track) {
        audioTrack.publication.track.detach(audioHtmlRef.current);
      }
    };
  }, [audioTrack]);

  useFrame(() => {
    if (ref.current) {
      const worldPos = new THREE.Vector3();
      ref.current.getWorldPosition(worldPos);
      const dist = camera.position.distanceTo(worldPos);
      const near = dist < 8;

      if (near !== isNear) setIsNear(near);

      // Video fading
      if (videoRef.current) {
        if (near) {
          videoRef.current.style.opacity = "1";
          videoRef.current.style.transform = "scale(1)";
        } else {
          videoRef.current.style.opacity = "0";
          videoRef.current.style.transform = "scale(0.5)";
        }
      }

      // Proximity Audio Attenuation (Linear Rolloff)
      if (audioHtmlRef.current) {
        const minDist = 2; // Full volume up to 2 units away
        const maxDist = 20; // Zero volume at 20 units away
        const volume = Math.max(0, Math.min(1, 1 - (dist - minDist) / (maxDist - minDist)));
        audioHtmlRef.current.volume = volume;
      }
    }
  });

  return (
    <group ref={ref}>
      {/* Hidden audio element for spatial proximity sound */}
      <Html><audio ref={audioHtmlRef} autoPlay playsInline /></Html>
      {/* ── Body (rounded capsule) */}
      <mesh position={[0, -0.15, 0]} castShadow>
        <capsuleGeometry args={[0.2, 0.45, 16, 16]} />
        <meshStandardMaterial color={color} roughness={0.35} metalness={0.1} />
      </mesh>
      {/* ── Head */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshStandardMaterial color="#fce4d6" roughness={0.4} />
      </mesh>
      {/* ── Left eye */}
      <mesh position={[-0.07, 0.33, 0.17]}>
        <sphereGeometry args={[0.035, 12, 12]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      {/* ── Right eye */}
      <mesh position={[0.07, 0.33, 0.17]}>
        <sphereGeometry args={[0.035, 12, 12]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      {/* ── Smile */}
      <mesh position={[0, 0.24, 0.18]}>
        <torusGeometry args={[0.04, 0.008, 8, 12, Math.PI]} />
        <meshStandardMaterial color="#c0392b" />
      </mesh>
      {/* ── Left arm */}
      <mesh position={[-0.25, -0.12, 0]} rotation={[0, 0, 0.15]} castShadow>
        <capsuleGeometry args={[0.05, 0.25, 8, 8]} />
        <meshStandardMaterial color={color} roughness={0.35} />
      </mesh>
      {/* ── Right arm */}
      <mesh position={[0.25, -0.12, 0]} rotation={[0, 0, -0.15]} castShadow>
        <capsuleGeometry args={[0.05, 0.25, 8, 8]} />
        <meshStandardMaterial color={color} roughness={0.35} />
      </mesh>
      {/* ── Left leg */}
      <mesh position={[-0.08, -0.52, 0]} castShadow>
        <capsuleGeometry args={[0.055, 0.2, 8, 8]} />
        <meshStandardMaterial color="#34495e" roughness={0.5} />
      </mesh>
      {/* ── Right leg */}
      <mesh position={[0.08, -0.52, 0]} castShadow>
        <capsuleGeometry args={[0.055, 0.2, 8, 8]} />
        <meshStandardMaterial color="#34495e" roughness={0.5} />
      </mesh>
      {/* ── Proximity ring (glowing) */}
      <mesh position={[0, -0.72, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.3, 0.42, 32]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
      {/* ── Floating Name Billboard */}
      <Billboard position={[0, 1.2, 0]} follow={true} lockX={false} lockY={false} lockZ={false}>
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[name.length * 0.15 + 0.6, 0.5]} />
          <meshBasicMaterial color="#000" transparent opacity={0.5} depthTest={false} />
        </mesh>
        <Text fontSize={0.3} color="white" anchorX="center" anchorY="middle" fontWeight="bold" renderOrder={1}>
          <meshBasicMaterial color="#ffffff" depthTest={false} transparent />
          {name}
        </Text>
      </Billboard>
      {/* ── Floating Video Head ── */}
      {cameraTrack && (
        <Html position={[0, 1.8, 0]} transform distanceFactor={2.5} center zIndexRange={[100, 0]}>
          <div
            ref={videoRef}
            className={`w-24 h-24 rounded-full overflow-hidden border-4 bg-gray-900 transition-all duration-300 shadow-xl ${!isNear ? 'pointer-events-none' : ''}`}
            style={{ borderColor: color, opacity: 0, transform: "scale(0.5)" }}
          >
            {isNear && (
              <div className="w-full h-full [&_.lk-participant-tile]:w-full [&_.lk-participant-tile]:h-full [&_video]:w-full [&_video]:h-full [&_video]:object-cover" style={{ pointerEvents: 'none' }}>
                <ParticipantTile trackRef={cameraTrack} />
              </div>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CHAIR POSITIONS (for sit detection)
   ═══════════════════════════════════════════════════════════════ */
const CHAIR_POSITIONS: [number, number][] = [
  // Workspace pods (6 desks × 2 chairs each)
  ...Array.from({ length: 6 }, (_, i) => {
    const col = i % 3; const row = Math.floor(i / 3);
    const x = -12 + col * 12; const z = 8 + row * 6;
    return [[x - 1, z], [x + 1, z]] as [number, number][];
  }).flat(),
  // Meeting room 1 chairs
  [-25, -4], [-23, -4], [-25, -6], [-23, -6],
  // Meeting room 2 chairs
  [-3, -6], [3, -6], [-3, -8], [3, -8], [-1, -6], [1, -6], [-1, -8], [1, -8],
  // Meeting room 3 chairs
  [23, -4], [25, -4], [23, -6], [25, -6],
  // Café seats
  [-26, 8], [-22, 8], [-26, 12], [-22, 12],
  // Library sofas
  [-18, -18], [-24, -18],
  // Gaming desks
  [18, -16], [20, -16], [22, -16], [24, -16], [26, -16],
  // Stage audience
  ...Array.from({ length: 15 }, (_, i) => [(-6 + Math.floor(i / 3) * 3), (-16 - (i % 3) * 2)] as [number, number]),
  // Lobby sofas
  [-8, 26], [8, 26],
  // Rooftop benches
  [-10, -28], [0, -28], [10, -28],
];

/* ═══════════════════════════════════════════════════════════════
   INTERACTIVE OBJECT DEFINITIONS
   ═══════════════════════════════════════════════════════════════ */
const INTERACTABLES: { type: string; position: [number, number, number]; radius: number; prompt: string }[] = [
  // Big Stage TV
  { type: "broadcast", position: [0, 2.5, -22], radius: 5, prompt: "Share Screen" },
  // Meeting Room TVs
  { type: "broadcast", position: [-27.5, 1.5, -4], radius: 3, prompt: "Share Screen" },
  { type: "broadcast", position: [0, 1.8, -9.5], radius: 4, prompt: "Share Screen" },
  { type: "broadcast", position: [27.5, 1.5, -4], radius: 3, prompt: "Share Screen" },
  // ScrumBoard
  { type: "whiteboard", position: [19, 0, 6], radius: 3, prompt: "Edit Board" },
  // Whiteboards
  { type: "whiteboard", position: [0, 1.5, 1.5], radius: 3, prompt: "Edit Whiteboard" },
  { type: "whiteboard", position: [-24, 1.5, -7.5], radius: 3, prompt: "Edit Whiteboard" },
  // Coffee Machine
  { type: "coffee", position: [-26, 0, 10], radius: 2, prompt: "☕ Grab Coffee" },
  // Jukebox
  { type: "jukebox", position: [-27, 0, 4], radius: 2, prompt: "🎵 Play Music" },
  // Arcade
  { type: "arcade", position: [26, 0, -22], radius: 2, prompt: "🎮 Play Arcade" },
  // Water Cooler
  { type: "watercooler", position: [18, 0, 10], radius: 2, prompt: "💧 Water Break" },
];

/* ═══════════════════════════════════════════════════════════════
   PER-TEMPLATE SPAWN POSITIONS
   ═══════════════════════════════════════════════════════════════ */
const TEMPLATE_SPAWNS: Record<string, [number, number, number]> = {
  office: [0, 0.6, 24],
  cafe: [0, 0.6, 4],
  party: [0, 0.6, 4],
  classroom: [0, 0.6, 12],
  conference: [0, 0.6, 16],
  library: [0, 0.6, 12],
  gaming: [0, 0.6, 12],
  rooftop: [0, 0.6, 12],
  theater: [0, 0.6, 12],
  blank: [0, 0.6, 12],
  custom: [0, 0.6, 12],
};

function PlayerController({ userName, onZoneChange, onNearChair, onNearInteractable, onInteract, fpsMode, onFpsModeChange, template = "office" }: {
  userName: string;
  onZoneChange: (z: string) => void;
  onNearChair: (near: boolean) => void;
  onNearInteractable: (interactable: { type: string; prompt: string } | null) => void;
  onInteract: (type: string) => void;
  fpsMode: boolean;
  onFpsModeChange: (fps: boolean) => void;
  template?: string;
}) {
  const { camera, gl } = useThree();
  const ref = useRef<THREE.Group>(null);
  const keys = useRef({ w: false, a: false, s: false, d: false });
  const speed = 6;
  const lastZone = useRef("Lobby");
  const isSitting = useRef(false);
  const lastNearChair = useRef(false);
  const lastInteractable = useRef<string | null>(null);
  const yawRef = useRef(0);
  const pitchRef = useRef(0);

  const updatePosition = useRealtimeStore(s => s.updatePosition);

  // Manual pointer lock & unlock
  useEffect(() => {
    if (fpsMode) {
      gl.domElement.requestPointerLock();
    } else {
      if (document.pointerLockElement === gl.domElement) {
        document.exitPointerLock();
      }
    }
  }, [fpsMode, gl.domElement]);

  // Sync pointer lock state changes back to fpsMode
  useEffect(() => {
    const onLockChange = () => {
      const isLocked = document.pointerLockElement === gl.domElement;
      if (!isLocked && fpsMode) {
        onFpsModeChange(false);
      }
    };
    document.addEventListener("pointerlockchange", onLockChange);
    return () => document.removeEventListener("pointerlockchange", onLockChange);
  }, [fpsMode, gl.domElement, onFpsModeChange]);

  // Manual mouse look when pointer is locked
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement !== gl.domElement) return;
      const sensitivity = 0.002;
      yawRef.current -= e.movementX * sensitivity;
      pitchRef.current -= e.movementY * sensitivity;
      pitchRef.current = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, pitchRef.current));
    };
    document.addEventListener("mousemove", onMouseMove);
    return () => document.removeEventListener("mousemove", onMouseMove);
  }, [gl.domElement]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k in keys.current) (keys.current as any)[k] = true;
      if (k === "e" && ref.current) {
        const px = ref.current.position.x, pz = ref.current.position.z;
        // Check chair interaction — find closest chair and teleport
        let closestChair: [number, number] | null = null;
        let closestChairDist = Infinity;
        for (const [cx, cz] of CHAIR_POSITIONS) {
          const d = Math.sqrt((px - cx) ** 2 + (pz - cz) ** 2);
          if (d < 1.5 && d < closestChairDist) {
            closestChairDist = d;
            closestChair = [cx, cz];
          }
        }
        if (closestChair) {
          isSitting.current = !isSitting.current;
          if (isSitting.current) {
            // Teleport to the chair and sit
            ref.current.position.set(closestChair[0], 0.3, closestChair[1]);
          } else {
            // Stand up
            ref.current.position.y = 0.6;
          }
        }
        // Check interactable objects
        for (const obj of INTERACTABLES) {
          const dx = px - obj.position[0], dz = pz - obj.position[2];
          if (Math.sqrt(dx * dx + dz * dz) < obj.radius) {
            onInteract(obj.type);
            break;
          }
        }
      }
    };
    const up = (e: KeyboardEvent) => { const k = e.key.toLowerCase(); if (k in keys.current) (keys.current as any)[k] = false; };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, [onInteract]);

  useFrame((_, dt) => {
    if (!ref.current) return;

    const px = ref.current.position.x, pz = ref.current.position.z;

    // Check chair proximity for HUD
    const nearSeat = CHAIR_POSITIONS.some(([cx, cz]) => Math.abs(px - cx) < 1.5 && Math.abs(pz - cz) < 1.5);
    if (nearSeat !== lastNearChair.current) { lastNearChair.current = nearSeat; onNearChair(nearSeat); }

    // Check interactable proximity
    let closestInteractable: { type: string; prompt: string } | null = null;
    let closestDist = Infinity;
    for (const obj of INTERACTABLES) {
      const dx = px - obj.position[0], dz = pz - obj.position[2];
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < obj.radius && dist < closestDist) {
        closestDist = dist;
        closestInteractable = { type: obj.type, prompt: obj.prompt };
      }
    }
    const interactKey = closestInteractable?.type || null;
    if (interactKey !== lastInteractable.current) {
      lastInteractable.current = interactKey;
      onNearInteractable(closestInteractable);
    }

    // Movement (only when in FPS mode)
    if (!isSitting.current && fpsMode) {
      const { w, a, s, d } = keys.current;
      const direction = new THREE.Vector3();
      const frontVector = new THREE.Vector3(0, 0, (s ? 1 : 0) - (w ? 1 : 0));
      const sideVector = new THREE.Vector3((d ? 1 : 0) - (a ? 1 : 0), 0, 0);

      direction.addVectors(frontVector, sideVector).normalize().multiplyScalar(speed * dt).applyEuler(new THREE.Euler(0, yawRef.current, 0));

      const nx = ref.current.position.x + direction.x;
      const nz = ref.current.position.z + direction.z;

      const clampX = Math.max(-28, Math.min(28, nx));
      const clampZ = Math.max(-28, Math.min(28, nz));

      if (!wouldCollide(clampX, ref.current.position.z, 0.35)) ref.current.position.x = clampX;
      if (!wouldCollide(ref.current.position.x, clampZ, 0.35)) ref.current.position.z = clampZ;
    }

    const zone = getZone(ref.current.position.x, ref.current.position.z);
    if (zone !== lastZone.current) { lastZone.current = zone; onZoneChange(zone); }

    // First person camera lock inside head
    const targetCamPos = ref.current.position.clone();
    targetCamPos.y += 1.4;
    camera.position.lerp(targetCamPos, 0.3);

    // Manual camera rotation
    camera.rotation.set(pitchRef.current, yawRef.current, 0, "YXZ");

    // Broadcast position (throttled)
    if (Math.random() < 0.1) {
      updatePosition(ref.current.position.x, ref.current.position.y, ref.current.position.z, lastZone.current);
    }
  });

  const spawn = TEMPLATE_SPAWNS[template] || TEMPLATE_SPAWNS.office;

  return (
    <group ref={ref} position={spawn}>
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════
   DECORATIVE COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

function ZoneRug({ position, size, color }: { position: [number, number, number]; size: [number, number]; color: string }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[position[0], 0.02, position[2]]} receiveShadow>
      <planeGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.95} metalness={0} />
    </mesh>
  );
}

function FloorLamp({ position, lightColor = "#fff5e0" }: { position: [number, number, number]; lightColor?: string }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.04, 0]}><cylinderGeometry args={[0.15, 0.18, 0.08, 12]} /><meshStandardMaterial color="#444" metalness={0.7} /></mesh>
      <mesh position={[0, 0.8, 0]}><cylinderGeometry args={[0.02, 0.02, 1.5, 8]} /><meshStandardMaterial color="#555" metalness={0.7} /></mesh>
      <mesh position={[0, 1.6, 0]}><coneGeometry args={[0.22, 0.25, 12]} /><meshStandardMaterial color="#f5f0e0" emissive={lightColor} emissiveIntensity={0.3} /></mesh>
      <pointLight position={[0, 1.55, 0]} intensity={0.5} color={lightColor} distance={6} />
    </group>
  );
}

function WallPoster({ position, rotation = [0, 0, 0] as [number, number, number], color, text }: { position: [number, number, number]; rotation?: [number, number, number]; color: string; text: string }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh><boxGeometry args={[1.2, 0.9, 0.03]} /><meshStandardMaterial color={color} roughness={0.5} /></mesh>
      <Text position={[0, 0, 0.02]} fontSize={0.1} color="white" anchorX="center" anchorY="middle" maxWidth={1}>{text}</Text>
    </group>
  );
}

function WallClock({ position, rotation = [0, 0, 0] as [number, number, number] }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  const handRef = useRef<THREE.Mesh>(null);
  useFrame((s) => { if (handRef.current) handRef.current.rotation.z = -s.clock.elapsedTime * 0.5; });
  return (
    <group position={position} rotation={rotation}>
      <mesh><circleGeometry args={[0.3, 32]} /><meshStandardMaterial color="#fff" roughness={0.4} /></mesh>
      <mesh position={[0, 0, 0.01]}><ringGeometry args={[0.28, 0.3, 32]} /><meshStandardMaterial color="#333" /></mesh>
      <mesh ref={handRef} position={[0, 0, 0.02]}><boxGeometry args={[0.02, 0.2, 0.01]} /><meshStandardMaterial color="#111" /></mesh>
    </group>
  );
}

function Whiteboard({ position, rotation = [0, 0, 0] as [number, number, number] }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  const whiteboardDataUrl = useRealtimeStore(s => s.whiteboardDataUrl);

  const texture = useMemo(() => {
    if (!whiteboardDataUrl) return null;
    const img = new Image();
    img.src = whiteboardDataUrl;
    const tex = new THREE.Texture(img);
    tex.colorSpace = THREE.SRGBColorSpace;
    img.onload = () => {
      tex.needsUpdate = true;
    };
    return tex;
  }, [whiteboardDataUrl]);

  return (
    <group position={position} rotation={rotation}>
      <RoundedBox args={[2.5, 1.6, 0.06]} radius={0.03} smoothness={4}>
        <meshStandardMaterial color="#0f0a1a" roughness={0.8} />
      </RoundedBox>

      {texture ? (
        <mesh position={[0, 0, 0.032]}>
          <planeGeometry args={[2.46, 1.56]} />
          <meshBasicMaterial map={texture} />
        </mesh>
      ) : (
        <group>
          {/* Colored marker lines placeholder */}
          {[[0.3, 0.3, "#e74c3c"], [-0.5, -0.1, "#3498db"], [0.1, -0.4, "#2ecc71"]].map(([x, y, c], i) => (
            <mesh key={i} position={[x as number, y as number, 0.04]}>
              <boxGeometry args={[0.8, 0.04, 0.01]} />
              <meshStandardMaterial color={c as string} />
            </mesh>
          ))}
          <Text position={[0, 0.6, 0.04]} fontSize={0.08} color="#666" anchorX="center">Shared Whiteboard</Text>
        </group>
      )}
    </group>
  );
}

function CeilingLight({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh><boxGeometry args={[1.5, 0.05, 0.3]} /><meshStandardMaterial color="#f5f5f5" emissive="#fff" emissiveIntensity={0.15} /></mesh>
      <pointLight position={[0, -0.2, 0]} intensity={0.3} color="#fff5e8" distance={8} />
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════
   OFFICE WORLD LAYOUT — ALL ZONES
   ═══════════════════════════════════════════════════════════════ */
function OfficeWorldLayout() {
  return (
    <>
      {/* ── FLOOR ─────────────────────────────────── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color={P.floor} roughness={0.9} metalness={0.1} />
      </mesh>
      <gridHelper args={[60, 60, "#bbb", "#ccc"]} position={[0, 0.01, 0]} material-opacity={0.12} material-transparent />

      {/* ── ZONE RUGS (colored floors per zone) ──── */}
      <ZoneRug position={[0, 0, 24]} size={[56, 8]} color="#e8ddd0" />        {/* Lobby — warm beige */}
      <ZoneRug position={[0, 0, 10]} size={[36, 16]} color="#dce8d8" />       {/* Workspace — light sage */}
      <ZoneRug position={[-24, 0, -4]} size={[8, 8]} color="#d0e0f0" />       {/* Meeting 1 — soft blue */}
      <ZoneRug position={[0, 0, -6]} size={[20, 8]} color="#d0e0f0" />        {/* Meeting 2 — soft blue */}
      <ZoneRug position={[24, 0, -4]} size={[8, 8]} color="#d0e0f0" />        {/* Meeting 3 — soft blue */}
      <ZoneRug position={[-24, 0, 10]} size={[8, 16]} color="#f0e0d0" />      {/* Café — warm terracotta */}
      <ZoneRug position={[0, 0, -18]} size={[20, 12]} color="#d8e8d0" />      {/* Stage — light green */}
      <ZoneRug position={[-21, 0, -18]} size={[14, 12]} color="#e8dac0" />    {/* Library — parchment */}
      <ZoneRug position={[21, 0, -18]} size={[14, 12]} color="#d0e8f0" />     {/* Gaming — cool cyan */}
      <ZoneRug position={[0, 0, -27.5]} size={[56, 3]} color="#c8d8b8" />     {/* Rooftop — moss green */}

      {/* ── OUTER WALLS ───────────────────────────── */}
      {[
        [0, 1.5, 29.5, 60, 3, 0.2],
        [0, 1.5, -29.5, 60, 3, 0.2],
        [-29.5, 1.5, 0, 0.2, 3, 60],
        [29.5, 1.5, 0, 0.2, 3, 60],
      ].map((w, i) => (
        <mesh key={`wall-${i}`} position={[w[0] as number, w[1] as number, w[2] as number]}>
          <boxGeometry args={[w[3] as number, w[4] as number, w[5] as number]} />
          <meshStandardMaterial color={P.wall} roughness={0.7} metalness={0.2} />
        </mesh>
      ))}

      {/* ── ZONE LABELS ───────────────────────────── */}
      {ZONES.map(z => (
        <ZoneLabel key={z.name} position={[(z.bounds.minX + z.bounds.maxX) / 2, 3.2, (z.bounds.minZ + z.bounds.maxZ) / 2]} text={z.name} emoji={z.emoji} />
      ))}

      {/* ── LOBBY ─────────────────────────────────── */}
      <ReceptionDesk position={[0, 0, 22.5]} />
      <Sofa position={[-10, 0, 24]} />
      <Sofa position={[10, 0, 24]} />
      <Plant position={[-14, 0, 22]} />
      <Plant position={[14, 0, 22]} />
      <Plant position={[-20, 0, 26]} />
      <Plant position={[20, 0, 26]} />
      <NeonSign position={[0, 2.8, 29]} text="🏢 HUDDLY OFFICE" color={P.greenLight} />

      {/* ── WORKSPACE (desk pods) ─────────────────── */}
      {/* Pod 1 */}
      <Desk position={[-14, 0, 5]} />
      <Desk position={[-10, 0, 5]} />
      <Chair position={[-14, 0, 4.2]} rotation={[0, Math.PI, 0]} />
      <Chair position={[-10, 0, 4.2]} rotation={[0, Math.PI, 0]} />
      {/* Pod 2 */}
      <Desk position={[-2, 0, 5]} />
      <Desk position={[2, 0, 5]} />
      <Chair position={[-2, 0, 4.2]} rotation={[0, Math.PI, 0]} />
      <Chair position={[2, 0, 4.2]} rotation={[0, Math.PI, 0]} />
      {/* Pod 3 */}
      <Desk position={[10, 0, 5]} />
      <Desk position={[14, 0, 5]} />
      <Chair position={[10, 0, 4.2]} rotation={[0, Math.PI, 0]} />
      <Chair position={[14, 0, 4.2]} rotation={[0, Math.PI, 0]} />
      {/* Pod 4 */}
      <Desk position={[-14, 0, 11]} />
      <Desk position={[-10, 0, 11]} />
      <Chair position={[-14, 0, 10.2]} rotation={[0, Math.PI, 0]} />
      <Chair position={[-10, 0, 10.2]} rotation={[0, Math.PI, 0]} />
      {/* Pod 5 */}
      <Desk position={[-2, 0, 11]} />
      <Desk position={[2, 0, 11]} />
      <Chair position={[-2, 0, 10.2]} rotation={[0, Math.PI, 0]} />
      <Chair position={[2, 0, 10.2]} rotation={[0, Math.PI, 0]} />
      {/* Pod 6 */}
      <Desk position={[10, 0, 11]} />
      <Desk position={[14, 0, 11]} />
      <Chair position={[10, 0, 10.2]} rotation={[0, Math.PI, 0]} />
      <Chair position={[14, 0, 10.2]} rotation={[0, Math.PI, 0]} />
      {/* Standing desks + utilities */}
      <StandingDesk position={[-6, 0, 16]} />
      <StandingDesk position={[6, 0, 16]} />
      <WaterCooler position={[18, 0, 10]} />
      <ScrumBoard position={[19, 0, 6]} rotation={[0, -Math.PI / 2, 0]} />

      {/* ── MEETING ROOM 1 (west) ─────────────────── */}
      <GlassPartition position={[-24, 1.5, 0]} size={[8, 3, 0.1]} />
      <GlassPartition position={[-20, 1.5, -4]} size={[0.1, 3, 8]} />
      <MeetingTable position={[-24, 0, -4]} />
      <Chair position={[-26, 0, -4]} rotation={[0, Math.PI / 2, 0]} color="#3B82F6" />
      <Chair position={[-22, 0, -4]} rotation={[0, -Math.PI / 2, 0]} color="#3B82F6" />
      <Chair position={[-24, 0, -6]} rotation={[0, 0, 0]} color="#3B82F6" />
      <Chair position={[-24, 0, -2]} rotation={[0, Math.PI, 0]} color="#3B82F6" />
      <BroadcastScreen position={[-27.5, 1.5, -4]} rotation={[0, Math.PI / 2, 0]} size={[2, 1.3]} />

      {/* ── MEETING ROOM 2 (center, large) ────────── */}
      <GlassPartition position={[-10, 1.5, -6]} size={[0.1, 3, 8]} />
      <GlassPartition position={[10, 1.5, -6]} size={[0.1, 3, 8]} />
      <GlassPartition position={[0, 1.5, -10]} size={[20, 3, 0.1]} />
      <MeetingTable position={[0, 0, -6]} size="large" />
      {[-3, -1, 1, 3].map(x => <Chair key={`mc-n-${x}`} position={[x, 0, -8]} rotation={[0, 0, 0]} color="#3B82F6" />)}
      {[-3, -1, 1, 3].map(x => <Chair key={`mc-s-${x}`} position={[x, 0, -4]} rotation={[0, Math.PI, 0]} color="#3B82F6" />)}
      <BroadcastScreen position={[0, 1.8, -9.5]} size={[5, 2.5]} />

      {/* ── MEETING ROOM 3 (east) ─────────────────── */}
      <GlassPartition position={[24, 1.5, 0]} size={[8, 3, 0.1]} />
      <GlassPartition position={[20, 1.5, -4]} size={[0.1, 3, 8]} />
      <MeetingTable position={[24, 0, -4]} />
      <Chair position={[22, 0, -4]} rotation={[0, Math.PI / 2, 0]} color="#3B82F6" />
      <Chair position={[26, 0, -4]} rotation={[0, -Math.PI / 2, 0]} color="#3B82F6" />
      <Chair position={[24, 0, -6]} rotation={[0, 0, 0]} color="#3B82F6" />
      <Chair position={[24, 0, -2]} rotation={[0, Math.PI, 0]} color="#3B82F6" />
      <BroadcastScreen position={[27.5, 1.5, -4]} rotation={[0, -Math.PI / 2, 0]} size={[2, 1.3]} />

      {/* ── CAFÉ / BREAK AREA ─────────────────────── */}
      {/* Counter */}
      <RoundedBox args={[5, 1.1, 0.8]} position={[-24.5, 0.55, 10]} radius={0.04} smoothness={4} castShadow>
        <meshStandardMaterial color={P.desk} roughness={0.4} metalness={0.3} />
      </RoundedBox>
      <CoffeeMachine position={[-26, 1.12, 10]} />
      {/* Bistro tables */}
      {[[-24, 6], [-24, 14], [-22, 10]].map(([x, z], i) => (
        <group key={`bistro-${i}`}>
          <mesh position={[x, 0.6, z]}><cylinderGeometry args={[0.4, 0.4, 0.04, 16]} /><meshStandardMaterial color={P.deskTop} /></mesh>
          <mesh position={[x, 0.3, z]}><cylinderGeometry args={[0.05, 0.05, 0.6, 8]} /><meshStandardMaterial color="#333" metalness={0.8} /></mesh>
        </group>
      ))}
      <JukeBox position={[-27, 0, 4]} />
      <PendantLight position={[-24, 3, 6]} />
      <PendantLight position={[-24, 3, 10]} />
      <PendantLight position={[-24, 3, 14]} />
      <NeonSign position={[-24, 2.7, 17.5]} text="☕ CAFÉ" color={P.warmLight} />

      {/* ── MAIN STAGE ────────────────────────────── */}
      {/* Elevated platform */}
      <mesh position={[0, 0.15, -18]} receiveShadow>
        <boxGeometry args={[12, 0.3, 4]} />
        <meshStandardMaterial color="#222" roughness={0.6} metalness={0.3} />
      </mesh>
      {/* Podium */}
      <RoundedBox args={[0.8, 1.2, 0.5]} position={[0, 0.9, -18]} radius={0.04} smoothness={4}>
        <meshStandardMaterial color={P.desk} roughness={0.5} />
      </RoundedBox>
      <BroadcastScreen position={[0, 2.5, -22]} size={[8, 4]} />
      {/* Audience seating rows */}
      {[-4, -2, 0, 2, 4].map(x => [-14, -15, -16].map(z => (
        <Chair key={`seat-${x}-${z}`} position={[x, 0, z]} rotation={[0, Math.PI, 0]} color="#444" />
      )))}
      <NeonSign position={[0, 2.8, -12.5]} text="🎤 MAIN STAGE" color={P.greenLight} />

      {/* ── LIBRARY / QUIET ZONE ──────────────────── */}
      <Bookshelf position={[-26, 0, -14]} />
      <Bookshelf position={[-24, 0, -14]} />
      <Bookshelf position={[-22, 0, -14]} />
      <Bookshelf position={[-26, 0, -18]} />
      <Bookshelf position={[-24, 0, -18]} />
      <Bookshelf position={[-22, 0, -18]} />
      <Sofa position={[-20, 0, -22]} rotation={[0, Math.PI / 2, 0]} color="#8B6914" />
      <Sofa position={[-18, 0, -16]} color="#8B6914" />
      <Plant position={[-16, 0, -14]} />
      <Plant position={[-26, 0, -22]} />
      <NeonSign position={[-21, 2.7, -12.5]} text="📖 QUIET ZONE" color="#E9C46A" />

      {/* ── GAMING CORNER ─────────────────────────── */}
      <Desk position={[18, 0, -16]} />
      <Desk position={[22, 0, -16]} />
      <Desk position={[26, 0, -16]} />
      <Desk position={[18, 0, -20]} />
      <Desk position={[22, 0, -20]} />
      <Chair position={[18, 0, -14.8]} rotation={[0, Math.PI, 0]} color="#06b6d4" />
      <Chair position={[22, 0, -14.8]} rotation={[0, Math.PI, 0]} color="#06b6d4" />
      <Chair position={[26, 0, -14.8]} rotation={[0, Math.PI, 0]} color="#06b6d4" />
      <Chair position={[18, 0, -18.8]} rotation={[0, Math.PI, 0]} color="#06b6d4" />
      <Chair position={[22, 0, -18.8]} rotation={[0, Math.PI, 0]} color="#06b6d4" />
      <ArcadeCabinet position={[26, 0, -22]} />
      <NeonSign position={[21, 2.7, -12.5]} text="🎮 GAME ON" color="#06b6d4" />

      {/* ── ROOFTOP TERRACE (south edge, elevated) ── */}
      <mesh position={[0, 0.4, -27.5]} receiveShadow>
        <boxGeometry args={[56, 0.8, 3]} />
        <meshStandardMaterial color="#3d2b1f" roughness={0.8} />
      </mesh>
      {/* Pergola columns */}
      {[-20, -10, 0, 10, 20].map(x => (
        <mesh key={`pergola-${x}`} position={[x, 2, -27.5]}>
          <cylinderGeometry args={[0.08, 0.08, 3.2, 8]} />
          <meshStandardMaterial color="#5C3A1E" roughness={0.7} />
        </mesh>
      ))}
      {/* Benches */}
      {[-15, -5, 5, 15].map(x => (
        <RoundedBox key={`bench-${x}`} args={[2, 0.3, 0.5]} position={[x, 1, -27.5]} radius={0.04} smoothness={4}>
          <meshStandardMaterial color="#5C3A1E" roughness={0.6} />
        </RoundedBox>
      ))}
      <Plant position={[-24, 0.8, -27]} />
      <Plant position={[24, 0.8, -27]} />

      {/* ── PLANTS THROUGHOUT ─────────────────────── */}
      {[[-6, 0, 18], [6, 0, 18], [-18, 0, 2], [18, 0, 2], [-12, 0, -8], [12, 0, -8],
      [-8, 0, 14], [8, 0, 14], [-4, 0, 2], [4, 0, 2], [-16, 0, -16], [16, 0, -14]].map((p, i) => (
        <Plant key={`plant-${i}`} position={p as [number, number, number]} />
      ))}

      {/* ── FLOOR LAMPS ──────────────────────────── */}
      <FloorLamp position={[-27, 0, 6]} lightColor="#fff5e0" />
      <FloorLamp position={[-27, 0, 14]} lightColor="#fff5e0" />
      <FloorLamp position={[-16, 0, -22]} lightColor="#ffe8c0" />
      <FloorLamp position={[16, 0, -22]} lightColor="#c0f0ff" />
      <FloorLamp position={[-18, 0, 8]} lightColor="#fff" />
      <FloorLamp position={[18, 0, 8]} lightColor="#fff" />

      {/* ── CEILING LIGHTS ───────────────────────── */}
      <CeilingLight position={[-12, 4, 8]} />
      <CeilingLight position={[0, 4, 8]} />
      <CeilingLight position={[12, 4, 8]} />
      <CeilingLight position={[-12, 4, 14]} />
      <CeilingLight position={[0, 4, 14]} />
      <CeilingLight position={[12, 4, 14]} />
      <CeilingLight position={[0, 4, -6]} />
      <CeilingLight position={[-24, 4, 10]} />

      {/* ── WHITEBOARDS ──────────────────────────── */}
      <Whiteboard position={[0, 1.5, 1.5]} />
      <Whiteboard position={[-24, 1.5, -7.5]} rotation={[0, 0, 0]} />

      {/* ── WALL CLOCKS ──────────────────────────── */}
      <WallClock position={[0, 2.5, 29.3]} />
      <WallClock position={[-29.3, 2.5, 0]} rotation={[0, Math.PI / 2, 0]} />

      {/* ── WALL POSTERS ─────────────────────────── */}
      <WallPoster position={[-29.3, 1.8, 6]} rotation={[0, Math.PI / 2, 0]} color="#e74c3c" text="THINK BIG" />
      <WallPoster position={[-29.3, 1.8, 14]} rotation={[0, Math.PI / 2, 0]} color="#3498db" text="STAY CURIOUS" />
      <WallPoster position={[29.3, 1.8, -16]} rotation={[0, -Math.PI / 2, 0]} color="#9b59b6" text="GAME ON!" />
      <WallPoster position={[29.3, 1.8, -20]} rotation={[0, -Math.PI / 2, 0]} color="#1abc9c" text="LEVEL UP" />
      <WallPoster position={[-29.3, 1.8, -16]} rotation={[0, Math.PI / 2, 0]} color="#f39c12" text="READ MORE" />
      <WallPoster position={[0, 1.8, 29.3]} color="#2ecc71" text="WELCOME" />

      {/* ── EXTRA INTERACTIVE OBJECTS ──────────── */}
      <PingPongTable position={[24, 0, -20]} />
      <VendingMachine position={[-28, 0, 2]} rotation={[0, Math.PI / 2, 0]} />
      <VendingMachine position={[28, 0, 10]} rotation={[0, -Math.PI / 2, 0]} />
      <Printer position={[-6, 0.8, 16]} />
      <Printer position={[6, 0.8, 16]} />
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SCENE LIGHTING
   ═══════════════════════════════════════════════════════════════ */
function SceneLighting() {
  return (
    <>
      <ambientLight intensity={1.2} color="#fffbf0" />
      <directionalLight castShadow position={[20, 30, 15]} intensity={1.5} color="#fff8ee" shadow-mapSize={[2048, 2048]} shadow-camera-far={80} shadow-camera-left={-35} shadow-camera-right={35} shadow-camera-top={35} shadow-camera-bottom={-35} />
      <directionalLight position={[-15, 25, -10]} intensity={0.6} color="#e8f0ff" />
      <pointLight position={[0, 8, 24]} intensity={0.6} color="#fff" distance={30} />
      <pointLight position={[0, 8, 0]} intensity={0.5} color="#fff" distance={35} />
      <pointLight position={[-24, 6, 10]} intensity={0.5} color={P.warmLight} distance={18} />
      <pointLight position={[0, 7, -18]} intensity={0.5} color="#fff" distance={20} />
      <pointLight position={[24, 6, -4]} intensity={0.4} color="#fff" distance={18} />
      <hemisphereLight args={["#87CEEB", "#d4cfc4", 0.6]} />
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CAFE & PARTY LAYOUTS
   ═══════════════════════════════════════════════════════════════ */
function CafeLayout() {
  return (
    <group>
      <RoundedBox args={[12, 3, 0.2]} position={[0, 1.5, -6]} radius={0.05}>
        <meshStandardMaterial color={P.wall} />
      </RoundedBox>
      <RoundedBox args={[12, 3, 0.2]} position={[0, 1.5, 6]} radius={0.05}>
        <meshStandardMaterial color={P.wall} />
      </RoundedBox>
      <RoundedBox args={[0.2, 3, 12]} position={[-6, 1.5, 0]} radius={0.05}>
        <meshStandardMaterial color={P.wall} />
      </RoundedBox>
      <RoundedBox args={[0.2, 3, 12]} position={[6, 1.5, 0]} radius={0.05}>
        <meshStandardMaterial color={P.wall} />
      </RoundedBox>

      {/* Counter */}
      <RoundedBox args={[6, 1.2, 1.5]} position={[0, 0.6, -4]} radius={0.05}>
        <meshStandardMaterial color="#8B4513" />
      </RoundedBox>
      <CoffeeMachine position={[-1.5, 1.2, -4]} />
      <WaterCooler position={[2, 0, -4]} />

      {/* Tables */}
      {[-3, 3].map(x => (
        <group key={`table-${x}`} position={[x, 0, 0]}>
          <cylinderGeometry args={[0.8, 0.8, 0.05, 16]} />
          <mesh position={[0, 0.8, 0]}><cylinderGeometry args={[0.8, 0.8, 0.05, 16]} /><meshStandardMaterial color="#D4A373" /></mesh>
          <mesh position={[0, 0.4, 0]}><cylinderGeometry args={[0.05, 0.05, 0.8, 8]} /><meshStandardMaterial color="#333" /></mesh>
          <Chair position={[-1.2, 0, 0]} rotation={[0, Math.PI / 2, 0]} color="#E9C46A" />
          <Chair position={[1.2, 0, 0]} rotation={[0, -Math.PI / 2, 0]} color="#E9C46A" />
        </group>
      ))}

      <NeonSign position={[0, 2.5, -5.8]} text="☕ HUDDLY CAFE" color="#ff9f43" />
      <Plant position={[-5, 0, -5]} />
      <Plant position={[5, 0, -5]} />
      <Plant position={[-5, 0, 5]} />
    </group>
  );
}

function PartyLayout() {
  return (
    <group>
      {/* Darker floors & walls for party */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#111" />
      </mesh>

      {/* Dance floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial color="#222" emissive="#06b6d4" emissiveIntensity={0.2} wireframe />
      </mesh>

      <JukeBox position={[0, 0, -4]} />
      <ArcadeCabinet position={[-3, 0, -4]} />
      <ArcadeCabinet position={[3, 0, -4]} />

      {/* Glow lights */}
      <pointLight position={[0, 3, 0]} color="#a855f7" intensity={2} distance={10} />
      <pointLight position={[-4, 3, 4]} color="#06b6d4" intensity={2} distance={10} />
      <pointLight position={[4, 3, 4]} color="#ec4899" intensity={2} distance={10} />

      <NeonSign position={[0, 2.5, -4.5]} text="🎉 PARTY TIME" color="#ec4899" />
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CLASSROOM LAYOUT
   ═══════════════════════════════════════════════════════════════ */
function ClassroomLayout() {
  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 30]} />
        <meshStandardMaterial color="#f0ebe3" roughness={0.9} />
      </mesh>
      <gridHelper args={[40, 40, "#bbb", "#ccc"]} position={[0, 0.01, 0]} material-opacity={0.1} material-transparent />

      {/* Walls */}
      {[
        [0, 1.5, 14.5, 40, 3, 0.2],
        [0, 1.5, -14.5, 40, 3, 0.2],
        [-19.5, 1.5, 0, 0.2, 3, 30],
        [19.5, 1.5, 0, 0.2, 3, 30],
      ].map((w, i) => (
        <mesh key={`wall-${i}`} position={[w[0] as number, w[1] as number, w[2] as number]}>
          <boxGeometry args={[w[3] as number, w[4] as number, w[5] as number]} />
          <meshStandardMaterial color={P.wall} roughness={0.7} />
        </mesh>
      ))}

      {/* Teacher's podium */}
      <RoundedBox args={[2, 0.4, 1]} position={[0, 0.2, -12]} radius={0.04} smoothness={4}>
        <meshStandardMaterial color="#5C3A1E" roughness={0.6} />
      </RoundedBox>

      {/* Big screen at the front */}
      <BroadcastScreen position={[0, 2, -14]} size={[6, 3]} />

      {/* Student desks in rows */}
      {[-3, 0, 3, 6, 9].map(z =>
        [-12, -6, 0, 6, 12].map(x => (
          <group key={`desk-${x}-${z}`}>
            <Desk position={[x, 0, z]} />
            <Chair position={[x, 0, z + 1.2]} rotation={[0, Math.PI, 0]} />
          </group>
        ))
      )}

      {/* Whiteboard */}
      <Whiteboard position={[-8, 1.5, -14]} />

      {/* Plants */}
      <Plant position={[-18, 0, 13]} />
      <Plant position={[18, 0, 13]} />
      <Plant position={[-18, 0, -13]} />
      <Plant position={[18, 0, -13]} />

      {/* Ceiling lights */}
      <CeilingLight position={[-8, 4, 0]} />
      <CeilingLight position={[0, 4, 0]} />
      <CeilingLight position={[8, 4, 0]} />
      <CeilingLight position={[-8, 4, 8]} />
      <CeilingLight position={[0, 4, 8]} />
      <CeilingLight position={[8, 4, 8]} />

      <Bookshelf position={[-18, 0, 0]} />
      <Bookshelf position={[-18, 0, -4]} />
      <WallClock position={[0, 2.5, 14.3]} />
      <NeonSign position={[0, 2.8, 14]} text="📚 CLASSROOM" color="#3B82F6" />
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CONFERENCE LAYOUT
   ═══════════════════════════════════════════════════════════════ */
function ConferenceLayout() {
  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[50, 40]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.8} />
      </mesh>

      {/* Walls */}
      {[
        [0, 2, 19.5, 50, 4, 0.2],
        [0, 2, -19.5, 50, 4, 0.2],
        [-24.5, 2, 0, 0.2, 4, 40],
        [24.5, 2, 0, 0.2, 4, 40],
      ].map((w, i) => (
        <mesh key={`wall-${i}`} position={[w[0] as number, w[1] as number, w[2] as number]}>
          <boxGeometry args={[w[3] as number, w[4] as number, w[5] as number]} />
          <meshStandardMaterial color="#16213e" roughness={0.7} />
        </mesh>
      ))}

      {/* Stage platform */}
      <mesh position={[0, 0.25, -16]} receiveShadow>
        <boxGeometry args={[20, 0.5, 6]} />
        <meshStandardMaterial color="#0f3460" roughness={0.5} metalness={0.3} />
      </mesh>

      {/* Big screen */}
      <BroadcastScreen position={[0, 3, -18.5]} size={[12, 5]} />

      {/* Side screens */}
      <BroadcastScreen position={[-20, 2.5, -16]} rotation={[0, Math.PI / 4, 0]} size={[4, 2.5]} />
      <BroadcastScreen position={[20, 2.5, -16]} rotation={[0, -Math.PI / 4, 0]} size={[4, 2.5]} />

      {/* Podium */}
      <RoundedBox args={[1.2, 1.3, 0.6]} position={[0, 0.9, -14]} radius={0.05} smoothness={4}>
        <meshStandardMaterial color="#e94560" roughness={0.4} metalness={0.2} />
      </RoundedBox>

      {/* Tiered seating */}
      {[0, 3, 6, 9, 12].map((z, row) => {
        const seatsPerRow = 7 + row;
        const spacing = 3;
        const startX = -((seatsPerRow - 1) * spacing) / 2;
        return Array.from({ length: seatsPerRow }, (_, i) => (
          <group key={`seat-${row}-${i}`}>
            <Chair position={[startX + i * spacing, row * 0.15, z - 8]} rotation={[0, Math.PI, 0]} color="#333" />
          </group>
        ));
      })}

      {/* Stage spotlights */}
      <pointLight position={[-5, 5, -16]} color="#e94560" intensity={1.5} distance={15} />
      <pointLight position={[5, 5, -16]} color="#0f3460" intensity={1.5} distance={15} />
      <pointLight position={[0, 6, -14]} color="#fff" intensity={1} distance={20} />
      <pointLight position={[0, 5, 0]} color="#1a1a3e" intensity={0.3} distance={30} />

      <Plant position={[-22, 0, 18]} />
      <Plant position={[22, 0, 18]} />

      <NeonSign position={[0, 3.5, -12]} text="🎤 CONFERENCE" color="#e94560" />
      <NeonSign position={[-20, 2.5, 19]} text="HUDDLY TALKS" color="#0f3460" />
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ADDITIONAL 3D OBJECTS
   ═══════════════════════════════════════════════════════════════ */
function PingPongTable({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.76, 0]} castShadow>
        <boxGeometry args={[2.74, 0.04, 1.52]} />
        <meshStandardMaterial color="#1a6b3c" roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.86, 0]}>
        <boxGeometry args={[0.02, 0.15, 1.52]} />
        <meshStandardMaterial color="#ddd" transparent opacity={0.7} />
      </mesh>
      {[[-1.2, 0.38, -0.65], [-1.2, 0.38, 0.65], [1.2, 0.38, -0.65], [1.2, 0.38, 0.65]].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]}>
          <cylinderGeometry args={[0.04, 0.04, 0.76, 8]} />
          <meshStandardMaterial color="#333" metalness={0.6} />
        </mesh>
      ))}
    </group>
  );
}

function VendingMachine({ position, rotation = [0, 0, 0] as [number, number, number] }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  return (
    <group position={position} rotation={rotation}>
      <RoundedBox args={[0.9, 1.8, 0.7]} position={[0, 0.9, 0]} radius={0.04} smoothness={4}>
        <meshStandardMaterial color="#1e3a5f" roughness={0.4} metalness={0.3} />
      </RoundedBox>
      <mesh position={[0, 1.1, 0.36]}>
        <planeGeometry args={[0.7, 1.0]} />
        <meshStandardMaterial color="#87CEEB" transparent opacity={0.3} metalness={0.8} roughness={0.1} />
      </mesh>
      {[0.8, 1.1, 1.4].map((y, i) => (
        <mesh key={i} position={[0, y, 0.2]}>
          <boxGeometry args={[0.65, 0.02, 0.3]} />
          <meshStandardMaterial color="#ccc" metalness={0.5} />
        </mesh>
      ))}
      <Text position={[0, 1.7, 0.36]} fontSize={0.08} color="#fff" anchorX="center">DRINKS</Text>
    </group>
  );
}

function Printer({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <RoundedBox args={[0.5, 0.3, 0.4]} position={[0, 0.15, 0]} radius={0.02} smoothness={4}>
        <meshStandardMaterial color="#333" roughness={0.5} />
      </RoundedBox>
      <mesh position={[0, 0.02, 0.15]}>
        <boxGeometry args={[0.35, 0.04, 0.1]} />
        <meshStandardMaterial color="#fff" roughness={0.8} />
      </mesh>
      <mesh position={[0.2, 0.28, 0.2]}>
        <sphereGeometry args={[0.015, 8, 8]} />
        <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.8} />
      </mesh>
    </group>
  );
}
/* ═══════════════════════════════════════════════════════════════
   LIBRARY LAYOUT
   ═══════════════════════════════════════════════════════════════ */
function LibraryLayout() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 30]} />
        <meshStandardMaterial color="#3e2723" roughness={0.9} />
      </mesh>

      {/* Walls */}
      {[
        [0, 2, 14.5, 40, 4, 0.2],
        [0, 2, -14.5, 40, 4, 0.2],
        [-19.5, 2, 0, 0.2, 4, 30],
        [19.5, 2, 0, 0.2, 4, 30],
      ].map((w, i) => (
        <mesh key={`wall-${i}`} position={[w[0] as number, w[1] as number, w[2] as number]}>
          <boxGeometry args={[w[3] as number, w[4] as number, w[5] as number]} />
          <meshStandardMaterial color="#5D4037" roughness={0.8} />
        </mesh>
      ))}

      {/* Tall bookshelves along walls */}
      {[-16, -12, -8, 8, 12, 16].map(x => (
        <Bookshelf key={`bs-${x}`} position={[x, 0, -13.5]} />
      ))}
      {[-10, -6, -2, 2, 6, 10].map(z => (
        <Bookshelf key={`bsw-${z}`} position={[-18.5, 0, z]} />
      ))}

      {/* Reading tables */}
      {[-8, 0, 8].map(x => (
        <group key={`rtable-${x}`}>
          <Desk position={[x, 0, -4]} />
          <Chair position={[x - 1, 0, -3]} rotation={[0, Math.PI, 0]} />
          <Chair position={[x + 1, 0, -3]} rotation={[0, Math.PI, 0]} />
          <FloorLamp position={[x + 2, 0, -4]} lightColor="#fff5e0" />
        </group>
      ))}

      {/* Study nooks */}
      {[-12, -4, 4, 12].map(x => (
        <group key={`nook-${x}`}>
          <Desk position={[x, 0, 6]} />
          <Chair position={[x, 0, 7.2]} rotation={[0, Math.PI, 0]} />
        </group>
      ))}

      {/* Sofa reading area */}
      <RoundedBox args={[4, 0.5, 1.5]} position={[0, 0.25, 10]} radius={0.1} smoothness={4}>
        <meshStandardMaterial color="#8D6E63" roughness={0.7} />
      </RoundedBox>

      {/* Warm lighting */}
      <pointLight position={[0, 4, 0]} color="#FFD700" intensity={0.5} distance={20} />
      <pointLight position={[-12, 4, -4]} color="#fff5e0" intensity={0.3} distance={12} />
      <pointLight position={[12, 4, -4]} color="#fff5e0" intensity={0.3} distance={12} />

      <Plant position={[-18, 0, 13]} />
      <Plant position={[18, 0, 13]} />
      <Plant position={[0, 0, 13]} />
      <WallClock position={[0, 3, 14.3]} />
      <NeonSign position={[0, 3, 14]} text="📖 QUIET LIBRARY" color="#FFD700" />
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════
   GAMING LAYOUT
   ═══════════════════════════════════════════════════════════════ */
function GamingLayout() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 30]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.8} />
      </mesh>

      {/* Walls */}
      {[
        [0, 2, 14.5, 40, 4, 0.2],
        [0, 2, -14.5, 40, 4, 0.2],
        [-19.5, 2, 0, 0.2, 4, 30],
        [19.5, 2, 0, 0.2, 4, 30],
      ].map((w, i) => (
        <mesh key={`wall-${i}`} position={[w[0] as number, w[1] as number, w[2] as number]}>
          <boxGeometry args={[w[3] as number, w[4] as number, w[5] as number]} />
          <meshStandardMaterial color="#1a1a2e" roughness={0.7} />
        </mesh>
      ))}

      {/* Arcade row */}
      {[-12, -8, -4, 0, 4, 8, 12].map(x => (
        <ArcadeCabinet key={`arc-${x}`} position={[x, 0, -12]} />
      ))}

      {/* Ping pong tables */}
      <PingPongTable position={[-10, 0, 2]} />
      <PingPongTable position={[10, 0, 2]} />

      {/* Gaming PCs */}
      {[-14, -10, -6, 6, 10, 14].map(x => (
        <group key={`pc-${x}`}>
          <Desk position={[x, 0, 8]} />
          <Chair position={[x, 0, 9.2]} rotation={[0, Math.PI, 0]} />
          <BroadcastScreen position={[x, 1.5, 7.5]} size={[1.5, 0.9]} />
        </group>
      ))}

      {/* Jukebox & vending */}
      <JukeBox position={[-17, 0, -4]} />
      <VendingMachine position={[17, 0, -4]} />

      {/* Neon lighting */}
      <pointLight position={[0, 4, 0]} color="#a855f7" intensity={1.5} distance={20} />
      <pointLight position={[-14, 3, -12]} color="#06b6d4" intensity={1} distance={12} />
      <pointLight position={[14, 3, -12]} color="#ec4899" intensity={1} distance={12} />
      <pointLight position={[0, 3, 8]} color="#22c55e" intensity={0.8} distance={15} />

      <NeonSign position={[0, 3, -14]} text="🎮 GAMING LOUNGE" color="#a855f7" />
      <NeonSign position={[-18, 2, 0]} text="PLAY" color="#06b6d4" />
      <NeonSign position={[18, 2, 0]} text="WIN" color="#ec4899" />
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ROOFTOP LAYOUT
   ═══════════════════════════════════════════════════════════════ */
function RooftopLayout() {
  return (
    <group>
      {/* Rooftop floor (concrete) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 30]} />
        <meshStandardMaterial color="#4a4a4a" roughness={0.9} />
      </mesh>

      {/* Low railings (no full walls — open sky) */}
      {[
        [0, 0.5, 14.5, 40, 1, 0.1],
        [0, 0.5, -14.5, 40, 1, 0.1],
        [-19.5, 0.5, 0, 0.1, 1, 30],
        [19.5, 0.5, 0, 0.1, 1, 30],
      ].map((w, i) => (
        <mesh key={`rail-${i}`} position={[w[0] as number, w[1] as number, w[2] as number]}>
          <boxGeometry args={[w[3] as number, w[4] as number, w[5] as number]} />
          <meshStandardMaterial color="#666" metalness={0.6} roughness={0.3} />
        </mesh>
      ))}

      {/* Bar counter */}
      <RoundedBox args={[8, 1.2, 1]} position={[0, 0.6, -10]} radius={0.05} smoothness={4}>
        <meshStandardMaterial color="#2c1810" roughness={0.5} />
      </RoundedBox>
      <CoffeeMachine position={[-2, 1.2, -10]} />
      <CoffeeMachine position={[2, 1.2, -10]} />

      {/* Lounge seating (sofas) */}
      {[-12, -4, 4, 12].map(x => (
        <group key={`lounge-${x}`}>
          <RoundedBox args={[3, 0.5, 1.2]} position={[x, 0.25, 4]} radius={0.1} smoothness={4}>
            <meshStandardMaterial color="#4a2c2a" roughness={0.7} />
          </RoundedBox>
          <RoundedBox args={[1.5, 0.5, 1.2]} position={[x, 0.25, 8]} radius={0.1} smoothness={4}>
            <meshStandardMaterial color="#4a2c2a" roughness={0.7} />
          </RoundedBox>
        </group>
      ))}

      {/* String lights */}
      {[-15, -5, 5, 15].map(x => (
        <pointLight key={`sl-${x}`} position={[x, 3.5, 0]} color="#FFE4B5" intensity={0.4} distance={8} />
      ))}

      {/* City skyline backdrop (simplified tall boxes) */}
      {[-30, -24, -18, -12, -6, 0, 6, 12, 18, 24, 30].map((x, i) => {
        const h = 4 + Math.sin(i * 1.7) * 3;
        return (
          <mesh key={`building-${i}`} position={[x, h / 2, -20]}>
            <boxGeometry args={[4, h, 2]} />
            <meshStandardMaterial color={`hsl(220, 20%, ${15 + i * 3}%)`} />
          </mesh>
        );
      })}

      <Plant position={[-18, 0, 13]} />
      <Plant position={[18, 0, 13]} />
      <Plant position={[-18, 0, -13]} />
      <Plant position={[18, 0, -13]} />

      <NeonSign position={[0, 2, -12]} text="🌃 ROOFTOP BAR" color="#FFE4B5" />
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════
   THEATER LAYOUT
   ═══════════════════════════════════════════════════════════════ */
function TheaterLayout() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[50, 40]} />
        <meshStandardMaterial color="#1a0a0a" roughness={0.8} />
      </mesh>

      {/* Walls */}
      {[
        [0, 3, 19.5, 50, 6, 0.2],
        [0, 3, -19.5, 50, 6, 0.2],
        [-24.5, 3, 0, 0.2, 6, 40],
        [24.5, 3, 0, 0.2, 6, 40],
      ].map((w, i) => (
        <mesh key={`wall-${i}`} position={[w[0] as number, w[1] as number, w[2] as number]}>
          <boxGeometry args={[w[3] as number, w[4] as number, w[5] as number]} />
          <meshStandardMaterial color="#2d0a0a" roughness={0.8} />
        </mesh>
      ))}

      {/* Stage */}
      <mesh position={[0, 0.4, -15]} receiveShadow>
        <boxGeometry args={[18, 0.8, 8]} />
        <meshStandardMaterial color="#4a1a1a" roughness={0.6} />
      </mesh>

      {/* Curtains (side planes) */}
      {[-10, 10].map(x => (
        <mesh key={`curtain-${x}`} position={[x, 2, -15]}>
          <boxGeometry args={[0.3, 4, 8]} />
          <meshStandardMaterial color="#8B0000" roughness={0.9} />
        </mesh>
      ))}

      {/* Main screen */}
      <BroadcastScreen position={[0, 3.5, -18.5]} size={[14, 6]} />

      {/* Tiered seating */}
      {[0, 3, 6, 9, 12, 15].map((z, row) => {
        const seats = 8 + row;
        const spacing = 2.5;
        const startX = -((seats - 1) * spacing) / 2;
        return Array.from({ length: seats }, (_, i) => (
          <Chair key={`seat-${row}-${i}`} position={[startX + i * spacing, row * 0.2, z - 6]} rotation={[0, Math.PI, 0]} color="#4a1a1a" />
        ));
      })}

      {/* Stage spotlights */}
      <pointLight position={[-6, 6, -15]} color="#FFD700" intensity={2} distance={15} />
      <pointLight position={[6, 6, -15]} color="#FFD700" intensity={2} distance={15} />
      <pointLight position={[0, 8, -12]} color="#fff" intensity={1} distance={25} />

      {/* House lights (dim) */}
      <pointLight position={[0, 6, 5]} color="#331111" intensity={0.2} distance={30} />

      <NeonSign position={[0, 5, -10]} text="🎭 THEATER" color="#FFD700" />
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════
   BLANK / CUSTOM LAYOUT — renders user-placed objects
   ═══════════════════════════════════════════════════════════════ */
function BlankLayout({ customObjects = [] }: { customObjects?: { type: string; x: number; z: number; rotation: number }[] }) {
  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 30]} />
        <meshStandardMaterial color="#e8e8e8" roughness={0.9} />
      </mesh>
      <gridHelper args={[40, 40, "#ccc", "#ddd"]} position={[0, 0.01, 0]} material-opacity={0.3} material-transparent />

      {/* Walls */}
      {[
        [0, 1.5, 14.5, 40, 3, 0.2],
        [0, 1.5, -14.5, 40, 3, 0.2],
        [-19.5, 1.5, 0, 0.2, 3, 30],
        [19.5, 1.5, 0, 0.2, 3, 30],
      ].map((w, i) => (
        <mesh key={`wall-${i}`} position={[w[0] as number, w[1] as number, w[2] as number]}>
          <boxGeometry args={[w[3] as number, w[4] as number, w[5] as number]} />
          <meshStandardMaterial color="#f5f5f5" roughness={0.7} />
        </mesh>
      ))}

      {/* Render custom objects */}
      {customObjects.map((obj, i) => (
        <group key={`custom-${i}`} position={[obj.x, 0, obj.z]} rotation={[0, obj.rotation * (Math.PI / 180), 0]}>
          {obj.type === "desk" && <Desk position={[0, 0, 0]} />}
          {obj.type === "chair" && <Chair position={[0, 0, 0]} />}
          {obj.type === "plant" && <Plant position={[0, 0, 0]} />}
          {obj.type === "whiteboard" && <Whiteboard position={[0, 1.5, 0]} />}
          {obj.type === "broadcast_screen" && <BroadcastScreen position={[0, 2, 0]} />}
          {obj.type === "bookshelf" && <Bookshelf position={[0, 0, 0]} />}
          {obj.type === "coffee_machine" && <CoffeeMachine position={[0, 0, 0]} />}
          {obj.type === "vending_machine" && <VendingMachine position={[0, 0, 0]} />}
          {obj.type === "ping_pong" && <PingPongTable position={[0, 0, 0]} />}
          {obj.type === "printer" && <Printer position={[0, 0, 0]} />}
          {obj.type === "arcade" && <ArcadeCabinet position={[0, 0, 0]} />}
          {obj.type === "floor_lamp" && <FloorLamp position={[0, 0, 0]} />}
        </group>
      ))}

      <CeilingLight position={[-8, 4, 0]} />
      <CeilingLight position={[0, 4, 0]} />
      <CeilingLight position={[8, 4, 0]} />
      <NeonSign position={[0, 2.5, 14]} text="🎨 YOUR SPACE" color="#6366f1" />
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN SCENE
   ═══════════════════════════════════════════════════════════════ */
function Scene({ userName, onZoneChange, onNearChair, onNearInteractable, onInteract, template, fpsMode, onFpsModeChange, customObjects }: {
  userName: string;
  onZoneChange: (z: string) => void;
  onNearChair: (near: boolean) => void;
  onNearInteractable: (interactable: { type: string; prompt: string } | null) => void;
  onInteract: (type: string) => void;
  template: string;
  fpsMode: boolean;
  onFpsModeChange: (fps: boolean) => void;
  customObjects?: { type: string; x: number; z: number; rotation: number }[];
}) {
  const players = useRealtimeStore(s => s.players);
  const myId = useRealtimeStore(s => s.myId);

  const { pcTracks } = React.useContext(LiveKitTrackContext);

  return (
    <>
      <color attach="background" args={["#c5dae8"]} />
      <fog attach="fog" args={["#c5dae8", 45, 80]} />

      <SceneLighting />
      <Sky sunPosition={[100, 60, 80]} turbidity={2} rayleigh={0.8} mieCoefficient={0.005} mieDirectionalG={0.9} />
      <Sparkles count={40} scale={50} size={2} speed={0.1} color={P.accent} opacity={0.08} />

      {/* Render layout based on template */}
      {template === "cafe" ? <CafeLayout />
        : template === "party" ? <PartyLayout />
          : template === "classroom" ? <ClassroomLayout />
            : template === "conference" ? <ConferenceLayout />
              : template === "library" ? <LibraryLayout />
                : template === "gaming" ? <GamingLayout />
                  : template === "rooftop" ? <RooftopLayout />
                    : template === "theater" ? <TheaterLayout />
                      : template === "blank" || template === "custom" ? <BlankLayout customObjects={customObjects} />
                        : <OfficeWorldLayout />}

      {/* Render live players */}
      {Array.from(players.values()).map(p => {
        if (p.id === myId) return null;
        const pCamTrack = pcTracks.find((t: any) => t.participant.name === p.name && t.source === Track.Source.Camera);
        const pMicTrack = pcTracks.find((t: any) => t.participant.name === p.name && t.source === Track.Source.Microphone);
        return (
          <group key={p.id} position={[p.x, p.y, p.z]}>
            <Avatar color={p.color} name={p.name} cameraTrack={pCamTrack} audioTrack={pMicTrack} />
          </group>
        );
      })}

      <PlayerController
        userName={userName}
        onZoneChange={onZoneChange}
        onNearChair={onNearChair}
        onNearInteractable={onNearInteractable}
        onInteract={onInteract}
        fpsMode={fpsMode}
        onFpsModeChange={onFpsModeChange}
        template={template}
      />
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   EXPORTED COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export const LiveKitTrackContext = React.createContext<{ pcTracks: any[], activeScreenTrack: any | null }>({ pcTracks: [], activeScreenTrack: null });

export default function ThreeRoom({ roomId, userName = "You", template = "office", customObjects }: ThreeRoomProps) {
  const [currentZone, setCurrentZone] = useState("Lobby");
  const [nearChair, setNearChair] = useState(false);
  const [nearInteractable, setNearInteractable] = useState<{ type: string; prompt: string } | null>(null);
  const [fpsMode, setFpsMode] = useState(false);
  const [entered, setEntered] = useState(false);
  const connect = useRealtimeStore(s => s.connect);
  const disconnect = useRealtimeStore(s => s.disconnect);

  const pcTracks = useTracks([
    { source: Track.Source.Camera, withPlaceholder: false },
    { source: Track.Source.Microphone, withPlaceholder: false }
  ], { onlySubscribed: true });

  const screenTracks = useTracks([
    { source: Track.Source.ScreenShare, withPlaceholder: false }
  ], { onlySubscribed: false });
  const activeScreenTrack = screenTracks.find(t => t.source === Track.Source.ScreenShare) || null;

  useEffect(() => {
    connect(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001", userName, roomId);
    return () => disconnect();
  }, [roomId, userName, connect, disconnect]);

  // Tab key toggles between FPS mode and UI mode
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Tab" && entered) {
        e.preventDefault();
        setFpsMode(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [entered]);

  const handleEnter = () => {
    setEntered(true);
    setFpsMode(true);
  };

  // Stable callback for PlayerController to sync pointer lock state
  const handleFpsModeChange = useCallback((fps: boolean) => {
    setFpsMode(fps);
  }, []);

  const handleInteract = (type: string) => {
    // When interacting with objects, switch to UI mode so user can use the panel
    setFpsMode(false);
    // Dispatch custom event so the room page can open the correct panel
    window.dispatchEvent(new CustomEvent("huddly:interact", { detail: { type } }));
  };

  return (
    <div className="w-full h-full relative three-canvas">
      {!entered && (
        <div className="absolute inset-0 z-30 bg-black/40 backdrop-blur-sm flex items-center justify-center cursor-pointer" onClick={handleEnter}>
          <div className="bg-white px-6 py-4 rounded-2xl shadow-2xl flex flex-col items-center">
            <span className="text-4xl mb-3">🖱️</span>
            <span className="text-xl font-bold text-gray-900">Click to Enter</span>
            <span className="text-sm text-gray-500 mt-1">First-Person Meeting Experience</span>
          </div>
        </div>
      )}

      <Canvas
        shadows
        camera={{ position: [0, 1.25, 24], fov: 60, near: 0.1, far: 200 }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.4 }}
      >
        <LiveKitTrackContext.Provider value={{ pcTracks, activeScreenTrack }}>
          <Scene
            userName={userName}
            onZoneChange={setCurrentZone}
            onNearChair={setNearChair}
            onNearInteractable={setNearInteractable}
            onInteract={handleInteract}
            template={template}
            fpsMode={fpsMode}
            onFpsModeChange={handleFpsModeChange}
            customObjects={customObjects}
          />
        </LiveKitTrackContext.Provider>
      </Canvas>

      {/* Zone indicator */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-xl border border-white/10">
        <span className="text-lg">{ZONES.find(z => z.name === currentZone)?.emoji || "🏢"}</span>
        <span className="text-white text-sm font-semibold">{currentZone}</span>
      </div>

      {/* Mode indicator */}
      {entered && (
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-xl border border-white/10">
          <span className="text-sm">{fpsMode ? "🔒" : "🖱️"}</span>
          <span className="text-white text-xs font-medium">{fpsMode ? "Navigation Mode" : "UI Mode"}</span>
          <kbd className="px-1.5 py-0.5 rounded bg-white/20 text-white text-[10px] font-mono">Tab</kbd>
        </div>
      )}

      {/* Sit prompt */}
      {nearChair && fpsMode && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600/90 backdrop-blur-sm text-white text-sm font-semibold shadow-lg animate-bounce">
          <kbd className="px-1.5 py-0.5 rounded bg-white/20 text-xs font-mono">E</kbd>
          Sit / Stand
        </div>
      )}

      {/* Interactive object prompt */}
      {nearInteractable && fpsMode && !nearChair && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600/90 backdrop-blur-sm text-white text-sm font-semibold shadow-lg animate-pulse">
          <kbd className="px-1.5 py-0.5 rounded bg-white/20 text-xs font-mono">E</kbd>
          {nearInteractable.prompt}
        </div>
      )}

      {/* Crosshair */}
      {fpsMode && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-1.5 h-1.5 rounded-full bg-white mix-blend-difference pointer-events-none" />
      )}

      {/* Controls hint */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 text-gray-500 text-xs bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full select-none pointer-events-none">
        Movement: WASD · Look: Mouse · Interact: E · Toggle Mode: Tab
      </div>
    </div>
  );
}
