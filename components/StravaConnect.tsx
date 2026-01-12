'use client';

import { useState, useEffect } from 'react';

interface SyncStatus {
  connected: boolean;
  lastSync?: string | null;
  workoutCount?: number;
}

export default function StravaConnect() {
  const [status, setStatus] = useState<SyncStatus | null>(null);
  const [syncingSync, setSyncingSync] = useState(false);
  const [syncingBackfill, setSyncingBackfill] = useState(false);
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

  const handleSync = async (backfillDays?: number, isBackfill: boolean = false) => {
    if (isBackfill) {
      setSyncingBackfill(true);
    } else {
      setSyncingSync(true);
    }
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
      if (isBackfill) {
        setSyncingBackfill(false);
      } else {
        setSyncingSync(false);
      }
    }
  };

  if (status === null) {
    return null;
  }

  if (!status.connected) {
    return (
      <div className="card px-3 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#1a2542] rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3">
                <path d="M160-160v-80h110l-16-14q-52-46-73-105t-21-119q0-111 66.5-197.5T400-790v84q-72 26-116 88.5T240-478q0 45 17 87.5t53 78.5l10 10v-98h80v240H160Zm400-10v-84q72-26 116-88.5T720-482q0-45-17-87.5T650-648l-10-10v98h-80v-240h240v80H690l16 14q49 49 71.5 106.5T800-482q0 111-66.5 197.5T560-170Z"/>
              </svg>
            </div>
            <div>
              <h3 className="font-mono font-medium text-sm text-accent">Connect Strava</h3>
              <p className="font-mono text-[10px] md:text-xs tracking-wide-upper text-[#f1f1f1]/60">
                Sync your workouts automatically
              </p>
            </div>
          </div>

          <button
            onClick={handleConnect}
            className="bg-[#1a2542] hover:bg-[#1e2a4a] text-accent font-mono font-medium py-2 px-6 rounded-lg transition-all"
          >
            Connect
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card px-3 py-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3">
            <path d="m424-296 282-282-56-56-226 226-114-114-56 56 170 170Zm56 216q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/>
          </svg>
        </div>
        <div>
          <h3 className="font-mono font-medium text-sm text-accent">Strava Connected</h3>
        </div>
      </div>

      <p className="font-mono text-[10px] md:text-xs tracking-wide-upper text-[#f1f1f1]/60 mb-4">
        {status.workoutCount} workouts synced
        {status.lastSync && ` · ${new Date(status.lastSync).toLocaleDateString()}`}
      </p>

      <div className="flex items-center gap-2">
        <button
          onClick={() => handleSync(2, false)}
          disabled={syncingSync || syncingBackfill}
          className="bg-[#1a2542] hover:bg-[#1e2a4a] disabled:bg-[#1a2542]/50 text-accent font-mono font-medium py-2 px-4 rounded-lg transition-all"
        >
          {syncingSync ? 'Syncing...' : 'Sync'}
        </button>
        <button
          onClick={() => handleSync(90, true)}
          disabled={syncingSync || syncingBackfill}
          className="bg-[#1a2542] hover:bg-[#1e2a4a] disabled:bg-[#1a2542]/50 text-accent font-mono font-medium py-2 px-4 rounded-lg transition-all"
        >
          {syncingBackfill ? '...' : 'Backfill'}
        </button>
      </div>

      {message && (
        <div className={`mt-3 text-center font-mono text-xs py-2 px-3 rounded-lg ${
          message.includes('✓')
            ? 'bg-accent/20 text-accent'
            : 'bg-red-500/20 text-red-400'
        }`}>
          {message}
        </div>
      )}
    </div>
  );
}
