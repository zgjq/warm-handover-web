'use client';

import { useRouter } from 'next/navigation';
import SmartFollowUp from '../SmartFollowUp';
import Certificate from '../Certificate';

interface OverviewTabProps {
  id: string;
  handover: any;
  score: any;
  comments: any[];
  checklist: Record<string, boolean>;
  successorRating: number;
  onRate: (rating: number) => void;
}

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

const getScoreColor = (s: number) => {
  if (s >= 80) return 'text-green-600 dark:text-green-400';
  if (s >= 60) return 'text-yellow-600 dark:text-yellow-400';
  if (s >= 40) return 'text-orange-600 dark:text-orange-400';
  return 'text-red-600 dark:text-red-400';
};

export default function OverviewTab({ id, handover, score, comments, checklist, successorRating, onRate }: OverviewTabProps) {
  const router = useRouter();

  return (
    <div className="space-y-6">
      {/* Score Breakdown */}
      {score && (
        <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-stone-100 mb-4">📊 评分详情</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: '访谈完成度', value: score.interview_completion, icon: '🎯' },
              { label: '时间线进度', value: score.timeline_progress, icon: '📅' },
              { label: '文档质量', value: score.document_quality, icon: '📄' },
              { label: '接手人评分', value: (score.successor_rating || 0) * 20, icon: '⭐' },
            ].map(item => (
              <div key={item.label} className="text-center p-4 bg-gray-50 dark:bg-stone-800 rounded-xl">
                <div className="text-2xl mb-1">{item.icon}</div>
                <div className={`text-2xl font-bold ${getScoreColor(item.value)}`}>{item.value}%</div>
                <div className="text-xs text-gray-500 dark:text-stone-400">{item.label}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-stone-700">
            <p className="text-sm text-gray-600 dark:text-stone-400 mb-2">接手人评分：</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  onClick={() => onRate(n)}
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
        <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-lg p-6 text-center">
          <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">{handover.answeredQuestions || 0}/{handover.totalQuestions || 0}</div>
          <div className="text-sm text-gray-500 dark:text-stone-400 mt-1">已回答问题</div>
        </div>
        <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-lg p-6 text-center">
          <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">{comments.length}</div>
          <div className="text-sm text-gray-500 dark:text-stone-400 mt-1">评论数</div>
        </div>
        <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-lg p-6 text-center">
          <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
            {Object.values(checklist).filter(Boolean).length}/{CHECKLIST.length}
          </div>
          <div className="text-sm text-gray-500 dark:text-stone-400 mt-1">清单完成</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <button onClick={() => router.push(`/interview?id=${id}`)} className="px-5 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors">
          🎯 继续访谈
        </button>
        <button onClick={() => router.push(`/knowledge?id=${id}`)} className="px-5 py-3 bg-white dark:bg-stone-800 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800 rounded-xl font-medium hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors">
          🔍 知识库
        </button>
        <button onClick={() => router.push(`/output?id=${id}`)} className="px-5 py-3 bg-white dark:bg-stone-800 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800 rounded-xl font-medium hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors">
          📄 导出文档
        </button>
        <button onClick={() => router.push(`/settings?id=${id}`)} className="px-5 py-3 bg-white dark:bg-stone-800 text-gray-600 dark:text-stone-300 border border-gray-200 dark:border-stone-700 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-stone-700 transition-colors">
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
  );
}
