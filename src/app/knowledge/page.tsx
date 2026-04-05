'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DataService } from '@/lib/data-service';
import { useTheme } from '@/context/ThemeContext';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  loading?: boolean;
}

function KnowledgeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const { theme, toggle } = useTheme();

  const [handover, setHandover] = useState<any>(null);
  const [handovers, setHandovers] = useState<any[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [aiMode, setAiMode] = useState(true); // AI mode vs search mode

  useEffect(() => {
    if (id) {
      const raw = localStorage.getItem(`handover_${id}`);
      if (raw) {
        try {
          setHandover(JSON.parse(raw));
          setLoading(false);
          return;
        } catch { /* continue */ }
      }
      DataService.get(Number(id))
        .then(data => {
          if (!data) { router.push('/knowledge'); return; }
          setHandover(data);
          setLoading(false);
        })
        .catch(() => { router.push('/knowledge'); setLoading(false); });
    } else {
      DataService.list()
        .then(list => { setHandovers(Array.isArray(list) ? list : []); setLoading(false); })
        .catch(() => {
          const raw = localStorage.getItem('handover_list');
          if (raw) setHandovers(JSON.parse(raw));
          setLoading(false);
        });
    }
  }, [id]);

  const handleSend = async () => {
    if (!query.trim() || !id || !handover) return;
    
    const userMessage: ChatMessage = { role: 'user', content: query };
    const loadingMessage: ChatMessage = { role: 'assistant', content: '', loading: true };
    setMessages(prev => [...prev, userMessage, loadingMessage]);
    setQuery('');
    setSearching(true);

    if (aiMode) {
      // AI mode: send to AI API
      try {
        const answers = (handover.answers || [])
          .filter((a: any) => a.answer?.trim())
          .map((a: any) => ({ category: a.category, question: a.question_label, answer: a.answer }));

        const res = await fetch('/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'qa',
            query: userMessage.content,
            context: {
              personName: handover.personName || handover.person_name,
              projectName: handover.projectName || handover.project_name,
              answers,
            },
          }),
        });
        const data = await res.json();
        setMessages(prev => [...prev.slice(0, -1), { role: 'assistant', content: data.answer || '回答失败' }]);
      } catch {
        setMessages(prev => [...prev.slice(0, -1), { role: 'assistant', content: 'AI 服务暂时不可用' }]);
      }
    } else {
      // Search mode: FTS5 search
      try {
        const res = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ handoverId: Number(id), query: userMessage.content }),
        });
        const results = await res.json();
        if (results.length > 0) {
          const content = results.map((r: any) => `**${r.question_label}** (${r.category})\n${r.answer}`).join('\n\n---\n\n');
          setMessages(prev => [...prev.slice(0, -1), { role: 'assistant', content }]);
        } else {
          setMessages(prev => [...prev.slice(0, -1), { role: 'assistant', content: '没有找到相关内容' }]);
        }
      } catch {
        setMessages(prev => [...prev.slice(0, -1), { role: 'assistant', content: '搜索失败' }]);
      }
    }
    setSearching(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">加载中...</p></div>;

  // No id — show handover list
  if (!id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-stone-950 dark:via-stone-900 dark:to-stone-950">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-stone-100 mb-2">🔍 知识库</h1>
          <p className="text-gray-500 dark:text-stone-400 mb-6">选择一个交接记录进行搜索</p>
          {handovers.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <p className="text-gray-500 dark:text-stone-400 mb-4">还没有交接记录</p>
              <button onClick={() => router.push('/new')} className="px-6 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600">创建第一个交接</button>
            </div>
          ) : (
            <div className="space-y-3">
              {handovers.map(h => (
                <button
                  key={h.id}
                  onClick={() => router.push(`/knowledge?id=${h.id}`)}
                  className="w-full text-left bg-white dark:bg-stone-900 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all hover:-translate-y-0.5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-stone-100">{h.personName || h.person_name} → {h.successorName || h.successor_name}</h3>
                      <p className="text-sm text-gray-500 dark:text-stone-400">{h.projectName || h.project_name}</p>
                    </div>
                    <span className="text-orange-500">搜索 →</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!handover) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-stone-950 dark:via-stone-900 dark:to-stone-950">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-stone-100 mb-1">🧠 AI 知识库</h1>
            <p className="text-gray-500 dark:text-stone-400">{handover.personName || handover.person_name} · {handover.projectName || handover.project_name}</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Mode toggle */}
            <div className="flex bg-white dark:bg-stone-800 rounded-lg p-0.5 border border-gray-200 dark:border-stone-700">
              <button
                onClick={() => setAiMode(true)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${aiMode ? 'bg-orange-500 text-white' : 'text-gray-600 dark:text-stone-400'}`}
              >
                🤖 AI
              </button>
              <button
                onClick={() => setAiMode(false)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${!aiMode ? 'bg-orange-500 text-white' : 'text-gray-600 dark:text-stone-400'}`}
              >
                🔍 搜索
              </button>
            </div>
            <button onClick={toggle} className="p-2.5 bg-white dark:bg-stone-800 rounded-xl shadow-md border border-gray-200 dark:border-stone-700 hover:scale-110 transition-all" aria-label="切换主题">
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>
        </div>

        {/* Chat messages */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-lg mb-4 min-h-[400px] max-h-[600px] overflow-y-auto p-6">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">{aiMode ? '🤖' : '🔍'}</div>
              <h2 className="text-xl font-semibold text-gray-700 dark:text-stone-300 mb-2">
                {aiMode ? 'AI 知识库助手' : '知识库搜索'}
              </h2>
              <p className="text-gray-500 dark:text-stone-400">
                {aiMode ? '向 AI 提问，它会基于交接内容回答' : '输入关键词，搜索所有访谈记录'}
              </p>
              {!aiMode && (
                <div className="mt-6 flex flex-wrap gap-2 justify-center">
                  {['架构', '部署', '风险', '联系人', '教训'].map(tag => (
                    <button
                      key={tag}
                      onClick={() => { setQuery(tag); }}
                      className="px-3 py-1.5 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-full text-sm hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    m.role === 'user'
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 dark:bg-stone-800 text-gray-800 dark:text-stone-200'
                  }`}>
                    {m.loading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-pulse">🤔</div>
                        <span className="text-sm">思考中...</span>
                      </div>
                    ) : (
                      <div className="text-sm whitespace-pre-wrap">{m.content}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Input */}
        <div className="flex gap-3">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder={aiMode ? '向 AI 提问...' : '搜索关键词...'}
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
          />
          <button
            onClick={handleSend}
            disabled={searching || !query.trim()}
            className="px-6 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors disabled:opacity-50"
          >
            {searching ? '⏳' : aiMode ? '🤖 提问' : '🔍 搜索'}
          </button>
        </div>

        <div className="mt-6 text-center">
          <button onClick={() => router.push(`/handover/${id}`)} className="px-6 py-3 bg-white dark:bg-stone-800 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800 rounded-xl font-medium hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors">← 返回交接详情</button>
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
