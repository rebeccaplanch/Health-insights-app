'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-sm mb-6 border-b border-slate-200 dark:border-slate-700">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex space-x-8">
          <Link
            href="/"
            className={`py-4 px-2 border-b-2 font-semibold text-sm transition-colors ${
              pathname === '/'
                ? 'border-neon-green text-neon-green'
                : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Dashboard
          </Link>

          <Link
            href="/trends"
            className={`py-4 px-2 border-b-2 font-semibold text-sm transition-colors ${
              pathname === '/trends'
                ? 'border-neon-green text-neon-green'
                : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            📊 Trends
          </Link>

          <Link
            href="/ai-data"
            className={`py-4 px-2 border-b-2 font-semibold text-sm transition-colors ${
              pathname === '/ai-data'
                ? 'border-neon-green text-neon-green'
                : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            🤖 AI Data
          </Link>
        </div>
      </div>
    </nav>
  );
}
