'use client';

import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useSphere } from '@react-three/cannon';
import { Decal, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '@/lib/store';
import gsap from 'gsap';

interface BasketballProps {
  color?: string;
  pattern?: 'CLASSIC' | 'STREET' | 'TECH' | 'CROSS';
  rotationSpeed?: number;
  physicsEnabled?: boolean;
  customText?: string;
  fontFamily?: string;
  engravingType?: 'laser' | 'gold';
  logoUrl?: string | null;
  transformRef?: React.RefObject<{ x: number, y: number, scale: number }>;
}

function LogoDecal({ url }: { url: string }) {
  const texture = useTexture(url);
  return (
    <Decal 
      position={[0, -0.4, 0.9]} 
      rotation={[0, 0, 0]} 
      scale={[0.3, 0.3, 0.1]}
    >
      <meshStandardMaterial 
        map={texture} 
        transparent 
        polygonOffset 
        polygonOffsetFactor={-1} 
      />
    </Decal>
  );
}

export function Basketball({ 
  color = '#FF5500', 
  pattern = 'CLASSIC', 
  rotationSpeed = 1, 
  physicsEnabled = false,
  customText = '',
  fontFamily = '"Space Grotesk"',
  engravingType = 'gold',
  logoUrl = null,
  transformRef
}: BasketballProps) {
  const meshRef = useRef<THREE.Group>(null);
  const ballMeshRef = useRef<THREE.Mesh>(null);
  const { viewport, mouse, camera } = useThree();
  const [isDragging, setIsDragging] = useState(false);
  
  // Audio context for synthesized bounce sound
  const audioContext = useRef<AudioContext | null>(null);
  
  // Create a high-fidelity texture for the custom text engraving
  const textTexture = useMemo(() => {
    if (!customText || typeof window === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    
    // Transparent background
    ctx.clearRect(0, 0, 1024, 256);
    
    // Font setup
    ctx.font = `bold 140px ${fontFamily}, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Laser Engraved: Deep black with a slight soft edge for the bump map
    ctx.shadowBlur = 4;
    ctx.shadowColor = 'black';
    ctx.fillStyle = 'white';
    ctx.fillText(customText.toUpperCase(), 512, 128);
    
    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = 16;
    return tex;
  }, [customText, fontFamily]);

  const playBounceSound = (velocity: number) => {
    if (!audioContext.current) {
      audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    const ctx = audioContext.current;
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.1);
    
    const vol = Math.min(velocity / 10, 0.5);
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  };

  const [ref, api] = useSphere(() => ({
    mass: 1,
    position: [0, 0, 0],
    args: [1],
    onCollide: (e) => {
      if (e.contact.impactVelocity > 0.5) {
        playBounceSound(e.contact.impactVelocity);
      }
    },
  }));

  const pebbleTexture = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 512, 512);
    
    ctx.fillStyle = '#000000';
    /* eslint-disable react-hooks/purity */
    for (let i = 0; i < 10000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      ctx.beginPath();
      ctx.arc(x, y, 1, 0, Math.PI * 2);
      ctx.fill();
    }
    /* eslint-enable react-hooks/purity */
    
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(8, 4);
    return tex;
  }, []);

  const isDesignStudio = useStore(state => state.isDesignStudio);
  const isIntroComplete = useStore(state => state.isIntroComplete);
  const isAnatomyMode = useStore(state => state.isAnatomyMode);
  const anatomyProgress = useStore(state => state.anatomyProgress);
  const theme = useStore(state => state.theme);

  const lineIntensity = theme === 'dark' ? 0.9 : 0.6;
  const lineColor = theme === 'dark' ? '#000000' : '#333333';

  // Map progress to a smoother transition (starts after 20% and completes by 80% of the section)
  const transitionValue = useMemo(() => {
    if (!isAnatomyMode) return 0;
    // Map 0.2-0.8 to 0-1
    return Math.min(1, Math.max(0, (anatomyProgress - 0.2) / 0.6));
  }, [anatomyProgress, isAnatomyMode]);

  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);

  // Track mouse for manual rotation in Lab
  const lastMousePos = useRef({ x: 0, y: 0 });
  const manualRotation = useRef({ x: 0, y: 0 });

  useFrame((state, delta) => {
    if (!physicsEnabled && meshRef.current) {
      // Apply shared transform if available
      if (transformRef?.current) {
        meshRef.current.position.x = transformRef.current.x;
        // Vertically, we combine the scroll offset with the floating effect
        // During intro, we let the internal GSAP bounce handle Y
        if (isIntroComplete) {
          const floatY = isDesignStudio ? Math.sin(state.clock.elapsedTime * 1.2) * 0.1 : 0;
          meshRef.current.position.y = transformRef.current.y + floatY;
        }
        meshRef.current.scale.setScalar(transformRef.current.scale);
      }

      if (isDesignStudio) {
        if (isDragging) {
          // Manual rotation when dragging in Lab
          const dx = mouse.x - lastMousePos.current.x;
          const dy = mouse.y - lastMousePos.current.y;
          manualRotation.current.y += dx * 5;
          manualRotation.current.x -= dy * 5;
        }

        // Apply rotation
        meshRef.current.rotation.y = manualRotation.current.y + state.clock.elapsedTime * 0.15;
        meshRef.current.rotation.x = manualRotation.current.x + Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
        
        lastMousePos.current.x = mouse.x;
        lastMousePos.current.y = mouse.y;
      } else {
        // Standard rotation during scroll/other views
        meshRef.current.rotation.y += delta * 0.2 * rotationSpeed;
        if (!transformRef?.current) {
          meshRef.current.position.y = 0;
        }
        meshRef.current.rotation.x = 0;
      }

      if (isAnatomyMode) {
        if (ring1Ref.current) ring1Ref.current.rotation.x += delta * 0.5;
        if (ring2Ref.current) ring2Ref.current.rotation.z += delta * 0.3;
        if (ring3Ref.current) ring3Ref.current.rotation.y += delta * 0.4;
      }
    }

    if (isDragging && physicsEnabled) {
      // Vector3 for target position
      const target = new THREE.Vector3(
        (mouse.x * viewport.width) / 2,
        (mouse.y * viewport.height) / 2,
        0
      );
      api.position.set(target.x, target.y, target.z);
      api.velocity.set(0, 0, 0);
    }
  });

  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    setIsDragging(true);
    lastMousePos.current.x = mouse.x;
    lastMousePos.current.y = mouse.y;
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const handleUp = () => setIsDragging(false);
    window.addEventListener('pointerup', handleUp);
    return () => window.removeEventListener('pointerup', handleUp);
  }, []);

  useEffect(() => {
    if (physicsEnabled && transformRef?.current) {
      // Initialize physics position from current visual position
      api.position.set(transformRef.current.x, transformRef.current.y, 0);
      api.velocity.set(0, 0, 0);
      api.angularVelocity.set(0, 0, 0);
    }
  }, [physicsEnabled, api, transformRef]);

  const introPlayed = useRef(false);
  const setIsIntroComplete = useStore(state => state.setIsIntroComplete);

  useEffect(() => {
    if (meshRef.current && !physicsEnabled && !introPlayed.current) {
      introPlayed.current = true;
      // Initial intro bounce animation
      gsap.fromTo(meshRef.current.position, 
        { y: 10 }, 
        { 
          y: 0, 
          duration: 2, 
          ease: "bounce.out",
          onComplete: () => {
            setIsIntroComplete(true);
          }
        }
      );
    }
  }, [physicsEnabled, setIsIntroComplete]);

  // Use the physics ref if enabled, otherwise use normal ref
  const activeRef = physicsEnabled ? ref : meshRef;

  return (
    <group 
      ref={activeRef as any} 
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      <mesh ref={ballMeshRef} castShadow receiveShadow>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial 
          color={color} 
          roughness={0.4} 
          metalness={0.1} 
          envMapIntensity={6}
          emissive={color}
          emissiveIntensity={isAnatomyMode ? 0.05 * (1 - transitionValue) : 0.1}
          bumpMap={pebbleTexture}
          bumpScale={0.005}
          transparent={isAnatomyMode}
          opacity={isAnatomyMode ? 1 - (transitionValue * 0.95) : 1}
          depthWrite={!isAnatomyMode || transitionValue < 0.5}
        />
        
        {/* Attached Lighting for constant illumination */}
        {!isAnatomyMode && (
          <group>
            {/* Direct point light to illuminate the ball specifically */}
            <pointLight position={[2, 2, 2]} intensity={25} color="#ffffff" decay={2} distance={10} />
            <pointLight position={[-2, -1, 1]} intensity={10} color={color} decay={2} distance={8} />
            <spotLight 
              position={[0, 5, 5]} 
              intensity={30} 
              angle={0.5} 
              penumbra={1} 
              castShadow 
              color="#ffffff"
            />
          </group>
        )}

        {isAnatomyMode && (
          <group scale={transitionValue}>
            {/* Illuminated Core */}
            <mesh>
              <sphereGeometry args={[0.15, 32, 32]} />
              <meshBasicMaterial color="#FF5500" />
              <pointLight intensity={10 * transitionValue} color="#FF5500" distance={3} decay={2} />
            </mesh>

            {/* X-Ray Rings */}
            <mesh ref={ring1Ref}>
              <ringGeometry args={[0.4, 0.42, 64]} />
              <meshBasicMaterial color="#FF5500" transparent opacity={0.6 * transitionValue} side={THREE.DoubleSide} />
            </mesh>
            <mesh ref={ring2Ref} rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.5, 0.52, 64]} />
              <meshBasicMaterial color="#FF5500" transparent opacity={0.4 * transitionValue} side={THREE.DoubleSide} />
            </mesh>
            <mesh ref={ring3Ref} rotation={[0, Math.PI / 2, 0]}>
              <ringGeometry args={[0.6, 0.62, 64]} />
              <meshBasicMaterial color="#FF5500" transparent opacity={0.2 * transitionValue} side={THREE.DoubleSide} />
            </mesh>
          </group>
        )}
        
        {/* Custom Text Decal (Physical Engraving System) */}
        {textTexture && (
          <Decal 
            position={[0, 0.4, 0.95]} 
            rotation={[0, 0, 0]} 
            scale={[0.8, 0.2, 0.1]} 
          >
             <meshStandardMaterial 
               alphaMap={textTexture}
               transparent
               opacity={isAnatomyMode ? 1 - transitionValue : 1}
               color={engravingType === 'laser' ? '#111111' : '#FFD700'}
               roughness={engravingType === 'laser' ? 0.9 : 0.05}
               metalness={engravingType === 'laser' ? 0 : 1}
               bumpMap={textTexture}
               bumpScale={engravingType === 'laser' ? -0.02 : 0.01}
               polygonOffset
               polygonOffsetFactor={-10}
             />
          </Decal>
        )}

        {/* Logo Decal */}
        {logoUrl && (
          <LogoDecal url={logoUrl} />
        )}
      </mesh>

      {pattern === 'CLASSIC' && (
        <group>
          <mesh><torusGeometry args={[1.005, 0.015, 16, 100]} /><meshStandardMaterial color={lineColor} roughness={lineIntensity} transparent={isAnatomyMode} opacity={isAnatomyMode ? 1 - (transitionValue * 0.6) : 1} /></mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[1.005, 0.015, 16, 100]} /><meshStandardMaterial color={lineColor} roughness={lineIntensity} transparent={isAnatomyMode} opacity={isAnatomyMode ? 1 - (transitionValue * 0.6) : 1} /></mesh>
          <mesh rotation={[0, Math.PI / 4, Math.PI / 2]}><torusGeometry args={[1.005, 0.01, 16, 100]} /><meshStandardMaterial color={lineColor} roughness={lineIntensity} transparent={isAnatomyMode} opacity={isAnatomyMode ? 1 - (transitionValue * 0.6) : 1} /></mesh>
           <mesh rotation={[0, -Math.PI / 4, Math.PI / 2]}><torusGeometry args={[1.005, 0.01, 16, 100]} /><meshStandardMaterial color={lineColor} roughness={lineIntensity} transparent={isAnatomyMode} opacity={isAnatomyMode ? 1 - (transitionValue * 0.6) : 1} /></mesh>
        </group>
      )}

      {pattern === 'STREET' && (
        <group>
           <mesh><torusGeometry args={[1.005, 0.02, 16, 100]} /><meshStandardMaterial color={lineColor} roughness={lineIntensity} /></mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[1.005, 0.02, 16, 100]} /><meshStandardMaterial color={lineColor} roughness={lineIntensity} /></mesh>
          {[0, 1, 2, 3].map((i) => (
             <mesh key={i} rotation={[Math.PI / 4, (i * Math.PI) / 2, 0]}>
                <torusGeometry args={[1.005, 0.015, 16, 100]} />
                <meshStandardMaterial color={lineColor} roughness={lineIntensity} />
             </mesh>
          ))}
        </group>
      )}

      {pattern === 'TECH' && (
        <group>
          <mesh><sphereGeometry args={[1.01, 32, 32]} /><meshStandardMaterial color={lineColor} wireframe transparent opacity={0.3} /></mesh>
          <mesh><torusGeometry args={[1.005, 0.01, 16, 100]} /><meshStandardMaterial color={lineColor} roughness={lineIntensity} /></mesh>
        </group>
      )}

      {pattern === 'CROSS' && (
        <group>
          <mesh rotation={[Math.PI / 4, Math.PI / 4, 0]}><torusGeometry args={[1.005, 0.02, 16, 100]} /><meshStandardMaterial color={lineColor} roughness={lineIntensity} /></mesh>
          <mesh rotation={[-Math.PI / 4, Math.PI / 4, 0]}><torusGeometry args={[1.005, 0.02, 16, 100]} /><meshStandardMaterial color={lineColor} roughness={lineIntensity} /></mesh>
        </group>
      )}
    </group>
  );
}
