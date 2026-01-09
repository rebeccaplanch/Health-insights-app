'use client';

import { useEffect, useRef } from 'react';

export default function BackgroundGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to window size
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      drawGrid();
    };

    const drawGrid = () => {
      const gridSize = 24; // Grid cell size in pixels
      const spotRadius = 56; // Radius of enhanced visibility spots
      const numSpots = 8; // Number of spots where grid is more visible

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Generate random spots
      const spots = Array.from({ length: numSpots }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: spotRadius + (Math.random() * 30 - 15), // Vary radius slightly
      }));

      // Draw grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)'; // Base grid opacity
      ctx.lineWidth = 1;

      // Vertical lines
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      // Horizontal lines
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw enhanced grid areas (spots)
      spots.forEach(spot => {
        // Create radial gradient for smooth visibility transition
        const gradient = ctx.createRadialGradient(spot.x, spot.y, 0, spot.x, spot.y, spot.radius);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.15)'); // More visible in center
        gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.08)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)'); // Fade out

        // Draw enhanced grid lines in this spot
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1;

        // Calculate grid bounds for this spot
        const startX = Math.floor((spot.x - spot.radius) / gridSize) * gridSize;
        const endX = Math.ceil((spot.x + spot.radius) / gridSize) * gridSize;
        const startY = Math.floor((spot.y - spot.radius) / gridSize) * gridSize;
        const endY = Math.ceil((spot.y + spot.radius) / gridSize) * gridSize;

        // Draw vertical lines in spot area
        for (let x = startX; x <= endX; x += gridSize) {
          const distance = Math.abs(x - spot.x);
          if (distance < spot.radius) {
            ctx.beginPath();
            ctx.moveTo(x, Math.max(0, spot.y - spot.radius));
            ctx.lineTo(x, Math.min(canvas.height, spot.y + spot.radius));
            ctx.stroke();
          }
        }

        // Draw horizontal lines in spot area
        for (let y = startY; y <= endY; y += gridSize) {
          const distance = Math.abs(y - spot.y);
          if (distance < spot.radius) {
            ctx.beginPath();
            ctx.moveTo(Math.max(0, spot.x - spot.radius), y);
            ctx.lineTo(Math.min(canvas.width, spot.x + spot.radius), y);
            ctx.stroke();
          }
        }

        // Randomly fill some grid boxes in enhanced areas
        const numFilledBoxes = Math.floor(Math.random() * 5) + 3; // 3-7 filled boxes per spot

        for (let i = 0; i < numFilledBoxes; i++) {
          // Random position within spot
          const angle = Math.random() * Math.PI * 2;
          const distance = Math.random() * spot.radius * 0.7; // Keep boxes within 70% of radius
          const boxX = spot.x + Math.cos(angle) * distance;
          const boxY = spot.y + Math.sin(angle) * distance;

          // Snap to grid
          const gridX = Math.floor(boxX / gridSize) * gridSize;
          const gridY = Math.floor(boxY / gridSize) * gridSize;

          // Calculate opacity based on distance from spot center
          const distanceFromCenter = Math.sqrt(
            Math.pow(gridX - spot.x, 2) + Math.pow(gridY - spot.y, 2)
          );
          const opacity = Math.max(0, 0.12 - (distanceFromCenter / spot.radius) * 0.12);

          // Fill the grid box
          ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
          ctx.fillRect(gridX, gridY, gridSize, gridSize);
        }
      });
    };

    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    return () => {
      window.removeEventListener('resize', setCanvasSize);
    };
  }, []);

  return (
    <>
      {/* Navy gradient background with randomization */}
      <div
        className="fixed inset-0 -z-20"
        style={{
          background: `
            radial-gradient(circle at 20% 30%, #1a2640 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, #192a45 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, #151d34 0%, #0d1520 100%)
          `
        }}
      />

      {/* Grain texture overlay */}
      <div
        className="fixed inset-0 -z-10 opacity-50"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
        }}
      />

      {/* Grid overlay canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 -z-10 pointer-events-none"
      />
    </>
  );
}
