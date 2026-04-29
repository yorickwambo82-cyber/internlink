'use client';

import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

function EmeraldSphere() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.15;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={meshRef} position={[0, 0, 0]} scale={2.2}>
        <icosahedronGeometry args={[1, 4]} />
        <MeshDistortMaterial
          color="#059669"
          speed={2}
          distort={0.3}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
    </Float>
  );
}

function SmallSphere({ position, color, speed }: { position: [number, number, number]; color: string; speed: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * speed * 0.3;
      meshRef.current.rotation.y = state.clock.elapsedTime * speed * 0.2;
    }
  });

  return (
    <Float speed={speed} rotationIntensity={1} floatIntensity={2}>
      <mesh ref={meshRef} position={position} scale={0.5}>
        <octahedronGeometry args={[1, 0]} />
        <MeshDistortMaterial
          color={color}
          speed={1}
          distort={0.2}
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>
    </Float>
  );
}

function Particles() {
  const count = 60;
  const positions = React.useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 15;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 15;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return pos;
  }, []);

  const pointsRef = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.03;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#059669"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} color="#ffffff" />
      <pointLight position={[-5, -3, 3]} intensity={0.5} color="#FCD116" />
      <pointLight position={[5, -2, -3]} intensity={0.3} color="#059669" />

      <EmeraldSphere />
      <SmallSphere position={[-3.5, 2, -2]} color="#FCD116" speed={1.5} />
      <SmallSphere position={[3.5, -1.5, -1]} color="#34D399" speed={2} />
      <SmallSphere position={[-2, -2.5, -3]} color="#10B981" speed={1.2} />
      <Particles />
    </>
  );
}

export function HeroScene() {
  return (
    <div className="absolute inset-0 -z-10 opacity-60">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
}

// Fallback for low-end devices
export function HeroSceneFallback() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      {/* Static gradient background as fallback */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-transparent to-amber-50 dark:from-emerald-950/30 dark:via-transparent dark:to-amber-950/20" />
      {/* Floating shapes using CSS */}
      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-emerald-400/20 rounded-full blur-3xl animate-float" />
      <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-amber-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-1/4 left-1/3 w-20 h-20 bg-emerald-300/15 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }} />
    </div>
  );
}
