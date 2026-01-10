'use client';

import { useState, useEffect, useMemo } from 'react';

/**
 * BackgroundGrid Component
 * 
 * Recreates the Figma design with:
 * - Dark navy base (#131c38)
 * - 24px grid pattern
 * - 3 specific cube shape patterns (can be rotated 90°)
 * - Solid-fill sparkles and diamonds aligned to grid
 */

const GRID_SIZE = 24;

/**
 * Converts grid coordinates to pixel position
 */
function gridToPixels(gridX: number, gridY: number): { x: number; y: number } {
  return {
    x: gridX * GRID_SIZE,
    y: gridY * GRID_SIZE,
  };
}

/**
 * Sparkle SVG component - 4-pointed star with solid fill
 * 19x19 size, centered on grid vertex (at the 0.5px intersection)
 * Star center is at 9.5, 9.5 (aligns with grid vertex at x+0.5, y+0.5)
 */
function Sparkle({ 
  gridX,
  gridY,
}: { 
  gridX: number;
  gridY: number;
}) {
  const { x, y } = gridToPixels(gridX, gridY);
  // Grid vertex is at x+0.5, y+0.5 (center of the intersection)
  // Star is 19x19 with center at 9.47888 ≈ 9.5
  
  return (
    <svg 
      width="19" 
      height="19" 
      viewBox="0 0 19 19" 
      fill="none"
      className="absolute"
      style={{ 
        left: x + 0.5 - 9.5,
        top: y + 0.5 - 9.5,
      }}
    >
      <path 
        d="M9.47888 1.47888L7.3645 7.3645L1.47888 9.47888L7.3645 11.5933L9.47888 17.4789L11.5933 11.5933L17.4789 9.47888L11.5933 7.3645L9.47888 1.47888Z" 
        fill="#6E81B7" 
        stroke="#6E81B7"
      />
    </svg>
  );
}

/**
 * Diamond shape component with solid fill
 * 13x13 size, centered on grid vertex (at the 0.5px intersection)
 * Diamond radius is 6px from center to each point
 */
function Diamond({ 
  gridX,
  gridY,
}: { 
  gridX: number;
  gridY: number;
}) {
  const { x, y } = gridToPixels(gridX, gridY);
  // Grid vertex is at x+0.5, y+0.5 (center of the intersection)
  // Diamond is 13x13 with center at 6.5, 6.5
  
  return (
    <svg 
      width="13" 
      height="13" 
      viewBox="0 0 13 13" 
      fill="none"
      className="absolute"
      style={{ 
        left: x + 0.5 - 6.5,
        top: y + 0.5 - 6.5,
      }}
    >
      <path 
        d="M0.5 6.5L6.5 12.5L12.5 6.5L6.5 0.5L0.5 6.5Z" 
        fill="#6E81B7" 
        stroke="#6E81B7"
      />
    </svg>
  );
}

/**
 * Single grid cell
 */
function GridCell({
  gridX,
  gridY,
  opacity = 0.5,
}: {
  gridX: number;
  gridY: number;
  opacity?: number;
}) {
  const { x, y } = gridToPixels(gridX, gridY);
  
  return (
    <div
      className="absolute"
      style={{
        left: x,
        top: y,
        width: GRID_SIZE,
        height: GRID_SIZE,
        backgroundColor: `rgba(61, 79, 111, ${opacity})`,
      }}
    />
  );
}

/**
 * The 3 allowed cube shape patterns
 * Each can be rotated in 90° increments
 * 
 * PYRAMID: 3 cubes on bottom, 1 centered on top
 *     █
 *   █ █ █
 * 
 * STAIRCASE: 2 cubes one apart on bottom, 1 center top, 
 *            1 above aligned with right bottom, 1 next to it
 *       █ █
 *     █
 *   █   █
 * 
 * L_TOWER: 2 cubes next to each other on bottom,
 *          1 on top of leftmost, 1 above that offset left
 *   █
 *     █
 *     █ █
 */

// Base shapes (0° rotation)
const SHAPE_PYRAMID: [number, number][] = [
  [0, 1], [2, 1],          // bottom row (left and right, no center)
  [1, 0],                   // top center
];

const SHAPE_STAIRCASE: [number, number][] = [
  [0, 2], [2, 2],          // bottom row (spaced)
  [1, 1],                   // middle center
  [2, 0], [3, 0],          // top right pair
];

const SHAPE_L_TOWER: [number, number][] = [
  [1, 2], [2, 2],          // bottom row
  [1, 1],                   // middle (above left)
  [0, 0],                   // top (offset left)
];

/**
 * Rotate a shape by 90° increments
 * @param cells - Original cell positions
 * @param rotations - Number of 90° clockwise rotations (0-3)
 */
function rotateShape(cells: [number, number][], rotations: number): [number, number][] {
  const r = rotations % 4;
  if (r === 0) return cells;
  
  // Find bounding box
  let maxX = 0, maxY = 0;
  for (const [x, y] of cells) {
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }
  
  return cells.map(([x, y]) => {
    let newX = x, newY = y;
    for (let i = 0; i < r; i++) {
      // Rotate 90° clockwise: (x, y) -> (maxY - y, x)
      const tempMax = i % 2 === 0 ? maxY : maxX;
      [newX, newY] = [tempMax - newY, newX];
    }
    return [newX, newY] as [number, number];
  });
}

type ShapeType = 'PYRAMID' | 'STAIRCASE' | 'L_TOWER';

const SHAPES: Record<ShapeType, [number, number][]> = {
  PYRAMID: SHAPE_PYRAMID,
  STAIRCASE: SHAPE_STAIRCASE,
  L_TOWER: SHAPE_L_TOWER,
};

/**
 * Cube cluster component
 */
function CubeCluster({
  gridX,
  gridY,
  shape,
  rotation = 0,
  opacity = 0.5,
}: {
  gridX: number;
  gridY: number;
  shape: ShapeType;
  rotation?: number; // 0, 1, 2, or 3 (90° increments)
  opacity?: number;
}) {
  const baseCells = SHAPES[shape];
  const cells = rotateShape(baseCells, rotation);
  
  return (
    <>
      {cells.map(([offsetX, offsetY], i) => (
        <GridCell
          key={`${gridX}-${gridY}-${i}`}
          gridX={gridX + offsetX}
          gridY={gridY + offsetY}
          opacity={opacity}
        />
      ))}
    </>
  );
}

/**
 * Cluster placements matching original Figma design positions
 */
interface ClusterConfig {
  relX: number;
  relY: number;
  shape: ShapeType;
  rotation: number;
  opacity: number;
}

const CLUSTER_PLACEMENTS: ClusterConfig[] = [
  // Top-left corner (above cards)
  { relX: 0.05, relY: 0.08, shape: 'L_TOWER', rotation: 0, opacity: 0.5 },
  // Top-right corner (above cards)
  { relX: 0.88, relY: 0.12, shape: 'STAIRCASE', rotation: 1, opacity: 0.5 },
  // Left side (beside cards)
  { relX: 0.03, relY: 0.55, shape: 'PYRAMID', rotation: 2, opacity: 0.5 },
  // Right side (beside cards)
  { relX: 0.92, relY: 0.45, shape: 'L_TOWER', rotation: 3, opacity: 0.45 },
  // Bottom-right corner (below cards)
  { relX: 0.85, relY: 0.88, shape: 'PYRAMID', rotation: 0, opacity: 0.45 },
];

/**
 * Sparkle/Diamond positions - distributed around the card area
 */
const SPARKLE_PLACEMENTS = [
  { relX: 0.08, relY: 0.18 },   // Top-left
  { relX: 0.92, relY: 0.35 },   // Right side
];

const DIAMOND_PLACEMENTS = [
  { relX: 0.06, relY: 0.38 },   // Left side
  { relX: 0.94, relY: 0.65 },   // Right side
  { relX: 0.12, relY: 0.92 },   // Bottom-left
];

/**
 * Generate config scaled to viewport
 */
function generateConfig(gridCols: number, gridRows: number) {
  if (gridCols < 5 || gridRows < 5) {
    return { clusters: [], sparkles: [], diamonds: [] };
  }

  const clusters = CLUSTER_PLACEMENTS.map(c => ({
    gridX: Math.floor(c.relX * gridCols),
    gridY: Math.floor(c.relY * gridRows),
    shape: c.shape,
    rotation: c.rotation,
    opacity: c.opacity,
  }));

  const sparkles = SPARKLE_PLACEMENTS.map(s => ({
    gridX: Math.floor(s.relX * gridCols),
    gridY: Math.floor(s.relY * gridRows),
  }));

  const diamonds = DIAMOND_PLACEMENTS.map(d => ({
    gridX: Math.floor(d.relX * gridCols),
    gridY: Math.floor(d.relY * gridRows),
  }));

  return { clusters, sparkles, diamonds };
}

export default function BackgroundGrid() {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    function updateDimensions() {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const gridCols = Math.ceil(dimensions.width / GRID_SIZE);
  const gridRows = Math.ceil(dimensions.height / GRID_SIZE);

  const config = useMemo(
    () => generateConfig(gridCols, gridRows),
    [gridCols, gridRows]
  );

  // Master opacity for all overlay elements (grid, clusters, gradients, sparkles, diamonds, grain)
  const OVERLAY_OPACITY = 0.7;

  return (
    <>
      {/* Base dark navy background - always full opacity */}
      <div 
        className="fixed inset-0 -z-20"
        style={{ backgroundColor: '#131c38' }}
      />

      {/* All overlay elements grouped with single opacity control */}
      <div 
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{ opacity: OVERLAY_OPACITY }}
      >
        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,1) 1px, transparent 1px)
            `,
            backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
          }}
        />

        {/* Cube clusters */}
        <div className="absolute inset-0 overflow-hidden">
          {config.clusters.map((cluster, i) => (
            <CubeCluster
              key={`cluster-${i}`}
              gridX={cluster.gridX}
              gridY={cluster.gridY}
              shape={cluster.shape}
              rotation={cluster.rotation}
              opacity={cluster.opacity}
            />
          ))}
        </div>

        {/* Gradient circle overlays for depth - evenly distributed, each extends outside viewport */}
        <div className="absolute inset-0 overflow-visible">
          {/* Top-left: extends past left and top edges */}
          <div 
            className="absolute bg-[#18223f]/60 rounded-full"
            style={{
              left: -dimensions.width * 0.1,
              top: -dimensions.height * 0.1,
              width: Math.max(dimensions.width, dimensions.height) * 0.42,
              height: Math.max(dimensions.width, dimensions.height) * 0.42,
              filter: 'blur(60px)',
            }}
          />
          {/* Center: slightly off-center */}
          <div 
            className="absolute bg-[#18223f]/60 rounded-full"
            style={{
              left: dimensions.width * 0.32,
              top: dimensions.height * 0.15 - (GRID_SIZE * 10),
              width: Math.max(dimensions.width, dimensions.height) * 0.47,
              height: Math.max(dimensions.width, dimensions.height) * 0.47,
              filter: 'blur(60px)',
            }}
          />
          {/* Bottom-right: extends past right and bottom edges */}
          <div 
            className="absolute bg-[#18223f]/60 rounded-full"
            style={{
              left: dimensions.width * 0.75,
              top: dimensions.height * 0.55,
              width: Math.max(dimensions.width, dimensions.height) * 0.42,
              height: Math.max(dimensions.width, dimensions.height) * 0.42,
              filter: 'blur(60px)',
            }}
          />
        </div>

        {/* Sparkles and diamonds with solid fill */}
        <div className="absolute inset-0 overflow-hidden">
          {config.sparkles.map((s, i) => (
            <Sparkle
              key={`sparkle-${i}`}
              gridX={s.gridX}
              gridY={s.gridY}
            />
          ))}
          {config.diamonds.map((d, i) => (
            <Diamond
              key={`diamond-${i}`}
              gridX={d.gridX}
              gridY={d.gridY}
            />
          ))}
        </div>

        {/* Film grain texture overlay - dark navy grain matching background hue */}
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
          <defs>
            <filter id="filmGrain" x="0%" y="0%" width="100%" height="100%">
              <feTurbulence 
                type="fractalNoise" 
                baseFrequency="1.3" 
                numOctaves="5" 
                seed="15"
                stitchTiles="stitch"
                result="noise"
              />
              {/* Convert to grayscale first */}
              <feColorMatrix
                type="saturate"
                values="0"
                in="noise"
                result="monoNoise"
              />
              {/* Boost contrast */}
              <feComponentTransfer in="monoNoise" result="contrastNoise">
                <feFuncR type="linear" slope="1.5" intercept="-0.25"/>
                <feFuncG type="linear" slope="1.5" intercept="-0.25"/>
                <feFuncB type="linear" slope="1.5" intercept="-0.25"/>
                <feFuncA type="linear" slope="1" intercept="0"/>
              </feComponentTransfer>
              {/* Tint to dark navy - same hue as #131c38 but darker */}
              <feColorMatrix
                type="matrix"
                in="contrastNoise"
                values="0.07 0 0 0 0
                        0 0.10 0 0 0
                        0 0 0.20 0 0
                        0 0 0 1 0"
                result="darkNavyGrain"
              />
            </filter>
          </defs>
          <rect 
            width="100%" 
            height="100%" 
            filter="url(#filmGrain)"
            style={{ opacity: 0.6, mixBlendMode: 'multiply' }}
          />
        </svg>
      </div>
    </>
  );
}
