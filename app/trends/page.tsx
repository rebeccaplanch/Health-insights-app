'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Navigation from '@/components/Navigation';
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

/**
 * Trends page - displays charts and analytics for health data
 * Design system: DM Mono/Sans, accent teal, solid navy cards
 */
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
      <main className="min-h-screen">
        {/* Navigation - hidden on mobile */}
        <div className="hidden md:block px-6 pt-6 max-w-lg mx-auto md:max-w-2xl lg:max-w-4xl">
          <Navigation />
        </div>

        <div className="px-6 pt-8 pb-20 max-w-lg mx-auto md:max-w-2xl lg:max-w-4xl space-y-4">
          <div className="pb-4">
            <p className="font-mono italic text-sm text-accent mb-1">
              Analytics
            </p>
            <h1 className="font-mono font-medium text-[48px] leading-none tracking-display text-[#f1f1f1] md:text-6xl lg:text-7xl">
              TRENDS
            </h1>
          </div>

          <div className="glass-card p-8 text-center">
            <p className="text-[#f1f1f1]/60 font-mono">Loading trends...</p>
          </div>
        </div>

        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
          <Navigation />
        </div>
      </main>
    );
  }

  if (!data) {
    return null;
  }

  // Prepare chart data
  const strainChartData = data.dailyEntries.map(entry => ({
    date: formatDateForDisplay(entry.date).split(' ').slice(1).join(' '),
    strain: entry.strain || 0,
  }));

  const activityTypeData = Object.entries(data.summary.workoutTypes).map(([type, count]) => ({
    name: type,
    value: count,
  }));

  const readinessData = [
    { name: 'Green', value: data.summary.readinessCount.green, color: '#7fd8be' },
    { name: 'Yellow', value: data.summary.readinessCount.yellow, color: '#eab308' },
    { name: 'Red', value: data.summary.readinessCount.red, color: '#ef4444' },
  ].filter(item => item.value > 0);

  const COLORS = ['#7fd8be', '#6E81B7', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4'];

  return (
    <main className="min-h-screen">
      {/* Navigation - hidden on mobile */}
      <div className="hidden md:block px-6 pt-6 max-w-lg mx-auto md:max-w-2xl lg:max-w-4xl">
        <Navigation />
      </div>

      <div className="px-6 pt-8 pb-20 max-w-lg mx-auto md:max-w-2xl lg:max-w-4xl space-y-4">
        {/* Header */}
        <div className="pb-4">
          <p className="font-mono italic text-sm text-accent mb-1">
            Analytics
          </p>
          <h1 className="font-mono font-medium text-[48px] leading-none tracking-display text-[#f1f1f1] md:text-6xl lg:text-7xl">
            TRENDS
          </h1>
        </div>

        {/* Period Selector */}
        <div className="flex gap-2">
          {[7, 30, 90].map((days) => (
            <button
              key={days}
              onClick={() => setPeriod(days)}
              className={`px-4 py-2 rounded-lg font-mono text-sm transition-all ${
                period === days
                  ? 'bg-accent text-[#12192f]'
                  : 'bg-[#12192f] text-[#f1f1f1]/60 hover:text-[#f1f1f1]'
              }`}
            >
              {days}d
            </button>
          ))}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-card p-4">
            <p className="font-mono text-[10px] md:text-xs text-[#f1f1f1]/40 uppercase tracking-wider mb-1">Avg Strain</p>
            <p className="font-mono text-2xl text-[#f1f1f1]">{data.summary.avgStrain}</p>
          </div>
          <div className="glass-card p-4">
            <p className="font-mono text-[10px] md:text-xs text-[#f1f1f1]/40 uppercase tracking-wider mb-1">Workouts</p>
            <p className="font-mono text-2xl text-[#f1f1f1]">{data.summary.totalWorkouts}</p>
          </div>
          <div className="glass-card p-4">
            <p className="font-mono text-[10px] md:text-xs text-[#f1f1f1]/40 uppercase tracking-wider mb-1">Avg Steps</p>
            <p className="font-mono text-2xl text-[#f1f1f1]">{data.summary.avgSteps.toLocaleString()}</p>
          </div>
          <div className="glass-card p-4">
            <p className="font-mono text-[10px] md:text-xs text-[#f1f1f1]/40 uppercase tracking-wider mb-1">Active Days</p>
            <p className="font-mono text-2xl text-[#f1f1f1]">{data.summary.activeDays}</p>
          </div>
        </div>

        {/* Strain Trend Chart */}
        <div className="glass-card p-4">
          <h2 className="font-mono text-sm text-[#f1f1f1]/60 uppercase tracking-wider mb-4">Strain Trend</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={strainChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#6E81B7" strokeOpacity={0.2} />
              <XAxis 
                dataKey="date" 
                fontSize={10} 
                stroke="#f1f1f1" 
                strokeOpacity={0.4}
                tick={{ fill: '#f1f1f1', fillOpacity: 0.4 }}
              />
              <YAxis 
                domain={[0, 21]} 
                fontSize={10}
                stroke="#f1f1f1" 
                strokeOpacity={0.4}
                tick={{ fill: '#f1f1f1', fillOpacity: 0.4 }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1a2542', 
                  border: 'none', 
                  borderRadius: '8px',
                  fontFamily: 'var(--font-mono)'
                }}
                labelStyle={{ color: '#f1f1f1' }}
              />
              <Line 
                type="monotone" 
                dataKey="strain" 
                stroke="#7fd8be" 
                strokeWidth={2} 
                dot={{ r: 3, fill: '#7fd8be' }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Charts Row */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Activity Types */}
          {activityTypeData.length > 0 && (
            <div className="glass-card p-4">
              <h2 className="font-mono text-sm text-[#f1f1f1]/60 uppercase tracking-wider mb-4">Activity Types</h2>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={activityTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                    fontSize={10}
                  >
                    {activityTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1a2542', 
                      border: 'none', 
                      borderRadius: '8px',
                      fontFamily: 'var(--font-mono)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Readiness Distribution */}
          {readinessData.length > 0 && (
            <div className="glass-card p-4">
              <h2 className="font-mono text-sm text-[#f1f1f1]/60 uppercase tracking-wider mb-4">Readiness</h2>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={readinessData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#6E81B7" strokeOpacity={0.2} />
                  <XAxis 
                    dataKey="name" 
                    fontSize={10}
                    stroke="#f1f1f1" 
                    strokeOpacity={0.4}
                    tick={{ fill: '#f1f1f1', fillOpacity: 0.4 }}
                  />
                  <YAxis 
                    fontSize={10}
                    stroke="#f1f1f1" 
                    strokeOpacity={0.4}
                    tick={{ fill: '#f1f1f1', fillOpacity: 0.4 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1a2542', 
                      border: 'none', 
                      borderRadius: '8px',
                      fontFamily: 'var(--font-mono)'
                    }}
                  />
                  <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]}>
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
        <div className="glass-card p-4">
          <h2 className="font-mono text-sm text-[#f1f1f1]/60 uppercase tracking-wider mb-4">
            Personal Bests <span className="text-accent">({period}d)</span>
          </h2>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className="font-mono text-[10px] md:text-xs text-[#f1f1f1]/40 mb-1">Highest Strain</p>
              <p className="font-mono text-xl text-accent">{data.summary.maxStrain.toFixed(1)}</p>
            </div>
            <div>
              <p className="font-mono text-[10px] md:text-xs text-[#f1f1f1]/40 mb-1">Most Steps</p>
              <p className="font-mono text-xl text-accent">{data.summary.maxSteps.toLocaleString()}</p>
            </div>
            <div>
              <p className="font-mono text-[10px] md:text-xs text-[#f1f1f1]/40 mb-1">Most Calories</p>
              <p className="font-mono text-xl text-accent">{data.summary.maxCalories.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Training Insights */}
        <div className="glass-card p-4">
          <h2 className="font-mono text-sm text-[#f1f1f1]/60 uppercase tracking-wider mb-4">Insights</h2>
          <div className="space-y-3">
            {data.summary.avgStrain > 12 && (
              <div className="border-l-2 border-amber-500 pl-3">
                <p className="font-mono text-sm text-[#f1f1f1]">High Average Load</p>
                <p className="text-xs text-[#f1f1f1]/60 mt-1">
                  Your average strain of {data.summary.avgStrain} is high. Consider incorporating more recovery days.
                </p>
              </div>
            )}

            {data.summary.avgStrain < 6 && (
              <div className="border-l-2 border-accent pl-3">
                <p className="font-mono text-sm text-[#f1f1f1]">Room to Increase Load</p>
                <p className="text-xs text-[#f1f1f1]/60 mt-1">
                  Your average strain is relatively low. You may have capacity for increased training volume.
                </p>
              </div>
            )}

            {data.summary.readinessCount.red > data.summary.activeDays * 0.3 && (
              <div className="border-l-2 border-red-500 pl-3">
                <p className="font-mono text-sm text-[#f1f1f1]">Frequent Low Readiness</p>
                <p className="text-xs text-[#f1f1f1]/60 mt-1">
                  You've had red readiness on {data.summary.readinessCount.red} days. Focus on recovery and sleep quality.
                </p>
              </div>
            )}

            {data.summary.activeDays / period > 0.8 && (
              <div className="border-l-2 border-accent pl-3">
                <p className="font-mono text-sm text-[#f1f1f1]">Great Consistency!</p>
                <p className="text-xs text-[#f1f1f1]/60 mt-1">
                  You've been active on {data.summary.activeDays} out of {period} days. Keep up the momentum!
                </p>
              </div>
            )}

            {data.summary.avgStrain >= 6 && data.summary.avgStrain <= 12 && 
             data.summary.readinessCount.red <= data.summary.activeDays * 0.3 &&
             data.summary.activeDays / period <= 0.8 && (
              <div className="border-l-2 border-[#6E81B7] pl-3">
                <p className="font-mono text-sm text-[#f1f1f1]">Balanced Training</p>
                <p className="text-xs text-[#f1f1f1]/60 mt-1">
                  Your training load is well-balanced. Keep monitoring your readiness to optimize performance.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
        <Navigation />
      </div>
    </main>
  );
}
