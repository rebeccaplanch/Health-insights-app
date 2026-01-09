import DailyCheckin from '@/components/DailyCheckin';
import Dashboard from '@/components/Dashboard';
import StravaConnect from '@/components/StravaConnect';
import Navigation from '@/components/Navigation';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="text-center pt-6 pb-4">
        <h1 className="text-4xl font-bold mb-2 text-slate-900 dark:text-white tracking-tight">
          Health Tracker
        </h1>
        <p className="text-slate-600 dark:text-slate-400 font-medium">
          Your personal performance dashboard
        </p>
      </div>

      <Navigation />

      <div className="max-w-2xl mx-auto px-4 space-y-4 pb-8">
        <Dashboard />

        <DailyCheckin />

        <StravaConnect />
      </div>
    </main>
  );
}
