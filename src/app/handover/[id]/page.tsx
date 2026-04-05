'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DataService } from '@/lib/data-service';
import { useTheme } from '@/context/ThemeContext';
import OverviewTab from '@/components/handover/OverviewTab';
import InterviewTab from '@/components/handover/InterviewTab';
import TimelineTab from '@/components/handover/TimelineTab';
import KnowledgeTab from '@/components/handover/KnowledgeTab';
import CommentsTab from '@/components/handover/CommentsTab';

type Tab = 'overview' | 'interview' | 'timeline' | 'knowledge' | 'comments' | 'settings';

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'overview', label: '概览', icon: '📊' },
  { key: 'interview', label: '访谈', icon: '🎯' },
  { key: 'timeline', label: '时间线', icon: '📅' },
  { key: 'knowledge', label: '知识库', icon: '🔍' },
  { key: 'comments', label: '评论', icon: '💬' },
  { key: 'settings', label: '设置', icon: '⚙️' },
];

export default function HandoverDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { theme, toggle } = useTheme();

  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [handover, setHandover] = useState<any>(null);
  const [score, setScore] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [successorRating, setSuccessorRating] = useState(0);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState<'departing' | 'successor' | 'manager'>('successor');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      try {
        const [hData, commentsData, scoreData] = await Promise.all([
          fetch(`/api/handover?id=${id}`).then(r => {
            if (!r.ok) throw new Error('API unavailable');
            return r.json();
          }),
          fetch(`/api/comments?handoverId=${id}`).then(r => r.json()).catch(() => []),
          fetch(`/api/scores?handoverId=${id}`).then(r => r.json()).catch(() => null),
        ]);

        setHandover(hData);
        if (hData.score) setScore(hData.score);
        if (scoreData) setScore(scoreData);
        setComments(commentsData);
      } catch {
        // Fallback to LocalStorage
        const raw = localStorage.getItem(`handover_${id}`);
        if (raw) {
          const h = JSON.parse(raw);
          setHandover({
            ...h,
            person_name: h.personName,
            successor_name: h.successorName,
            project_name: h.projectName,
            departure_date: h.departureDate,
            answers: Object.entries(h.answers || {}).map(([key, val]) => {
              const [category, question_key, ...rest] = key.split('::');
              return { category, question_key, question_label: rest.length > 0 ? rest.join('::') : '', answer: val as string };
            }),
          });
        } else {
          setError('交接记录不存在');
        }
      } finally {
        setLoading(false);
      }

      const saved = localStorage.getItem(`checklist_${id}`);
      if (saved) setChecklist(JSON.parse(saved));

      const savedName = localStorage.getItem('wh_user_name');
      if (savedName) setUserName(savedName);
      const savedRole = localStorage.getItem('wh_user_role');
      if (savedRole) setUserRole(savedRole as any);
    };

    load();
  }, [id]);

  const handleSaveName = () => {
    localStorage.setItem('wh_user_name', userName);
    localStorage.setItem('wh_user_role', userRole);
  };

  const handleAddComment = async (content: string) => {
    if (!id || !userName) return;
    try {
      await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handoverId: Number(id), userName, userRole, content }),
      });
      const res = await fetch(`/api/comments?handoverId=${id}`);
      setComments(await res.json());
    } catch (e) {
      console.error('[Comments] Add failed:', e);
    }
  };

  const toggleChecklist = async (itemId: string) => {
    const updated = { ...checklist, [itemId]: !checklist[itemId] };
    setChecklist(updated);
    if (id) {
      localStorage.setItem(`checklist_${id}`, JSON.stringify(updated));
    }
  };

  const handleRate = async (rating: number) => {
    if (!id) return;
    setSuccessorRating(rating);
    try {
      await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handoverId: Number(id), action: 'rate', rating }),
      });
      const res = await fetch(`/api/scores?handoverId=${id}`);
      setScore(await res.json());
    } catch (e) {
      console.error('[Scores] Rate failed:', e);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center dark:bg-stone-950 dark:text-stone-300">加载中...</div>;
  if (error || !handover) return <div className="min-h-screen flex items-center justify-center dark:bg-stone-950 dark:text-stone-300">{error || '交接记录不存在'}</div>;

  const getScoreColor = (s: number) => {
    if (s >= 80) return 'text-green-600 dark:text-green-400';
    if (s >= 60) return 'text-yellow-600 dark:text-yellow-400';
    if (s >= 40) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-stone-950 dark:via-stone-900 dark:to-stone-950">
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-stone-100">{handover.person_name} → {handover.successor_name}</h1>
            <p className="text-gray-500 dark:text-stone-400 text-sm">{handover.project_name} · {handover.role}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className={`text-4xl font-bold ${getScoreColor(score?.total_score || 0)}`}>{score?.total_score || 0}</div>
              <div className="text-xs text-gray-400 dark:text-stone-500">综合评分</div>
            </div>
            <button
              onClick={toggle}
              className="p-2.5 bg-white dark:bg-stone-800 rounded-xl shadow-md border border-gray-200 dark:border-stone-700 hover:scale-110 transition-all"
              aria-label="切换主题"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>
        </div>

        {/* User Identity */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-lg p-4 mb-4">
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              value={userName}
              onChange={e => setUserName(e.target.value)}
              placeholder="你的名字"
              className="px-3 py-2 rounded-lg border border-gray-200 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 text-sm focus:border-orange-400 outline-none"
            />
            <select
              value={userRole}
              onChange={e => setUserRole(e.target.value as any)}
              className="px-3 py-2 rounded-lg border border-gray-200 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 text-sm focus:border-orange-400 outline-none"
            >
              <option value="departing">🚪 离职人</option>
              <option value="successor">🤝 接手人</option>
              <option value="manager">👔 管理者</option>
            </select>
            <button onClick={handleSaveName} className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600">
              确认身份
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white dark:bg-stone-900 rounded-xl p-1 shadow-sm overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.key ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-600 dark:text-stone-400 hover:bg-gray-50 dark:hover:bg-stone-800'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <OverviewTab
            id={id}
            handover={handover}
            score={score}
            comments={comments}
            checklist={checklist}
            successorRating={successorRating}
            onRate={handleRate}
          />
        )}

        {activeTab === 'interview' && (
          <InterviewTab id={id} handover={handover} />
        )}

        {activeTab === 'timeline' && (
          <TimelineTab id={id} checklist={checklist} onToggle={toggleChecklist} />
        )}

        {activeTab === 'knowledge' && (
          <KnowledgeTab handoverId={Number(id)} handover={handover} />
        )}

        {activeTab === 'comments' && (
          <CommentsTab
            id={id}
            comments={comments}
            userName={userName}
            userRole={userRole}
            onAddComment={handleAddComment}
          />
        )}

        {activeTab === 'settings' && (
          <div className="text-center py-12 bg-white dark:bg-stone-900 rounded-2xl shadow-lg">
            <p className="text-gray-500 dark:text-stone-400 mb-4">集成设置</p>
            <button
              onClick={() => router.push(`/settings?id=${id}`)}
              className="px-6 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600"
            >
              前往集成设置 →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
