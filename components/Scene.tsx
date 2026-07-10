'use client';

import { Canvas } from '@react-three/fiber';
import { Physics, usePlane } from '@react-three/cannon';
import { PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { Basketball } from './Basketball';
import { Suspense } from 'react';
import { useStore } from '@/lib/store';
import * as THREE from 'three';

interface SceneProps {
  color?: string;
  pattern?: 'CLASSIC' | 'STREET' | 'TECH' | 'CROSS';
  rotationSpeed?: number;
  environment?: 'studio' | 'city' | 'night' | 'warehouse';
  physicsEnabled?: boolean;
  customText?: string;
  fontFamily?: string;
  engravingType?: 'laser' | 'gold';
  logoUrl?: string | null;
  transformRef?: React.RefObject<{ x: number, y: number, scale: number }>;
}

export function Scene({ 
  color, 
  pattern, 
  rotationSpeed, 
  environment = 'studio', 
  physicsEnabled = false, 
  customText = '', 
  fontFamily = '"Space Grotesk"',
  engravingType = 'gold',
  logoUrl = null,
  transformRef
}: SceneProps) {
  const theme = useStore(state => state.theme);

  return (
    <Canvas shadows dpr={[1, 2]}>
      <Suspense fallback={null}>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={45}>
        </PerspectiveCamera>
        <Physics gravity={[0, -9.81, 0]}>
          <Basketball 
            color={color} 
            pattern={pattern} 
            rotationSpeed={rotationSpeed} 
            physicsEnabled={physicsEnabled} 
            customText={customText} 
            fontFamily={fontFamily}
            engravingType={engravingType}
            logoUrl={logoUrl} 
            transformRef={transformRef}
          />
          <Plane rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} />
        </Physics>

        <Environment preset={theme === 'dark' ? environment : 'city'} />
        <ContactShadows position={[0, -2, 0]} opacity={theme === 'dark' ? 0.4 : 0.2} scale={10} blur={2.5} far={4} />
        
        <ambientLight intensity={theme === 'dark' ? 0.5 : 1.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={theme === 'dark' ? 1 : 0.5} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={theme === 'dark' ? 0.5 : 0.2} />

        {/* Effect Composer for Bloom */}
        <EffectComposer>
          <Bloom 
            luminanceThreshold={1.0} 
            mipmapBlur 
            intensity={1.5} 
            radius={0.4}
          />
        </EffectComposer>
      </Suspense>
    </Canvas>
  );
}

function Plane(props: any) {
  const [ref] = usePlane(() => ({ ...props }));
  return (
    <mesh ref={ref as any} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial transparent opacity={0} />
    </mesh>
  );
}
