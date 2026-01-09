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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 relative">
      <div className="mb-4">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">Daily Check-in</h2>
            {date && (
              <p className="text-gray-600 dark:text-gray-400">
                Yesterday · {formatDateForDisplay(date)}
              </p>
            )}
          </div>
          {!isEditing && hasData && (
            <button
              onClick={handleEdit}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              title="Edit"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          )}
        </div>
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
            disabled={!isEditing}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 ${
              isEditing
                ? 'border-gray-300 dark:border-gray-600'
                : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 cursor-not-allowed'
            }`}
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
            disabled={!isEditing}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 ${
              isEditing
                ? 'border-gray-300 dark:border-gray-600'
                : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 cursor-not-allowed'
            }`}
            min="0"
          />
        </div>

        <div>
          <label htmlFor="sleepScore" className="block text-sm font-medium mb-2">
            Sleep Score (Garmin)
          </label>
          <input
            type="number"
            id="sleepScore"
            value={sleepScore}
            onChange={(e) => setSleepScore(e.target.value)}
            placeholder="75"
            disabled={!isEditing}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 ${
              isEditing
                ? 'border-gray-300 dark:border-gray-600'
                : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 cursor-not-allowed'
            }`}
            min="0"
            max="100"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            0-100 scale from your Garmin device
          </p>
        </div>

        {isEditing && (
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        )}

        {message && (
          <p className={`text-center text-sm ${message.includes('✓') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
}
