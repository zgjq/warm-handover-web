'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DataService } from '@/lib/data-service';
import { useTheme } from '@/context/ThemeContext';

export default function DashboardPage() {
  const router = useRouter();
  const { theme, toggle } = useTheme();
  const [handovers, setHandovers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    DataService.list()
      .then(data => { setHandovers(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800';
      case 'high': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800';
      case 'medium': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
      default: return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800';
    }
  };

  const getRiskLabel = (level: string) => {
    switch (level) {
      case 'critical': return '🚨 严重';
      case 'high': return '⚠️ 高风险';
      case 'medium': return '🟡 中等';
      default: return '✅ 低风险';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    if (score >= 40) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center dark:bg-stone-950 dark:text-stone-300">加载中...</div>;

  const criticalCount = handovers.filter(h => h.risk_level === 'critical').length;
  const highCount = handovers.filter(h => h.risk_level === 'high').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-stone-950 dark:via-stone-900 dark:to-stone-950">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-stone-100 mb-1">📊 交接管理看板</h1>
            <p className="text-gray-500 dark:text-stone-400">所有交接项目的进度和质量总览</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={toggle}
              className="p-2.5 bg-white dark:bg-stone-800 rounded-xl shadow-md border border-gray-200 dark:border-stone-700 hover:scale-110 transition-all"
              aria-label="切换主题"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <button
              onClick={() => router.push('/new')}
              className="px-5 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors shadow-md"
            >
              + 新建交接
            </button>
          </div>
        </div>

        {/* Alert Banner */}
        {(criticalCount > 0 || highCount > 0) && (
          <div className={`mb-6 p-4 rounded-xl border ${criticalCount > 0 ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'}`}>
            <p className="font-medium text-red-700 dark:text-red-400">
              {criticalCount > 0 && `🚨 ${criticalCount} 个交接项目存在严重风险`}
              {criticalCount > 0 && highCount > 0 && ' · '}
              {highCount > 0 && `⚠️ ${highCount} 个交接项目风险较高`}
            </p>
            <p className="text-sm text-red-600 dark:text-red-300 mt-1">请及时跟进这些项目</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: '总交接数', value: handovers.length, emoji: '📋' },
            { label: '进行中', value: handovers.filter(h => h.status === 'draft' || h.status === 'in_progress').length, emoji: '🔄' },
            { label: '高风险', value: criticalCount + highCount, emoji: '⚠️' },
            { label: '平均评分', value: handovers.length > 0 ? Math.round(handovers.reduce((s, h) => s + (h.score || 0), 0) / handovers.length) : 0, emoji: '⭐' },
          ].map(stat => (
            <div key={stat.label} className="bg-white dark:bg-stone-900 rounded-2xl shadow-lg p-6 text-center">
              <div className="text-3xl mb-2">{stat.emoji}</div>
              <div className="text-2xl font-bold text-gray-800 dark:text-stone-100">{stat.value}</div>
              <div className="text-sm text-gray-500 dark:text-stone-400">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Handover List */}
        {handovers.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-xl font-semibold text-gray-700 dark:text-stone-300 mb-2">还没有交接记录</h2>
            <p className="text-gray-500 dark:text-stone-400 mb-6">开始一次有尊严的知识传递</p>
            <button
              onClick={() => router.push('/new')}
              className="px-6 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors"
            >
              创建第一个交接
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {handovers.map(h => (
              <div
                key={h.id}
                className="bg-white dark:bg-stone-900 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => router.push(`/handover/${h.id}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-stone-100">{h.personName}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getRiskColor(h.risk_level || 'low')}`}>
                        {getRiskLabel(h.risk_level || 'low')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-stone-400">{h.projectName} → {h.successorName}</p>
                    {h.departureDate && (
                      <p className="text-xs text-gray-400 dark:text-stone-500 mt-1">离职日期: {h.departureDate}</p>
                    )}
                  </div>
                  <div className="text-right ml-6">
                    <div className={`text-3xl font-bold ${getScoreColor(h.score || 0)}`}>{h.score || 0}</div>
                    <div className="text-xs text-gray-400 dark:text-stone-500">综合评分</div>
                  </div>
                </div>
                {/* Mini progress bar */}
                <div className="mt-3 w-full h-2 bg-gray-100 dark:bg-stone-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      (h.score || 0) >= 80 ? 'bg-green-500' :
                      (h.score || 0) >= 60 ? 'bg-yellow-500' :
                      (h.score || 0) >= 40 ? 'bg-orange-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${h.score || 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
