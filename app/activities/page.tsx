'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';

interface Workout {
  id: number;
  type: string;
  customType: string | null;
  name: string;
  description: string | null;
  date: string;
  startDateLocal: string;
  duration: number;
  distance: number | null;
  elevation: number | null;
  averageHeartrate: number | null;
}

const WORKOUT_TYPES = [
  'Run',
  'Ride',
  'Swim',
  'Walk',
  'Hike',
  'CrossFit',
  'WeightTraining',
  'Yoga',
  'Workout',
];

export default function ActivitiesPage() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ customType: '', description: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    try {
      const response = await fetch('/api/workouts');
      if (response.ok) {
        const data = await response.json();
        setWorkouts(data);
      }
    } catch (error) {
      console.error('Error fetching workouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (workout: Workout) => {
    setEditingId(workout.id);
    setEditForm({
      customType: workout.customType || workout.type,
      description: workout.description || '',
    });
  };

  const handleSave = async (id: number) => {
    setSaving(true);
    try {
      const response = await fetch(`/api/workouts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        const updated = await response.json();
        setWorkouts(workouts.map(w => (w.id === id ? updated : w)));
        setEditingId(null);
      }
    } catch (error) {
      console.error('Error saving workout:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({ customType: '', description: '' });
  };

  if (loading) {
    return (
      <main className="min-h-screen">
        <div className="text-center pt-6 pb-4">
          <h1 className="text-4xl font-bold mb-2 text-white tracking-tight">
            Health Tracker
          </h1>
          <p className="text-slate-300 font-medium">
            Your personal performance dashboard
          </p>
        </div>
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-8 text-center text-slate-400">
          Loading activities...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <div className="text-center pt-6 pb-4">
        <h1 className="text-4xl font-bold mb-2 text-white tracking-tight">
          Health Tracker
        </h1>
        <p className="text-slate-300 font-medium">
          Your personal performance dashboard
        </p>
      </div>

      <Navigation />

      <div className="max-w-4xl mx-auto px-4 pb-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">
            Activity Record
          </h2>
          <p className="text-slate-300 text-sm font-medium">
            Edit workout types and add notes to improve your insights
          </p>
        </div>

        {workouts.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 text-center">
            <p className="text-slate-500 dark:text-slate-400 mb-4">
              No activities yet. Connect Strava to sync your workouts.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {workouts.map((workout) => {
              const isEditing = editingId === workout.id;
              const displayType = workout.customType || workout.type;
              const durationMins = Math.round(workout.duration / 60);

              return (
                <div
                  key={workout.id}
                  className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5"
                >
                  {!isEditing ? (
                    <>
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg font-bold text-slate-900 dark:text-white">
                              {displayType}
                            </span>
                            {workout.customType && (
                              <span className="text-xs bg-neon-green text-slate-900 px-2 py-0.5 rounded-full font-semibold">
                                Edited
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                            {new Date(workout.startDateLocal).toLocaleString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                        <button
                          onClick={() => handleEdit(workout)}
                          className="p-2 text-slate-600 dark:text-slate-400 hover:text-neon-green dark:hover:text-neon-green transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                            />
                          </svg>
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-3 mb-3">
                        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3">
                          <div className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide mb-1">
                            Duration
                          </div>
                          <div className="text-lg font-bold text-slate-900 dark:text-white">
                            {durationMins} min
                          </div>
                        </div>

                        {workout.distance && (
                          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3">
                            <div className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide mb-1">
                              Distance
                            </div>
                            <div className="text-lg font-bold text-slate-900 dark:text-white">
                              {(workout.distance / 1000).toFixed(1)} km
                            </div>
                          </div>
                        )}

                        {workout.averageHeartrate && (
                          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3">
                            <div className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide mb-1">
                              Avg HR
                            </div>
                            <div className="text-lg font-bold text-slate-900 dark:text-white">
                              {Math.round(workout.averageHeartrate)} bpm
                            </div>
                          </div>
                        )}
                      </div>

                      {workout.description && (
                        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3">
                          <div className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide mb-1">
                            Notes
                          </div>
                          <p className="text-sm text-slate-700 dark:text-slate-300">
                            {workout.description}
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                          Workout Type
                        </label>
                        <select
                          value={editForm.customType}
                          onChange={(e) =>
                            setEditForm({ ...editForm, customType: e.target.value })
                          }
                          className="w-full px-4 py-3 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-neon-green focus:border-neon-green"
                        >
                          {WORKOUT_TYPES.map((type) => (
                            <option key={type} value={type}>
                              {type === 'Workout' ? 'CrossFit/Hybrid' : type}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                          Description / Notes
                        </label>
                        <textarea
                          value={editForm.description}
                          onChange={(e) =>
                            setEditForm({ ...editForm, description: e.target.value })
                          }
                          placeholder="Add notes about this workout..."
                          className="w-full px-4 py-3 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-neon-green focus:border-neon-green resize-none"
                          rows={3}
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSave(workout.id)}
                          disabled={saving}
                          className="flex-1 bg-neon-green hover:bg-lime-500 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-slate-900 font-bold py-3 px-4 rounded-xl transition-all"
                        >
                          {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                          onClick={handleCancel}
                          disabled={saving}
                          className="px-6 py-3 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-semibold rounded-xl transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
