'use client';

/**
 * BackgroundGrid Component
 * 
 * A responsive decorative background featuring:
 * - Dark navy base (#131c38)
 * - 24px grid pattern with subtle white borders
 * - Scattered diamond/sparkle decorative elements
 * - Blurred gradient overlays for depth
 * 
 * Responsive behavior:
 * - Grid fills entire viewport
 * - Decorative elements maintain fixed sizes
 * - Elements are positioned using percentage-based coordinates
 */

/**
 * Diamond/Sparkle SVG component
 * Renders a 4-pointed star shape
 */
function Sparkle({ 
  size = 12, 
  opacity = 0.6,
  className = '' 
}: { 
  size?: number; 
  opacity?: number;
  className?: string;
}) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none"
      className={className}
      style={{ opacity }}
    >
      <path 
        d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" 
        fill="#4A5B82"
      />
    </svg>
  );
}

/**
 * Small diamond shape component
 */
function Diamond({ 
  size = 8, 
  opacity = 0.5,
  className = '' 
}: { 
  size?: number; 
  opacity?: number;
  className?: string;
}) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 16 16" 
      fill="none"
      className={className}
      style={{ opacity }}
    >
      <path 
        d="M8 0L16 8L8 16L0 8L8 0Z" 
        fill="#5B6E9E"
      />
    </svg>
  );
}

/**
 * Highlighted grid cells - creates the subtle blue rectangle highlights
 * visible in the Figma design
 */
function HighlightedCells() {
  // Positions based on Figma design (percentage-based for responsiveness)
  const highlights = [
    // Top-left cluster
    { left: '12%', top: '35%', width: 48, height: 72 },
    { left: '15%', top: '40%', width: 24, height: 48 },
    // Center cluster
    { left: '45%', top: '48%', width: 72, height: 72 },
    { left: '48%', top: '52%', width: 48, height: 48 },
    // Bottom-left cluster
    { left: '8%', top: '72%', width: 48, height: 96 },
    { left: '11%', top: '78%', width: 24, height: 48 },
    // Right side cluster
    { left: '78%', top: '58%', width: 48, height: 48 },
    // Bottom-right area
    { left: '70%', top: '82%', width: 48, height: 48 },
  ];

  return (
    <>
      {highlights.map((h, i) => (
        <div
          key={i}
          className="absolute bg-[#1e2a4a]/30"
          style={{
            left: h.left,
            top: h.top,
            width: h.width,
            height: h.height,
          }}
        />
      ))}
    </>
  );
}

export default function BackgroundGrid() {
  return (
    <>
      {/* Base dark navy background */}
      <div 
        className="fixed inset-0 -z-20"
        style={{ backgroundColor: '#131c38' }}
      />

      {/* Grid pattern overlay - CSS-based for performance */}
      <div 
        className="fixed inset-0 -z-15 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,1) 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Highlighted grid cells */}
      <div className="fixed inset-0 -z-14 pointer-events-none">
        <HighlightedCells />
      </div>

      {/* Gradient overlays for depth - blurred rectangles */}
      <div className="fixed inset-0 -z-13 pointer-events-none overflow-hidden">
        {/* Top-left gradient */}
        <div 
          className="absolute bg-[#18223f]/60"
          style={{
            left: 0,
            top: '-6%',
            width: '77%',
            height: '33%',
            filter: 'blur(36px)',
          }}
        />
        {/* Center-right gradient */}
        <div 
          className="absolute bg-[#18223f]/60"
          style={{
            left: '28%',
            top: '33%',
            width: '72%',
            height: '34%',
            filter: 'blur(36px)',
          }}
        />
        {/* Bottom-left gradient */}
        <div 
          className="absolute bg-[#18223f]/60"
          style={{
            left: 0,
            top: '72%',
            width: '71%',
            height: '33%',
            filter: 'blur(36px)',
          }}
        />
      </div>

      {/* Decorative sparkles and diamonds */}
      <div className="fixed inset-0 -z-12 pointer-events-none">
        {/* Large sparkle - top area */}
        <div className="absolute" style={{ left: '58%', top: '5%' }}>
          <Sparkle size={16} opacity={0.4} />
        </div>
        
        {/* Diamond - upper left */}
        <div className="absolute" style={{ left: '18%', top: '28%' }}>
          <Diamond size={10} opacity={0.7} />
        </div>
        
        {/* Sparkle - right side */}
        <div className="absolute" style={{ left: '85%', top: '52%' }}>
          <Sparkle size={14} opacity={0.35} />
        </div>
        
        {/* Small sparkle - bottom left */}
        <div className="absolute" style={{ left: '15%', top: '85%' }}>
          <Diamond size={8} opacity={0.5} />
        </div>
        
        {/* Diamond - bottom right */}
        <div className="absolute" style={{ left: '75%', top: '78%' }}>
          <Diamond size={10} opacity={0.6} />
        </div>

        {/* Additional decorative elements for larger screens */}
        <div className="absolute hidden md:block" style={{ left: '35%', top: '15%' }}>
          <Sparkle size={12} opacity={0.3} />
        </div>
        
        <div className="absolute hidden md:block" style={{ left: '92%', top: '25%' }}>
          <Diamond size={8} opacity={0.4} />
        </div>
        
        <div className="absolute hidden lg:block" style={{ left: '5%', top: '45%' }}>
          <Sparkle size={10} opacity={0.25} />
        </div>
        
        <div className="absolute hidden lg:block" style={{ left: '65%', top: '92%' }}>
          <Diamond size={12} opacity={0.5} />
        </div>
      </div>

      {/* Subtle noise texture for depth */}
      <div
        className="fixed inset-0 -z-11 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
        }}
      />
    </>
  );
}
