import DailyCheckin from '@/components/DailyCheckin';
import Dashboard from '@/components/Dashboard';
import StravaConnect from '@/components/StravaConnect';
import Navigation from '@/components/Navigation';
import AICoach from '@/components/AICoach';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="text-center pt-4 pb-2">
        <h1 className="text-3xl font-bold mb-2">Health Tracker</h1>
        <p className="text-gray-600 dark:text-gray-400">Your personal health & performance tracker</p>
      </div>

      <Navigation />

      <div className="max-w-2xl mx-auto px-4 space-y-6 pb-8">
        <Dashboard />

        <AICoach />

        <DailyCheckin />

        <StravaConnect />
      </div>
    </main>
  );
}
