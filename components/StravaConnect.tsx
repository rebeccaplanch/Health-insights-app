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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="text-2xl">🚴</div>
          <div>
            <h3 className="font-semibold">Connect Strava</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Sync your workouts automatically
            </p>
          </div>
        </div>

        <button
          onClick={handleConnect}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
        >
          Connect with Strava
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="text-2xl">🚴</div>
        <div className="flex-1">
          <h3 className="font-semibold">Strava Connected</h3>
          {status.lastSync && (
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Last synced: {new Date(status.lastSync).toLocaleString()}
            </p>
          )}
          {status.workoutCount !== undefined && (
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {status.workoutCount} workouts synced
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <button
          onClick={() => handleSync()}
          disabled={syncing}
          className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
        >
          {syncing ? 'Syncing...' : 'Sync Recent Activities'}
        </button>

        <button
          onClick={() => handleSync(90)}
          disabled={syncing}
          className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 disabled:bg-gray-400 font-medium py-2 px-4 rounded-lg transition-colors text-sm"
        >
          {syncing ? 'Syncing...' : 'Backfill Last 90 Days'}
        </button>
      </div>

      {message && (
        <p className={`text-sm mt-3 text-center ${message.includes('✓') ? 'text-green-600' : 'text-red-600'}`}>
          {message}
        </p>
      )}
    </div>
  );
}
