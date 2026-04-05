'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [handovers, setHandovers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/handover')
      .then(r => r.json())
      .then(data => {
        setHandovers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-green-100 text-green-700 border-green-200';
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
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">加载中...</div>;

  const criticalCount = handovers.filter(h => h.risk_level === 'critical').length;
  const highCount = handovers.filter(h => h.risk_level === 'high').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-1">📊 交接管理看板</h1>
            <p className="text-gray-500">所有交接项目的进度和质量总览</p>
          </div>
          <button
            onClick={() => router.push('/new')}
            className="px-5 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors shadow-md"
          >
            + 新建交接
          </button>
        </div>

        {/* Alert Banner */}
        {(criticalCount > 0 || highCount > 0) && (
          <div className={`mb-6 p-4 rounded-xl border ${criticalCount > 0 ? 'bg-red-50 border-red-200' : 'bg-orange-50 border-orange-200'}`}>
            <p className="font-medium text-red-700">
              {criticalCount > 0 && `🚨 ${criticalCount} 个交接项目存在严重风险`}
              {criticalCount > 0 && highCount > 0 && ' · '}
              {highCount > 0 && `⚠️ ${highCount} 个交接项目风险较高`}
            </p>
            <p className="text-sm text-red-600 mt-1">请及时跟进这些项目</p>
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
            <div key={stat.label} className="bg-white rounded-2xl shadow-lg p-6 text-center">
              <div className="text-3xl mb-2">{stat.emoji}</div>
              <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Handover List */}
        {handovers.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">还没有交接记录</h2>
            <p className="text-gray-500 mb-6">开始一次有尊严的知识传递</p>
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
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => router.push(`/handover/${h.id}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-semibold text-gray-800">{h.person_name}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getRiskColor(h.risk_level || 'low')}`}>
                        {getRiskLabel(h.risk_level || 'low')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{h.project_name} → {h.successor_name}</p>
                    {h.departure_date && (
                      <p className="text-xs text-gray-400 mt-1">离职日期: {h.departure_date}</p>
                    )}
                  </div>
                  <div className="text-right ml-6">
                    <div className={`text-3xl font-bold ${getScoreColor(h.score || 0)}`}>{h.score || 0}</div>
                    <div className="text-xs text-gray-400">综合评分</div>
                  </div>
                </div>
                {/* Mini progress bar */}
                <div className="mt-3 w-full h-2 bg-gray-100 rounded-full overflow-hidden">
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
