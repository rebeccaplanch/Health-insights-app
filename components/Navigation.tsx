'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-white/5 backdrop-blur-md shadow-lg mb-6 border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex space-x-8">
          <Link
            href="/"
            className={`py-4 px-2 border-b-2 font-semibold text-sm transition-colors ${
              pathname === '/'
                ? 'border-neon-green text-neon-green'
                : 'border-transparent text-slate-300 hover:text-white'
            }`}
          >
            Dashboard
          </Link>

          <Link
            href="/trends"
            className={`py-4 px-2 border-b-2 font-semibold text-sm transition-colors ${
              pathname === '/trends'
                ? 'border-neon-green text-neon-green'
                : 'border-transparent text-slate-300 hover:text-white'
            }`}
          >
            📊 Trends
          </Link>

          <Link
            href="/activities"
            className={`py-4 px-2 border-b-2 font-semibold text-sm transition-colors ${
              pathname === '/activities'
                ? 'border-neon-green text-neon-green'
                : 'border-transparent text-slate-300 hover:text-white'
            }`}
          >
            🏃 Activities
          </Link>

          <Link
            href="/ai-data"
            className={`py-4 px-2 border-b-2 font-semibold text-sm transition-colors ${
              pathname === '/ai-data'
                ? 'border-neon-green text-neon-green'
                : 'border-transparent text-slate-300 hover:text-white'
            }`}
          >
            🤖 AI Data
          </Link>
        </div>
      </div>
    </nav>
  );
}
