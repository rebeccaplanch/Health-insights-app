'use client';

import { useState, useEffect } from 'react';
import { getYesterdayDate, formatDateForDisplay } from '@/lib/utils';

/**
 * Up arrow icon (no background fill)
 */
function UpArrow({ className = '' }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      height="24" 
      viewBox="0 -960 960 960" 
      width="24" 
      fill="currentColor"
      className={className}
    >
      <path d="M358-598l-58-58 180-180 180 180-58 58-122-122-122 122Z"/>
    </svg>
  );
}

/**
 * Down arrow icon (no background fill)
 */
function DownArrow({ className = '' }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      height="24" 
      viewBox="0 -960 960 960" 
      width="24" 
      fill="currentColor"
      className={className}
    >
      <path d="M480-120 300-300l58-58 122 122 122-122 58 58-180 180Z"/>
    </svg>
  );
}

/**
 * Number input with up/down arrows
 */
function NumberInput({
  id,
  value,
  onChange,
  placeholder = '–',
  disabled = false,
  min,
  max,
  suffix,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  min?: number;
  max?: number;
  suffix?: string;
}) {
  const increment = () => {
    const current = parseInt(value) || 0;
    if (max !== undefined && current >= max) return;
    onChange((current + 1).toString());
  };

  const decrement = () => {
    const current = parseInt(value) || 0;
    if (min !== undefined && current <= min) return;
    if (current > 0) onChange((current - 1).toString());
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-baseline gap-1 flex-1">
        <input
          type="number"
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full font-mono font-medium text-xl bg-transparent border-none outline-none appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${
            !disabled
              ? 'text-[#f1f1f1] placeholder:text-[#f1f1f1]/30'
              : 'text-[#f1f1f1]/60 cursor-not-allowed'
          }`}
          min={min}
          max={max}
        />
        {suffix && (
          <span className="font-mono text-xs text-[#f1f1f1]/40">{suffix}</span>
        )}
      </div>
      {!disabled && (
        <div className="hidden md:flex flex-col -space-y-4">
          <button
            type="button"
            onClick={increment}
            className="text-[#f1f1f1]/40 hover:text-[#f1f1f1] transition-colors"
            tabIndex={-1}
          >
            <UpArrow />
          </button>
          <button
            type="button"
            onClick={decrement}
            className="text-[#f1f1f1]/40 hover:text-[#f1f1f1] transition-colors"
            tabIndex={-1}
          >
            <DownArrow />
          </button>
        </div>
      )}
    </div>
  );
}

export default function DailyCheckin() {
  const [date, setDate] = useState('');
  const [steps, setSteps] = useState('');
  const [caloriesBurned, setCaloriesBurned] = useState('');
  const [sleepScore, setSleepScore] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isEditing, setIsEditing] = useState(true);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    // Set yesterday's date on the client side (logging completed data)
    const yesterday = getYesterdayDate();
    setDate(yesterday);

    // Fetch existing data for yesterday
    fetchDateData(yesterday);
  }, []);

  const fetchDateData = async (dateStr: string) => {
    try {
      const response = await fetch(`/api/daily?date=${dateStr}`);
      if (response.ok) {
        const data = await response.json();
        if (data) {
          const dataExists = data.steps !== null || data.caloriesBurned !== null || data.sleepScore !== null;
          setHasData(dataExists);
          setIsEditing(!dataExists); // If data exists, start in locked mode
          setSteps(data.steps?.toString() || '');
          setCaloriesBurned(data.caloriesBurned?.toString() || '');
          setSleepScore(data.sleepScore?.toString() || '');
        }
      }
    } catch (error) {
      console.error('Error fetching date data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/daily', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date,
          steps: steps ? parseInt(steps) : null,
          caloriesBurned: caloriesBurned ? parseInt(caloriesBurned) : null,
          sleepScore: sleepScore ? parseInt(sleepScore) : null,
        }),
      });

      if (response.ok) {
        setMessage('✓ Saved successfully');
        setHasData(true);
        setIsEditing(false); // Lock the form after saving
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('✗ Failed to save');
      }
    } catch (error) {
      console.error('Error saving:', error);
      setMessage('✗ Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setMessage('');
  };

  return (
    <div className="card px-3 py-4 relative">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="font-mono font-medium text-sm text-accent">Daily Check-in</h2>
          {date && (
            <p className="font-mono text-[10px] md:text-xs tracking-wide-upper text-[#f1f1f1]/60 mt-1">
              Yesterday · {formatDateForDisplay(date)}
            </p>
          )}
        </div>
        {!isEditing && hasData && (
          <button
            onClick={handleEdit}
            className="p-2 text-[#f1f1f1]/60 hover:text-accent transition-colors rounded-lg"
            title="Edit"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-2">
          {/* Steps */}
          <div className={`p-3 rounded-lg transition-all ${
            isEditing
              ? 'bg-[#1a2542]'
              : 'bg-[#1a2542]/50'
          }`}>
            <label htmlFor="steps" className="block font-mono text-[10px] md:text-xs tracking-wide-upper text-[#f1f1f1]/60 mb-2">
              Steps
            </label>
            <NumberInput
              id="steps"
              value={steps}
              onChange={setSteps}
              disabled={!isEditing}
              min={0}
            />
          </div>

          {/* Calories */}
          <div className={`p-3 rounded-lg transition-all ${
            isEditing
              ? 'bg-[#1a2542]'
              : 'bg-[#1a2542]/50'
          }`}>
            <label htmlFor="calories" className="block font-mono text-[10px] md:text-xs tracking-wide-upper text-[#f1f1f1]/60 mb-2">
              Calories
            </label>
            <NumberInput
              id="calories"
              value={caloriesBurned}
              onChange={setCaloriesBurned}
              disabled={!isEditing}
              min={0}
            />
          </div>

          {/* Sleep Score */}
          <div className={`p-3 rounded-lg transition-all ${
            isEditing
              ? 'bg-[#1a2542]'
              : 'bg-[#1a2542]/50'
          }`}>
            <label htmlFor="sleepScore" className="block font-mono text-[10px] md:text-xs tracking-wide-upper text-[#f1f1f1]/60 mb-2">
              Sleep
            </label>
            <NumberInput
              id="sleepScore"
              value={sleepScore}
              onChange={setSleepScore}
              disabled={!isEditing}
              min={0}
              max={100}
              suffix="/100"
            />
          </div>
        </div>

        {isEditing && (
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-[#1a2542] hover:bg-[#1e2a4a] disabled:bg-[#1a2542]/50 text-accent font-mono font-medium py-2 px-6 rounded-lg transition-all"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        )}

        {message && (
          <div className={`text-center font-mono text-xs py-2 px-3 rounded-lg ${
            message.includes('✓')
              ? 'bg-accent/20 text-accent'
              : 'bg-red-500/20 text-red-400'
          }`}>
            {message}
          </div>
        )}
      </form>
    </div>
  );
}
