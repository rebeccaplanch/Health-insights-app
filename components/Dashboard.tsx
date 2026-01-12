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
  size = 36,
  color = '#7fd8be'
}: { 
  value: number | null; 
  max?: number; 
  size?: number;
  color?: string;
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
          stroke={color}
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
 * Card wrapper component
 */
function Card({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode; 
  className?: string;
}) {
  return (
    <div className={`card px-3 py-4 ${className}`}>
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
    <Card className="flex-1">
      <div className="flex flex-col gap-2">
        <span className="font-mono text-[10px] md:text-xs tracking-wide-upper text-[#f2f0e3]">
          {label}
        </span>
        <span className="font-mono font-medium text-2xl text-[#f2f0e3]">
          {value}
        </span>
      </div>
    </Card>
  );
}

/**
 * Insight row with icon
 */
function InsightRow({ message, type }: { message: string; type: string }) {
  const isStrain = type === 'strain';
  const isRecovery = type === 'recovery';
  const isWorkouts = type === 'workouts';
  const isSteps = type === 'steps';
  const isReadiness = type === 'readiness';
  
  return (
    <div className="flex gap-2.5 items-start">
      {/* Priority/Info icon */}
      <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
        {isStrain ? (
          <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#7fd8be">
            <path d="M160-400v-80h640v80H160Zm0-120v-80h640v80H160ZM440-80v-128l-64 64-56-56 160-160 160 160-56 56-64-62v126h-80Zm40-560L320-800l56-56 64 64v-128h80v128l64-64 56 56-160 160Z"/>
          </svg>
        ) : isRecovery ? (
          <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#7fd8be">
            <path d="M314-115q-104-48-169-145T80-479q0-26 2.5-51t8.5-49l-46 27-40-69 191-110 110 190-70 40-54-94q-11 27-16.5 56t-5.5 60q0 97 53 176.5T354-185l-40 70Zm306-485v-80h109q-46-57-111-88.5T480-800q-55 0-104 17t-90 48l-40-70q50-35 109-55t125-20q79 0 151 29.5T760-765v-55h80v220H620ZM594 0 403-110l110-190 69 40-57 98q118-17 196.5-107T800-480q0-11-.5-20.5T797-520h81q1 10 1.5 19.5t.5 20.5q0 135-80.5 241.5T590-95l44 26-40 69Z"/>
          </svg>
        ) : isWorkouts ? (
          <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#7fd8be">
            <path d="M610-760q-21 0-35.5-14.5T560-810q0-21 14.5-35.5T610-860q21 0 35.5 14.5T660-810q0 21-14.5 35.5T610-760Zm0 660q-21 0-35.5-14.5T560-150q0-21 14.5-35.5T610-200q21 0 35.5 14.5T660-150q0 21-14.5 35.5T610-100Zm160-520q-21 0-35.5-14.5T720-670q0-21 14.5-35.5T770-720q21 0 35.5 14.5T820-670q0 21-14.5 35.5T770-620Zm0 380q-21 0-35.5-14.5T720-290q0-21 14.5-35.5T770-340q21 0 35.5 14.5T820-290q0 21-14.5 35.5T770-240Zm60-190q-21 0-35.5-14.5T780-480q0-21 14.5-35.5T830-530q21 0 35.5 14.5T880-480q0 21-14.5 35.5T830-430ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880v80q-134 0-227 93t-93 227q0 134 93 227t227 93v80Zm0-320q-33 0-56.5-23.5T400-480q0-5 .5-10.5T403-501l-83-83 56-56 83 83q4-1 21-3 33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Z"/>
          </svg>
        ) : isSteps ? (
          <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#7fd8be">
            <path d="M216-580q39 0 74 14t64 41l382 365h24q17 0 28.5-11.5T800-200q0-8-1.5-17T788-235L605-418l-71-214-74 18q-38 10-69-14t-31-63v-84l-28-14-154 206q-1 1-1 1.5t-1 1.5h40Zm0 80h-46q3 7 7.5 13t10.5 11l324 295q11 11 25 16t29 5h54L299-467q-17-17-38.5-25t-44.5-8ZM566-80q-30 0-57-11t-50-31L134-417q-46-42-51.5-103T114-631l154-206q17-23 45.5-30.5T368-861l28 14q21 11 32.5 30t11.5 42v84l74-19q30-8 58 7.5t38 44.5l65 196 170 170q20 20 27.5 43t7.5 49q0 50-35 85t-85 35H566Z"/>
          </svg>
        ) : isReadiness ? (
          <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#7fd8be">
            <path d="M660-80v-120H560l140-200v120h100L660-80Zm-300-80Zm-40 80q-17 0-28.5-11.5T280-120v-640q0-17 11.5-28.5T320-800h80v-80h160v80h80q17 0 28.5 11.5T680-760v280q-21 0-41 3.5T600-466v-254H360v560h94q8 23 19.5 43T501-80H320Z"/>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#7fd8be">
            <path d="M440-400v-360h80v360h-80Zm0 200v-80h80v80h-80Z"/>
          </svg>
        )}
      </div>
      <p className="font-sans text-xs text-[#f2f0e3] leading-normal flex-1">
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
        <div className="text-[#f2f0e3]/60 font-mono text-sm">Loading...</div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  // Readiness status configuration
  const readinessConfig = {
    green: { label: 'Ready', color: '#7fd8be' },
    yellow: { label: 'Moderate', color: '#f9f871' },
    red: { label: 'Rest', color: '#ef4444' },
  }[data.readiness || 'green'];

  // Format values for display
  const strainDisplay = data.strain !== null ? data.strain.toFixed(1) : '–';
  const stepsDisplay = data.steps !== null ? data.steps.toLocaleString() : '–';
  const caloriesDisplay = data.caloriesBurned !== null ? data.caloriesBurned.toLocaleString() : '–';

  return (
    <div className="space-y-2">
      {/* Current Strain Card */}
      <Card>
        <div className="flex flex-col gap-2">
          {/* Header row */}
          <div className="flex items-center justify-between">
            <span className="font-mono font-medium text-sm text-accent">
              Current strain
            </span>
            <span className="font-mono text-[10px] md:text-xs tracking-wide-upper text-[#f2f0e3]">
              {formatDateForDisplay(data.date)}
            </span>
          </div>

          {/* Strain display row */}
          <div className="flex gap-4 items-center">
            {/* Circular progress */}
            <StrainCircle value={data.strain} color={readinessConfig.color} />

            {/* Value and status */}
            <div className="flex-1 flex flex-col">
              <span className="font-mono font-medium text-[40px] leading-none text-[#f2f0e3]">
                {strainDisplay}
              </span>
              <div className="flex items-center justify-between mt-1">
                <span className="font-mono text-xs tracking-wider-upper text-[#f2f0e3]">
                  of 21 units
                </span>
                {/* Status pill */}
                <div className="status-pill">
                  <StatusDot color={readinessConfig.color} />
                  <span className="font-mono text-xs tracking-wider-upper text-[#f2f0e3]">
                    {readinessConfig.label}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Stats Row */}
      <div className="flex gap-2">
        <StatCard label="Steps" value={stepsDisplay} />
        <StatCard label="Calories" value={caloriesDisplay} />
        <StatCard label="Workouts" value={data.workoutCount} />
      </div>

      {/* Insights Card */}
      {data.insights && data.insights.length > 0 && (
        <Card>
          <div className="flex flex-col gap-3">
            <span className="font-mono font-medium text-sm text-accent">
              Insights
            </span>
            <div className="flex flex-col gap-3">
              {data.insights.map((insight, index) => (
                <InsightRow key={index} message={insight.message} type={insight.type} />
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
