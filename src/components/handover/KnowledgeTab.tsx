'use client';

import { useState } from 'react';

interface KnowledgeTabProps {
  handoverId: number;
  handover: any;
}

export default function KnowledgeTab({ handoverId, handover }: KnowledgeTabProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);

    // First try API (FTS5 search)
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handoverId, query: query.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setResults(data);
        setLoading(false);
        return;
      }
    } catch {
      // API unavailable, fallback to client-side search
    }

    // Client-side fallback: search through handover answers
    const answers = handover?.answers || [];
    const q = query.toLowerCase();
    const matched = answers.filter((a: any) =>
      (a.answer || '').toLowerCase().includes(q) ||
      (a.question_label || '').toLowerCase().includes(q) ||
      (a.category || '').toLowerCase().includes(q)
    );
    setResults(matched);
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-lg p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="搜索交接知识..."
            className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 focus:border-orange-400 outline-none text-sm"
          />
          <button onClick={handleSearch} disabled={loading} className="px-4 py-2 bg-orange-500 text-white rounded-xl text-sm font-medium disabled:opacity-50">
            {loading ? '搜索中...' : '搜索'}
          </button>
        </div>
      </div>
      {searched && results.length === 0 && (
        <div className="text-center py-8 bg-white dark:bg-stone-900 rounded-2xl shadow-lg">
          <p className="text-gray-500 dark:text-stone-400">没有找到相关内容</p>
        </div>
      )}
      {results.map((r, i) => (
        <div key={i} className="bg-white dark:bg-stone-900 rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full">{r.category}</span>
            <span className="text-sm font-medium text-gray-700 dark:text-stone-300">{r.question_label}</span>
          </div>
          <p className="text-gray-700 dark:text-stone-300 whitespace-pre-wrap text-sm">{r.answer}</p>
          <div className="mt-2 text-xs text-gray-400 dark:text-stone-500">💡 来自 {handover?.person_name} 的回答</div>
        </div>
      ))}
      {!searched && handover?.answers?.filter((a: any) => a.answer?.trim()).slice(0, 5).map((a: any, i: number) => (
        <div key={i} className="bg-white dark:bg-stone-900 rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full">{a.category}</span>
            <span className="text-sm font-medium text-gray-700 dark:text-stone-300">{a.question_label}</span>
          </div>
          <p className="text-gray-700 dark:text-stone-300 whitespace-pre-wrap text-sm">{a.answer}</p>
        </div>
      ))}
    </div>
  );
}
