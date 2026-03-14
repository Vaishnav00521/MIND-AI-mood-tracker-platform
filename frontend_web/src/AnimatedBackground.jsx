import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

// Generates random zig-zag points on screen
const generateLines = (count = 12) => {
  const lines = [];
  for (let i = 0; i < count; i++) {
    const points = [];
    const startX = Math.random() * 100;
    const startY = Math.random() * 100;
    let x = startX;
    let y = startY;
    for (let j = 0; j < 6; j++) {
      x += (Math.random() - 0.5) * 30;
      y += (Math.random() - 0.5) * 30;
      points.push({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
    }
    lines.push({
      id: i,
      points,
      color: i % 3 === 0 ? 'rgba(139,92,246,0.12)' : i % 3 === 1 ? 'rgba(6,182,212,0.10)' : 'rgba(244,114,182,0.08)',
      duration: 8 + Math.random() * 12,
      delay: Math.random() * 4,
    });
  }
  return lines;
};

// Generates random floating node dots
const generateNodes = (count = 20) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 1 + Math.random() * 2,
    color: i % 3 === 0 ? 'rgba(139,92,246,0.25)' : i % 3 === 1 ? 'rgba(6,182,212,0.2)' : 'rgba(255,255,255,0.1)',
    duration: 6 + Math.random() * 8,
    delay: Math.random() * 5,
  }));
};

const lines = generateLines(14);
const nodes = generateNodes(22);

export const AnimatedBackground = () => {
  const svgRef = useRef(null);

  const buildPath = (points) => {
    if (!points || points.length < 2) return '';
    const d = points.reduce((acc, p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      // Alternate between straight zigzag and smooth curves
      const prev = points[i - 1];
      const midX = (prev.x + p.x) / 2;
      return acc + ` Q ${midX} ${prev.y} ${p.x} ${p.y}`;
    }, '');
    return d;
  };

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          {lines.map(line => (
            <filter key={`blur-${line.id}`} id={`glow-${line.id}`}>
              <feGaussianBlur stdDeviation="0.3" result="colored-blur" />
              <feMerge>
                <feMergeNode in="colored-blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          ))}
        </defs>

        {/* Animated zig-zag lines */}
        {lines.map(line => (
          <motion.path
            key={line.id}
            d={buildPath(line.points)}
            stroke={line.color}
            strokeWidth="0.15"
            fill="none"
            filter={`url(#glow-${line.id})`}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{
              pathLength: [0, 1, 0.5, 1],
              opacity: [0, 0.8, 0.4, 0.8, 0],
            }}
            transition={{
              duration: line.duration,
              delay: line.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}

        {/* Neural node dots */}
        {nodes.map(node => (
          <motion.circle
            key={node.id}
            cx={node.x}
            cy={node.y}
            r={node.size * 0.1}
            fill={node.color}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.9, 0.3],
              cx: [node.x, node.x + 2, node.x - 1, node.x],
              cy: [node.y, node.y - 1.5, node.y + 2, node.y],
            }}
            transition={{
              duration: node.duration,
              delay: node.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </svg>
    </div>
  );
};
