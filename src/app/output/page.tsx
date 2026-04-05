'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getQuestionsForRole } from '@/lib/questions';
import { getTacitKnowledgeQuestions, generateTacitKnowledgeSection } from '@/lib/tacit-knowledge';
import { DataService } from '@/lib/data-service';
import JSZip from 'jszip';
import { Markdown } from '@/components/Markdown';
import { useTheme } from '@/context/ThemeContext';

function generateDocuments(data: any) {
  const cats = getQuestionsForRole(data.role || 'backend');
  const result: Record<string, string> = {};
  const dateStr = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });

  for (const cat of cats) {
    let content = `# ${data.projectName || '项目'} 交接 — ${cat.file.replace('.md', '')}\n\n`;
    content += `> 访谈日期: ${dateStr}\n`;
    content += `> 离职人: ${data.personName}\n`;
    content += `> 接手人: ${data.successorName || '待确定'}\n`;
    if (data.departureDate) content += `> 离职日期: ${data.departureDate}\n`;
    content += `\n---\n\n`;

    let hasContent = false;
    for (const q of cat.questions) {
      const answer = data.answers[`${cat.file}::${q.key}`] || '';
      if (answer.trim()) {
        content += `## ${q.label}\n\n${answer}\n\n`;
        hasContent = true;
      }
    }

    // Add tacit knowledge section to relevant files
    if (cat.file === 'LESSONS.md' || cat.file === 'PEOPLE.md') {
      const tacitSection = generateTacitKnowledgeSection(data.answers);
      if (tacitSection) {
        content += `\n---\n\n${tacitSection}`;
        hasContent = true;
      }
    }

    if (!hasContent) content += '_（此部分暂无记录）_\n';
    result[cat.file] = content;
  }

  return result;
}

function OutputContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const { theme, toggle } = useTheme();

  const [handover, setHandover] = useState<any>(null);
  const [output, setOutput] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    DataService.get(Number(id)).then(data => {
      if (!data) { router.push('/new'); return; }
      setHandover(data);
      setOutput(generateDocuments(data));
      setLoading(false);
    }).catch(() => {
      const raw = localStorage.getItem(`handover_${id}`);
      if (!raw) { router.push('/new'); return; }
      const h = JSON.parse(raw);
      setHandover(h);
      setOutput(generateDocuments(h));
      setLoading(false);
    });
  }, [id]);

  const handleDownload = async () => {
    setDownloading(true);
    const zip = new JSZip();
    const folder = zip.folder(`handover-${handover?.personName}-${handover?.projectName}`);
    
    for (const [filename, content] of Object.entries(output)) {
      folder?.file(filename, content);
    }

    folder?.file('README.md', `# ${handover?.projectName || '项目'} 交接文档

> 离职人: ${handover?.personName}
> 接手人: ${handover?.successorName || '待确定'}
> 生成日期: ${new Date().toLocaleDateString('zh-CN')}

## 使用说明

这些文档是交接访谈的结构化输出。接手者应该：

1. 先通读所有文件，了解项目全貌
2. 每遇到新问题，直接更新对应文件
3. 每月回顾 LESSONS.md，把个人经验变成团队知识
4. 3 个月后评估交接质量

## 文件说明

- PROJECT.md — 项目全景、架构、关键决策
- PEOPLE.md — 人脉地图、协作网络
- LESSONS.md — 经验教训、踩坑记录
- TODO.md — 待办清单、已知问题
`);

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `warm-handover-${handover?.personName}-${handover?.projectName}.zip`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloading(false);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-pulse text-4xl mb-3">📄</div>
        <p className="text-gray-500 dark:text-stone-400">生成文档中...</p>
      </div>
    </div>;
  }

  if (!handover) return null;

  const filenames = Object.keys(output);
  const answeredCount = Object.values(handover.answers || {}).filter((a: any) => a && a.trim()).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-stone-950 dark:via-stone-900 dark:to-stone-950">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-stone-100 mb-2">📄 交接文档已生成</h1>
          <p className="text-gray-500 dark:text-stone-400">{handover.personName} → {handover.successorName || '待确定'} · {handover.projectName}</p>
          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm">
            ✅ 已回答 {answeredCount} 个问题
          </div>
        </div>

        <div className="flex gap-3 mb-6 justify-center flex-wrap">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="px-6 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors shadow-md disabled:opacity-50 flex items-center gap-2"
          >
            {downloading ? '⏳ 打包中...' : '📦 下载全部 (ZIP)'}
          </button>
          <button
            onClick={() => router.push(`/handover/${id}`)}
            className="px-6 py-3 bg-white dark:bg-stone-800 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800 rounded-xl font-medium hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
          >
            📋 交接详情
          </button>
          <button
            onClick={() => router.push('/list')}
            className="px-6 py-3 bg-white dark:bg-stone-800 text-gray-600 dark:text-stone-300 border border-gray-200 dark:border-stone-700 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-stone-700 transition-colors"
          >
            返回列表
          </button>
        </div>

        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {filenames.map((f, i) => (
            <button
              key={f}
              onClick={() => setActiveTab(i)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all ${
                i === activeTab
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-white dark:bg-stone-800 text-gray-600 dark:text-stone-300 hover:bg-gray-50 dark:hover:bg-stone-700'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-lg overflow-hidden">
          <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 dark:border-stone-800 bg-gray-50 dark:bg-stone-800/50">
            <span className="text-sm text-gray-500 dark:text-stone-400">{filenames[activeTab]}</span>
            <button
              onClick={() => {
                const content = output[filenames[activeTab]];
                if (!content) return;
                const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filenames[activeTab];
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="text-sm text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300"
            >
              下载此文件 ↓
            </button>
          </div>
          <div className="p-6">
            <Markdown content={output[filenames[activeTab]]} />
          </div>
        </div>

        <div className="mt-8 bg-white dark:bg-stone-900 rounded-2xl shadow-lg p-6">
          <h3 className="font-bold text-gray-800 dark:text-stone-100 mb-4">🤝 为什么 Warm Handover 比 Colleague-Skill 更好？</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
              <div className="font-medium text-red-600 dark:text-red-400 mb-2">❌ Colleague-Skill</div>
              <ul className="space-y-1 text-red-700 dark:text-red-300">
                <li>• 爬聊天记录（被动、冰冷）</li>
                <li>• 生成 AI 替身（ELIZA 效应）</li>
                <li>• 静态快照，过时即废</li>
                <li>• 可能侵犯隐私</li>
              </ul>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <div className="font-medium text-green-600 dark:text-green-400 mb-2">✅ Warm Handover</div>
              <ul className="space-y-1 text-green-700 dark:text-green-300">
                <li>• 引导式访谈（主动、温暖）</li>
                <li>• 结构化知识（经过思考）</li>
                <li>• 活文档，持续更新</li>
                <li>• 完全合规</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OutputPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">加载中...</div>}>
      <OutputContent />
    </Suspense>
  );
}
