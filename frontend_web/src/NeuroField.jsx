import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Mood color mappings - expanded palette
const MOOD_COLORS = {
    happy: '#FFD700',        // Gold - joy
    excited: '#FF6B35',      // Orange - high energy
    energetic: '#00FF88',    // Neon green - vitality
    calm: '#4ECDC4',         // Teal - peace
    neutral: '#A0A0FF',      // Soft purple - balance
    sad: '#5C7AEA',          // Blue - melancholy
    anxious: '#9B59B6',      // Purple - worry
    angry: '#FF4757',         // Red - rage
    depressed: '#2C3E50',    // Dark blue - low energy
    default: '#6366F1'       // Indigo - default
};

// Particle configuration
const PARTICLE_COUNT = 1500;

// Custom shader for glowing particles with neuro-field effect
const vertexShader = `
    uniform float uTime;
    uniform float uPixelRatio;
    uniform float uSize;
    uniform vec3 uMoodColor;
    uniform float uMoodIntensity;
    
    attribute float aScale;
    attribute vec3 aColor;
    attribute float aRandom;
    attribute float aSpeed;
    
    varying vec3 vColor;
    varying float vAlpha;
    
    // Simplex noise function
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
    
    float snoise(vec3 v) {
        const vec2 C = vec2(1.0/6.0, 1.0/3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
        
        vec3 i  = floor(v + dot(v, C.yyy));
        vec3 x0 = v - i + dot(i, C.xxx);
        
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min(g.xyz, l.zxy);
        vec3 i2 = max(g.xyz, l.zxy);
        
        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy;
        vec3 x3 = x0 - D.yyy;
        
        i = mod289(i);
        vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));
        
        float n_ = 0.142857142857;
        vec3 ns = n_ * D.wyz - D.xzx;
        
        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
        
        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_);
        
        vec4 x = x_ *ns.x + ns.yyyy;
        vec4 y = y_ *ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);
        
        vec4 b0 = vec4(x.xy, y.xy);
        vec4 b1 = vec4(x.zw, y.zw);
        
        vec4 s0 = floor(b0)*2.0 + 1.0;
        vec4 s1 = floor(b1)*2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));
        
        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
        vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
        
        vec3 p0 = vec3(a0.xy, h.x);
        vec3 p1 = vec3(a0.zw, h.y);
        vec3 p2 = vec3(a1.xy, h.z);
        vec3 p3 = vec3(a1.zw, h.w);
        
        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;
        
        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
    }
    
    void main() {
        vec4 modelPosition = modelMatrix * vec4(position, 1.0);
        
        // Neuro-field wave effect
        float noiseVal = snoise(vec3(modelPosition.x * 0.5, modelPosition.y * 0.5, uTime * 0.2));
        float wave = sin(uTime * 0.5 + aRandom * 6.28) * 0.15;
        
        modelPosition.y += wave + noiseVal * 0.1 * aSpeed;
        modelPosition.x += cos(uTime * 0.3 + aRandom * 10.0) * 0.05;
        modelPosition.z += sin(uTime * 0.4 + aRandom * 10.0) * 0.05;
        
        vec4 viewPosition = viewMatrix * modelPosition;
        vec4 projectedPosition = projectionMatrix * viewPosition;
        
        gl_Position = projectedPosition;
        
        // Size with mood influence
        float moodSize = 1.0 + uMoodIntensity * 0.5;
        gl_PointSize = uSize * uPixelRatio * aScale * moodSize * (1.0 / -viewPosition.z);
        
        // Blend default color with mood color
        vec3 finalColor = mix(aColor, uMoodColor, uMoodIntensity * 0.6);
        vColor = finalColor;
        
        // Pulsing alpha
        vAlpha = 0.4 + 0.3 * sin(uTime * 1.5 + aRandom * 6.28);
    }
`;

const fragmentShader = `
    varying vec3 vColor;
    varying float vAlpha;
    
    void main() {
        float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
        float strength = 0.08 / distanceToCenter - 0.15;
        
        if (strength < 0.0) discard;
        
        gl_FragColor = vec4(vColor, strength * vAlpha);
    }
`;

function NeuroParticles({ moodColor = '#6366F1', moodIntensity = 0 }) {
    const points = useRef();

    const { positions, scales, colors, randoms, speeds } = useMemo(() => {
        const positions = new Float32Array(PARTICLE_COUNT * 3);
        const scales = new Float32Array(PARTICLE_COUNT);
        const colors = new Float32Array(PARTICLE_COUNT * 3);
        const randoms = new Float32Array(PARTICLE_COUNT);
        const speeds = new Float32Array(PARTICLE_COUNT);

        const defaultColor = new THREE.Color(MOOD_COLORS.default);

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            // Neural network-like distribution
            const radius = 1.5 + Math.random() * 3;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            const x = radius * Math.sin(phi) * Math.cos(theta);
            const y = radius * Math.sin(phi) * Math.sin(theta) * 0.6; // Flatten for 2D feel
            const z = radius * Math.cos(phi) * 0.3;

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;

            scales[i] = Math.random() * 0.5 + 0.5;
            randoms[i] = Math.random();
            speeds[i] = Math.random() * 0.5 + 0.5;

            // Default indigo color
            colors[i * 3] = defaultColor.r;
            colors[i * 3 + 1] = defaultColor.g;
            colors[i * 3 + 2] = defaultColor.b;
        }

        return { positions, scales, colors, randoms, speeds };
    }, []);

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        uSize: { value: 120 },
        uMoodColor: { value: new THREE.Color(moodColor) },
        uMoodIntensity: { value: moodIntensity }
    }), []);

    useEffect(() => {
        if (uniforms.uMoodColor) {
            uniforms.uMoodColor.value = new THREE.Color(moodColor);
        }
        uniforms.uMoodIntensity.value = moodIntensity;
    }, [moodColor, moodIntensity, uniforms]);

    useFrame((state) => {
        const time = state.clock.getElapsedTime();

        if (points.current) {
            points.current.material.uniforms.uTime.value = time;

            // Gentle rotation
            points.current.rotation.y = time * 0.03;
            points.current.rotation.x = Math.sin(time * 0.1) * 0.05;
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
                <bufferAttribute
                    attach="attributes-aSpeed"
                    count={PARTICLE_COUNT}
                    array={speeds}
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

// Neural network connection lines
function NeuralConnections() {
    const linesRef = useRef();
    const lineCount = 50;

    const { positions, colors } = useMemo(() => {
        const positions = new Float32Array(lineCount * 6);
        const colors = new Float32Array(lineCount * 6);

        for (let i = 0; i < lineCount; i++) {
            // Random start point
            const x1 = (Math.random() - 0.5) * 6;
            const y1 = (Math.random() - 0.5) * 3;
            const z1 = (Math.random() - 0.5) * 2;

            // Random end point nearby
            const x2 = x1 + (Math.random() - 0.5) * 2;
            const y2 = y1 + (Math.random() - 0.5) * 1;
            const z2 = z1 + (Math.random() - 0.5) * 0.5;

            positions[i * 6] = x1;
            positions[i * 6 + 1] = y1;
            positions[i * 6 + 2] = z1;
            positions[i * 6 + 3] = x2;
            positions[i * 6 + 4] = y2;
            positions[i * 6 + 5] = z2;

            // Faint purple color
            const alpha = 0.1 + Math.random() * 0.1;
            colors[i * 6] = 0.4 * alpha;
            colors[i * 6 + 1] = 0.4 * alpha;
            colors[i * 6 + 2] = 1.0 * alpha;
            colors[i * 6 + 3] = 0.4 * alpha;
            colors[i * 6 + 4] = 0.4 * alpha;
            colors[i * 6 + 5] = 1.0 * alpha;
        }

        return { positions, colors };
    }, []);

    useFrame((state) => {
        if (linesRef.current) {
            linesRef.current.rotation.y = state.clock.getElapsedTime() * 0.02;
        }
    });

    return (
        <lineSegments ref={linesRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={lineCount * 2}
                    array={positions}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-color"
                    count={lineCount * 2}
                    array={colors}
                    itemSize={3}
                />
            </bufferGeometry>
            <lineBasicMaterial vertexColors transparent opacity={0.3} />
        </lineSegments>
    );
}

function Scene({ moodColor, moodIntensity }) {
    return (
        <>
            <ambientLight intensity={0.1} />
            <NeuroParticles moodColor={moodColor} moodIntensity={moodIntensity} />
            <NeuralConnections />
        </>
    );
}

// Main NeuroField component - Universal animated background
export const NeuroField = ({
    mood = null,
    intensity = 0.3,
    className = '',
    showLegend = false
}) => {
    const moodColor = mood ? (MOOD_COLORS[mood] || MOOD_COLORS.default) : MOOD_COLORS.default;
    const moodIntensity = mood ? intensity : 0;

    return (
        <div className={`fixed inset-0 -z-10 ${className}`}>
            <Canvas
                camera={{ position: [0, 0, 5], fov: 60 }}
                dpr={[1, 2]}
                gl={{ antialias: true, alpha: true }}
            >
                <color attach="background" args={['#030712']} />
                <fog attach="fog" args={['#030712', 3, 10]} />
                <Scene moodColor={moodColor} moodIntensity={moodIntensity} />
            </Canvas>

            {/* Gradient overlay for depth */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60 pointer-events-none" />

            {/* Mood legend */}
            {showLegend && (
                <div className="absolute bottom-6 left-6 flex flex-wrap gap-2 max-w-md">
                    {Object.entries(MOOD_COLORS).filter(([key]) => key !== 'default').map(([m, color]) => (
                        <div
                            key={m}
                            className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/5 border border-white/10"
                        >
                            <div
                                className="w-2 h-2 rounded-full"
                                style={{
                                    backgroundColor: color,
                                    boxShadow: `0 0 6px ${color}40`
                                }}
                            />
                            <span className="text-[10px] text-white/50 capitalize">{m}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default NeuroField;
