'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm mb-6">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex space-x-8">
          <Link
            href="/"
            className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
              pathname === '/'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            Dashboard
          </Link>

          <Link
            href="/trends"
            className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
              pathname === '/trends'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            📊 Trends
          </Link>
        </div>
      </div>
    </nav>
  );
}
