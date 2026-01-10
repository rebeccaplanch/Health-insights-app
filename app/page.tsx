import DailyCheckin from '@/components/DailyCheckin';
import Dashboard from '@/components/Dashboard';
import StravaConnect from '@/components/StravaConnect';
import Navigation from '@/components/Navigation';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Navigation - hidden on mobile, visible on tablet+ */}
      <div className="hidden md:block">
        <Navigation />
      </div>

      {/* Main Content Container - centered vertically */}
      <div className="px-6 pb-20 max-w-lg mx-auto md:max-w-2xl lg:max-w-4xl flex-1 flex flex-col justify-center">
        {/* Welcome Header - matching Figma design */}
        <div className="pb-4">
          <p className="font-mono italic text-sm text-accent mb-1">
            Welcome back
          </p>
          <h1 className="font-mono font-medium text-[48px] leading-none tracking-display text-[#f1f1f1] md:text-6xl lg:text-7xl">
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
