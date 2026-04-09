import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState, useMemo } from "react";
import * as THREE from "three";
import { motion, AnimatePresence } from "motion/react";
import { Stars, Float, Text, Environment, Sparkles } from "@react-three/drei";
import { GoogleGenAI, Modality } from "@google/genai";

// --- AI Voice Helper ---
let ai: GoogleGenAI | null = null;
let audioContext: AudioContext | null = null;

async function playAIVoice(text: string) {
  try {
    if (!ai) {
      if (!process.env.GEMINI_API_KEY) {
        console.warn("AI Voice: No GEMINI_API_KEY provided. Skipping voice.");
        return;
      }
      ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }

    if (!audioContext) {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Say in a deep, legendary, epic narrator voice: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Charon' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      console.warn("AI Voice: No audio data received (likely quota limit or safety filter). Skipping voice.");
      return;
    }

    const audioData = atob(base64Audio);
    const arrayBuffer = new ArrayBuffer(audioData.length);
    const view = new Uint8Array(arrayBuffer);
    for (let i = 0; i < audioData.length; i++) {
      view[i] = audioData.charCodeAt(i);
    }

    try {
      const buffer = await audioContext.decodeAudioData(arrayBuffer);
      const source = audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContext.destination);
      source.start(0);
    } catch (decodeError) {
      console.warn("AI Voice: Unable to decode audio data. Skipping voice.", decodeError);
    }
  } catch (error: any) {
    // Handle quota errors (429) silently or with a simple warning
    if (error?.message?.includes('429') || error?.status === 'RESOURCE_EXHAUSTED') {
      console.warn("AI Voice: Quota exceeded. The intro will continue without narration.");
    } else {
      console.warn("AI Voice Error:", error?.message || error);
    }
  }
}

// --- Types ---
interface SceneProps {
  sceneIndex: number;
}

// --- Environments ---

function Scorpion({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[0.5, 0.3, 0.8]} />
        <meshStandardMaterial color="#d4a373" />
      </mesh>
      <mesh position={[0, 0.5, 0.4]} rotation={[0.5, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.1, 0.6]} />
        <meshStandardMaterial color="#d4a373" />
      </mesh>
    </group>
  );
}

function Miner({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[0.3, 0.8, 0.3]} />
        <meshStandardMaterial color="#555555" />
      </mesh>
      <mesh position={[0.3, 0.6, 0]}>
        <boxGeometry args={[0.4, 0.1, 0.1]} />
        <meshStandardMaterial color="#aaaaaa" />
      </mesh>
    </group>
  );
}

function Goblin({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[0.3, 0.6, 0.3]} />
        <meshStandardMaterial color="#2d5a27" />
      </mesh>
    </group>
  );
}

function Woodcutter({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[0.3, 0.8, 0.3]} />
        <meshStandardMaterial color="#5d4037" />
      </mesh>
      <mesh position={[0.3, 0.6, 0]}>
        <boxGeometry args={[0.3, 0.1, 0.1]} />
        <meshStandardMaterial color="#a67c52" />
      </mesh>
    </group>
  );
}

function DeadTree({ position }: { position: [number, number, number] }) {
  const segments = 6;
  const height = 4 + Math.random() * 3;
  const segmentHeight = height / segments;
  
  return (
    <group position={position}>
      {/* Roots */}
      {[...Array(4)].map((_, i) => (
        <mesh 
          key={`root-${i}`} 
          position={[Math.cos(i * Math.PI / 2) * 0.5, -0.2, Math.sin(i * Math.PI / 2) * 0.5]}
          rotation={[Math.PI / 2.5, i * Math.PI / 2, 0]}
        >
          <cylinderGeometry args={[0.05, 0.15, 1.5, 4]} />
          <meshStandardMaterial color="#111111" flatShading />
        </mesh>
      ))}

      {/* Trunk segments */}
      {[...Array(segments)].map((_, i) => (
        <mesh 
          key={i} 
          position={[
            Math.sin(i * 0.8) * 0.2, 
            i * segmentHeight + segmentHeight / 2, 
            Math.cos(i * 0.8) * 0.2
          ]}
          rotation={[
            (Math.random() - 0.5) * 0.4,
            Math.random() * Math.PI,
            (Math.random() - 0.5) * 0.4
          ]}
        >
          <cylinderGeometry args={[0.12 - i * 0.02, 0.18 - i * 0.02, segmentHeight, 5]} />
          <meshStandardMaterial color="#1a1a1a" flatShading />
        </mesh>
      ))}
      
      {/* Gnarled/Broken Branches */}
      {[...Array(10)].map((_, i) => (
        <group 
          key={`branch-group-${i}`}
          position={[
            Math.sin(i) * 0.5, 
            2 + Math.random() * (height - 2), 
            Math.cos(i) * 0.5
          ]}
          rotation={[
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
          ]}
        >
          <mesh>
            <cylinderGeometry args={[0.01, 0.05, 1 + Math.random() * 1, 4]} />
            <meshStandardMaterial color="#1a1a1a" flatShading />
          </mesh>
          {/* Broken stub */}
          {Math.random() > 0.5 && (
            <mesh position={[0, 0.5, 0]} rotation={[0.5, 0, 0]}>
              <boxGeometry args={[0.05, 0.2, 0.05]} />
              <meshStandardMaterial color="#1a1a1a" flatShading />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
}

function RuneSymbol({ position }: { position: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      const pulse = (Math.sin(state.clock.elapsedTime * 2) + 1) / 2;
      groupRef.current.children.forEach((child) => {
        if (child instanceof THREE.Mesh) {
          (child.material as THREE.MeshStandardMaterial).emissiveIntensity = 1 + pulse * 4;
        }
      });
      if (lightRef.current) {
        lightRef.current.intensity = 2 + pulse * 6;
      }
      groupRef.current.scale.setScalar(0.9 + pulse * 0.15);
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Rune Geometry (Cross shape) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <boxGeometry args={[0.8, 0.15, 0.05]} />
        <meshStandardMaterial color="#2e004d" emissive="#8a2be2" emissiveIntensity={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
        <boxGeometry args={[0.8, 0.15, 0.05]} />
        <meshStandardMaterial color="#2e004d" emissive="#8a2be2" emissiveIntensity={1} />
      </mesh>
      {/* Inner Glow Light */}
      <pointLight ref={lightRef} position={[0, 0.5, 0]} color="#8a2be2" distance={5} />
    </group>
  );
}

function Volcano({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh>
        <coneGeometry args={[10, 15, 8]} />
        <meshStandardMaterial color="#2a2a2a" flatShading />
      </mesh>
      {/* Crater Glow */}
      <mesh position={[0, 7.5, 0]}>
        <coneGeometry args={[3, 2, 8]} />
        <meshStandardMaterial color="#ff4400" emissive="#ff4400" emissiveIntensity={5} flatShading />
      </mesh>
      <pointLight position={[0, 8, 0]} color="#ff4400" intensity={15} distance={40} />
      {/* Smoke */}
      <Sparkles count={50} scale={5} size={6} speed={0.2} color="#444444" position={[0, 9, 0]} />
    </group>
  );
}

function Wilderness() {
  return (
    <group>
      {/* Grass Ground (Like Lumbridge) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#3a7d44" roughness={1} flatShading />
      </mesh>
      
      {/* Big Volcano with Red/Orange Lava */}
      <group position={[0, 0, -20]}>
        <mesh>
          <coneGeometry args={[15, 20, 8]} />
          <meshStandardMaterial color="#2a2a2a" flatShading />
        </mesh>
        {/* Crater Lava */}
        <mesh position={[0, 10, 0]}>
          <cylinderGeometry args={[4, 4, 0.5, 8]} />
          <meshStandardMaterial color="#ff4400" emissive="#ff4400" emissiveIntensity={10} />
        </mesh>
        {/* Lava Flows */}
        {[...Array(4)].map((_, i) => (
          <mesh key={`lava-${i}`} position={[Math.sin(i * Math.PI / 2) * 5, 5, Math.cos(i * Math.PI / 2) * 5]} rotation={[0.5, i * Math.PI / 2, 0]}>
            <boxGeometry args={[1, 12, 0.2]} />
            <meshStandardMaterial color="#ff6600" emissive="#ff4400" emissiveIntensity={5} />
          </mesh>
        ))}
        <pointLight position={[0, 12, 0]} color="#ff4400" intensity={20} distance={50} />
        <Sparkles count={100} scale={10} size={8} speed={0.5} color="#ff4400" position={[0, 12, 0]} />
      </group>

      {/* Sprites in Wildy */}
      {[...Array(8)].map((_, i) => (
        <Goblin key={`wildy-goblin-${i}`} position={[Math.random() * 40 - 20, 0, Math.random() * 40 - 20]} />
      ))}
      {[...Array(5)].map((_, i) => (
        <Scorpion key={`wildy-scorpion-${i}`} position={[Math.random() * 30 - 15, -0.4, Math.random() * 30 - 15]} />
      ))}

      {/* Gnarled Dead Trees */}
      {[...Array(30)].map((_, i) => (
        <DeadTree key={i} position={[Math.random() * 80 - 40, 0, Math.random() * 80 - 40]} />
      ))}

      {/* Bone Piles */}
      {[...Array(15)].map((_, i) => (
        <mesh key={`bone-${i}`} position={[Math.random() * 40 - 20, -0.4, Math.random() * 40 - 20]}>
          <sphereGeometry args={[0.2, 4, 4]} />
          <meshStandardMaterial color="#eeeeee" flatShading />
        </mesh>
      ))}

      {/* Rocks */}
      {[...Array(20)].map((_, i) => (
        <mesh key={`rock-${i}`} position={[Math.random() * 60 - 30, -0.4, Math.random() * 60 - 30]}>
          <dodecahedronGeometry args={[0.5 + Math.random()]} />
          <meshStandardMaterial color="#333333" flatShading />
        </mesh>
      ))}

      <Sparkles count={100} scale={30} size={2} speed={0.5} color="#4b0082" />
    </group>
  );
}

function AlKharid() {
  return (
    <group>
      {/* Sand Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#d4a373" roughness={1} flatShading />
      </mesh>

      {/* Dunes */}
      {[...Array(12)].map((_, i) => (
        <mesh key={i} position={[Math.random() * 60 - 30, -1, Math.random() * 60 - 30]}>
          <sphereGeometry args={[5 + Math.random() * 5, 8, 8]} />
          <meshStandardMaterial color="#bc8a5f" flatShading />
        </mesh>
      ))}

      {/* Cacti */}
      {[...Array(20)].map((_, i) => (
        <group key={`cactus-${i}`} position={[Math.random() * 50 - 25, 0, Math.random() * 50 - 25]}>
          <mesh position={[0, 1, 0]}>
            <cylinderGeometry args={[0.2, 0.2, 2, 6]} />
            <meshStandardMaterial color="#2d5a27" flatShading />
          </mesh>
          <mesh position={[0.3, 1.2, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.1, 0.1, 0.6, 6]} />
            <meshStandardMaterial color="#2d5a27" flatShading />
          </mesh>
        </group>
      ))}

      {/* Sandstone Gate */}
      <group position={[0, 0, -10]}>
        <mesh position={[-3, 3, 0]}>
          <boxGeometry args={[1, 6, 1]} />
          <meshStandardMaterial color="#a67c52" flatShading />
        </mesh>
        <mesh position={[3, 3, 0]}>
          <boxGeometry args={[1, 6, 1]} />
          <meshStandardMaterial color="#a67c52" flatShading />
        </mesh>
        <mesh position={[0, 6, 0]}>
          <boxGeometry args={[7, 1, 1]} />
          <meshStandardMaterial color="#a67c52" flatShading />
        </mesh>
      </group>

      {/* Scorpions - More prominent */}
      {[...Array(15)].map((_, i) => (
        <Scorpion key={`scorpion-${i}`} position={[Math.random() * 30 - 15, -0.4, Math.random() * 30 - 15]} />
      ))}

      {/* Miners */}
      {[...Array(5)].map((_, i) => (
        <Miner key={`miner-${i}`} position={[Math.random() * 30 - 15, 0, Math.random() * 30 - 15]} />
      ))}

      <pointLight position={[10, 15, 10]} color="#ffcc00" intensity={4} />
      <Environment preset="sunset" />
    </group>
  );
}

function Windmill() {
  const sailsRef = useRef<THREE.Group>(null);
  useFrame((state, delta) => {
    if (sailsRef.current) {
      sailsRef.current.rotation.z += delta * 0.5;
    }
  });

  return (
    <group position={[-15, 0, -5]}>
      {/* Base */}
      <mesh position={[0, 3, 0]}>
        <cylinderGeometry args={[2, 3, 6, 6]} />
        <meshStandardMaterial color="#d7ccc8" flatShading />
      </mesh>
      {/* Cap */}
      <mesh position={[0, 6.5, 0]}>
        <coneGeometry args={[2.5, 2, 6]} />
        <meshStandardMaterial color="#5d4037" flatShading />
      </mesh>
      {/* Sails */}
      <group ref={sailsRef} position={[0, 5, 2.2]}>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} rotation={[0, 0, (i * Math.PI) / 2]} position={[0, 2, 0]}>
            <boxGeometry args={[0.5, 4, 0.1]} />
            <meshStandardMaterial color="#ffffff" flatShading />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function Birds() {
  const birdsRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (birdsRef.current) {
      birdsRef.current.rotation.y += 0.005;
      birdsRef.current.children.forEach((bird, i) => {
        bird.position.y = Math.sin(state.clock.elapsedTime + i) * 0.5;
      });
    }
  });

  return (
    <group ref={birdsRef}>
      {[...Array(5)].map((_, i) => (
        <mesh key={i} position={[10 + Math.random() * 5, 8, Math.random() * 10 - 5]}>
          <boxGeometry args={[0.2, 0.05, 0.4]} />
          <meshStandardMaterial color="#000000" flatShading />
        </mesh>
      ))}
    </group>
  );
}

function Lumbridge() {
  return (
    <group>
      {/* Grass Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#3a7d44" roughness={1} flatShading />
      </mesh>

      {/* River */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.45, 0]}>
        <planeGeometry args={[10, 100]} />
        <meshStandardMaterial color="#1e90ff" transparent opacity={0.6} flatShading />
      </mesh>

      {/* Bridge */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[12, 0.5, 6]} />
        <meshStandardMaterial color="#5d4037" flatShading />
      </mesh>

      <Windmill />
      <Birds />

      {/* Castle */}
      <group position={[0, 0, -20]}>
        {/* Main Keep */}
        <mesh position={[0, 4, 0]}>
          <boxGeometry args={[10, 8, 10]} />
          <meshStandardMaterial color="#757575" flatShading />
        </mesh>
        {/* Battlements */}
        {[...Array(4)].map((_, i) => (
          <mesh key={i} position={[i % 2 === 0 ? -4.5 : 4.5, 8.5, i < 2 ? -4.5 : 4.5]}>
            <boxGeometry args={[2, 2, 2]} />
            <meshStandardMaterial color="#616161" flatShading />
          </mesh>
        ))}
        {/* Towers */}
        <mesh position={[-6, 6, -6]}>
          <cylinderGeometry args={[2, 2, 12, 6]} />
          <meshStandardMaterial color="#616161" flatShading />
        </mesh>
        <mesh position={[6, 6, -6]}>
          <cylinderGeometry args={[2, 2, 12, 6]} />
          <meshStandardMaterial color="#616161" flatShading />
        </mesh>
      </group>

      {/* Trees */}
      {[...Array(25)].map((_, i) => (
        <group key={`tree-${i}`} position={[Math.random() * 60 - 30, 0, Math.random() * 60 - 30]}>
          <mesh position={[0, 1, 0]}>
            <cylinderGeometry args={[0.1, 0.2, 2, 5]} />
            <meshStandardMaterial color="#5d4037" flatShading />
          </mesh>
          <mesh position={[0, 2.5, 0]}>
            <coneGeometry args={[1.5, 3, 6]} />
            <meshStandardMaterial color="#2d5a27" flatShading />
          </mesh>
        </group>
      ))}

      {/* Goblins */}
      {[...Array(10)].map((_, i) => (
        <Goblin key={`goblin-${i}`} position={[Math.random() * 40 - 20, 0, Math.random() * 40 - 20]} />
      ))}

      {/* Woodcutters */}
      {[...Array(5)].map((_, i) => (
        <Woodcutter key={`woodcutter-${i}`} position={[Math.random() * 30 - 15, 0, Math.random() * 30 - 15]} />
      ))}

      <Sparkles count={150} scale={40} size={1} speed={0.2} color="#ffffff" />
      <directionalLight position={[10, 20, 10]} intensity={1.5} color="#ffffff" />
    </group>
  );
}

function Varrock() {
  return (
    <group>
      {/* Stone Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#3a3a3a" roughness={1} flatShading />
      </mesh>

      {/* Central Gate */}
      <group position={[0, 0, -10]}>
        <mesh position={[-5, 5, 0]}>
          <boxGeometry args={[2, 10, 2]} />
          <meshStandardMaterial color="#555555" flatShading />
        </mesh>
        <mesh position={[5, 5, 0]}>
          <boxGeometry args={[2, 10, 2]} />
          <meshStandardMaterial color="#555555" flatShading />
        </mesh>
        <mesh position={[0, 10, 0]}>
          <boxGeometry args={[12, 2, 2]} />
          <meshStandardMaterial color="#555555" flatShading />
        </mesh>
      </group>

      {/* Buildings */}
      {[...Array(15)].map((_, i) => {
        const x = (i % 5) * 15 - 30;
        const z = Math.floor(i / 5) * 15 - 30;
        return (
          <group key={`building-${i}`} position={[x, 4, z]}>
            {/* Main body */}
            <mesh>
              <boxGeometry args={[6, 8 + Math.random() * 4, 6]} />
              <meshStandardMaterial color="#4a4a4a" flatShading />
            </mesh>
            {/* Roof */}
            <mesh position={[0, 5, 0]}>
              <coneGeometry args={[4.5, 3, 4]} />
              <meshStandardMaterial color="#333333" flatShading />
            </mesh>
            {/* Windows */}
            <mesh position={[0, 1, 3.1]}>
              <boxGeometry args={[1, 1.5, 0.1]} />
              <meshStandardMaterial color="#111111" />
            </mesh>
          </group>
        );
      })}

      {/* Fountain */}
      <group position={[0, 0, 10]}>
        <mesh position={[0, 0.2, 0]}>
          <cylinderGeometry args={[4, 4, 0.5, 8]} />
          <meshStandardMaterial color="#424242" flatShading />
        </mesh>
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[3.5, 3.5, 0.1, 8]} />
          <meshStandardMaterial color="#1e90ff" emissive="#1e90ff" emissiveIntensity={0.5} flatShading />
        </mesh>
        <mesh position={[0, 1, 0]}>
          <cylinderGeometry args={[0.5, 0.5, 2, 6]} />
          <meshStandardMaterial color="#424242" flatShading />
        </mesh>
      </group>

      {/* Torches */}
      {[...Array(8)].map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const x = Math.cos(angle) * 10;
        const z = Math.sin(angle) * 10;
        return (
          <group key={`torch-${i}`} position={[x, 0, z]}>
            <mesh position={[0, 1, 0]}>
              <cylinderGeometry args={[0.05, 0.05, 2, 4]} />
              <meshStandardMaterial color="#3e2723" flatShading />
            </mesh>
            <mesh position={[0, 2.1, 0]}>
              <sphereGeometry args={[0.2, 4, 4]} />
              <meshStandardMaterial color="#ff4400" emissive="#ff4400" emissiveIntensity={2} />
            </mesh>
            <pointLight position={[0, 2.2, 0]} color="#ff4400" intensity={3} distance={8} />
          </group>
        );
      })}

      {/* City Walls */}
      {[...Array(10)].map((_, i) => (
        <mesh key={`wall-${i}`} position={[i * 6 - 25, 3, -15]}>
          <boxGeometry args={[5.5, 6, 2]} />
          <meshStandardMaterial color="#424242" flatShading />
        </mesh>
      ))}

      <Sparkles count={60} scale={25} size={2} speed={0.4} color="#ffaa00" />
      <pointLight position={[0, 10, 0]} color="#ffffff" intensity={0.5} />
    </group>
  );
}

function FinalScene() {
  return (
    <group>
      {/* Stone Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#2a2a2a" roughness={1} flatShading />
      </mesh>

      {/* OSRS Style Login Screen Pillars */}
      <group position={[0, 0, -5]}>
        {/* Left Pillar */}
        <group position={[-6, 0, 0]}>
          <mesh position={[0, 4, 0]}>
            <boxGeometry args={[1.5, 8, 1.5]} />
            <meshStandardMaterial color="#444444" flatShading />
          </mesh>
          <mesh position={[0, 8.2, 0]}>
            <boxGeometry args={[2, 0.5, 2]} />
            <meshStandardMaterial color="#333333" flatShading />
          </mesh>
          {/* Fire */}
          <mesh position={[0, 8.8, 0]}>
            <sphereGeometry args={[0.4, 8, 8]} />
            <meshStandardMaterial color="#ff4400" emissive="#ff4400" emissiveIntensity={5} />
          </mesh>
          <pointLight position={[0, 9, 0]} color="#ff4400" intensity={10} distance={15} />
          <Sparkles count={30} scale={1} size={4} speed={0.5} color="#ff4400" position={[0, 9, 0]} />
        </group>

        {/* Right Pillar */}
        <group position={[6, 0, 0]}>
          <mesh position={[0, 4, 0]}>
            <boxGeometry args={[1.5, 8, 1.5]} />
            <meshStandardMaterial color="#444444" flatShading />
          </mesh>
          <mesh position={[0, 8.2, 0]}>
            <boxGeometry args={[2, 0.5, 2]} />
            <meshStandardMaterial color="#333333" flatShading />
          </mesh>
          {/* Fire */}
          <mesh position={[0, 8.8, 0]}>
            <sphereGeometry args={[0.4, 8, 8]} />
            <meshStandardMaterial color="#ff4400" emissive="#ff4400" emissiveIntensity={5} />
          </mesh>
          <pointLight position={[0, 9, 0]} color="#ff4400" intensity={10} distance={15} />
          <Sparkles count={30} scale={1} size={4} speed={0.5} color="#ff4400" position={[0, 9, 0]} />
        </group>

        {/* Archway */}
        <mesh position={[0, 8.5, 0]}>
          <boxGeometry args={[14, 1, 1.5]} />
          <meshStandardMaterial color="#333333" flatShading />
        </mesh>
      </group>

      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
    </group>
  );
}

// --- Scene Manager ---

function SceneManager({ sceneIndex }: SceneProps) {
  return (
    <AnimatePresence mode="wait">
      <group key={sceneIndex}>
        {sceneIndex === 0 && <Wilderness />}
        {sceneIndex === 1 && <AlKharid />}
        {sceneIndex === 2 && <Lumbridge />}
        {sceneIndex === 3 && <FinalScene />}
      </group>
    </AnimatePresence>
  );
}

// --- Camera Rig ---

function CameraRig({ sceneIndex }: SceneProps) {
  const { camera } = useThree();
  
  const targets = useMemo(() => [
    { pos: [0, 4, 15], look: [0, 0, -10] },    // Wilderness
    { pos: [15, 6, 15], look: [-5, 0, -5] },   // Al Kharid
    { pos: [0, 5, 20], look: [0, 5, -10] },    // Lumbridge
    { pos: [0, 0, 8], look: [0, 0, 0] }        // Final
  ], []);

  useFrame((state) => {
    const target = targets[sceneIndex] || targets[0];
    
    state.camera.position.lerp(new THREE.Vector3(...target.pos), 0.015);
    
    const currentLookAt = new THREE.Vector3(...target.look);
    state.camera.lookAt(currentLookAt);
  });

  return null;
}

// --- Main Component ---

export default function CinematicIntro({ onComplete }: { onComplete: (useMusic: boolean) => void }) {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [text, setText] = useState("");
  const [isFinished, setIsFinished] = useState(false);
  const [showMusicPrompt, setShowMusicPrompt] = useState(false);

  const scenes = useMemo(() => [
    { text: "Beyond the burning sands of Al Kharid...", duration: 6000 },
    { text: "Past the quiet fields of Lumbridge...", duration: 6000 },
    { text: "Deep in the wilderness, where fire meets earth...", duration: 6000 },
    { text: "Legends foretold of 1 man who would dec1de the fate of the universe...", duration: 6000 },
    { text: "His name was...", duration: 3000 },
    { text: "Dec1der.", duration: 4000 }
  ], []);

  useEffect(() => {
    let i = 0;
    let timeout: NodeJS.Timeout;

    const run = async () => {
      if (i < scenes.length) {
        const currentText = scenes[i].text;
        setText(currentText);
        
        // Play AI Voice for the current text
        playAIVoice(currentText);
        
        // Map text index to visual scene index
        if (i === 0) setSceneIndex(1); // Al Kharid
        else if (i === 1) setSceneIndex(2); // Lumbridge
        else if (i === 2) setSceneIndex(0); // Wilderness
        else setSceneIndex(3); // Final

        timeout = setTimeout(() => {
          i++;
          run();
        }, scenes[i].duration);
      } else {
        setShowMusicPrompt(true);
      }
    };

    run();
    return () => clearTimeout(timeout);
  }, [scenes]);

  const handleMusicChoice = (choice: boolean) => {
    setIsFinished(true);
    setTimeout(() => onComplete(choice), 1000);
  };

  const handleSkip = () => {
    setIsFinished(true);
    onComplete(true);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: isFinished ? 0 : 1 }}
      className="fixed inset-0 z-[100] bg-black"
    >
      <Canvas camera={{ position: [0, 10, 20], fov: 50 }}>
        <color attach="background" args={["#000000"]} />
        <fog attach="fog" args={["#000000", 5, 45]} />
        
        <ambientLight intensity={0.2} />
        <CameraRig sceneIndex={sceneIndex} />
        <SceneManager sceneIndex={sceneIndex} />
      </Canvas>

      {/* TEXT OVERLAY */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-6">
        <AnimatePresence mode="wait">
          {!showMusicPrompt ? (
            <motion.h2
              key={text}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className={`text-3xl md:text-5xl font-serif text-amber-100 text-center tracking-widest drop-shadow-[0_0_15px_rgba(251,191,36,0.5)] ${
                text === "Dec1der." ? "text-6xl md:text-8xl font-black uppercase" : ""
              }`}
            >
              {text}
            </motion.h2>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-8 pointer-events-auto"
            >
              <h2 className="text-3xl md:text-5xl font-serif text-amber-100 text-center tracking-widest drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]">
                And now you must dec1de...<br />Do you like music?
              </h2>
              <div className="flex gap-6">
                <button 
                  onClick={() => handleMusicChoice(true)}
                  className="px-8 py-3 bg-amber-100 text-black font-bold rounded-full hover:bg-white transition-all scale-110"
                >
                  YES
                </button>
                <button 
                  onClick={() => handleMusicChoice(false)}
                  className="px-8 py-3 border-2 border-amber-100 text-amber-100 font-bold rounded-full hover:bg-amber-100/10 transition-all"
                >
                  NO
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* SKIP BUTTON */}
      <button 
        onClick={handleSkip}
        className="absolute bottom-10 right-10 text-white/30 hover:text-white/80 text-xs uppercase tracking-[0.3em] transition-all border border-white/10 hover:border-white/40 px-4 py-2 rounded-full backdrop-blur-sm"
      >
        Skip Intro
      </button>

      {/* VIGNETTE */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,1)]" />

      {/* YOUTUBE BACKGROUND AUDIO (HIDDEN) */}
      <div className="fixed -top-[1000px] left-0 opacity-0 pointer-events-none">
        <iframe
          width="560"
          height="315"
          src="https://www.youtube.com/embed/kFTDohuCFic?autoplay=1&mute=0&controls=0&loop=1&playlist=kFTDohuCFic"
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        ></iframe>
      </div>
    </motion.div>
  );
}
