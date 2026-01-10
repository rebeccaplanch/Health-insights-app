import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-dm-mono)', 'monospace'],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Accent colors from Figma design
        accent: {
          mint: '#7fd8be',    // Primary accent (teal/mint green)
          green: '#7fd8be',
        },
        // Legacy neon colors (keeping for compatibility)
        neon: {
          green: '#7fd8be',   // Updated to match new design
          lime: '#7fd8be',
        },
        // Card and UI colors
        card: {
          bg: 'rgba(255, 255, 255, 0.05)',
          border: 'rgba(255, 255, 255, 0.1)',
        },
        // Status colors
        status: {
          ready: '#7fd8be',
          moderate: '#fbbf24',
          rest: '#ef4444',
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      fontSize: {
        // Custom sizes matching Figma
        'display': ['48px', { lineHeight: '1', letterSpacing: '0.05em' }],
        'stat': ['40px', { lineHeight: '1' }],
        'stat-sm': ['24px', { lineHeight: '1' }],
      },
    },
  },
  plugins: [],
};
export default config;
