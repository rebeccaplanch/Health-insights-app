'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * Navigation component
 * - Mobile: Fixed bottom navigation bar
 * - Desktop: Top navigation bar
 */
export default function Navigation() {
  const pathname = usePathname();

  const DashboardIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor">
      <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h240v-560H200v560Zm320 0h240v-280H520v280Zm0-360h240v-200H520v200Z"/>
    </svg>
  );

  const TrendsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor">
      <path d="M640-160v-280h160v280H640Zm-240 0v-640h160v640H400Zm-240 0v-440h160v440H160Z"/>
    </svg>
  );

  const ActivitiesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor">
      <path d="M520-40v-240l-84-80-40 176-276-56 16-80 192 40 64-324-72 28v136h-80v-188l158-68q35-15 51.5-19.5T480-720q21 0 39 11t29 29l40 64q26 42 70.5 69T760-520v80q-66 0-123.5-27.5T540-540l-24 120 84 80v300h-80Zm20-700q-33 0-56.5-23.5T460-820q0-33 23.5-56.5T540-900q33 0 56.5 23.5T620-820q0 33-23.5 56.5T540-740Z"/>
    </svg>
  );

  const InsightsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor">
      <path d="M760-120q-39 0-70-22.5T647-200H440q-66 0-113-47t-47-113q0-66 47-113t113-47h80q33 0 56.5-23.5T600-600q0-33-23.5-56.5T520-680H313q-13 35-43.5 57.5T200-600q-50 0-85-35t-35-85q0-50 35-85t85-35q39 0 69.5 22.5T313-760h207q66 0 113 47t47 113q0 66-47 113t-113 47h-80q-33 0-56.5 23.5T360-360q0 33 23.5 56.5T440-280h207q13-35 43.5-57.5T760-360q50 0 85 35t35 85q0 50-35 85t-85 35ZM200-680q17 0 28.5-11.5T240-720q0-17-11.5-28.5T200-760q-17 0-28.5 11.5T160-720q0 17 11.5 28.5T200-680Z"/>
    </svg>
  );

  const navItems = [
    { href: '/', label: 'Dashboard', icon: <DashboardIcon /> },
    { href: '/trends', label: 'Trends', icon: <TrendsIcon /> },
    { href: '/activities', label: 'Activities', icon: <ActivitiesIcon /> },
    { href: '/ai-data', label: 'Insights', icon: <InsightsIcon /> },
  ];

  return (
    <nav className="bg-[var(--card-bg-0)] rounded-none md:rounded-lg">
      {/* Mobile: Bottom bar layout */}
      <div className="md:hidden flex justify-around items-center py-3 px-4 safe-area-pb">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
                isActive
                  ? 'text-accent'
                  : 'text-[#f1f1f1]/60 hover:text-[#f1f1f1]'
              }`}
            >
              <span className="text-lg flex items-center justify-center">{item.icon}</span>
              <span className="font-mono text-[10px] md:text-xs tracking-wide-upper">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Desktop: Top bar layout */}
      <div className="hidden md:block">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex space-x-8">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`py-4 px-2 border-b-2 font-mono text-sm transition-colors flex items-center gap-2 ${
                    isActive
                      ? 'border-accent text-accent'
                      : 'border-transparent text-[#f1f1f1]/60 hover:text-[#f1f1f1]'
                  }`}
                >
                  <span className="flex items-center">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
