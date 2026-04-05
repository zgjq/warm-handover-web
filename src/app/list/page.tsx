'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ListPage() {
  const router = useRouter();
  const [handovers, setHandovers] = useState<any[]>([]);

  useEffect(() => {
    const listStr = localStorage.getItem('handover_list') || '[]';
    setHandovers(JSON.parse(listStr));
  }, []);

  const handleDelete = (id: number) => {
    localStorage.removeItem(`handover_${id}`);
    localStorage.removeItem(`checklist_${id}`);
    const updated = handovers.filter(h => h.id !== id);
    setHandovers(updated);
    localStorage.setItem('handover_list', JSON.stringify(updated));
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'in_progress': return '进行中';
      case 'completed': return '已完成';
      default: return '草稿';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress': return 'bg-orange-100 text-orange-700';
      case 'completed': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-1">我的交接</h1>
            <p className="text-gray-500">管理所有交接记录</p>
          </div>
          <button
            onClick={() => router.push('/new')}
            className="px-5 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors shadow-md"
          >
            + 新建
          </button>
        </div>

        {handovers.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🤝</div>
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
              <div key={h.id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1 cursor-pointer" onClick={() => router.push(`/interview?id=${h.id}`)}>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">{h.personName}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(h.status || 'draft')}`}>
                        {getStatusText(h.status || 'draft')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{h.projectName || '项目'} → {h.successorName || '待确定'}</p>
                    <p className="text-xs text-gray-400 mt-1">创建于 {new Date(h.createdAt).toLocaleDateString('zh-CN')}</p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => router.push(`/output?id=${h.id}`)}
                      className="px-3 py-1.5 text-sm text-orange-500 border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors"
                    >
                      查看
                    </button>
                    <button
                      onClick={() => handleDelete(h.id)}
                      className="px-3 py-1.5 text-sm text-red-400 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      删除
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
