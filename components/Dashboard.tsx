'use client';

import { useState, useEffect } from 'react';
import { getTodayDate, formatDateForDisplay } from '@/lib/utils';
import { Insight, ReadinessBand } from '@/lib/scoring';

interface DashboardData {
  date: string;
  steps: number | null;
  caloriesBurned: number | null;
  strain: number | null;
  readiness: ReadinessBand | null;
  insights: Insight[];
  workoutCount: number;
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch the most recent entry with complete data
      const response = await fetch('/api/daily/latest');

      if (response.ok) {
        const entry = await response.json();

        if (entry) {
          setData({
            date: entry.date,
            steps: entry.steps,
            caloriesBurned: entry.caloriesBurned,
            strain: entry.strain,
            readiness: entry.readiness,
            insights: entry.insights ? JSON.parse(entry.insights) : [],
            workoutCount: entry.workouts?.length || 0,
          });
        } else {
          // No entries with data yet
          const today = getTodayDate();
          setData({
            date: today,
            steps: null,
            caloriesBurned: null,
            strain: null,
            readiness: null,
            insights: [],
            workoutCount: 0,
          });
        }
      } else {
        // Set default data on error
        const today = getTodayDate();
        setData({
          date: today,
          steps: null,
          caloriesBurned: null,
          strain: null,
          readiness: null,
          insights: [],
          workoutCount: 0,
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set default data on error
      const today = getTodayDate();
      setData({
        date: today,
        steps: null,
        caloriesBurned: null,
        strain: null,
        readiness: null,
        insights: [],
        workoutCount: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const readinessConfig = {
    green: {
      color: 'bg-neon-green',
      textColor: 'text-neon-green',
      label: 'Ready',
    },
    yellow: {
      color: 'bg-yellow-400',
      textColor: 'text-yellow-400',
      label: 'Moderate',
    },
    red: {
      color: 'bg-red-500',
      textColor: 'text-red-500',
      label: 'Rest Needed',
    },
  }[data.readiness || 'green'];

  const strainPercentage = data.strain !== null ? (data.strain / 21) * 100 : 0;
  const circumference = 2 * Math.PI * 90; // radius = 90
  const strokeDashoffset = circumference - (circumference * strainPercentage) / 100;

  return (
    <div className="space-y-4">
      {/* Strain Circle - Hero Section */}
      <div className="bg-slate-900 dark:bg-slate-800/50 rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-neon-green/5 rounded-full blur-3xl"></div>

        <div className="flex flex-col items-center relative z-10">
          <div className="text-sm font-medium text-slate-400 tracking-wide uppercase mb-6">
            Current Strain
          </div>

          {/* Circular Progress */}
          <div className="relative w-56 h-56">
            <svg className="transform -rotate-90 w-full h-full">
              {/* Background circle */}
              <circle
                cx="112"
                cy="112"
                r="90"
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                className="text-slate-700/50"
              />
              {/* Progress circle */}
              <circle
                cx="112"
                cy="112"
                r="90"
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="text-neon-green transition-all duration-1000 ease-out"
                strokeLinecap="round"
              />
            </svg>

            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-6xl font-bold text-white tracking-tight">
                {data.strain !== null ? data.strain.toFixed(1) : '–'}
              </div>
              <div className="text-lg text-slate-400 font-medium">/ 21</div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <div className="text-xs text-slate-500 mb-2">
              {formatDateForDisplay(data.date)}
            </div>
          </div>
        </div>
      </div>

      {/* Readiness Band */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-slate-500 dark:text-slate-400 mb-1 font-medium">
              Readiness
            </div>
            {data.readiness ? (
              <div className={`text-2xl font-bold ${readinessConfig.textColor}`}>
                {readinessConfig.label}
              </div>
            ) : (
              <div className="text-slate-400">No data</div>
            )}
          </div>
          {data.readiness && (
            <div className={`${readinessConfig.color} w-16 h-16 rounded-full shadow-lg`} />
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-2 font-medium uppercase tracking-wide">
            Steps
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {data.steps !== null ? Math.round(data.steps / 1000) + 'k' : '–'}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-2 font-medium uppercase tracking-wide">
            Calories
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {data.caloriesBurned !== null ? Math.round(data.caloriesBurned / 100) / 10 + 'k' : '–'}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-2 font-medium uppercase tracking-wide">
            Workouts
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {data.workoutCount}
          </div>
        </div>
      </div>

      {/* Insights */}
      {data.insights && data.insights.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Insights</h3>
          <div className="space-y-4">
            {data.insights.map((insight, index) => (
              <div key={index} className="border-l-4 border-neon-green pl-4 py-1">
                <p className="text-sm font-medium text-slate-900 dark:text-white leading-relaxed">
                  {insight.message}
                </p>
                {insight.suggestion && (
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                    💡 {insight.suggestion}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
