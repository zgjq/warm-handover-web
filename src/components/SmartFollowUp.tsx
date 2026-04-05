'use client';

import { useState, useEffect } from 'react';
import { analyzeAnswers, type FollowUpSuggestion } from '@/lib/smart-followup';
import { getQuestionsForRole } from '@/lib/questions';
import { useNotification } from '@/context/NotificationContext';

interface SmartFollowUpProps {
  handoverId: number;
  answers: Record<string, string>;
  role: string;
  onNavigate: (category: string, questionKey: string) => void;
}

export default function SmartFollowUp({ handoverId, answers, role, onNavigate }: SmartFollowUpProps) {
  const [suggestions, setSuggestions] = useState<FollowUpSuggestion[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const { warning } = useNotification();

  useEffect(() => {
    const result = analyzeAnswers(handoverId, answers, role);
    setSuggestions(result);
  }, [handoverId, answers, role]);

  const activeSuggestions = suggestions.filter(s => !dismissed.has(`${s.category}::${s.questionKey}`));

  if (activeSuggestions.length === 0) return null;

  const highPriority = activeSuggestions.filter(s => s.priority === 'high').length;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border-2 border-amber-200 dark:border-amber-800 overflow-hidden">
      <div className="px-6 py-4 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">💡</span>
            <h3 className="font-bold text-amber-800 dark:text-amber-200">智能追问</h3>
            {highPriority > 0 && (
              <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-full text-xs font-medium">
                {highPriority} 条高优先级
              </span>
            )}
          </div>
          <span className="text-sm text-amber-600 dark:text-amber-400">{activeSuggestions.length} 条建议</span>
        </div>
      </div>

      <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-96 overflow-y-auto">
        {activeSuggestions.map((s, i) => (
          <div key={i} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-2 h-2 rounded-full ${
                    s.priority === 'high' ? 'bg-red-500' :
                    s.priority === 'medium' ? 'bg-amber-500' :
                    'bg-blue-400'
                  }`} />
                  <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">
                    {s.category}
                  </span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{s.questionLabel}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{s.reason}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => onNavigate(s.category, s.questionKey)}
                  className="px-3 py-1.5 bg-orange-500 text-white rounded-lg text-xs font-medium hover:bg-orange-600 transition-colors"
                >
                  去回答
                </button>
                <button
                  onClick={() => setDismissed(prev => new Set([...prev, `${s.category}::${s.questionKey}`]))}
                  className="px-3 py-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xs transition-colors"
                >
                  忽略
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
