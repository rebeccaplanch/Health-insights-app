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
      const today = getTodayDate();
      const response = await fetch(`/api/daily?date=${today}`);

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
          // No entry for today yet
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
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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

  const readinessColor = {
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
  }[data.readiness || 'green'];

  const readinessTextColor = {
    green: 'text-green-700 dark:text-green-400',
    yellow: 'text-yellow-700 dark:text-yellow-400',
    red: 'text-red-700 dark:text-red-400',
  }[data.readiness || 'green'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl font-semibold">
          Today · {formatDateForDisplay(data.date)}
        </h2>
      </div>

      {/* Main Tiles Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Strain Tile */}
        <div className="col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Strain
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-5xl font-bold">
              {data.strain !== null ? data.strain.toFixed(1) : '–'}
            </div>
            <div className="text-2xl text-gray-500 dark:text-gray-400">/ 21</div>
          </div>
          {data.strain !== null && (
            <div className="mt-3 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${(data.strain / 21) * 100}%` }}
              />
            </div>
          )}
        </div>

        {/* Readiness Tile */}
        <div className="col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Readiness
          </div>
          {data.readiness ? (
            <div className="flex items-center gap-3">
              <div className={`${readinessColor} w-16 h-16 rounded-full`} />
              <div>
                <div className={`text-2xl font-bold capitalize ${readinessTextColor}`}>
                  {data.readiness}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Estimated from activity patterns
                </div>
              </div>
            </div>
          ) : (
            <div className="text-gray-500 dark:text-gray-400">
              No data yet
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
            Steps
          </div>
          <div className="text-xl font-semibold">
            {data.steps !== null ? data.steps.toLocaleString() : '–'}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
            Calories
          </div>
          <div className="text-xl font-semibold">
            {data.caloriesBurned !== null ? data.caloriesBurned.toLocaleString() : '–'}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
            Workouts
          </div>
          <div className="text-xl font-semibold">{data.workoutCount}</div>
        </div>
      </div>

      {/* Insights */}
      {data.insights && data.insights.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Insights</h3>
          <div className="space-y-3">
            {data.insights.map((insight, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4">
                <p className="text-sm font-medium">{insight.message}</p>
                {insight.suggestion && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    💡 {insight.suggestion}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="text-xs text-center text-gray-500 dark:text-gray-400 px-4">
        <p>
          Note: Readiness is estimated from activity and energy patterns only.
          This is not based on HRV or sleep data.
        </p>
      </div>
    </div>
  );
}
