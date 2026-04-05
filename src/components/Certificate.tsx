'use client';

import { useState } from 'react';

interface CertificateProps {
  personName: string;
  successorName: string;
  projectName: string;
  completedDate: string;
  score: number;
  answeredCount: number;
  totalQuestions: number;
}

export default function Certificate({ personName, successorName, projectName, completedDate, score, answeredCount, totalQuestions }: CertificateProps) {
  const [showPreview, setShowPreview] = useState(false);

  if (!showPreview) {
    return (
      <button
        onClick={() => setShowPreview(true)}
        className="w-full p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-left hover:shadow-md transition-all"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏆</span>
          <div>
            <div className="font-medium text-amber-800 dark:text-amber-200">交接完成证书</div>
            <div className="text-sm text-amber-600 dark:text-amber-400">生成可分享的交接完成报告</div>
          </div>
        </div>
      </button>
    );
  }

  const grade = score >= 90 ? '优秀' : score >= 80 ? '良好' : score >= 60 ? '合格' : '需改进';
  const gradeColor = score >= 90 ? 'text-green-600' : score >= 80 ? 'text-blue-600' : score >= 60 ? 'text-amber-600' : 'text-red-600';

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowPreview(false)}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Certificate Header */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-8 py-6 text-center rounded-t-2xl">
          <div className="text-4xl mb-2">🏆</div>
          <h2 className="text-2xl font-bold">交接完成证书</h2>
          <p className="text-orange-100 mt-1">Certificate of Handover Completion</p>
        </div>

        {/* Certificate Body */}
        <div className="p-8 space-y-6">
          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm">兹证明</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-200 mt-2">{personName}</p>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              已于 <strong className="text-orange-600">{completedDate}</strong> 完成
            </p>
            <p className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-1">「{projectName}」</p>
            <p className="text-gray-600 dark:text-gray-400">的知识交接工作，交接给 <strong className="text-orange-600">{successorName}</strong></p>
          </div>

          {/* Score Card */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 text-center">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">综合评分</div>
            <div className={`text-5xl font-bold ${gradeColor}`}>{score}</div>
            <div className="text-lg font-medium text-gray-700 dark:text-gray-300 mt-1">{grade}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              已回答 {answeredCount} / {totalQuestions} 个问题
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-center">
              <div className="text-green-600 dark:text-green-400 font-medium">✅ 结构化文档</div>
              <div className="text-xs text-green-500 mt-1">PROJECT / PEOPLE / LESSONS / TODO</div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-center">
              <div className="text-blue-600 dark:text-blue-400 font-medium">📋 完整时间线</div>
              <div className="text-xs text-blue-500 mt-1">T-30 到 T-0 完整清单</div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-gray-400 dark:text-gray-600 pt-4 border-t border-gray-200 dark:border-gray-800">
            <p>Warm Handover — 让经验活下来</p>
            <p className="mt-1">{new Date().toLocaleDateString('zh-CN')} 自动生成</p>
          </div>
        </div>

        {/* Actions */}
        <div className="px-8 pb-6 flex gap-3">
          <button
            onClick={() => {
              // Print certificate
              window.print();
            }}
            className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors"
          >
            🖨️ 打印 / 保存 PDF
          </button>
          <button
            onClick={() => setShowPreview(false)}
            className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}
