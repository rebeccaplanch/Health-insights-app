'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Link from 'next/link';
import { formatDateForDisplay } from '@/lib/utils';

interface DailyData {
  date: string;
  strain: number | null;
  steps: number | null;
  caloriesBurned: number | null;
  readiness: string | null;
  workouts: any[];
}

interface TrendsData {
  dailyEntries: DailyData[];
  summary: {
    avgStrain: number;
    avgSteps: number;
    totalSteps: number;
    totalCalories: number;
    totalWorkouts: number;
    workoutTypes: Record<string, number>;
    maxStrain: number;
    maxSteps: number;
    maxCalories: number;
    readinessCount: {
      green: number;
      yellow: number;
      red: number;
    };
    activeDays: number;
  };
}

export default function TrendsPage() {
  const [data, setData] = useState<TrendsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(30);

  useEffect(() => {
    fetchTrends();
  }, [period]);

  const fetchTrends = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/trends?days=${period}`);
      if (response.ok) {
        const trendsData = await response.json();
        setData(trendsData);
      }
    } catch (error) {
      console.error('Error fetching trends:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen p-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center p-8">
            <div className="text-gray-500">Loading trends...</div>
          </div>
        </div>
      </main>
    );
  }

  if (!data) {
    return null;
  }

  // Prepare chart data
  const strainChartData = data.dailyEntries.map(entry => ({
    date: formatDateForDisplay(entry.date).split(' ').slice(1).join(' '), // Just "Mon 8"
    strain: entry.strain || 0,
  }));

  const activityTypeData = Object.entries(data.summary.workoutTypes).map(([type, count]) => ({
    name: type,
    value: count,
  }));

  const readinessData = [
    { name: 'Green', value: data.summary.readinessCount.green, color: '#22c55e' },
    { name: 'Yellow', value: data.summary.readinessCount.yellow, color: '#eab308' },
    { name: 'Red', value: data.summary.readinessCount.red, color: '#ef4444' },
  ].filter(item => item.value > 0);

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

  return (
    <main className="min-h-screen p-4 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto space-y-6 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link href="/" className="text-blue-600 dark:text-blue-400 text-sm mb-2 block">
              ← Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold">Trends & Insights</h1>
          </div>

          {/* Period selector */}
          <div className="flex gap-2">
            <button
              onClick={() => setPeriod(7)}
              className={`px-3 py-1 rounded text-sm ${period === 7 ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
            >
              7 days
            </button>
            <button
              onClick={() => setPeriod(30)}
              className={`px-3 py-1 rounded text-sm ${period === 30 ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
            >
              30 days
            </button>
            <button
              onClick={() => setPeriod(90)}
              className={`px-3 py-1 rounded text-sm ${period === 90 ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
            >
              90 days
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Avg Strain</div>
            <div className="text-2xl font-bold">{data.summary.avgStrain}</div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Workouts</div>
            <div className="text-2xl font-bold">{data.summary.totalWorkouts}</div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Avg Steps/Day</div>
            <div className="text-2xl font-bold">{data.summary.avgSteps.toLocaleString()}</div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Active Days</div>
            <div className="text-2xl font-bold">{data.summary.activeDays}</div>
          </div>
        </div>

        {/* Strain Trend Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Strain Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={strainChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis domain={[0, 21]} />
              <Tooltip />
              <Line type="monotone" dataKey="strain" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Activity Type Breakdown */}
          {activityTypeData.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Activity Types</h2>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={activityTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {activityTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Readiness Distribution */}
          {readinessData.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Readiness Distribution</h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={readinessData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8">
                    {readinessData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Personal Bests */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Personal Bests (Last {period} Days)</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Highest Strain</div>
              <div className="text-xl font-bold text-blue-600">{data.summary.maxStrain.toFixed(1)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Most Steps</div>
              <div className="text-xl font-bold text-blue-600">{data.summary.maxSteps.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Most Calories</div>
              <div className="text-xl font-bold text-blue-600">{data.summary.maxCalories.toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Training Insights */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Training Insights</h2>
          <div className="space-y-3">
            {data.summary.avgStrain > 12 && (
              <div className="border-l-4 border-orange-500 pl-4">
                <p className="text-sm font-medium">High Average Load</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Your average strain of {data.summary.avgStrain} is high. Consider incorporating more recovery days.
                </p>
              </div>
            )}

            {data.summary.avgStrain < 6 && (
              <div className="border-l-4 border-blue-500 pl-4">
                <p className="text-sm font-medium">Room to Increase Load</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Your average strain is relatively low. You may have capacity for increased training volume.
                </p>
              </div>
            )}

            {data.summary.readinessCount.red > data.summary.activeDays * 0.3 && (
              <div className="border-l-4 border-red-500 pl-4">
                <p className="text-sm font-medium">Frequent Low Readiness</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  You've had red readiness on {data.summary.readinessCount.red} days. Focus on recovery and sleep quality.
                </p>
              </div>
            )}

            {data.summary.activeDays / period > 0.8 && (
              <div className="border-l-4 border-green-500 pl-4">
                <p className="text-sm font-medium">Great Consistency!</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  You've been active on {data.summary.activeDays} out of {period} days. Keep up the momentum!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
