'use client';

import { useRouter } from 'next/navigation';

interface InterviewTabProps {
  id: string;
  handover: any;
}

export default function InterviewTab({ id, handover }: InterviewTabProps) {
  const router = useRouter();
  const answers = handover.answers || [];
  const answered = answers.filter((a: any) => a.answer && a.answer.trim());

  if (answered.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-stone-900 rounded-2xl shadow-lg">
        <div className="text-4xl mb-3">📝</div>
        <p className="text-gray-500 dark:text-stone-400">还没有回答</p>
        <button onClick={() => router.push(`/interview?id=${id}`)} className="mt-3 px-5 py-2 bg-orange-500 text-white rounded-xl text-sm hover:bg-orange-600">
          开始访谈
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {answered.map((a: any, i: number) => (
        <div key={i} className="bg-white dark:bg-stone-900 rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full">{a.category}</span>
            <span className="text-sm font-medium text-gray-700 dark:text-stone-300">{a.question_label}</span>
          </div>
          <p className="text-gray-700 dark:text-stone-300 whitespace-pre-wrap">{a.answer}</p>
        </div>
      ))}
    </div>
  );
}
