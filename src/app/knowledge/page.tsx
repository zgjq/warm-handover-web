'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DataService } from '@/lib/data-service';
import { useTheme } from '@/context/ThemeContext';

function KnowledgeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const { theme, toggle } = useTheme();

  const [handover, setHandover] = useState<any>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    DataService.get(Number(id))
      .then(data => {
        if (!data) { router.push('/new'); return; }
        setHandover(data);
        setLoading(false);
      })
      .catch(() => {
        // Fallback to LocalStorage
        const raw = localStorage.getItem(`handover_${id}`);
        if (raw) {
          setHandover(JSON.parse(raw));
        } else {
          router.push('/new');
        }
        setLoading(false);
      });
  }, [id]);

  const handleSearch = async () => {
    if (!query.trim() || !id) return;
    setSearching(true);
    setError('');
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handoverId: Number(id), query }),
      });
      if (!res.ok) throw new Error('搜索失败');
      const data = await res.json();
      setResults(data);
    } catch (e: any) {
      setError(e.message || '搜索出错');
    } finally {
      setSearching(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center dark:bg-stone-950 dark:text-stone-300">加载中...</div>;
  if (!handover) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-stone-950 dark:via-stone-900 dark:to-stone-950">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-stone-100 mb-2">🔍 知识库搜索</h1>
            <p className="text-gray-500 dark:text-stone-400">{handover.personName} · {handover.projectName}</p>
          </div>
          <button
            onClick={toggle}
            className="p-2.5 bg-white dark:bg-stone-800 rounded-xl shadow-md border border-gray-200 dark:border-stone-700 hover:scale-110 transition-all"
            aria-label="切换主题"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>

        {/* Search */}
        <div className="flex gap-3 mb-6">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="搜索交接内容..."
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
          />
          <button
            onClick={handleSearch}
            disabled={searching || !query.trim()}
            className="px-6 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors disabled:opacity-50"
          >
            {searching ? '🔍 搜索中...' : '搜索'}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
            ❌ {error}
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500 dark:text-stone-400">找到 {results.length} 条结果</p>
            {results.map((r, i) => (
              <div key={i} className="bg-white dark:bg-stone-900 rounded-2xl shadow-lg p-6">
                <div className="text-xs text-orange-500 dark:text-orange-400 font-medium mb-1">{r.category?.replace('.md', '') || r.question_key}</div>
                <div className="text-sm text-gray-500 dark:text-stone-400 mb-2">{r.question_label || r.question_key}</div>
                <div className="text-gray-700 dark:text-stone-300 whitespace-pre-wrap">{r.answer}</div>
              </div>
            ))}
          </div>
        )}

        {query && results.length === 0 && !searching && (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-gray-500 dark:text-stone-400">没有找到匹配的内容</p>
          </div>
        )}

        {!query && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🧠</div>
            <h2 className="text-xl font-semibold text-gray-700 dark:text-stone-300 mb-2">搜索交接知识</h2>
            <p className="text-gray-500 dark:text-stone-400">输入关键词，搜索所有访谈记录</p>
          </div>
        )}

        <div className="mt-8 text-center">
          <button
            onClick={() => router.push(`/handover/${id}`)}
            className="px-6 py-3 bg-white dark:bg-stone-800 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800 rounded-xl font-medium hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
          >
            ← 返回交接详情
          </button>
        </div>
      </div>
    </div>
  );
}

export default function KnowledgePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">加载中...</div>}>
      <KnowledgeContent />
    </Suspense>
  );
}
