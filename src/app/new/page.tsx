'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { roleTemplates } from '@/lib/questions';

const roles = roleTemplates;

export default function NewHandoverPage() {
  const router = useRouter();
  const [personName, setPersonName] = useState('');
  const [successorName, setSuccessorName] = useState('');
  const [projectName, setProjectName] = useState('');
  const [role, setRole] = useState('backend');
  const [step, setStep] = useState(1);

  const handleSubmit = () => {
    if (!personName.trim()) return;
    const id = Date.now();
    const data = {
      id,
      personName: personName.trim(),
      successorName: successorName.trim() || '待确定',
      projectName: projectName.trim() || '项目',
      role,
      createdAt: new Date().toISOString(),
      answers: {} as Record<string, string>,
    };
    localStorage.setItem(`handover_${id}`, JSON.stringify(data));
    localStorage.setItem('handover_current', String(id));
    
    // Also save to a list
    const listStr = localStorage.getItem('handover_list') || '[]';
    const list = JSON.parse(listStr);
    list.unshift({ id, personName: data.personName, projectName: data.projectName, createdAt: data.createdAt, status: 'in_progress' });
    localStorage.setItem('handover_list', JSON.stringify(list));
    
    router.push(`/interview?id=${id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">新建交接</h1>
          <p className="text-gray-500">让我们开始一次有尊严的知识传递</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
          {/* Step Indicator */}
          <div className="flex items-center gap-2 mb-6">
            {[1, 2].map(s => (
              <div key={s} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                s <= step ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {s}
              </div>
            ))}
            <div className="flex-1 h-0.5 bg-gray-200">
              <div className="h-full bg-orange-500 transition-all" style={{ width: step >= 2 ? '100%' : '0%' }} />
            </div>
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">离职人姓名 *</label>
                <input
                  type="text"
                  value={personName}
                  onChange={e => setPersonName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                  placeholder="例如：张三"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">接手人姓名</label>
                <input
                  type="text"
                  value={successorName}
                  onChange={e => setSuccessorName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                  placeholder="例如：李四（可留空）"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">项目名称</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={e => setProjectName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                  placeholder="例如：用户服务"
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
                <label className="block text-sm font-medium text-gray-700 mb-3">选择角色模板</label>
                <div className="grid grid-cols-1 gap-3">
                  {roles.map(r => (
                    <button
                      key={r.id}
                      onClick={() => setRole(r.id)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        role === r.id
                          ? 'border-orange-400 bg-orange-50'
                          : 'border-gray-200 hover:border-orange-200'
                      }`}
                    >
                      <div className="font-medium text-gray-800">{r.name}</div>
                      <div className="text-sm text-gray-500">{r.description}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  ← 上一步
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors"
                >
                  开始访谈 🤝
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
