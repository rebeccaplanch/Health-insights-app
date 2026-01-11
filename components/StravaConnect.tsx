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
      <div className="glass-card px-3 py-4">
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
    <div className="glass-card px-3 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className="font-mono font-medium text-sm text-accent">Strava Connected</h3>
            <p className="font-mono text-[10px] md:text-xs tracking-wide-upper text-[#f1f1f1]/60">
              {status.workoutCount} workouts synced
              {status.lastSync && ` · ${new Date(status.lastSync).toLocaleDateString()}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSync(2)}
            disabled={syncing}
            className="bg-[#1a2542] hover:bg-[#1e2a4a] disabled:bg-[#1a2542]/50 text-accent font-mono font-medium py-2 px-4 rounded-lg transition-all"
          >
            {syncing ? 'Syncing...' : 'Sync'}
          </button>
          <button
            onClick={() => handleSync(90)}
            disabled={syncing}
            className="bg-[#1a2542] hover:bg-[#1e2a4a] disabled:bg-[#1a2542]/50 text-accent font-mono font-medium py-2 px-4 rounded-lg transition-all"
          >
            {syncing ? '...' : 'Backfill'}
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
