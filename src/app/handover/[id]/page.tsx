'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import SmartFollowUp from '@/components/SmartFollowUp';
import Certificate from '@/components/Certificate';

type Tab = 'overview' | 'interview' | 'timeline' | 'knowledge' | 'comments' | 'settings';

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'overview', label: '概览', icon: '📊' },
  { key: 'interview', label: '访谈', icon: '🎯' },
  { key: 'timeline', label: '时间线', icon: '📅' },
  { key: 'knowledge', label: '知识库', icon: '🔍' },
  { key: 'comments', label: '评论', icon: '💬' },
  { key: 'settings', label: '设置', icon: '⚙️' },
];

const CHECKLIST = [
  { id: 't30_1', phase: 'T-30 天', label: '确认离职日期和最后工作日' },
  { id: 't30_2', phase: 'T-30 天', label: '指定接手人（或启动招聘）' },
  { id: 't30_3', phase: 'T-30 天', label: '安排交接访谈时间（至少 2 次）' },
  { id: 't30_4', phase: 'T-30 天', label: '整理项目清单和代码仓库权限' },
  { id: 't21_1', phase: 'T-21 天', label: '运行首轮访谈' },
  { id: 't21_2', phase: 'T-21 天', label: '生成 PROJECT.md 和 PEOPLE.md' },
  { id: 't21_3', phase: 'T-21 天', label: '确认所有代码已提交，分支已合并' },
  { id: 't14_1', phase: 'T-14 天', label: '接手人开始参与日常工作' },
  { id: 't14_2', phase: 'T-14 天', label: '离职人 Review 接手人的工作' },
  { id: 't14_3', phase: 'T-14 天', label: '完成 LESSONS.md 访谈' },
  { id: 't7_1', phase: 'T-7 天', label: '完成 TODO.md 访谈' },
  { id: 't7_2', phase: 'T-7 天', label: '确认外部联系人已介绍' },
  { id: 't7_3', phase: 'T-7 天', label: '安排离职后的紧急联系方式' },
  { id: 't3_1', phase: 'T-3 天', label: '所有交接文档已完成并分享' },
  { id: 't3_2', phase: 'T-3 天', label: '接手人能独立完成至少一个任务' },
  { id: 't3_3', phase: 'T-3 天', label: '权限转移确认' },
  { id: 't0_1', phase: 'T-0 天', label: '正式交接确认' },
  { id: 't0_2', phase: 'T-0 天', label: '权限回收' },
  { id: 't0_3', phase: 'T-0 天', label: '好好告别 🫡' },
];

const phaseIcons: Record<string, string> = {
  'T-30 天': '📋', 'T-21 天': '📝', 'T-14 天': '👥',
  'T-7 天': '🔍', 'T-3 天': '✅', 'T-0 天': '🫡',
};

export default function HandoverDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [handover, setHandover] = useState<any>(null);
  const [score, setScore] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [successorRating, setSuccessorRating] = useState(0);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState<'departing' | 'successor' | 'manager'>('successor');

  useEffect(() => {
    if (!id) return;
    fetch(`/api/handover?id=${id}`)
      .then(r => r.json())
      .then(data => {
        setHandover(data);
        if (data.score) setScore(data.score);
      });
    fetch(`/api/comments?handoverId=${id}`)
      .then(r => r.json())
      .then(data => setComments(data));
    fetch(`/api/scores?handoverId=${id}`)
      .then(r => r.json())
      .then(data => {
        if (data) setScore(data);
      });

    const saved = localStorage.getItem(`checklist_${id}`);
    if (saved) setChecklist(JSON.parse(saved));

    const savedName = localStorage.getItem('wh_user_name');
    if (savedName) setUserName(savedName);
    const savedRole = localStorage.getItem('wh_user_role') as any;
    if (savedRole) setUserRole(savedRole);
  }, [id]);

  const handleSaveName = () => {
    localStorage.setItem('wh_user_name', userName);
    localStorage.setItem('wh_user_role', userRole);
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !id || !userName) return;
    await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ handoverId: Number(id), userName, userRole, content: newComment.trim() }),
    });
    setNewComment('');
    const res = await fetch(`/api/comments?handoverId=${id}`);
    setComments(await res.json());
  };

  const toggleChecklist = (itemId: string) => {
    const updated = { ...checklist, [itemId]: !checklist[itemId] };
    setChecklist(updated);
    if (id) localStorage.setItem(`checklist_${id}`, JSON.stringify(updated));
  };

  const handleRate = async (rating: number) => {
    if (!id) return;
    setSuccessorRating(rating);
    await fetch('/api/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ handoverId: Number(id), action: 'rate', rating }),
    });
    const res = await fetch(`/api/scores?handoverId=${id}`);
    setScore(await res.json());
  };

  if (!handover) return <div className="min-h-screen flex items-center justify-center">加载中...</div>;

  const getScoreColor = (s: number) => {
    if (s >= 80) return 'text-green-600';
    if (s >= 60) return 'text-yellow-600';
    if (s >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const phases = ['T-30 天', 'T-21 天', 'T-14 天', 'T-7 天', 'T-3 天', 'T-0 天'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{handover.person_name} → {handover.successor_name}</h1>
            <p className="text-gray-500 text-sm">{handover.project_name} · {handover.role}</p>
          </div>
          <div className="text-right">
            <div className={`text-4xl font-bold ${getScoreColor(score?.total_score || 0)}`}>{score?.total_score || 0}</div>
            <div className="text-xs text-gray-400">综合评分</div>
          </div>
        </div>

        {/* User Identity */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-4">
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              value={userName}
              onChange={e => setUserName(e.target.value)}
              placeholder="你的名字"
              className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-orange-400 outline-none"
            />
            <select
              value={userRole}
              onChange={e => setUserRole(e.target.value as any)}
              className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-orange-400 outline-none"
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
        <div className="flex gap-1 mb-6 bg-white rounded-xl p-1 shadow-sm overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.key ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Score Breakdown */}
            {score && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">📊 评分详情</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: '访谈完成度', value: score.interview_completion, icon: '🎯' },
                    { label: '时间线进度', value: score.timeline_progress, icon: '📅' },
                    { label: '文档质量', value: score.document_quality, icon: '📄' },
                    { label: '接手人评分', value: (score.successor_rating || 0) * 20, icon: '⭐' },
                  ].map(item => (
                    <div key={item.label} className="text-center p-4 bg-gray-50 rounded-xl">
                      <div className="text-2xl mb-1">{item.icon}</div>
                      <div className={`text-2xl font-bold ${getScoreColor(item.value)}`}>{item.value}%</div>
                      <div className="text-xs text-gray-500">{item.label}</div>
                    </div>
                  ))}
                </div>
                {/* Successor Rating */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-600 mb-2">接手人评分：</p>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(n => (
                      <button
                        key={n}
                        onClick={() => handleRate(n)}
                        className={`text-2xl transition-transform ${n <= (score.successor_rating || 0) ? 'scale-110' : 'opacity-30'}`}
                      >
                        ⭐
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                <div className="text-3xl font-bold text-orange-600">{handover.answeredQuestions || 0}/{handover.totalQuestions || 0}</div>
                <div className="text-sm text-gray-500 mt-1">已回答问题</div>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                <div className="text-3xl font-bold text-orange-600">{comments.length}</div>
                <div className="text-sm text-gray-500 mt-1">评论数</div>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                <div className="text-3xl font-bold text-orange-600">
                  {Object.values(checklist).filter(Boolean).length}/{CHECKLIST.length}
                </div>
                <div className="text-sm text-gray-500 mt-1">清单完成</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3">
              <button onClick={() => router.push(`/interview?id=${id}`)} className="px-5 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors">
                🎯 继续访谈
              </button>
              <button onClick={() => router.push(`/knowledge?id=${id}`)} className="px-5 py-3 bg-white text-orange-600 border border-orange-200 rounded-xl font-medium hover:bg-orange-50 transition-colors">
                🔍 知识库
              </button>
              <button onClick={() => router.push(`/output?id=${id}`)} className="px-5 py-3 bg-white text-orange-600 border border-orange-200 rounded-xl font-medium hover:bg-orange-50 transition-colors">
                📄 导出文档
              </button>
              <button onClick={() => router.push(`/settings?id=${id}`)} className="px-5 py-3 bg-white text-gray-600 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors">
                ⚙️ 集成设置
              </button>
            </div>

            {/* Smart Follow-up */}
            <SmartFollowUp
              handoverId={Number(id)}
              answers={handover.answers || {}}
              role={handover.role || 'backend'}
              onNavigate={(category, questionKey) => {
                router.push(`/interview?id=${id}&cat=${category}&q=${questionKey}`);
              }}
            />

            {/* Certificate */}
            {(handover.answeredQuestions || 0) > 0 && (
              <Certificate
                personName={handover.person_name}
                successorName={handover.successor_name}
                projectName={handover.project_name}
                completedDate={new Date().toLocaleDateString('zh-CN')}
                score={score?.total_score || 0}
                answeredCount={handover.answeredQuestions || 0}
                totalQuestions={handover.totalQuestions || 0}
              />
            )}
          </div>
        )}

        {activeTab === 'interview' && (
          <div className="space-y-4">
            {handover.answers?.filter((a: any) => a.answer && a.answer.trim()).map((a: any, i: number) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full">{a.category}</span>
                  <span className="text-sm font-medium text-gray-700">{a.question_label}</span>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{a.answer}</p>
              </div>
            ))}
            {(!handover.answers || handover.answers.filter((a: any) => a.answer?.trim()).length === 0) && (
              <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
                <div className="text-4xl mb-3">📝</div>
                <p className="text-gray-500">还没有回答</p>
                <button onClick={() => router.push(`/interview?id=${id}`)} className="mt-3 px-5 py-2 bg-orange-500 text-white rounded-xl text-sm hover:bg-orange-600">
                  开始访谈
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="space-y-4">
            {phases.map(phase => {
              const items = CHECKLIST.filter(i => i.phase === phase);
              return (
                <div key={phase} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-3">
                    <span className="text-xl">{phaseIcons[phase]}</span>
                    <h3 className="font-bold text-gray-800">{phase}</h3>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {items.map(item => (
                      <label key={item.id} className={`flex items-center gap-3 px-6 py-3 cursor-pointer transition-colors ${checklist[item.id] ? 'bg-green-50/50' : 'hover:bg-gray-50'}`}>
                        <input
                          type="checkbox"
                          checked={!!checklist[item.id]}
                          onChange={() => toggleChecklist(item.id)}
                          className="w-5 h-5 rounded border-gray-300 text-orange-500 focus:ring-orange-300"
                        />
                        <span className={`text-sm ${checklist[item.id] ? 'text-green-700 line-through' : 'text-gray-700'}`}>
                          {item.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'knowledge' && (
          <KnowledgeTab handoverId={Number(id)} handover={handover} />
        )}

        {activeTab === 'comments' && (
          <div className="space-y-4">
            {/* Add comment */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <textarea
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder={userName ? "写下你的评论..." : "请先在上方确认身份"}
                className="w-full h-24 px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-400 outline-none resize-none text-sm"
                disabled={!userName}
              />
              <div className="flex justify-end mt-3">
                <button
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || !userName}
                  className="px-5 py-2 bg-orange-500 text-white rounded-xl text-sm font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  发表评论
                </button>
              </div>
            </div>

            {/* Comments list */}
            {comments.map((c, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-gray-700">{c.user_name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    c.user_role === 'departing' ? 'bg-blue-100 text-blue-600' :
                    c.user_role === 'manager' ? 'bg-purple-100 text-purple-600' :
                    'bg-green-100 text-green-600'
                  }`}>
                    {c.user_role === 'departing' ? '🚪 离职人' : c.user_role === 'manager' ? '👔 管理者' : '🤝 接手人'}
                  </span>
                  <span className="text-xs text-gray-400">{new Date(c.created_at).toLocaleString('zh-CN')}</span>
                </div>
                <p className="text-gray-700 text-sm whitespace-pre-wrap">{c.content}</p>
              </div>
            ))}
            {comments.length === 0 && (
              <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
                <div className="text-4xl mb-3">💬</div>
                <p className="text-gray-500">还没有评论</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">集成设置</p>
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

function KnowledgeTab({ handoverId, handover }: { handoverId: number; handover: any }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handoverId, query: query.trim() }),
      });
      setResults(await res.json());
      setSearched(true);
    } catch { setResults([]); }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-lg p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="搜索交接知识..."
            className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:border-orange-400 outline-none text-sm"
          />
          <button onClick={handleSearch} disabled={loading} className="px-4 py-2 bg-orange-500 text-white rounded-xl text-sm font-medium disabled:opacity-50">
            搜索
          </button>
        </div>
      </div>
      {searched && results.length === 0 && (
        <div className="text-center py-8 bg-white rounded-2xl shadow-lg">
          <p className="text-gray-500">没有找到相关内容</p>
        </div>
      )}
      {results.map((r, i) => (
        <div key={i} className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full">{r.category}</span>
            <span className="text-sm font-medium text-gray-700">{r.question_label}</span>
          </div>
          <p className="text-gray-700 whitespace-pre-wrap text-sm">{r.answer}</p>
          <div className="mt-2 text-xs text-gray-400">💡 来自 {handover?.person_name} 的回答</div>
        </div>
      ))}
      {!searched && handover?.answers?.filter((a: any) => a.answer?.trim()).slice(0, 5).map((a: any, i: number) => (
        <div key={i} className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full">{a.category}</span>
            <span className="text-sm font-medium text-gray-700">{a.question_label}</span>
          </div>
          <p className="text-gray-700 whitespace-pre-wrap text-sm">{a.answer}</p>
        </div>
      ))}
    </div>
  );
}
