'use client';

import { useState, useEffect } from 'react';
import { getTodayDate, formatDateForDisplay } from '@/lib/utils';

export default function DailyCheckin() {
  const [date, setDate] = useState('');
  const [steps, setSteps] = useState('');
  const [caloriesBurned, setCaloriesBurned] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Set today's date on the client side
    const today = getTodayDate();
    setDate(today);

    // Fetch existing data for today
    fetchTodayData(today);
  }, []);

  const fetchTodayData = async (dateStr: string) => {
    try {
      const response = await fetch(`/api/daily?date=${dateStr}`);
      if (response.ok) {
        const data = await response.json();
        if (data) {
          setSteps(data.steps?.toString() || '');
          setCaloriesBurned(data.caloriesBurned?.toString() || '');
        }
      }
    } catch (error) {
      console.error('Error fetching today\'s data:', error);
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
        }),
      });

      if (response.ok) {
        setMessage('✓ Saved successfully');
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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="mb-4">
        <h2 className="text-2xl font-bold">Daily Check-in</h2>
        {date && (
          <p className="text-gray-600 dark:text-gray-400">
            Today · {formatDateForDisplay(date)}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="steps" className="block text-sm font-medium mb-2">
            Steps
          </label>
          <input
            type="number"
            id="steps"
            value={steps}
            onChange={(e) => setSteps(e.target.value)}
            placeholder="10000"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700"
            min="0"
          />
        </div>

        <div>
          <label htmlFor="calories" className="block text-sm font-medium mb-2">
            Calories Burned
          </label>
          <input
            type="number"
            id="calories"
            value={caloriesBurned}
            onChange={(e) => setCaloriesBurned(e.target.value)}
            placeholder="2500"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700"
            min="0"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
        >
          {loading ? 'Saving...' : 'Save'}
        </button>

        {message && (
          <p className={`text-center text-sm ${message.includes('✓') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
}
