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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <span>💡</span>
            AI Coach
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
            Personalized insights from your training data
          </p>
        </div>
        {insights && !isEditing && (
          <div className="flex gap-2">
            <button
              onClick={handleEditInsights}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              title="Update insights"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button
              onClick={handleClearInsights}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              title="Clear insights"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {!insights && !showPrompt && (
        <button
          onClick={handleGetInsights}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
        >
          Get AI Insights
        </button>
      )}

      {showPrompt && !insights && (
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
              Data ready! Tell Claude Code:
            </p>
            <code className="block bg-white dark:bg-gray-900 px-3 py-2 rounded text-sm font-mono text-blue-600 dark:text-blue-400">
              Analyze my training data
            </code>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Paste AI insights below:
            </label>
            <textarea
              value={tempInsights}
              onChange={(e) => setTempInsights(e.target.value)}
              placeholder="Paste the insights from Claude Code here..."
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 font-mono text-sm"
              rows={12}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSaveInsights}
              disabled={!tempInsights.trim()}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Save Insights
            </button>
            <button
              onClick={() => {
                setShowPrompt(false);
                setIsEditing(false);
                setTempInsights('');
              }}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {showPrompt && insights && isEditing && (
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
              Get fresh insights! Tell Claude Code:
            </p>
            <code className="block bg-white dark:bg-gray-900 px-3 py-2 rounded text-sm font-mono text-blue-600 dark:text-blue-400">
              Analyze my training data
            </code>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Update insights:
            </label>
            <textarea
              value={tempInsights}
              onChange={(e) => setTempInsights(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 font-mono text-sm"
              rows={12}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSaveInsights}
              disabled={!tempInsights.trim()}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Save Insights
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setShowPrompt(false);
                setTempInsights('');
              }}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {insights && !isEditing && (
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 whitespace-pre-wrap font-mono text-sm">
            {insights}
          </div>
        </div>
      )}
    </div>
  );
}
