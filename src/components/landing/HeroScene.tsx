"use client";

import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
    OrbitControls,
    Stars,
    Text,
    RoundedBox,
    MeshReflectorMaterial,
    Float,
    Sparkles,
} from "@react-three/drei";
import * as THREE from "three";

/* ── Mini Avatar ──────────────────────────────────────────────── */
function MiniAvatar({ position, name, color }: {
    position: [number, number, number]; name: string; color: string;
}) {
    const ref = useRef<THREE.Group>(null);
    useFrame((s) => {
        if (ref.current) ref.current.position.y = position[1] + Math.sin(s.clock.elapsedTime * 2 + position[0]) * 0.04;
    });
    return (
        <group ref={ref} position={position}>
            <mesh position={[0, -0.25, 0]} castShadow>
                <capsuleGeometry args={[0.15, 0.35, 12, 12]} />
                <meshStandardMaterial color={color} roughness={0.4} metalness={0.3} />
            </mesh>
            <mesh position={[0, 0.2, 0]} castShadow>
                <sphereGeometry args={[0.15, 24, 24]} />
                <meshStandardMaterial color="#e0e7ff" roughness={0.3} />
            </mesh>
            <mesh position={[0, -0.45, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.18, 0.25, 24]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} transparent opacity={0.3} side={THREE.DoubleSide} />
            </mesh>
            <Text position={[0, 0.55, 0]} fontSize={0.08} color="white" anchorX="center" fillOpacity={0.8}>
                {name}
            </Text>
        </group>
    );
}

/* ── Mini Desk ────────────────────────────────────────────────── */
function MiniDesk({ position }: { position: [number, number, number] }) {
    return (
        <group position={position}>
            <RoundedBox args={[0.8, 0.04, 0.4]} position={[0, 0.35, 0]} radius={0.01} smoothness={4} castShadow>
                <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.6} />
            </RoundedBox>
            {[[-0.33, 0.17, -0.15], [0.33, 0.17, -0.15], [-0.33, 0.17, 0.15], [0.33, 0.17, 0.15]].map((p, i) => (
                <mesh key={i} position={p as [number, number, number]}>
                    <cylinderGeometry args={[0.012, 0.012, 0.34, 6]} />
                    <meshStandardMaterial color="#1e293b" metalness={0.8} />
                </mesh>
            ))}
            {/* Tiny monitor */}
            <RoundedBox args={[0.3, 0.2, 0.015]} position={[0, 0.55, -0.1]} radius={0.01} smoothness={4}>
                <meshStandardMaterial color="#222" emissive="#3d8b6a" emissiveIntensity={0.15} />
            </RoundedBox>
        </group>
    );
}

/* ── Mini Screen ──────────────────────────────────────────────── */
function MiniScreen() {
    const ref = useRef<THREE.Mesh>(null);
    useFrame((s) => {
        if (ref.current) {
            const mat = ref.current.material as THREE.MeshStandardMaterial;
            mat.emissiveIntensity = 0.4 + Math.sin(s.clock.elapsedTime * 0.6) * 0.15;
        }
    });
    return (
        <group position={[0, 1.2, -2.2]}>
            <RoundedBox args={[2.5, 1.4, 0.06]} radius={0.04} smoothness={4}>
                <meshStandardMaterial color="#111" metalness={0.8} roughness={0.2} />
            </RoundedBox>
            <mesh ref={ref} position={[0, 0, 0.04]}>
                <planeGeometry args={[2.3, 1.2]} />
                <meshStandardMaterial color="#1a3020" emissive="#3d8b6a" emissiveIntensity={0.4} roughness={0.1} metalness={0.9} />
            </mesh>
            <Text position={[0, 0, 0.08]} fontSize={0.12} color="#6ecfa0" anchorX="center" fillOpacity={0.9}>
                {"🎥  LIVE"}
            </Text>
        </group>
    );
}

/* ── The Scene ────────────────────────────────────────────────── */
function Scene() {
    return (
        <>
            <color attach="background" args={["#e8e0d0"]} />
            <fog attach="fog" args={["#e8e0d0", 6, 14]} />

            <ambientLight intensity={1.0} color="#fffbf0" />
            <directionalLight castShadow position={[5, 8, 5]} intensity={1.2} shadow-mapSize={[1024, 1024]} color="#fff8ee" />
            <pointLight position={[0, 3, 0]} intensity={0.5} color="#fff" distance={10} />
            <pointLight position={[3, 2, -1]} intensity={0.3} color="#D4A373" distance={8} />
            <hemisphereLight args={["#87CEEB", "#d4cfc4", 0.4]} />

            <Stars radius={30} depth={20} count={1500} factor={3} saturation={0.5} fade speed={0.6} />
            <Sparkles count={30} scale={8} size={2} speed={0.2} color="#E9C46A" opacity={0.1} />

            {/* Reflective floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
                <planeGeometry args={[20, 20]} />
                <MeshReflectorMaterial
                    blur={[200, 80]}
                    resolution={512}
                    mixBlur={1}
                    mixStrength={30}
                    roughness={1}
                    depthScale={1}
                    color="#d4cfc4"
                    metalness={0.3}
                    mirror={0.3}
                />
            </mesh>

            {/* Grid */}
            <gridHelper args={[20, 20, "#b0a89a", "#c0b8aa"]} position={[0, 0.01, 0]} material-opacity={0.15} material-transparent />

            {/* Walls */}
            <RoundedBox args={[6, 2, 0.12]} position={[0, 1, -2.5]} radius={0.02} smoothness={4} receiveShadow>
                <meshStandardMaterial color="#e8e0d0" roughness={0.6} metalness={0.2} />
            </RoundedBox>

            {/* Screen */}
            <MiniScreen />

            {/* Desks */}
            <MiniDesk position={[-1.2, 0, 0.3]} />
            <MiniDesk position={[0, 0, 0.3]} />
            <MiniDesk position={[1.2, 0, 0.3]} />

            {/* Avatars */}
            <MiniAvatar position={[-1.2, 0.6, 0.7]} name="Alex" color="#2D6A4F" />
            <MiniAvatar position={[0, 0.6, 0.7]} name="Maya" color="#D4A373" />
            <MiniAvatar position={[1.2, 0.6, 0.7]} name="Sam" color="#52B788" />

            {/* Guide */}
            <MiniAvatar position={[0, 0.6, -1.2]} name="Guide" color="#2D6A4F" />

            {/* Plants */}
            {[[-2.5, 0, -2], [2.5, 0, -2]].map((p, i) => (
                <group key={i} position={p as [number, number, number]}>
                    <mesh position={[0, 0.12, 0]}>
                        <cylinderGeometry args={[0.08, 0.1, 0.24, 8]} />
                        <meshStandardMaterial color="#44403c" roughness={0.8} />
                    </mesh>
                    <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2}>
                        <mesh position={[0, 0.35, 0]}>
                            <sphereGeometry args={[0.18, 12, 12]} />
                            <meshStandardMaterial color="#166534" roughness={0.8} />
                        </mesh>
                    </Float>
                </group>
            ))}

            <OrbitControls
                enablePan={false}
                enableZoom={false}
                autoRotate={false}
                maxPolarAngle={Math.PI / 2.3}
                minPolarAngle={Math.PI / 4}
            />
        </>
    );
}

/* ── Exported Component ───────────────────────────────────────── */
export default function HeroScene() {
    return (
        <div className="w-full h-full relative">
            <Canvas
                shadows
                camera={{ position: [0, 3.5, 5], fov: 40, near: 0.1, far: 50 }}
                gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
                style={{ borderRadius: "12px" }}
            >
                <Scene />
            </Canvas>
            {/* Hint overlay */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] text-gray-500 bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full pointer-events-none select-none">
                drag to explore 3D
            </div>
        </div>
    );
}
