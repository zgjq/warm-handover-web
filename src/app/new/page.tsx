'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { roleTemplates } from '@/lib/questions';
import { templates as scenarioTemplates, getTemplate } from '@/lib/templates';
import { DataService } from '@/lib/data-service';

const roles = roleTemplates;

export default function NewHandoverPage() {
  const router = useRouter();
  const [personName, setPersonName] = useState('');
  const [successorName, setSuccessorName] = useState('');
  const [projectName, setProjectName] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [role, setRole] = useState('backend');
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!personName.trim()) return;
    setSubmitting(true);
    try {
      const id = await DataService.create({
        personName: personName.trim(),
        successorName: successorName.trim() || '待确定',
        projectName: projectName.trim() || '项目',
        departureDate: departureDate || undefined,
        role,
      });
      alert('✅ 交接创建成功！');
      router.push(`/interview?id=${id}`);
    } catch (e: any) {
      alert(e.message || '创建失败');
    } finally {
      setSubmitting(false);
    }
  };

  const daysRemaining = departureDate ? Math.ceil((new Date(departureDate).getTime() - Date.now()) / 86400000) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-stone-950 dark:via-stone-900 dark:to-stone-950">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-stone-100 mb-2">新建交接</h1>
          <p className="text-gray-500 dark:text-stone-400">让我们开始一次有尊严的知识传递</p>
        </div>

        <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-lg p-8 space-y-6">
          {/* Step Indicator */}
          <div className="flex items-center gap-2 mb-6">
            {[1, 2, 3].map(s => (
              <div key={s} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                s <= step ? 'bg-orange-500 text-white' : 'bg-gray-200 dark:bg-stone-700 text-gray-500 dark:text-stone-400'
              }`}>
                {s}
              </div>
            ))}
            <div className="flex-1 h-0.5 bg-gray-200 dark:bg-stone-700">
              <div className="h-full bg-orange-500 transition-all" style={{ width: step >= 3 ? '100%' : step >= 2 ? '50%' : '0%' }} />
            </div>
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-stone-300 mb-1">离职人姓名 *</label>
                <input
                  type="text"
                  value={personName}
                  onChange={e => setPersonName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && personName.trim() && setStep(2)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                  placeholder="例如：张三"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-stone-300 mb-1">接手人姓名</label>
                <input
                  type="text"
                  value={successorName}
                  onChange={e => setSuccessorName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && setStep(2)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                  placeholder="例如：李四（可留空）"
                />
              </div>
              <button
                onClick={() => personName.trim() && setStep(2)}
                className="w-full py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors disabled:opacity-50"
                disabled={!personName.trim()}
              >
                下一步 →
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-stone-300 mb-1">项目名称</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={e => setProjectName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && setStep(3)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                  placeholder="例如：用户服务"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-stone-300 mb-1">离职日期</label>
                <input
                  type="date"
                  value={departureDate}
                  onChange={e => setDepartureDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                  min={new Date().toISOString().split('T')[0]}
                />
                {daysRemaining !== null && daysRemaining > 0 && (
                  <p className="mt-1 text-sm text-orange-600 dark:text-orange-400">
                    ⏰ 还有 <strong>{daysRemaining}</strong> 天
                  </p>
                )}
                {daysRemaining !== null && daysRemaining <= 0 && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    ⚠️ 离职日期已过
                  </p>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 bg-gray-100 dark:bg-stone-800 text-gray-700 dark:text-stone-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-stone-700 transition-colors"
                >
                  ← 上一步
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors"
                >
                  下一步 →
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-stone-300 mb-3">选择交接场景</label>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {scenarioTemplates.map(t => (
                    <div key={t.id} className="p-3 bg-gray-50 dark:bg-stone-800 rounded-xl text-center text-sm">
                      <div className="text-2xl mb-1">{t.emoji}</div>
                      <div className="font-medium text-gray-700 dark:text-stone-200">{t.name}</div>
                      <div className="text-xs text-gray-400 dark:text-stone-400">{t.description}</div>
                    </div>
                  ))}
                </div>
                <label className="block text-sm font-medium text-gray-700 dark:text-stone-300 mb-3">选择角色模板</label>
                <div className="grid grid-cols-1 gap-3">
                  {roles.map(r => (
                    <button
                      key={r.id}
                      onClick={() => setRole(r.id)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        role === r.id
                          ? 'border-orange-400 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-600 shadow-sm'
                          : 'border-gray-200 dark:border-stone-700 hover:border-orange-200 dark:hover:border-orange-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-800 dark:text-stone-100">{r.name}</div>
                          <div className="text-sm text-gray-500 dark:text-stone-400">{r.description}</div>
                        </div>
                        {role === r.id && <span className="text-orange-500 text-xl">✓</span>}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="bg-gray-50 dark:bg-stone-800 rounded-xl p-4 text-sm space-y-1">
                <p><span className="text-gray-500 dark:text-stone-400">离职人：</span><span className="font-medium dark:text-stone-200">{personName}</span></p>
                <p><span className="text-gray-500 dark:text-stone-400">接手人：</span><span className="dark:text-stone-300">{successorName || '待确定'}</span></p>
                <p><span className="text-gray-500 dark:text-stone-400">项目：</span><span className="dark:text-stone-300">{projectName || '项目'}</span></p>
                {departureDate && <p><span className="text-gray-500 dark:text-stone-400">离职日期：</span><span className="dark:text-stone-300">{departureDate}</span></p>}
                <p><span className="text-gray-500 dark:text-stone-400">角色：</span><span className="dark:text-stone-300">{roles.find(r => r.id === role)?.name}</span></p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-3 bg-gray-100 dark:bg-stone-800 text-gray-700 dark:text-stone-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-stone-700 transition-colors"
                >
                  ← 上一步
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors disabled:opacity-50"
                >
                  {submitting ? '⏳ 创建中...' : '开始交接 🤝'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
