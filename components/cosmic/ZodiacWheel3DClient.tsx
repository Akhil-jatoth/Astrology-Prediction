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
        const radius = 2.2;
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
      <mesh>
        <torusGeometry args={[2.2, 0.02, 16, 100]} />
        <meshBasicMaterial color="#7C3AED" transparent opacity={0.6} />
      </mesh>
      <mesh>
        <torusGeometry args={[1.6, 0.015, 16, 100]} />
        <meshBasicMaterial color="#4F9DFF" transparent opacity={0.4} />
      </mesh>
      {signs.map(({ sign, x, y, symbol }) => (
        <group key={sign} position={[x, y, 0]}>
          {interactive ? (
            <mesh
              onClick={() => onSelectSign?.(sign)}
              onPointerOver={() => (document.body.style.cursor = 'pointer')}
              onPointerOut={() => (document.body.style.cursor = 'auto')}
            >
              <circleGeometry args={[0.22, 32]} />
              <meshBasicMaterial
                color={selectedSign === sign ? '#FFD166' : '#1B1F4A'}
                transparent
                opacity={0.9}
              />
            </mesh>
          ) : null}
          <Text
            fontSize={0.28}
            color={selectedSign === sign ? '#FFD166' : '#E5E7EB'}
            anchorX="center"
            anchorY="middle"
          >
            {symbol}
          </Text>
        </group>
      ))}
      <Text fontSize={0.5} color="#FFD166" anchorX="center" anchorY="middle">
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
      <div className="mx-auto h-72 w-full max-w-md md:h-96 bg-secondary/15 rounded-3xl" />
    );
  }

  return (
    <div className="mx-auto h-72 w-full max-w-md md:h-96" role="img" aria-label="3D zodiac wheel">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={0.8} />
        <WheelRing
          interactive={interactive}
          onSelectSign={onSelectSign}
          selectedSign={selectedSign}
        />
      </Canvas>
    </div>
  );
}
