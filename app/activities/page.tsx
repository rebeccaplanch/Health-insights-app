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
  calories: number | null;
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

/**
 * Activities page - displays and allows editing of workout records
 * Design system: DM Mono/Sans, accent teal, solid navy cards
 */
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
        // Use mock data in development if no workouts exist
        if (data.length === 0 && typeof window !== 'undefined' && window.location.hostname === 'localhost') {
          const mockWorkout: Workout = {
            id: 1,
            type: 'Run',
            customType: null,
            name: 'Morning Run',
            description: null,
            date: new Date().toISOString().split('T')[0],
            startDateLocal: new Date().toISOString(),
            duration: 2700, // 45 minutes in seconds
            distance: 8000, // 8km in meters
            elevation: 120,
            averageHeartrate: 145,
            calories: 450,
          };
          setWorkouts([mockWorkout]);
        } else {
          setWorkouts(data);
        }
      } else {
        // Mock data for dev environment when API is not available
        const mockWorkout: Workout = {
          id: 1,
          type: 'Run',
          customType: null,
          name: 'Morning Run',
          description: null,
          date: new Date().toISOString().split('T')[0],
          startDateLocal: new Date().toISOString(),
          duration: 2700, // 45 minutes in seconds
          distance: 8000, // 8km in meters
          elevation: 120,
          averageHeartrate: 145,
        };
        setWorkouts([mockWorkout]);
      }
    } catch (error) {
      console.error('Error fetching workouts:', error);
      // Mock data for dev environment if API fails
      const mockWorkout: Workout = {
        id: 1,
        type: 'Run',
        customType: null,
        name: 'Morning Run',
        description: null,
        date: new Date().toISOString().split('T')[0],
        startDateLocal: new Date().toISOString(),
        duration: 2700, // 45 minutes in seconds
        distance: 8000, // 8km in meters
        elevation: 120,
        averageHeartrate: 145,
      };
      setWorkouts([mockWorkout]);
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
        {/* Navigation - hidden on mobile */}
        <div className="hidden md:block px-6 pt-6 max-w-lg mx-auto md:max-w-2xl lg:max-w-4xl">
          <Navigation />
        </div>

        <div className="px-6 pt-8 pb-20 max-w-lg mx-auto md:max-w-2xl lg:max-w-4xl space-y-4">
          <div className="pb-4">
            <p className="font-mono italic text-sm text-accent mb-1">
              Your workouts
            </p>
            <h1 className="font-mono font-medium text-[48px] leading-none tracking-display text-[var(--foreground)]">
              ACTIVITIES
            </h1>
          </div>

          <div className="card p-8 text-center">
            <p className="text-[#999999] font-mono">Loading activities...</p>
          </div>
        </div>

        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
          <Navigation />
        </div>
      </main>
    );
  }

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
            Your workouts
          </p>
          <h1 className="font-mono font-medium text-[48px] leading-none tracking-display text-[var(--foreground)]">
            ACTIVITIES
          </h1>
        </div>

        {/* Subtitle */}
        <p className="text-[#999999] text-sm">
          Edit workout types and add notes to improve your insights
        </p>

        {/* Workouts List */}
        {workouts.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-[#999999] font-mono mb-2">No activities yet</p>
            <p className="text-[#999999] text-sm">
              Connect Strava to sync your workouts
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {workouts.map((workout) => {
              const isEditing = editingId === workout.id;
              const displayType = workout.customType || workout.type;
              const durationMins = Math.round(workout.duration / 60);

              return (
                <div key={workout.id} className="card p-4">
                  {!isEditing ? (
                    <>
                      {/* Header Row */}
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-lg text-[var(--foreground)]">
                              {displayType}
                            </span>
                            {workout.customType && (
                              <span className="text-[10px] md:text-xs bg-accent text-[#12192f] px-2 py-0.5 rounded-full font-mono font-medium">
                                Edited
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#999999] font-mono">
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
                          className="p-2 text-[#999999] hover:text-accent transition-colors rounded-lg"
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

                      {/* Stats Grid */}
                      <div className="flex gap-2 mb-3">
                        <div className="bg-[#1a2542] rounded-lg p-3 flex-1">
                          <p className="font-mono text-[10px] md:text-xs text-[#f2f0e3]/40 uppercase tracking-wider mb-1">
                            Duration
                          </p>
                          <p className="font-mono text-lg text-[var(--foreground)]">
                            {durationMins}m
                          </p>
                        </div>

                        <div className="bg-[#1a2542] rounded-lg p-3 flex-1">
                          <p className="font-mono text-[10px] md:text-xs text-[#f2f0e3]/40 uppercase tracking-wider mb-1">
                            Calories
                          </p>
                          <p className="font-mono text-lg text-[var(--foreground)]">
                            {workout.calories ? workout.calories.toLocaleString() : '–'}
                          </p>
                        </div>

                        {workout.averageHeartrate && (
                          <div className="bg-[#1a2542] rounded-lg p-3 flex-1">
                            <p className="font-mono text-[10px] md:text-xs text-[#f2f0e3]/40 uppercase tracking-wider mb-1">
                              Avg HR
                            </p>
                            <p className="font-mono text-lg text-[var(--foreground)]">
                              {Math.round(workout.averageHeartrate)}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Notes */}
                      {workout.description && (
                        <div className="bg-[#1a2542] rounded-lg p-3">
                          <p className="font-mono text-[10px] md:text-xs text-[#f2f0e3]/40 uppercase tracking-wider mb-1">
                            Notes
                          </p>
                          <p className="text-sm text-[#cccccc]">
                            {workout.description}
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    /* Edit Mode */
                    <div className="space-y-4">
                      <div>
                        <label className="block font-mono text-[10px] md:text-xs text-[#999999] uppercase tracking-wider mb-2">
                          Workout Type
                        </label>
                        <select
                          value={editForm.customType}
                          onChange={(e) =>
                            setEditForm({ ...editForm, customType: e.target.value })
                          }
                          style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23C7C1B8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                            backgroundSize: '16px',
                            backgroundPosition: 'right 1rem center',
                            backgroundRepeat: 'no-repeat',
                          }}
                          className="w-full px-4 py-3 pr-10 bg-[#1a2542] border border-[#6E81B7]/30 rounded-lg text-[var(--foreground)] font-mono focus:outline-none focus:border-accent appearance-none"
                        >
                          {WORKOUT_TYPES.map((type) => (
                            <option key={type} value={type}>
                              {type === 'Workout' ? 'CrossFit/Hybrid' : type}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block font-mono text-[10px] md:text-xs text-[#999999] uppercase tracking-wider mb-2">
                          Notes
                        </label>
                        <textarea
                          value={editForm.description}
                          onChange={(e) =>
                            setEditForm({ ...editForm, description: e.target.value })
                          }
                          placeholder="Add notes about this workout..."
                          className="w-full px-4 py-3 bg-[#1a2542] border border-[#6E81B7]/30 rounded-lg text-[var(--foreground)] font-mono focus:outline-none focus:border-accent resize-none placeholder:text-[#999999]"
                          rows={3}
                        />
                      </div>

                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={handleCancel}
                          disabled={saving}
                          className="px-4 py-2 bg-transparent border-[1.5px] border-[#1a2542] hover:border-[#1e2a4a] hover:bg-[#1a2542]/10 disabled:border-[#1a2542]/50 disabled:bg-transparent disabled:text-accent/50 text-accent font-mono font-medium text-sm rounded-lg transition-all box-border"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSave(workout.id)}
                          disabled={saving}
                          className="px-4 py-2 bg-[#1a2542] hover:bg-[#1e2a4a] disabled:bg-[#1a2542]/50 text-accent font-mono font-medium text-sm rounded-lg transition-all"
                        >
                          {saving ? 'Saving...' : 'Save'}
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

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
        <Navigation />
      </div>
    </main>
  );
}
