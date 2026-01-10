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
      <main className="min-h-screen flex flex-col justify-center items-center">
        <div className="px-6 space-y-4 pb-20 max-w-lg mx-auto md:max-w-2xl lg:max-w-4xl w-full">
          <div className="pt-16 pb-4 md:pt-20 lg:pt-24">
            <p className="font-mono italic text-sm text-accent mb-1">
              Your workouts
            </p>
            <h1 className="font-mono font-medium text-[48px] leading-none tracking-display text-[#f1f1f1] md:text-6xl lg:text-7xl">
              ACTIVITIES
            </h1>
          </div>

          <div className="hidden md:block">
            <Navigation />
          </div>

          <div className="glass-card p-8 text-center">
            <p className="text-[#f1f1f1]/60 font-mono">Loading activities...</p>
          </div>
        </div>

        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
          <Navigation />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col justify-center items-center">
      <div className="px-6 space-y-4 pb-20 max-w-lg mx-auto md:max-w-2xl lg:max-w-4xl w-full">
        {/* Header */}
        <div className="pt-16 pb-4 md:pt-20 lg:pt-24">
          <p className="font-mono italic text-sm text-accent mb-1">
            Your workouts
          </p>
          <h1 className="font-mono font-medium text-[48px] leading-none tracking-display text-[#f1f1f1] md:text-6xl lg:text-7xl">
            ACTIVITIES
          </h1>
        </div>

        {/* Navigation - hidden on mobile */}
        <div className="hidden md:block">
          <Navigation />
        </div>

        {/* Subtitle */}
        <p className="text-[#f1f1f1]/60 text-sm">
          Edit workout types and add notes to improve your insights
        </p>

        {/* Workouts List */}
        {workouts.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <p className="text-[#f1f1f1]/60 font-mono mb-2">No activities yet</p>
            <p className="text-[#f1f1f1]/40 text-sm">
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
                <div key={workout.id} className="glass-card p-4">
                  {!isEditing ? (
                    <>
                      {/* Header Row */}
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-lg text-[#f1f1f1]">
                              {displayType}
                            </span>
                            {workout.customType && (
                              <span className="text-[10px] md:text-xs bg-accent text-[#12192f] px-2 py-0.5 rounded-full font-mono font-medium">
                                Edited
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#f1f1f1]/40 font-mono">
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
                          className="p-2 text-[#f1f1f1]/40 hover:text-accent transition-colors rounded-lg"
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
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <div className="bg-[#12192f] rounded-lg p-3">
                          <p className="font-mono text-[10px] md:text-xs text-[#f1f1f1]/40 uppercase tracking-wider mb-1">
                            Duration
                          </p>
                          <p className="font-mono text-lg text-[#f1f1f1]">
                            {durationMins}m
                          </p>
                        </div>

                        {workout.distance && (
                          <div className="bg-[#12192f] rounded-lg p-3">
                            <p className="font-mono text-[10px] md:text-xs text-[#f1f1f1]/40 uppercase tracking-wider mb-1">
                              Distance
                            </p>
                            <p className="font-mono text-lg text-[#f1f1f1]">
                              {(workout.distance / 1000).toFixed(1)}km
                            </p>
                          </div>
                        )}

                        {workout.averageHeartrate && (
                          <div className="bg-[#12192f] rounded-lg p-3">
                            <p className="font-mono text-[10px] md:text-xs text-[#f1f1f1]/40 uppercase tracking-wider mb-1">
                              Avg HR
                            </p>
                            <p className="font-mono text-lg text-[#f1f1f1]">
                              {Math.round(workout.averageHeartrate)}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Notes */}
                      {workout.description && (
                        <div className="bg-[#12192f] rounded-lg p-3">
                          <p className="font-mono text-[10px] md:text-xs text-[#f1f1f1]/40 uppercase tracking-wider mb-1">
                            Notes
                          </p>
                          <p className="text-sm text-[#f1f1f1]/80">
                            {workout.description}
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    /* Edit Mode */
                    <div className="space-y-4">
                      <div>
                        <label className="block font-mono text-[10px] md:text-xs text-[#f1f1f1]/40 uppercase tracking-wider mb-2">
                          Workout Type
                        </label>
                        <select
                          value={editForm.customType}
                          onChange={(e) =>
                            setEditForm({ ...editForm, customType: e.target.value })
                          }
                          className="w-full px-4 py-3 bg-[#12192f] border border-[#6E81B7]/30 rounded-lg text-[#f1f1f1] font-mono focus:outline-none focus:border-accent"
                        >
                          {WORKOUT_TYPES.map((type) => (
                            <option key={type} value={type}>
                              {type === 'Workout' ? 'CrossFit/Hybrid' : type}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block font-mono text-[10px] md:text-xs text-[#f1f1f1]/40 uppercase tracking-wider mb-2">
                          Notes
                        </label>
                        <textarea
                          value={editForm.description}
                          onChange={(e) =>
                            setEditForm({ ...editForm, description: e.target.value })
                          }
                          placeholder="Add notes about this workout..."
                          className="w-full px-4 py-3 bg-[#12192f] border border-[#6E81B7]/30 rounded-lg text-[#f1f1f1] font-mono focus:outline-none focus:border-accent resize-none placeholder:text-[#f1f1f1]/30"
                          rows={3}
                        />
                      </div>

                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={handleCancel}
                          disabled={saving}
                          className="px-4 py-2 bg-[#f1f1f1]/10 hover:bg-[#f1f1f1]/15 text-[#f1f1f1] font-mono text-sm rounded-lg transition-all"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSave(workout.id)}
                          disabled={saving}
                          className="px-4 py-2 bg-[#12192f] hover:bg-[#161e38] disabled:bg-[#f1f1f1]/20 text-accent font-mono text-sm rounded-lg transition-all"
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
