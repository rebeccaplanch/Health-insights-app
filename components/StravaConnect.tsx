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
        // Temporarily force connected state for UI preview
        setStatus({
          connected: true,
          workoutCount: data.workoutCount || 42,
          lastSync: data.lastSync || new Date().toISOString(),
        });
      } else {
        // Temporarily force connected state for UI preview
        setStatus({
          connected: true,
          workoutCount: 42,
          lastSync: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Error fetching sync status:', error);
      // Temporarily force connected state for UI preview
      setStatus({
        connected: true,
        workoutCount: 42,
        lastSync: new Date().toISOString(),
      });
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
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#6E81B7">
                <path d="M160-160v-80h110l-16-14q-52-46-73-105t-21-119q0-111 66.5-197.5T400-790v84q-72 26-116 88.5T240-478q0 45 17 87.5t53 78.5l10 10v-98h80v240H160Zm400-10v-84q72-26 116-88.5T720-482q0-45-17-87.5T650-648l-10-10v98h-80v-240h240v80H690l16 14q49 49 71.5 106.5T800-482q0 111-66.5 197.5T560-170Z"/>
              </svg>
            </div>
            <div>
              <h3 className="font-mono font-medium text-sm text-accent">Connect Strava</h3>
              <p className="font-mono text-[10px] md:text-xs tracking-wide-upper text-[#999999]">
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
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#1a2542] rounded-lg flex items-center justify-center flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#6E81B7">
              <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/>
            </svg>
          </div>
          <div>
            <h3 className="font-mono font-medium text-sm text-accent">Strava Connected</h3>
            <p className="font-mono text-[10px] md:text-xs tracking-wide-upper text-[#f2f0e3]/60 mt-1">
              {status.workoutCount} workouts synced
              {status.lastSync && `; ${new Date(status.lastSync).toLocaleDateString()}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 pl-[52px] md:pl-0 md:justify-start">
          <button
            onClick={() => handleSync(90, true)}
            disabled={syncingSync || syncingBackfill}
            className="bg-transparent border-[1.5px] border-[#1a2542] hover:border-[#1e2a4a] hover:bg-[#1a2542]/10 disabled:border-[#1a2542]/50 disabled:bg-transparent disabled:text-accent/50 text-accent font-mono font-medium py-2 px-4 rounded-lg transition-all box-border"
          >
            {syncingBackfill ? '...' : 'Backfill'}
          </button>
          <button
            onClick={() => handleSync(2, false)}
            disabled={syncingSync || syncingBackfill}
            className="bg-[#1a2542] hover:bg-[#1e2a4a] disabled:bg-[#1a2542]/50 text-accent font-mono font-medium py-2 px-4 rounded-lg transition-all"
          >
            {syncingSync ? 'Syncing...' : 'Sync'}
          </button>
        </div>
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
