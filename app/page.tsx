import DailyCheckin from '@/components/DailyCheckin';
import Dashboard from '@/components/Dashboard';
import StravaConnect from '@/components/StravaConnect';
import Navigation from '@/components/Navigation';

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Navigation - hidden on mobile, visible on tablet+ */}
      <div className="hidden md:block px-6 pt-6 max-w-lg mx-auto md:max-w-2xl lg:max-w-4xl">
        <Navigation />
      </div>

      {/* Main Content Container - top aligned with 32px gap from nav */}
      <div className="px-6 pt-8 pb-20 max-w-lg mx-auto md:max-w-2xl lg:max-w-4xl">
        {/* Welcome Header */}
        <div className="pb-4">
          <p className="font-mono italic text-sm text-accent mb-1">
            Welcome back
          </p>
          <h1 className="font-mono font-medium text-[48px] leading-none tracking-display text-[#f2f0e3]">
            REBECCA
          </h1>
        </div>

        {/* Cards */}
        <div className="space-y-4">
          <Dashboard />
          <DailyCheckin />
          <StravaConnect />
        </div>
      </div>

      {/* Mobile Navigation - fixed bottom nav on mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
        <Navigation />
      </div>
    </main>
  );
}
