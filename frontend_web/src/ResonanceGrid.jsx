import React, { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Points, PointMaterial, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// Mood color mappings
const MOOD_COLORS = {
    happy: '#FFD700',      // Gold - joy
    excited: '#FF6B35',    // Orange - high energy
    energetic: '#00FF88',  // Neon green - vitality
    calm: '#4ECDC4',       // Teal - peace
    neutral: '#A0A0FF',    // Soft purple - balance
    sad: '#5C7AEA',        // Blue - melancholy
    anxious: '#9B59B6',    // Purple - worry
    angry: '#FF4757',      // Red - rage
    depressed: '#2C3E50', // Dark blue - low energy
    default: '#FFFFFF'
};

// Particle count
const PARTICLE_COUNT = 3000;

// Custom shader for glowing particles
const vertexShader = `
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uSize;
  
  attribute float aScale;
  attribute vec3 aColor;
  attribute float aRandom;
  
  varying vec3 vColor;
  varying float vAlpha;
  
  void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    
    // Add subtle floating motion
    modelPosition.y += sin(uTime * 0.5 + aRandom * 10.0) * 0.1;
    modelPosition.x += cos(uTime * 0.3 + aRandom * 10.0) * 0.1;
    modelPosition.z += sin(uTime * 0.4 + aRandom * 10.0) * 0.1;
    
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    
    gl_Position = projectedPosition;
    
    // Size attenuation
    gl_PointSize = uSize * uPixelRatio * aScale * (1.0 / -viewPosition.z);
    
    vColor = aColor;
    vAlpha = 0.6 + 0.4 * sin(uTime * 2.0 + aRandom * 6.28);
  }
`;

const fragmentShader = `
  varying vec3 vColor;
  varying float vAlpha;
  
  void main() {
    // Create circular particle with soft glow
    float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
    float strength = 0.05 / distanceToCenter - 0.1;
    
    if (strength < 0.0) discard;
    
    gl_FragColor = vec4(vColor, strength * vAlpha);
  }
`;

function Particles({ moodPulse, activeMood }) {
    const points = useRef();
    const { viewport } = useThree();

    // Generate particle positions and attributes
    const { positions, scales, colors, randoms, originalPositions } = useMemo(() => {
        const positions = new Float32Array(PARTICLE_COUNT * 3);
        const originalPositions = new Float32Array(PARTICLE_COUNT * 3);
        const scales = new Float32Array(PARTICLE_COUNT);
        const colors = new Float32Array(PARTICLE_COUNT * 3);
        const randoms = new Float32Array(PARTICLE_COUNT);

        const color = new THREE.Color(MOOD_COLORS.default);

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            // Spread particles in a sphere
            const radius = 2 + Math.random() * 3;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            const x = radius * Math.sin(phi) * Math.cos(theta);
            const y = radius * Math.sin(phi) * Math.sin(theta);
            const z = radius * Math.cos(phi);

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;

            originalPositions[i * 3] = x;
            originalPositions[i * 3 + 1] = y;
            originalPositions[i * 3 + 2] = z;

            // Random scales for variety
            scales[i] = Math.random();
            randoms[i] = Math.random();

            // Default white/purple color
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }

        return { positions, scales, colors, randoms, originalPositions };
    }, []);

    // Uniforms for shader
    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        uSize: { value: 150 }
    }), []);

    // Update colors based on mood pulse
    useEffect(() => {
        if (moodPulse && activeMood) {
            const moodColor = new THREE.Color(MOOD_COLORS[activeMood] || MOOD_COLORS.default);

            // Pulse a subset of particles
            for (let i = 0; i < PARTICLE_COUNT; i++) {
                if (Math.random() < 0.3) { // 30% of particles pulse
                    colors[i * 3] = moodColor.r;
                    colors[i * 3 + 1] = moodColor.g;
                    colors[i * 3 + 2] = moodColor.b;
                }
            }

            // Reset after pulse
            setTimeout(() => {
                const defaultColor = new THREE.Color(MOOD_COLORS.default);
                for (let i = 0; i < PARTICLE_COUNT; i++) {
                    colors[i * 3] = defaultColor.r;
                    colors[i * 3 + 1] = defaultColor.g;
                    colors[i * 3 + 2] = defaultColor.b;
                }
            }, 2000);
        }
    }, [moodPulse, activeMood, colors]);

    useFrame((state) => {
        const time = state.clock.getElapsedTime();

        // Update uniforms
        if (points.current) {
            points.current.material.uniforms.uTime.value = time;
        }

        // Gentle rotation
        if (points.current) {
            points.current.rotation.y = time * 0.05;
            points.current.rotation.x = time * 0.02;
        }
    });

    return (
        <points ref={points}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={PARTICLE_COUNT}
                    array={positions}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-aColor"
                    count={PARTICLE_COUNT}
                    array={colors}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-aScale"
                    count={PARTICLE_COUNT}
                    array={scales}
                    itemSize={1}
                />
                <bufferAttribute
                    attach="attributes-aRandom"
                    count={PARTICLE_COUNT}
                    array={randoms}
                    itemSize={1}
                />
            </bufferGeometry>
            <shaderMaterial
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
                transparent
            />
        </points>
    );
}

// Pulsing sphere in center
function Core({ activeMood }) {
    const meshRef = useRef();
    const [pulse, setPulse] = useState(false);

    useEffect(() => {
        if (activeMood) {
            setPulse(true);
            setTimeout(() => setPulse(false), 1000);
        }
    }, [activeMood]);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.5;
            meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.3;
        }
    });

    const color = MOOD_COLORS[activeMood] || MOOD_COLORS.default;

    return (
        <mesh ref={meshRef}>
            <icosahedronGeometry args={[0.5, 2]} />
            <meshBasicMaterial
                color={color}
                wireframe
                transparent
                opacity={0.6}
            />
        </mesh>
    );
}

// Connection lines between particles
function Connections({ activeMood }) {
    const lineRef = useRef();

    useFrame((state) => {
        if (lineRef.current) {
            lineRef.current.rotation.y = state.clock.getElapsedTime() * 0.1;
        }
    });

    return null; // Optional: Add connection lines if performance allows
}

// Main scene component
function Scene({ moodPulse, activeMood }) {
    return (
        <>
            <ambientLight intensity={0.1} />
            <Particles moodPulse={moodPulse} activeMood={activeMood} />
            <Core activeMood={activeMood} />
            <OrbitControls
                enableZoom={false}
                enablePan={false}
                autoRotate
                autoRotateSpeed={0.5}
                maxPolarAngle={Math.PI / 1.5}
                minPolarAngle={Math.PI / 3}
            />
        </>
    );
}

// Main ResonanceGrid component
export const ResonanceGrid = () => {
    const [moodPulse, setMoodPulse] = useState(false);
    const [activeMood, setActiveMood] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const wsRef = useRef(null);

    // WebSocket connection
    useEffect(() => {
        const connectWebSocket = () => {
            // Connect to your WebSocket server
            // Using localhost for development - change to your production URL
            const wsUrl = `ws://${window.location.host}/ws/mood/`;

            try {
                wsRef.current = new WebSocket(wsUrl);

                wsRef.current.onopen = () => {
                    console.log('WebSocket connected');
                    setIsConnected(true);
                };

                wsRef.current.onclose = () => {
                    console.log('WebSocket disconnected');
                    setIsConnected(false);
                    // Reconnect after 3 seconds
                    setTimeout(connectWebSocket, 3000);
                };

                wsRef.current.onerror = (error) => {
                    console.error('WebSocket error:', error);
                };

                wsRef.current.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        console.log('Received mood data:', data);

                        if (data.mood_type) {
                            setActiveMood(data.mood_type);
                            setMoodPulse(true);
                            setTimeout(() => setMoodPulse(false), 2000);
                        }
                    } catch (e) {
                        console.error('Error parsing WebSocket message:', e);
                    }
                };
            } catch (error) {
                console.error('Failed to connect WebSocket:', error);
                setTimeout(connectWebSocket, 3000);
            }
        };

        connectWebSocket();

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, []);

    // Demo mode - simulate mood pulses
    const [demoMode, setDemoMode] = useState(true);

    useEffect(() => {
        if (demoMode) {
            const moods = ['happy', 'calm', 'anxious', 'sad', 'energetic', 'angry'];
            const interval = setInterval(() => {
                const randomMood = moods[Math.floor(Math.random() * moods.length)];
                setActiveMood(randomMood);
                setMoodPulse(true);
                setTimeout(() => setMoodPulse(false), 2000);
            }, 4000);

            return () => clearInterval(interval);
        }
    }, [demoMode]);

    return (
        <div className="fixed inset-0 bg-black z-50">
            {/* Canvas */}
            <Canvas
                camera={{ position: [0, 0, 6], fov: 75 }}
                dpr={[1, 2]}
                gl={{ antialias: true, alpha: true }}
            >
                <color attach="background" args={['#050508']} />
                <fog attach="fog" args={['#050508', 5, 15]} />
                <Scene moodPulse={moodPulse} activeMood={activeMood} />
            </Canvas>

            {/* UI Overlay */}
            <div className="absolute top-6 left-6 text-white/70 font-mono text-sm">
                <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                    <span>{isConnected ? 'NEURAL LINK ACTIVE' : 'CONNECTING...'}</span>
                </div>
                {activeMood && (
                    <div className="mt-4">
                        <span className="text-xs text-white/50">DETECTED RESONANCE:</span>
                        <div
                            className="text-2xl font-bold mt-1"
                            style={{ color: MOOD_COLORS[activeMood] || '#fff' }}
                        >
                            {activeMood.toUpperCase()}
                        </div>
                    </div>
                )}
            </div>

            {/* Legend */}
            <div className="absolute bottom-6 left-6 flex flex-wrap gap-3 max-w-md">
                {Object.entries(MOOD_COLORS).filter(([key]) => key !== 'default').map(([mood, color]) => (
                    <div
                        key={mood}
                        className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10"
                    >
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{
                                backgroundColor: color,
                                boxShadow: `0 0 10px ${color}40`
                            }}
                        />
                        <span className="text-xs text-white/60 capitalize">{mood}</span>
                    </div>
                ))}
            </div>

            {/* Title */}
            <div className="absolute top-6 right-6 text-right">
                <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 tracking-tighter">
                    ANONYMOUS
                </h1>
                <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 tracking-tighter">
                    RESONANCE
                </h1>
                <p className="text-xs text-white/30 mt-2 tracking-[0.3em]">REAL-TIME MOOD VISUALIZATION</p>
            </div>

            {/* Demo Toggle */}
            <button
                onClick={() => setDemoMode(!demoMode)}
                className="absolute bottom-6 right-6 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white/60 text-xs hover:bg-white/20 transition-colors"
            >
                {demoMode ? 'EXIT DEMO' : 'ENTER DEMO'}
            </button>
        </div>
    );
};

export default ResonanceGrid;
