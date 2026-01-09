'use client';

import { useMemo } from 'react';

export default function BackgroundGrid() {
  // Generate random spots for grid visibility on mount
  const spots = useMemo(() => {
    const numSpots = 8;
    const spotRadius = 56;

    return Array.from({ length: numSpots }, () => {
      const x = Math.random() * 100; // Percentage
      const y = Math.random() * 100; // Percentage
      const radius = spotRadius + (Math.random() * 30 - 15);

      // Generate 3-7 filled boxes per spot
      const numFilledBoxes = Math.floor(Math.random() * 5) + 3;
      const filledBoxes = Array.from({ length: numFilledBoxes }, () => {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 0.7; // 70% of radius
        const boxX = x + Math.cos(angle) * distance * (radius / 10);
        const boxY = y + Math.sin(angle) * distance * (radius / 10);

        return {
          x: Math.floor(boxX / 2.4) * 2.4, // Snap to grid (24px = ~2.4vw at 1000px width)
          y: Math.floor(boxY / 2.4) * 2.4,
          opacity: 0.08 + Math.random() * 0.04, // 0.08-0.12 opacity
        };
      });

      return { x, y, radius, filledBoxes };
    });
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
        <defs>
          {/* Base grid pattern */}
          <pattern
            id="grid"
            width="24"
            height="24"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 24 0 L 0 0 0 24"
              fill="none"
              stroke="rgba(255, 255, 255, 0.03)"
              strokeWidth="1"
            />
          </pattern>

          {/* Enhanced grid patterns for each spot */}
          {spots.map((spot, index) => (
            <pattern
              key={`enhanced-grid-${index}`}
              id={`enhanced-grid-${index}`}
              width="24"
              height="24"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 24 0 L 0 0 0 24"
                fill="none"
                stroke="rgba(255, 255, 255, 0.12)"
                strokeWidth="1"
              />
            </pattern>
          ))}

          {/* Radial gradient masks for each spotlight */}
          {spots.map((spot, index) => (
            <radialGradient
              key={`spot-gradient-${index}`}
              id={`spot-gradient-${index}`}
              cx={`${spot.x}%`}
              cy={`${spot.y}%`}
              r={`${spot.radius * 1.5}px`}
            >
              <stop offset="0%" stopColor="white" stopOpacity="1" />
              <stop offset="70%" stopColor="white" stopOpacity="0.4" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </radialGradient>
          ))}

          {/* Create masks for enhanced grid visibility */}
          {spots.map((spot, index) => (
            <mask key={`spot-mask-${index}`} id={`spot-mask-${index}`}>
              <rect
                width="100%"
                height="100%"
                fill={`url(#spot-gradient-${index})`}
              />
            </mask>
          ))}
        </defs>

        {/* Base grid layer */}
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Enhanced grid layers for each spot */}
        {spots.map((spot, index) => (
          <g key={`spot-${index}`}>
            {/* Enhanced grid in spotlight area */}
            <circle
              cx={`${spot.x}%`}
              cy={`${spot.y}%`}
              r={`${spot.radius}px`}
              fill={`url(#enhanced-grid-${index})`}
              mask={`url(#spot-mask-${index})`}
            />

            {/* Filled boxes within this spot */}
            {spot.filledBoxes.map((box, boxIndex) => (
              <rect
                key={`box-${index}-${boxIndex}`}
                x={`${box.x}%`}
                y={`${box.y}%`}
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
