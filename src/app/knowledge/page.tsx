'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function KnowledgeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const [handover, setHandover] = useState<any>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/handover?id=${id}`)
      .then(r => r.json())
      .then(data => setHandover(data))
      .catch(() => router.push('/list'));
  }, [id]);

  const handleSearch = async () => {
    if (!query.trim() || !id) return;
    setLoading(true);
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handoverId: Number(id), query: query.trim() }),
      });
      const data = await res.json();
      setResults(data);
      setSearched(true);
    } catch {
      setResults([]);
    }
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  if (!handover) return <div className="min-h-screen flex items-center justify-center">加载中...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">🔍 知识库</h1>
          <p className="text-gray-500">{handover.person_name} → {handover.successor_name} · {handover.project_name}</p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex gap-3">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入关键词搜索交接知识..."
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors disabled:opacity-50"
            >
              {loading ? '搜索中...' : '搜索'}
            </button>
          </div>
        </div>

        {/* Results */}
        {searched && (
          <div className="space-y-4">
            {results.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                <div className="text-4xl mb-3">🔍</div>
                <p className="text-gray-500">没有找到相关内容</p>
                <p className="text-sm text-gray-400 mt-1">试试其他关键词</p>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-500">找到 {results.length} 条相关内容</p>
                {results.map((r, i) => (
                  <div key={i} className="bg-white rounded-2xl shadow-lg p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full">{r.category}</span>
                      <span className="text-sm font-medium text-gray-700">{r.question_label}</span>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">{r.answer}</p>
                    <div className="mt-3 text-xs text-gray-400">
                      💡 这个回答来自 {handover.person_name} 关于「{r.question_label}」的回答
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* All Answers Browse */}
        {!searched && handover.answers && handover.answers.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-4">📚 浏览所有交接内容</h2>
            <div className="space-y-4">
              {handover.answers.filter((a: any) => a.answer && a.answer.trim()).map((a: any, i: number) => (
                <div key={i} className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full">{a.category}</span>
                    <span className="text-sm font-medium text-gray-700">{a.question_label}</span>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{a.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <button
            onClick={() => router.push(`/handover/${id}`)}
            className="px-6 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors"
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
