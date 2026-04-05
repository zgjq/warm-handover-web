'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getQuestionsForRole, baseCategories } from '@/lib/questions';

function InterviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const [handover, setHandover] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [catIdx, setCatIdx] = useState(0);
  const [qIdx, setQIdx] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!id) return;
    const data = localStorage.getItem(`handover_${id}`);
    if (!data) { router.push('/new'); return; }
    const h = JSON.parse(data);
    setHandover(h);
    const cats = getQuestionsForRole(h.role || 'backend');
    setCategories(cats);
    setAnswers(h.answers || {});
  }, [id]);

  useEffect(() => {
    if (categories.length === 0) return;
    let totalQ = 0;
    let answeredQ = 0;
    for (const cat of categories) {
      for (const q of cat.questions) {
        totalQ++;
        if (answers[`${cat.file}::${q.key}`]) answeredQ++;
      }
    }
    if (currentAnswer.trim()) answeredQ++;
    setProgress(totalQ > 0 ? Math.round((answeredQ / totalQ) * 100) : 0);
  }, [answers, currentAnswer, categories]);

  if (!handover || categories.length === 0) {
    return <div className="min-h-screen flex items-center justify-center">加载中...</div>;
  }

  const cat = categories[catIdx];
  const q = cat.questions[qIdx];
  const answerKey = `${cat.file}::${q.key}`;
  const existingAnswer = answers[answerKey] || '';

  const handleNext = () => {
    if (currentAnswer.trim() || existingAnswer) {
      const val = currentAnswer.trim() || existingAnswer;
      const newAnswers = { ...answers, [answerKey]: val };
      setAnswers(newAnswers);
      const data = { ...handover, answers: newAnswers };
      localStorage.setItem(`handover_${id}`, JSON.stringify(data));
    }

    if (qIdx < cat.questions.length - 1) {
      setQIdx(qIdx + 1);
      setCurrentAnswer('');
    } else if (catIdx < categories.length - 1) {
      setCatIdx(catIdx + 1);
      setQIdx(0);
      setCurrentAnswer('');
    } else {
      router.push(`/output?id=${id}`);
    }
  };

  const handleSkip = () => {
    if (qIdx < cat.questions.length - 1) {
      setQIdx(qIdx + 1);
      setCurrentAnswer('');
    } else if (catIdx < categories.length - 1) {
      setCatIdx(catIdx + 1);
      setQIdx(0);
      setCurrentAnswer('');
    } else {
      router.push(`/output?id=${id}`);
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

  const totalQuestions = categories.reduce((sum, c) => sum + c.questions.length, 0);
  const currentQuestionNum = categories.slice(0, catIdx).reduce((sum, c) => sum + c.questions.length, 0) + qIdx + 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">{handover.personName} → {handover.successorName || '待确定'}</span>
            <span className="text-sm text-gray-500">{currentQuestionNum} / {totalQuestions}</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-400 to-amber-400 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {categories.map((c, i) => (
            <button
              key={c.file}
              onClick={() => { setCatIdx(i); setQIdx(0); setCurrentAnswer(''); }}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all ${
                i === catIdx
                  ? 'bg-orange-500 text-white shadow-md'
                  : i < catIdx
                  ? 'bg-green-100 text-green-700'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {c.icon} {c.file.replace('.md', '')}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-sm text-orange-500 font-medium mb-2">{q.label}</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4 whitespace-pre-line">{q.text}</h2>
          
          {existingAnswer && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
              ✅ 已有回答，可以修改
            </div>
          )}

          <textarea
            value={currentAnswer || existingAnswer}
            onChange={e => setCurrentAnswer(e.target.value)}
            placeholder={q.placeholder || '输入你的回答...'}
            className="w-full h-40 px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all resize-none text-gray-700"
          />

          <div className="flex gap-3 mt-6">
            <button
              onClick={handlePrev}
              disabled={catIdx === 0 && qIdx === 0}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              ← 上一题
            </button>
            <button
              onClick={handleSkip}
              className="px-6 py-3 bg-gray-100 text-gray-400 rounded-xl font-medium hover:bg-gray-200 transition-colors"
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

        <div className="mt-6 text-center text-sm text-gray-400">
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
