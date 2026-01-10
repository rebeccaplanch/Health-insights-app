'use client';

import { useState, useEffect } from 'react';

interface Spot {
  x: number;
  y: number;
  radius: number;
  filledBoxes: Array<{ x: number; y: number; opacity: number }>;
}

interface GridLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  opacity: number;
}

export default function BackgroundGrid() {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [gridLines, setGridLines] = useState<GridLine[]>([]);

  useEffect(() => {
    // Generate randomized grid lines
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const gridSize = 24;
    const lines: GridLine[] = [];

    // Generate vertical lines with randomized opacity
    for (let x = 0; x <= vw; x += gridSize) {
      lines.push({
        x1: x,
        y1: 0,
        x2: x,
        y2: vh,
        opacity: 0.06 + Math.random() * 0.08, // 0.06 to 0.14
      });
    }

    // Generate horizontal lines with randomized opacity
    for (let y = 0; y <= vh; y += gridSize) {
      lines.push({
        x1: 0,
        y1: y,
        x2: vw,
        y2: y,
        opacity: 0.06 + Math.random() * 0.08, // 0.06 to 0.14
      });
    }

    setGridLines(lines);

    // Generate random spots only on client side
    const numSpots = 8;
    const newSpots = Array.from({ length: numSpots }, () => {
      const x = 10 + Math.random() * 80; // Keep away from edges (10-90%)
      const y = 10 + Math.random() * 80;
      const radius = 80 + Math.random() * 40; // 80-120px radius

      // Generate 4-8 filled boxes per spot
      const numFilledBoxes = Math.floor(Math.random() * 5) + 4;
      const filledBoxes = Array.from({ length: numFilledBoxes }, () => {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 60; // 0-60px from center

        const boxX = (x * vw / 100) + Math.cos(angle) * distance;
        const boxY = (y * vh / 100) + Math.sin(angle) * distance;

        // Snap to 24px grid
        const gridX = Math.floor(boxX / 24) * 24;
        const gridY = Math.floor(boxY / 24) * 24;

        // Calculate distance from spot center for opacity
        const centerX = x * vw / 100;
        const centerY = y * vh / 100;
        const distFromCenter = Math.sqrt(
          Math.pow(gridX - centerX, 2) + Math.pow(gridY - centerY, 2)
        );
        const opacity = Math.max(0.03, 0.15 - (distFromCenter / 100) * 0.12);

        return { x: gridX, y: gridY, opacity };
      });

      return { x, y, radius, filledBoxes };
    });

    setSpots(newSpots);
  }, []);

  return (
    <>
      {/* Dark blue gradient background */}
      <div
        className="fixed inset-0 -z-20"
        style={{
          background: `
            radial-gradient(circle at 15% 25%, #0d1a2d 0%, transparent 45%),
            radial-gradient(circle at 85% 75%, #0a1525 0%, transparent 45%),
            radial-gradient(circle at 50% 50%, #08121f 0%, #040a12 100%)
          `
        }}
      />

      {/* Grain texture overlay */}
      <div
        className="fixed inset-0 -z-10 opacity-40"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
        }}
      />

      {/* Vector-based grid overlay */}
      <svg
        className="fixed inset-0 -z-10 w-full h-full pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Randomized grid lines */}
        {gridLines.map((line, index) => (
          <line
            key={`line-${index}`}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke={`rgba(255, 255, 255, ${line.opacity})`}
            strokeWidth="1"
          />
        ))}

        {/* Filled grid boxes */}
        {spots.map((spot, index) => (
          <g key={`spot-${index}`}>
            {spot.filledBoxes.map((box, boxIndex) => (
              <rect
                key={`box-${index}-${boxIndex}`}
                x={box.x}
                y={box.y}
                width="24"
                height="24"
                fill={`rgba(255, 255, 255, ${box.opacity})`}
              />
            ))}
          </g>
        ))}
      </svg>
    </>
  );
}
