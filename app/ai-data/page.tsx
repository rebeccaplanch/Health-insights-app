'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';

export default function AIDataPage() {
  const [data, setData] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/ai/summary-data');
      if (response.ok) {
        const json = await response.json();
        setData(JSON.stringify(json, null, 2));
      } else {
        setError('Failed to fetch data');
      }
    } catch (err) {
      setError('Error fetching data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(data);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

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
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">AI Training Data</h2>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              📊 How to get AI insights:
            </h3>
            <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
              <li>1. Click the "Copy Data" button below</li>
              <li>2. Go to your Claude Code chat</li>
              <li>3. Type: "Analyze my training data" and paste the copied data</li>
              <li>4. Claude Code will analyze and provide personalized insights</li>
            </ol>
          </div>

          <div className="flex gap-2 mb-4">
            <button
              onClick={handleCopy}
              disabled={loading || !data}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                copied
                  ? 'bg-green-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400'
              }`}
            >
              {copied ? '✓ Copied!' : '📋 Copy Data'}
            </button>
            <button
              onClick={fetchData}
              disabled={loading}
              className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors disabled:bg-gray-400"
            >
              🔄 Refresh
            </button>
          </div>

          {loading && (
            <div className="text-center py-8 text-gray-600 dark:text-gray-400">
              Loading data...
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-800 dark:text-red-200">
              {error}
            </div>
          )}

          {!loading && !error && data && (
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 overflow-auto">
              <pre className="text-xs font-mono text-gray-800 dark:text-gray-200">
                {data}
              </pre>
            </div>
          )}

          {!loading && !error && !data && (
            <div className="text-center py-8 text-gray-600 dark:text-gray-400">
              No data available yet. Start logging your daily check-ins!
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
