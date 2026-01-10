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

/**
 * Circular progress indicator for strain display
 */
function StrainCircle({ 
  value, 
  max = 21, 
  size = 36 
}: { 
  value: number | null; 
  max?: number; 
  size?: number;
}) {
  const percentage = value !== null ? (value / max) * 100 : 0;
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * percentage) / 100;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#7fd8be"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
    </div>
  );
}

/**
 * Status indicator dot
 */
function StatusDot({ color = '#7fd8be' }: { color?: string }) {
  return (
    <div 
      className="w-1.5 h-1.5 rounded-full" 
      style={{ backgroundColor: color }}
    />
  );
}

/**
 * Glass card wrapper component
 */
function GlassCard({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode; 
  className?: string;
}) {
  return (
    <div className={`glass-card px-3 py-4 ${className}`}>
      {children}
    </div>
  );
}

/**
 * Stat card for quick metrics (Steps, Calories, Workouts)
 */
function StatCard({ 
  label, 
  value 
}: { 
  label: string; 
  value: string | number;
}) {
  return (
    <GlassCard className="flex-1">
      <div className="flex flex-col gap-2">
        <span className="font-mono text-[10px] md:text-xs tracking-wide-upper text-[#f1f1f1]">
          {label}
        </span>
        <span className="font-mono font-medium text-2xl text-[#f1f1f1]">
          {value}
        </span>
      </div>
    </GlassCard>
  );
}

/**
 * Insight row with icon
 */
function InsightRow({ message }: { message: string }) {
  return (
    <div className="flex gap-2.5 items-start">
      {/* Alert/Info icon */}
      <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path 
            d="M10 6V10M10 14H10.01M19 10C19 14.9706 14.9706 19 10 19C5.02944 19 1 14.9706 1 10C1 5.02944 5.02944 1 10 1C14.9706 1 19 5.02944 19 10Z" 
            stroke="#7fd8be" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <p className="font-sans text-xs text-[#f1f1f1] leading-normal flex-1">
        {message}
      </p>
    </div>
  );
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

  /**
   * Fetches dashboard data from the API
   * Preserves all existing data fetching logic
   */
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
        <div className="text-[#f1f1f1]/60 font-mono text-sm">Loading...</div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  // Readiness status configuration
  const readinessConfig = {
    green: { label: 'Ready', color: '#7fd8be' },
    yellow: { label: 'Moderate', color: '#fbbf24' },
    red: { label: 'Rest', color: '#ef4444' },
  }[data.readiness || 'green'];

  // Format values for display
  const strainDisplay = data.strain !== null ? data.strain.toFixed(1) : '–';
  const stepsDisplay = data.steps !== null ? data.steps.toLocaleString() : '–';
  const caloriesDisplay = data.caloriesBurned !== null ? data.caloriesBurned.toLocaleString() : '–';

  return (
    <div className="space-y-2">
      {/* Current Strain Card */}
      <GlassCard>
        <div className="flex flex-col gap-2">
          {/* Header row */}
          <div className="flex items-center justify-between">
            <span className="font-mono font-medium text-sm text-accent">
              Current strain
            </span>
            <span className="font-mono text-[10px] md:text-xs tracking-wide-upper text-[#f1f1f1]">
              {formatDateForDisplay(data.date)}
            </span>
          </div>

          {/* Strain display row */}
          <div className="flex gap-4 items-center">
            {/* Circular progress */}
            <StrainCircle value={data.strain} />

            {/* Value and status */}
            <div className="flex-1 flex flex-col">
              <span className="font-mono font-medium text-[40px] leading-none text-[#f1f1f1]">
                {strainDisplay}
              </span>
              <div className="flex items-center justify-between mt-1">
                <span className="font-mono text-xs tracking-wider-upper text-[#f1f1f1]">
                  of 21 units
                </span>
                {/* Status pill */}
                <div className="status-pill">
                  <StatusDot color={readinessConfig.color} />
                  <span className="font-mono text-xs tracking-wider-upper text-[#f1f1f1]">
                    {readinessConfig.label}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Quick Stats Row */}
      <div className="flex gap-2">
        <StatCard label="Steps" value={stepsDisplay} />
        <StatCard label="Calories" value={caloriesDisplay} />
        <StatCard label="Workouts" value={data.workoutCount} />
      </div>

      {/* Insights Card */}
      {data.insights && data.insights.length > 0 && (
        <GlassCard>
          <div className="flex flex-col gap-3">
            <span className="font-mono font-medium text-sm text-accent">
              Insights
            </span>
            <div className="flex flex-col gap-3">
              {data.insights.map((insight, index) => (
                <InsightRow key={index} message={insight.message} />
              ))}
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
