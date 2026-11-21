'use client';

import React from 'react';
import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { ZODIAC_SIGNS, ZODIAC_DATA } from '@/lib/constants';

type ZodiacWheel3DProps = {
  interactive?: boolean;
  onSelectSign?: (sign: string) => void;
  selectedSign?: string | null;
};

function WheelRing({
  interactive,
  onSelectSign,
  selectedSign,
}: {
  interactive?: boolean;
  onSelectSign?: (sign: string) => void;
  selectedSign?: string | null;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useFrame((_, delta) => {
    if (groupRef.current && !prefersReduced) {
      groupRef.current.rotation.z += delta * 0.05;
    }
  });

  const signs = useMemo(
    () =>
      ZODIAC_SIGNS.map((sign, i) => {
        const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
        const radius = 1.75;
        return {
          sign,
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius,
          symbol: ZODIAC_DATA[sign].symbol,
        };
      }),
    []
  );

  return (
    <group ref={groupRef}>
      {/* Outer Luminous Violet/Purple Ring */}
      <mesh>
        <torusGeometry args={[1.75, 0.024, 16, 120]} />
        <meshBasicMaterial color="#9333EA" transparent opacity={0.75} />
      </mesh>

      {/* Middle Celestial Blue Ring */}
      <mesh>
        <torusGeometry args={[1.25, 0.016, 16, 120]} />
        <meshBasicMaterial color="#38BDF8" transparent opacity={0.55} />
      </mesh>

      {/* Inner Golden Astrolabe Core Ring */}
      <mesh>
        <torusGeometry args={[0.7, 0.012, 16, 100]} />
        <meshBasicMaterial color="#FBBF24" transparent opacity={0.4} />
      </mesh>

      {/* 12 Zodiac Glyphs & Interactive Targets */}
      {signs.map(({ sign, x, y, symbol }) => (
        <group key={sign} position={[x, y, 0]}>
          {interactive ? (
            <mesh
              onClick={() => onSelectSign?.(sign)}
              onPointerOver={() => (document.body.style.cursor = 'pointer')}
              onPointerOut={() => (document.body.style.cursor = 'auto')}
            >
              <circleGeometry args={[0.2, 32]} />
              <meshBasicMaterial
                color={selectedSign === sign ? '#FFD166' : '#1B1F4A'}
                transparent
                opacity={0.92}
              />
            </mesh>
          ) : null}
          <Text
            fontSize={0.24}
            color={selectedSign === sign ? '#FFD166' : '#E5E7EB'}
            anchorX="center"
            anchorY="middle"
          >
            {symbol}
          </Text>
        </group>
      ))}

      {/* Central Radiance Star */}
      <Text fontSize={0.42} color="#FFD166" anchorX="center" anchorY="middle">
        ✦
      </Text>
    </group>
  );
}

export function ZodiacWheel3D({
  interactive,
  onSelectSign,
  selectedSign,
}: ZodiacWheel3DProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="h-full w-full aspect-square rounded-3xl bg-secondary/15 mx-auto" />
    );
  }

  return (
    <div className="h-full w-full aspect-square flex items-center justify-center mx-auto" role="img" aria-label="3D zodiac wheel">
      <Canvas camera={{ position: [0, 0, 6.2], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={0.9} />
        <WheelRing
          interactive={interactive}
          onSelectSign={onSelectSign}
          selectedSign={selectedSign}
        />
      </Canvas>
    </div>
  );
}
