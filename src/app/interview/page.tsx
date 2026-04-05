'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getQuestionsForRole } from '@/lib/questions';
import { getTacitKnowledgeQuestions } from '@/lib/tacit-knowledge';
import { DataService, onSaveStatusChange } from '@/lib/data-service';

function InterviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const notifyError = (msg: string) => alert('❌ ' + msg);

  const [handover, setHandover] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [catIdx, setCatIdx] = useState(0);
  const [qIdx, setQIdx] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [loading, setLoading] = useState(true);

  // Tacit knowledge state
  const [showTacit, setShowTacit] = useState(false);
  const [tacitQuestions] = useState(() => getTacitKnowledgeQuestions(''));
  const [tacitIdx, setTacitIdx] = useState(0);
  const [tacitAnswer, setTacitAnswer] = useState('');

  useEffect(() => {
    const unsub = onSaveStatusChange(setSaveStatus);
    return () => { unsub(); };
  }, []);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    DataService.get(Number(id)).then(data => {
      if (!data) { router.push('/new'); return; }
      setHandover(data);
      const cats = getQuestionsForRole(data.role || 'backend');
      setCategories(cats);

      const loadedAnswers: Record<string, string> = {};
      for (const cat of cats) {
        for (const q of cat.questions) {
          const key = `${cat.file}::${q.key}`;
          const val = data.answers[key] || '';
          if (val) loadedAnswers[key] = val;
        }
      }
      setAnswers(loadedAnswers);
      setLoading(false);
    }).catch(e => {
      console.error('[Interview] Load failed:', e);
      notifyError('加载失败: ' + e.message);
      setLoading(false);
    });
  }, [id]);

  const progress = useCallback(() => {
    if (categories.length === 0) return 0;
    let totalQ = 0;
    let answeredQ = 0;
    for (const cat of categories) {
      for (const q of cat.questions) {
        totalQ++;
        if (answers[`${cat.file}::${q.key}`]?.trim()) answeredQ++;
      }
    }
    if (currentAnswer.trim()) answeredQ++;
    return totalQ > 0 ? Math.round((answeredQ / totalQ) * 100) : 0;
  }, [answers, currentAnswer, categories]);

  const handleNext = async () => {
    const val = currentAnswer.trim() || '';
    if (val) {
      try {
        await DataService.saveAnswer(Number(id), cat.file, q.key, q.label, val);
        const newAnswers = { ...answers, [answerKey]: val };
        setAnswers(newAnswers);
        setCurrentAnswer('');
      } catch (e: any) {
        notifyError(e.message || '保存失败');
        return;
      }
    }

    if (qIdx < cat.questions.length - 1) {
      setQIdx(qIdx + 1);
    } else if (catIdx < categories.length - 1) {
      setCatIdx(catIdx + 1);
      setQIdx(0);
    } else {
      // Main interview done — show tacit knowledge option
      setShowTacit(true);
    }
  };

  const handleSkip = () => {
    if (qIdx < cat.questions.length - 1) {
      setQIdx(qIdx + 1);
    } else if (catIdx < categories.length - 1) {
      setCatIdx(catIdx + 1);
      setQIdx(0);
    } else {
      setShowTacit(true);
    }
  };

  const handlePrev = () => {
    if (qIdx > 0) {
      setQIdx(qIdx - 1);
    } else if (catIdx > 0) {
      setCatIdx(catIdx - 1);
      setQIdx(categories[catIdx - 1].questions.length - 1);
    }
  };

  const handleTacitSave = async () => {
    if (!tacitAnswer.trim()) return;
    try {
      const tq = tacitQuestions[tacitIdx];
      await DataService.saveAnswer(Number(id), 'TACIT', tq.id, tq.label, tacitAnswer.trim());
      setTacitAnswer('');
      if (tacitIdx < tacitQuestions.length - 1) {
        setTacitIdx(tacitIdx + 1);
      } else {
        alert('🎉 访谈完成！感谢你的分享！');
        router.push(`/output?id=${id}`);
      }
    } catch (e: any) {
      notifyError(e.message || '保存失败');
    }
  };

  const handleTacitSkip = () => {
    if (tacitIdx < tacitQuestions.length - 1) {
      setTacitIdx(tacitIdx + 1);
    } else {
      alert('🎉 访谈完成！');
      router.push(`/output?id=${id}`);
    }
  };

  if (loading || !handover || categories.length === 0) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-pulse text-4xl mb-3">🎯</div>
        <p className="text-gray-500 dark:text-stone-400">加载访谈中...</p>
      </div>
    </div>;
  }

  // ── Tacit Knowledge Round ──
  if (showTacit) {
    const tq = tacitQuestions[tacitIdx];
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-stone-950 dark:via-purple-950/20 dark:to-stone-950">
        <div className="max-w-3xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🧠</span>
              <h1 className="text-2xl font-bold text-purple-800 dark:text-purple-300">默会知识</h1>
            </div>
            <p className="text-purple-600 dark:text-purple-400 text-sm">
              Polanyi 说："我们所知多于我们所能言。"这些问题捕捉那些难以言传、但极其宝贵的经验。
            </p>
            <div className="mt-2 text-xs text-purple-500 dark:text-purple-400">
              可选环节 · 跳过不影响主访谈 · 第 {tacitIdx + 1} / {tacitQuestions.length} 题
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-lg p-8">
            <div className="text-sm text-purple-600 dark:text-purple-400 font-medium mb-2">{tq.label}</div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-stone-100 mb-3">{tq.prompt}</h2>
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4 mb-4">
              <div className="text-xs text-purple-600 dark:text-purple-400 font-medium mb-1">💡 提示</div>
              <p className="text-sm text-purple-700 dark:text-purple-300">{tq.hint}</p>
            </div>
            <div className="bg-gray-50 dark:bg-stone-800 border border-gray-200 dark:border-stone-700 rounded-xl p-4 mb-4">
              <div className="text-xs text-gray-500 dark:text-stone-400 font-medium mb-1">📝 示例回答</div>
              <p className="text-sm text-gray-600 dark:text-stone-300 italic">{tq.example}</p>
            </div>

            <textarea
              value={tacitAnswer}
              onChange={e => setTacitAnswer(e.target.value)}
              placeholder="这种经验很难用语言完全描述，但请尽可能分享..."
              className="w-full h-40 px-4 py-3 rounded-xl border border-gray-200 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all resize-none"
            />

            <div className="flex gap-3 mt-4">
              <button
                onClick={handleTacitSkip}
                className="px-6 py-3 bg-gray-100 dark:bg-stone-800 text-gray-500 dark:text-stone-400 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-stone-700 transition-colors"
              >
                跳过
              </button>
              <button
                onClick={handleTacitSave}
                disabled={!tacitAnswer.trim()}
                className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {tacitIdx < tacitQuestions.length - 1 ? '保存并下一题 →' : '完成 🎉'}
              </button>
            </div>
          </div>

          {/* Progress dots */}
          <div className="flex justify-center gap-2 mt-6">
            {tacitQuestions.map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full transition-all ${
                  i === tacitIdx ? 'bg-purple-500 scale-125' :
                  i < tacitIdx ? 'bg-green-400' :
                  'bg-gray-300 dark:bg-stone-700'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Main Interview ──
  const cat = categories[catIdx];
  const q = cat.questions[qIdx];
  const answerKey = `${cat.file}::${q.key}`;
  const existingAnswer = answers[answerKey] || '';
  const totalQuestions = categories.reduce((sum, c) => sum + c.questions.length, 0);
  const currentQuestionNum = categories.slice(0, catIdx).reduce((sum, c) => sum + c.questions.length, 0) + qIdx + 1;
  const prog = progress();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-stone-950 dark:via-stone-900 dark:to-stone-950">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500 dark:text-stone-400">{handover.personName} → {handover.successorName || '待确定'}</span>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 dark:text-stone-400">{currentQuestionNum} / {totalQuestions}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full transition-all ${
                saveStatus === 'saving' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 animate-pulse' :
                saveStatus === 'saved' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                saveStatus === 'error' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                'bg-gray-100 dark:bg-stone-800 text-gray-400 dark:text-stone-500'
              }`}>
                {saveStatus === 'saving' ? '💾 保存中...' :
                 saveStatus === 'saved' ? '✅ 已保存' :
                 saveStatus === 'error' ? '❌ 保存失败' : ''}
              </span>
            </div>
          </div>
          <div className="w-full h-2 bg-gray-200 dark:bg-stone-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-400 to-amber-400 rounded-full transition-all duration-500"
              style={{ width: `${prog}%` }}
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {categories.map((c, i) => {
            const catAnswered = c.questions.filter((q: any) => answers[`${c.file}::${q.key}`]?.trim()).length;
            const catTotal = c.questions.length;
            const catDone = catAnswered === catTotal;
            return (
              <button
                key={c.file}
                onClick={() => { setCatIdx(i); setQIdx(0); setCurrentAnswer(''); }}
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all flex items-center gap-1 ${
                  i === catIdx
                    ? 'bg-orange-500 text-white shadow-md'
                    : catDone
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : 'bg-white dark:bg-stone-800 text-gray-600 dark:text-stone-300 hover:bg-gray-50 dark:hover:bg-stone-700'
                }`}
              >
                {c.icon} {c.file.replace('.md', '')}
                {catDone && <span>✓</span>}
              </button>
            );
          })}
        </div>

        {/* Question Card */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-lg p-8 transition-all">
          <div className="text-sm text-orange-500 dark:text-orange-400 font-medium mb-2">{q.label}</div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-stone-100 mb-4 whitespace-pre-line">{q.text}</h2>
          
          {existingAnswer && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-sm text-green-700 dark:text-green-400">
              ✅ 已有回答，可以修改
            </div>
          )}

          <textarea
            value={currentAnswer || existingAnswer}
            onChange={e => setCurrentAnswer(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                handleNext();
              }
            }}
            placeholder={q.placeholder || '输入你的回答...'}
            className="w-full h-40 px-4 py-3 rounded-xl border border-gray-200 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all resize-none"
          />

          <div className="flex items-center justify-between mt-4">
            <span className="text-xs text-gray-400 dark:text-stone-500">⌘/Ctrl + Enter 快速保存并下一题</span>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={handlePrev}
              disabled={catIdx === 0 && qIdx === 0}
              className="px-6 py-3 bg-gray-100 dark:bg-stone-800 text-gray-700 dark:text-stone-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-stone-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← 上一题
            </button>
            <button
              onClick={handleSkip}
              className="px-6 py-3 bg-gray-100 dark:bg-stone-800 text-gray-400 dark:text-stone-500 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-stone-700 transition-colors"
            >
              跳过
            </button>
            <button
              onClick={handleNext}
              className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors"
            >
              {catIdx === categories.length - 1 && qIdx === cat.questions.length - 1
                ? '完成 🎉'
                : '下一题 →'}
            </button>
          </div>
        </div>

        {/* Tip */}
        <div className="mt-6 text-center text-sm text-gray-400 dark:text-stone-500">
          💡 提示：回答越详细，交接文档越有价值。可以随时回来修改。
        </div>
      </div>
    </div>
  );
}

export default function InterviewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">加载中...</div>}>
      <InterviewContent />
    </Suspense>
  );
}
