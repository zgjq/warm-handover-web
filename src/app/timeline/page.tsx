'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface ChecklistItem {
  id: string;
  phase: string;
  label: string;
  checked: boolean;
}

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  { id: 't30_1', phase: 'T-30 天', label: '确认离职日期和最后工作日', checked: false },
  { id: 't30_2', phase: 'T-30 天', label: '指定接手人（或启动招聘）', checked: false },
  { id: 't30_3', phase: 'T-30 天', label: '安排交接访谈时间（至少 2 次）', checked: false },
  { id: 't30_4', phase: 'T-30 天', label: '整理项目清单和代码仓库权限', checked: false },
  { id: 't21_1', phase: 'T-21 天', label: '运行首轮访谈', checked: false },
  { id: 't21_2', phase: 'T-21 天', label: '生成 PROJECT.md 和 PEOPLE.md', checked: false },
  { id: 't21_3', phase: 'T-21 天', label: '确认所有代码已提交，分支已合并', checked: false },
  { id: 't14_1', phase: 'T-14 天', label: '接手人开始参与日常工作', checked: false },
  { id: 't14_2', phase: 'T-14 天', label: '离职人 Review 接手人的工作', checked: false },
  { id: 't14_3', phase: 'T-14 天', label: '完成 LESSONS.md 访谈', checked: false },
  { id: 't7_1', phase: 'T-7 天', label: '完成 TODO.md 访谈', checked: false },
  { id: 't7_2', phase: 'T-7 天', label: '确认外部联系人已介绍', checked: false },
  { id: 't7_3', phase: 'T-7 天', label: '安排离职后的紧急联系方式', checked: false },
  { id: 't3_1', phase: 'T-3 天', label: '所有交接文档已完成并分享', checked: false },
  { id: 't3_2', phase: 'T-3 天', label: '接手人能独立完成至少一个任务', checked: false },
  { id: 't3_3', phase: 'T-3 天', label: '权限转移确认', checked: false },
  { id: 't0_1', phase: 'T-0 天', label: '正式交接确认', checked: false },
  { id: 't0_2', phase: 'T-0 天', label: '权限回收', checked: false },
  { id: 't0_3', phase: 'T-0 天', label: '好好告别 🫡', checked: false },
];

const phases = ['T-30 天', 'T-21 天', 'T-14 天', 'T-7 天', 'T-3 天', 'T-0 天'];
const phaseIcons: Record<string, string> = {
  'T-30 天': '📋',
  'T-21 天': '📝',
  'T-14 天': '👥',
  'T-7 天': '🔍',
  'T-3 天': '✅',
  'T-0 天': '🫡',
};

function TimelineContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const [handover, setHandover] = useState<any>(null);
  const [checklist, setChecklist] = useState<ChecklistItem[]>(DEFAULT_CHECKLIST);

  useEffect(() => {
    if (!id) return;
    const data = localStorage.getItem(`handover_${id}`);
    if (!data) { router.push('/new'); return; }
    setHandover(JSON.parse(data));
    const saved = localStorage.getItem(`checklist_${id}`);
    if (saved) setChecklist(JSON.parse(saved));
  }, [id]);

  const toggleItem = (itemId: string) => {
    const updated = checklist.map(item =>
      item.id === itemId ? { ...item, checked: !item.checked } : item
    );
    setChecklist(updated);
    if (id) localStorage.setItem(`checklist_${id}`, JSON.stringify(updated));
  };

  const progress = Math.round((checklist.filter(i => i.checked).length / checklist.length) * 100);

  if (!handover) {
    return <div className="min-h-screen flex items-center justify-center">加载中...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">📅 交接时间线</h1>
          <p className="text-gray-500">{handover.personName} → {handover.successorName || '待确定'}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">交接进度</span>
            <span className="text-sm font-bold text-orange-600">{progress}%</span>
          </div>
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-400 to-amber-400 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-2 text-xs text-gray-400">
            {checklist.filter(i => i.checked).length} / {checklist.length} 项完成
          </div>
        </div>

        <div className="space-y-6">
          {phases.map(phase => {
            const items = checklist.filter(i => i.phase === phase);
            const done = items.filter(i => i.checked).length;
            const allDone = done === items.length;
            return (
              <div key={phase} className={`bg-white rounded-2xl shadow-lg overflow-hidden transition-all ${allDone ? 'ring-2 ring-green-200' : ''}`}>
                <div className={`px-6 py-4 ${allDone ? 'bg-green-50' : 'bg-gray-50'} border-b border-gray-100`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{phaseIcons[phase]}</span>
                      <div>
                        <h3 className="font-bold text-gray-800">{phase}</h3>
                        <span className="text-xs text-gray-500">{done}/{items.length} 完成</span>
                      </div>
                    </div>
                    {allDone && <span className="text-green-500 text-lg">✅</span>}
                  </div>
                </div>
                <div className="divide-y divide-gray-100">
                  {items.map(item => (
                    <label
                      key={item.id}
                      className={`flex items-center gap-3 px-6 py-4 cursor-pointer transition-colors ${
                        item.checked ? 'bg-green-50/50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => toggleItem(item.id)}
                        className="w-5 h-5 rounded border-gray-300 text-orange-500 focus:ring-orange-300"
                      />
                      <span className={`text-sm ${item.checked ? 'text-green-700 line-through' : 'text-gray-700'}`}>
                        {item.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => router.push(`/output?id=${id}`)}
            className="px-6 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors"
          >
            ← 返回文档
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TimelinePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">加载中...</div>}>
      <TimelineContent />
    </Suspense>
  );
}
