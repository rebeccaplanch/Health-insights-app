'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';

/**
 * AI Data/Insights page - provides exportable data for AI analysis
 * Design system: DM Mono/Sans, accent teal, solid navy cards
 */
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
      {/* Navigation - hidden on mobile */}
      <div className="hidden md:block px-6 pt-6 max-w-lg mx-auto md:max-w-2xl lg:max-w-4xl">
        <Navigation />
      </div>

      <div className="px-6 pt-8 pb-20 max-w-lg mx-auto md:max-w-2xl lg:max-w-4xl space-y-4">
        {/* Header */}
        <div className="pb-4">
          <p className="font-mono italic text-sm text-accent mb-1">
            AI Analysis
          </p>
          <h1 className="font-mono font-medium text-[48px] leading-none tracking-display text-[var(--foreground)]">
            INSIGHTS
          </h1>
        </div>

        {/* Instructions Card */}
        <div className="card p-4">
          <div className="flex flex-col gap-3">
            {/* Header with icon - left aligned */}
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#6E81B7">
                  <path d="M440-280h80v-240h-80v240Zm40-320q17 0 28.5-11.5T520-640q0-17-11.5-28.5T480-680q-17 0-28.5 11.5T440-640q0 17 11.5 28.5T480-600Zm0 520q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/>
                </svg>
              </div>
              <h3 className="font-mono text-sm text-[var(--foreground)]">
                How to get AI insights
              </h3>
            </div>
            {/* Numbered list - hanging indent, text aligns with header */}
            <ol 
              className="text-xs text-[#999999] space-y-1.5 ai-insights-list" 
              style={{ 
                listStyleType: 'decimal',
                listStylePosition: 'outside', 
                padding: 0, 
                paddingLeft: '36px',
              }}
            >
              <li>Click "Copy Data" below</li>
              <li>Go to your Claude Code chat</li>
              <li>Type "Analyze my training data" and paste</li>
              <li>Get personalized insights</li>
            </ol>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            disabled={loading || !data}
            className={`flex-1 py-3 px-4 rounded-lg font-mono text-sm transition-all ${
              copied
                ? 'bg-accent text-[#12192f]'
                : 'bg-[var(--status-bg)] hover:bg-[#0f1219] text-[#6E81B7] disabled:text-[#4d4d4d] disabled:bg-[#1a1a1a]'
            }`}
          >
            {copied ? '✓ Copied!' : 'Copy Data'}
          </button>
          <button
            onClick={fetchData}
            disabled={loading}
            className="py-3 px-4 bg-[var(--status-bg)] hover:bg-[#0f1219] disabled:bg-[#0d0d0d] text-[#6E81B7] font-mono text-sm rounded-lg transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#6E81B7" className={loading ? 'animate-spin' : ''}>
              <path d="M480-160q-134 0-227-93t-93-227q0-134 93-227t227-93q69 0 132 28.5T720-690v-110h80v280H520v-80h168q-32-56-87.5-88T480-720q-100 0-170 70t-70 170q0 100 70 170t170 70q77 0 139-44t87-116h84q-28 106-114 173t-196 67Z"/>
            </svg>
          </button>
        </div>

        {/* Data Display */}
        <div className="card p-4">
          {loading && (
            <div className="text-center py-8">
              <p className="text-[#999999] font-mono">Loading data...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <p className="text-red-400 font-mono text-sm">{error}</p>
            </div>
          )}

          {!loading && !error && data && (
            <div className="bg-[#1a2542] rounded-lg p-4 overflow-auto max-h-[400px]">
              <pre className="text-xs font-mono text-[#cccccc] whitespace-pre-wrap">
                {data}
              </pre>
            </div>
          )}

          {!loading && !error && !data && (
            <div className="text-center py-8">
              <p className="text-[#999999] font-mono mb-2">No data available</p>
              <p className="text-[#999999] text-sm">
                Start logging your daily check-ins!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
        <Navigation />
      </div>
    </main>
  );
}
