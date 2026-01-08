import DailyCheckin from '@/components/DailyCheckin';
import Dashboard from '@/components/Dashboard';
import StravaConnect from '@/components/StravaConnect';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen p-4 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto space-y-6 pb-8">
        <div className="text-center pt-4">
          <h1 className="text-3xl font-bold mb-2">Health Tracker</h1>
          <p className="text-gray-600 dark:text-gray-400">Your personal health & performance tracker</p>

          <Link
            href="/trends"
            className="inline-block mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            📊 View Trends & Insights
          </Link>
        </div>

        <Dashboard />

        <DailyCheckin />

        <StravaConnect />
      </div>
    </main>
  );
}
