'use client';

import { useState, useEffect } from 'react';
import { getYesterdayDate, formatDateForDisplay } from '@/lib/utils';

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
    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 relative">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Daily Check-in</h2>
          {date && (
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
              Yesterday · {formatDateForDisplay(date)}
            </p>
          )}
        </div>
        {!isEditing && hasData && (
          <button
            onClick={handleEdit}
            className="p-2 text-slate-600 dark:text-slate-400 hover:text-neon-green dark:hover:text-neon-green transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
            title="Edit"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Steps */}
          <div className={`p-4 rounded-2xl border-2 transition-all ${
            isEditing
              ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'
              : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800'
          }`}>
            <label htmlFor="steps" className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Steps
            </label>
            <input
              type="number"
              id="steps"
              value={steps}
              onChange={(e) => setSteps(e.target.value)}
              placeholder="10000"
              disabled={!isEditing}
              className={`w-full text-2xl font-bold bg-transparent border-none outline-none ${
                isEditing
                  ? 'text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700'
                  : 'text-slate-600 dark:text-slate-400 cursor-not-allowed'
              }`}
              min="0"
            />
          </div>

          {/* Calories */}
          <div className={`p-4 rounded-2xl border-2 transition-all ${
            isEditing
              ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'
              : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800'
          }`}>
            <label htmlFor="calories" className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Calories
            </label>
            <input
              type="number"
              id="calories"
              value={caloriesBurned}
              onChange={(e) => setCaloriesBurned(e.target.value)}
              placeholder="2500"
              disabled={!isEditing}
              className={`w-full text-2xl font-bold bg-transparent border-none outline-none ${
                isEditing
                  ? 'text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700'
                  : 'text-slate-600 dark:text-slate-400 cursor-not-allowed'
              }`}
              min="0"
            />
          </div>

          {/* Sleep Score */}
          <div className={`p-4 rounded-2xl border-2 transition-all ${
            isEditing
              ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'
              : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800'
          }`}>
            <label htmlFor="sleepScore" className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Sleep
            </label>
            <input
              type="number"
              id="sleepScore"
              value={sleepScore}
              onChange={(e) => setSleepScore(e.target.value)}
              placeholder="75"
              disabled={!isEditing}
              className={`w-full text-2xl font-bold bg-transparent border-none outline-none ${
                isEditing
                  ? 'text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700'
                  : 'text-slate-600 dark:text-slate-400 cursor-not-allowed'
              }`}
              min="0"
              max="100"
            />
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-medium">
              /100
            </p>
          </div>
        </div>

        {isEditing && (
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-neon-green hover:bg-lime-500 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-slate-900 font-bold py-4 px-6 rounded-2xl transition-all shadow-lg hover:shadow-xl disabled:shadow-none"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        )}

        {message && (
          <div className={`text-center text-sm font-semibold py-2 px-4 rounded-xl ${
            message.includes('✓')
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
          }`}>
            {message}
          </div>
        )}
      </form>
    </div>
  );
}
