'use client';

import { useState, useEffect } from 'react';

interface SyncStatus {
  connected: boolean;
  lastSync?: string | null;
  workoutCount?: number;
}

export default function StravaConnect() {
  const [status, setStatus] = useState<SyncStatus | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSyncStatus();
  }, []);

  const fetchSyncStatus = async () => {
    try {
      const response = await fetch('/api/strava/sync');
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      } else {
        // Set default disconnected state on error
        setStatus({ connected: false });
      }
    } catch (error) {
      console.error('Error fetching sync status:', error);
      // Set default disconnected state on error
      setStatus({ connected: false });
    }
  };

  const handleConnect = () => {
    window.location.href = '/api/strava/auth/start';
  };

  const handleSync = async (backfillDays?: number) => {
    setSyncing(true);
    setMessage('');

    try {
      const response = await fetch('/api/strava/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backfillDays }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(`✓ ${data.message}`);
        await fetchSyncStatus();

        // Refresh the page to update dashboard
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setMessage('✗ Sync failed');
      }
    } catch (error) {
      console.error('Error syncing:', error);
      setMessage('✗ Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  if (status === null) {
    return null;
  }

  if (!status.connected) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center text-2xl">
            🚴
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">Connect Strava</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              Sync your workouts automatically
            </p>
          </div>
        </div>

        <button
          onClick={handleConnect}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-lg hover:shadow-xl"
        >
          Connect with Strava
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">Strava Connected</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              {status.workoutCount} workouts synced
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={() => handleSync(2)}
          disabled={syncing}
          className="w-full bg-neon-green hover:bg-lime-500 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-slate-900 font-bold py-3 px-4 rounded-xl transition-all"
        >
          {syncing ? 'Syncing...' : 'Sync Recent (2 days)'}
        </button>

        <button
          onClick={() => handleSync(90)}
          disabled={syncing}
          className="w-full bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-semibold py-3 px-4 rounded-xl transition-all"
        >
          {syncing ? 'Syncing...' : 'Backfill (90 days)'}
        </button>
      </div>

      {message && (
        <div className={`mt-4 text-center text-sm font-semibold py-2 px-4 rounded-xl ${
          message.includes('✓')
            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
        }`}>
          {message}
        </div>
      )}

      {status.lastSync && (
        <p className="text-xs text-slate-400 dark:text-slate-500 text-center mt-4 font-medium">
          Last synced: {new Date(status.lastSync).toLocaleString()}
        </p>
      )}
    </div>
  );
}
