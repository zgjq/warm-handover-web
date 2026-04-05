'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DataService } from '@/lib/data-service';
import { useNotification } from '@/context/NotificationContext';

export default function ListPage() {
  const router = useRouter();
  const { success, warning } = useNotification();
  const [handovers, setHandovers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const refresh = () => setHandovers(DataService.list());
  useEffect(refresh, []);

  const filtered = DataService.search(searchQuery);

  const handleDelete = (id: number, name: string) => {
    if (!confirm(`确定要删除 "${name}" 的交接记录吗？此操作不可撤销。`)) return;
    DataService.delete(id);
    refresh();
    success(`已删除 ${name} 的交接记录`);
  };

  const getStatusInfo = (h: any) => {
    const stats = DataService.getAnswerStats(h.id);
    if (stats.total === 0) return { label: '未开始', color: 'bg-gray-100 text-gray-600', progress: 0 };
    const pct = Math.round((stats.answered / stats.total) * 100);
    if (pct >= 80) return { label: '即将完成', color: 'bg-green-100 text-green-700', progress: pct };
    if (pct >= 50) return { label: '进行中', color: 'bg-orange-100 text-orange-700', progress: pct };
    return { label: '刚开始', color: 'bg-yellow-100 text-yellow-700', progress: pct };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-1">我的交接</h1>
            <p className="text-gray-500 text-sm">管理所有交接记录</p>
          </div>
          <button
            onClick={() => router.push('/new')}
            className="px-5 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-all hover:scale-105 shadow-md"
          >
            + 新建
          </button>
        </div>

        {/* Search */}
        {handovers.length > 0 && (
          <div className="mb-6">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="🔍 搜索姓名、项目..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
            />
          </div>
        )}

        {handovers.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🤝</div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">还没有交接记录</h2>
            <p className="text-gray-500 mb-6">开始一次有尊严的知识传递</p>
            <button
              onClick={() => router.push('/new')}
              className="px-6 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-all hover:scale-105"
            >
              创建第一个交接
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">没有找到匹配的交接记录</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(h => {
              const status = getStatusInfo(h);
              return (
                <div key={h.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 cursor-pointer" onClick={() => router.push(`/handover/${h.id}`)}>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-semibold text-gray-800">{h.personName}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                            {status.label}
                          </span>
                          {status.progress > 0 && (
                            <span className="text-xs text-gray-400">{status.progress}%</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{h.projectName || '项目'} → {h.successorName || '待确定'}</p>
                        {h.departureDate && (
                          <p className="text-xs text-orange-500 mt-1">📅 {h.departureDate}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">创建于 {new Date(h.createdAt).toLocaleDateString('zh-CN')}</p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => router.push(`/handover/${h.id}`)}
                          className="px-3 py-1.5 text-sm text-orange-500 border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors"
                        >
                          详情
                        </button>
                        <button
                          onClick={() => router.push(`/output?id=${h.id}`)}
                          className="px-3 py-1.5 text-sm text-blue-500 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          导出
                        </button>
                        <button
                          onClick={() => handleDelete(h.id, h.personName)}
                          className="px-3 py-1.5 text-sm text-red-400 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          删除
                        </button>
                      </div>
                    </div>
                    {/* Progress bar */}
                    {status.progress > 0 && (
                      <div className="mt-3 w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            status.progress >= 80 ? 'bg-green-500' :
                            status.progress >= 50 ? 'bg-orange-500' : 'bg-yellow-500'
                          }`}
                          style={{ width: `${status.progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Quick links */}
        {handovers.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-5 py-2.5 bg-white text-orange-600 border border-orange-200 rounded-xl text-sm font-medium hover:bg-orange-50 transition-colors"
            >
              📊 管理者看板
            </button>
            <button
              onClick={() => router.push('/new')}
              className="px-5 py-2.5 bg-white text-orange-600 border border-orange-200 rounded-xl text-sm font-medium hover:bg-orange-50 transition-colors"
            >
              ➕ 新建交接
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
