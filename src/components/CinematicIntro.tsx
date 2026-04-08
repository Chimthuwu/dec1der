import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState, useMemo } from "react";
import * as THREE from "three";
import { motion, AnimatePresence } from "motion/react";
import { Stars, Float, Text, Environment, Sparkles } from "@react-three/drei";

// --- Types ---
interface SceneProps {
  sceneIndex: number;
}

// --- Environments ---

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
      {/* Dark Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#0a0a0a" roughness={1} flatShading />
      </mesh>
      
      {/* Volcanoes */}
      <Volcano position={[30, 0, -30]} />
      <Volcano position={[-40, 0, -20]} />

      {/* Gnarled Dead Trees */}
      {[...Array(50)].map((_, i) => (
        <DeadTree key={i} position={[Math.random() * 80 - 40, 0, Math.random() * 80 - 40]} />
      ))}

      {/* Pulsing Rune Symbols */}
      {[...Array(15)].map((_, i) => (
        <RuneSymbol key={`rune-${i}`} position={[Math.random() * 50 - 25, -0.48, Math.random() * 50 - 25]} />
      ))}

      {/* Bone Piles */}
      {[...Array(15)].map((_, i) => (
        <mesh key={`bone-${i}`} position={[Math.random() * 40 - 20, -0.4, Math.random() * 40 - 20]}>
          <sphereGeometry args={[0.2, 4, 4]} />
          <meshStandardMaterial color="#eeeeee" flatShading />
        </mesh>
      ))}

      {/* Dark Altar */}
      <group position={[0, 0, -5]}>
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[2, 1, 2]} />
          <meshStandardMaterial color="#2a2a2a" flatShading />
        </mesh>
        <mesh position={[0, 1.1, 0]}>
          <boxGeometry args={[1.8, 0.1, 1.8]} />
          <meshStandardMaterial color="#8a2be2" emissive="#8a2be2" emissiveIntensity={2} />
        </mesh>
        <pointLight position={[0, 2, 0]} color="#8a2be2" intensity={5} distance={10} />
      </group>

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
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <mesh>
          <torusKnotGeometry args={[1.5, 0.4, 128, 16]} />
          <meshStandardMaterial 
            color="#ffaa00" 
            emissive="#ffaa00" 
            emissiveIntensity={2} 
            metalness={1} 
            roughness={0} 
          />
        </mesh>
      </Float>
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <pointLight position={[0, 0, 0]} color="#ffaa00" intensity={5} distance={20} />
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
        {sceneIndex === 3 && <Varrock />}
        {sceneIndex === 4 && <FinalScene />}
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
    { pos: [-10, 8, 15], look: [5, 0, -5] },   // Varrock
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

export default function CinematicIntro({ onComplete }: { onComplete: () => void }) {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [text, setText] = useState("");
  const [isFinished, setIsFinished] = useState(false);

  const scenes = useMemo(() => [
    { text: "Deep in the wilderness...", duration: 6000 },
    { text: "Beyond the burning sands of Al Kharid...", duration: 6000 },
    { text: "Past the quiet fields of Lumbridge...", duration: 6000 },
    { text: "Through the shadows of Varrock...", duration: 6000 },
    { text: "And in that moment...", duration: 3000 },
    { text: "A decision was made.", duration: 4000 }
  ], []);

  useEffect(() => {
    let i = 0;
    let timeout: NodeJS.Timeout;

    const run = async () => {
      if (i < scenes.length) {
        setText(scenes[i].text);
        
        // Map text index to visual scene index
        if (i < 4) setSceneIndex(i);
        else setSceneIndex(4);

        timeout = setTimeout(() => {
          i++;
          run();
        }, scenes[i].duration);
      } else {
        setIsFinished(true);
        setTimeout(onComplete, 1000);
      }
    };

    run();
    return () => clearTimeout(timeout);
  }, [scenes, onComplete]);

  const handleSkip = () => {
    setIsFinished(true);
    onComplete();
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
          <motion.h2
            key={text}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className={`text-3xl md:text-5xl font-serif text-amber-100 text-center tracking-widest drop-shadow-[0_0_15px_rgba(251,191,36,0.5)] ${
              text === "A decision was made." ? "text-6xl md:text-8xl font-black uppercase" : ""
            }`}
          >
            {text}
          </motion.h2>
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
    </motion.div>
  );
}
