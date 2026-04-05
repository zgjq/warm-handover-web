'use client';

import { useState } from 'react';

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

const phases = ['T-30 天', 'T-21 天', 'T-14 天', 'T-7 天', 'T-3 天', 'T-0 天'];
const phaseIcons: Record<string, string> = {
  'T-30 天': '📋', 'T-21 天': '📝', 'T-14 天': '👥',
  'T-7 天': '🔍', 'T-3 天': '✅', 'T-0 天': '🫡',
};

interface TimelineTabProps {
  id: string;
  checklist: Record<string, boolean>;
  onToggle: (itemId: string) => void;
}

export default function TimelineTab({ id, checklist, onToggle }: TimelineTabProps) {
  return (
    <div className="space-y-4">
      {phases.map(phase => {
        const items = CHECKLIST.filter(i => i.phase === phase);
        return (
          <div key={phase} className="bg-white dark:bg-stone-900 rounded-2xl shadow-lg overflow-hidden">
            <div className="px-6 py-3 bg-gray-50 dark:bg-stone-800 border-b border-gray-100 dark:border-stone-700 flex items-center gap-3">
              <span className="text-xl">{phaseIcons[phase]}</span>
              <h3 className="font-bold text-gray-800 dark:text-stone-100">{phase}</h3>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-stone-800">
              {items.map(item => (
                <label key={item.id} className={`flex items-center gap-3 px-6 py-3 cursor-pointer transition-colors ${checklist[item.id] ? 'bg-green-50/50 dark:bg-green-900/10' : 'hover:bg-gray-50 dark:hover:bg-stone-800/50'}`}>
                  <input
                    type="checkbox"
                    checked={!!checklist[item.id]}
                    onChange={() => onToggle(item.id)}
                    className="w-5 h-5 rounded border-gray-300 dark:border-stone-600 text-orange-500 focus:ring-orange-300 dark:bg-stone-700"
                  />
                  <span className={`text-sm ${checklist[item.id] ? 'text-green-700 dark:text-green-400 line-through' : 'text-gray-700 dark:text-stone-300'}`}>
                    {item.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
