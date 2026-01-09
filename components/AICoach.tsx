'use client';

import { useState, useEffect } from 'react';

export default function AICoach() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [insights, setInsights] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [tempInsights, setTempInsights] = useState('');

  useEffect(() => {
    // Load insights from localStorage
    const saved = localStorage.getItem('aiInsights');
    if (saved) {
      setInsights(saved);
    }
  }, []);

  const handleGetInsights = () => {
    setShowPrompt(true);
  };

  const handleSaveInsights = () => {
    localStorage.setItem('aiInsights', tempInsights);
    setInsights(tempInsights);
    setIsEditing(false);
    setShowPrompt(false);
  };

  const handleEditInsights = () => {
    setTempInsights(insights);
    setIsEditing(true);
    setShowPrompt(true);
  };

  const handleClearInsights = () => {
    if (confirm('Clear AI insights?')) {
      localStorage.removeItem('aiInsights');
      setInsights('');
      setShowPrompt(false);
      setIsEditing(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-600 dark:via-purple-600 dark:to-pink-600 rounded-3xl shadow-lg p-6 relative overflow-hidden">
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <span className="text-2xl">🤖</span>
              AI Coach
            </h2>
            <p className="text-white/90 text-sm mt-1 font-medium">
              Personalized insights from your training data
            </p>
          </div>
          {insights && !isEditing && (
            <div className="flex gap-2">
              <button
                onClick={handleEditInsights}
                className="p-2 text-white/80 hover:text-white hover:bg-white/20 transition-all rounded-lg"
                title="Update insights"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <button
                onClick={handleClearInsights}
                className="p-2 text-white/80 hover:text-white hover:bg-white/20 transition-all rounded-lg"
                title="Clear insights"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {!insights && !showPrompt && (
          <button
            onClick={handleGetInsights}
            className="w-full bg-white hover:bg-white/95 text-purple-600 font-bold py-4 px-6 rounded-2xl transition-all shadow-lg hover:shadow-xl"
          >
            Get AI Insights
          </button>
        )}

        {showPrompt && !insights && (
          <div className="space-y-4">
            <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-4">
              <p className="text-sm font-semibold text-white mb-2">
                📊 How to get AI insights:
              </p>
              <ol className="text-sm text-white/95 space-y-2 list-decimal list-inside">
                <li>Go to the "🤖 AI Data" tab</li>
                <li>Click "Copy Data"</li>
                <li>Come back to Claude Code chat</li>
                <li>Say: "Analyze my training data" and paste</li>
              </ol>
            </div>

            <div>
              <label className="block text-sm font-bold text-white mb-2">
                Paste AI insights below:
              </label>
              <textarea
                value={tempInsights}
                onChange={(e) => setTempInsights(e.target.value)}
                placeholder="Paste the insights from Claude Code here..."
                className="w-full px-4 py-3 bg-white/95 border-2 border-white/50 rounded-2xl focus:ring-2 focus:ring-white focus:border-white text-slate-900 placeholder:text-slate-400 font-mono text-sm"
                rows={12}
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSaveInsights}
                disabled={!tempInsights.trim()}
                className="flex-1 bg-white hover:bg-white/95 disabled:bg-white/50 text-purple-600 font-bold py-3 px-4 rounded-xl transition-all"
              >
                Save Insights
              </button>
              <button
                onClick={() => {
                  setShowPrompt(false);
                  setIsEditing(false);
                  setTempInsights('');
                }}
                className="px-4 py-3 text-white/90 hover:text-white hover:bg-white/20 font-semibold rounded-xl transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {showPrompt && insights && isEditing && (
          <div className="space-y-4">
            <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-4">
              <p className="text-sm font-semibold text-white mb-2">
                Get fresh insights!
              </p>
              <p className="text-sm text-white/95">
                Go to AI Data tab → Copy → Tell Claude Code: "Analyze my training data"
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-white mb-2">
                Update insights:
              </label>
              <textarea
                value={tempInsights}
                onChange={(e) => setTempInsights(e.target.value)}
                className="w-full px-4 py-3 bg-white/95 border-2 border-white/50 rounded-2xl focus:ring-2 focus:ring-white focus:border-white text-slate-900 font-mono text-sm"
                rows={12}
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSaveInsights}
                disabled={!tempInsights.trim()}
                className="flex-1 bg-white hover:bg-white/95 disabled:bg-white/50 text-purple-600 font-bold py-3 px-4 rounded-xl transition-all"
              >
                Save Insights
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setShowPrompt(false);
                  setTempInsights('');
                }}
                className="px-4 py-3 text-white/90 hover:text-white hover:bg-white/20 font-semibold rounded-xl transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {insights && !isEditing && (
          <div className="bg-white/95 dark:bg-white/90 rounded-2xl p-5 shadow-lg">
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-slate-900 font-mono text-sm leading-relaxed">
                {insights}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
