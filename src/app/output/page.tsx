'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getQuestionsForRole } from '@/lib/questions';
import JSZip from 'jszip';

function OutputContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const [handover, setHandover] = useState<any>(null);
  const [output, setOutput] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (!id) return;
    const data = localStorage.getItem(`handover_${id}`);
    if (!data) { router.push('/new'); return; }
    const h = JSON.parse(data);
    setHandover(h);

    const cats = getQuestionsForRole(h.role || 'backend');
    const result: Record<string, string> = {};
    const dateStr = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });

    for (const cat of cats) {
      let content = `# ${h.projectName || '项目'} 交接 — ${cat.file.replace('.md', '')}\n\n`;
      content += `> 访谈日期: ${dateStr}\n`;
      content += `> 离职人: ${h.personName}\n`;
      content += `> 接手人: ${h.successorName || '待确定'}\n\n`;
      content += `---\n\n`;

      let hasContent = false;
      for (const q of cat.questions) {
        const answer = (h.answers || {})[`${cat.file}::${q.key}`] || '';
        if (answer.trim()) {
          content += `## ${q.label}\n\n${answer}\n\n`;
          hasContent = true;
        }
      }

      if (!hasContent) content += '_（此部分暂无记录）_\n';
      result[cat.file] = content;
    }

    setOutput(result);
    setActiveTab(0);
  }, [id]);

  const handleDownload = async () => {
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
  };

  const handleDownloadSingle = (filename: string) => {
    const content = output[filename];
    if (!content) return;
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!handover) {
    return <div className="min-h-screen flex items-center justify-center">加载中...</div>;
  }

  const filenames = Object.keys(output);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">📄 交接文档已生成</h1>
          <p className="text-gray-500">{handover.personName} → {handover.successorName || '待确定'} · {handover.projectName}</p>
        </div>

        <div className="flex gap-3 mb-6 justify-center flex-wrap">
          <button
            onClick={handleDownload}
            className="px-6 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors shadow-md"
          >
            📦 下载全部 (ZIP)
          </button>
          <button
            onClick={() => router.push(`/timeline?id=${id}`)}
            className="px-6 py-3 bg-white text-orange-600 border border-orange-200 rounded-xl font-medium hover:bg-orange-50 transition-colors"
          >
            📅 查看时间线
          </button>
          <button
            onClick={() => router.push('/list')}
            className="px-6 py-3 bg-white text-gray-600 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors"
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
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 bg-gray-50">
            <span className="text-sm text-gray-500">{filenames[activeTab]}</span>
            <button
              onClick={() => handleDownloadSingle(filenames[activeTab])}
              className="text-sm text-orange-500 hover:text-orange-600"
            >
              下载此文件 ↓
            </button>
          </div>
          <div className="p-6">
            <pre className="whitespace-pre-wrap font-sans text-gray-700 text-sm leading-relaxed">
              {output[filenames[activeTab]]}
            </pre>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
          <h3 className="font-bold text-gray-800 mb-4">🤝 为什么 Warm Handover 比 Colleague-Skill 更好？</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="p-4 bg-red-50 rounded-xl">
              <div className="font-medium text-red-600 mb-2">❌ Colleague-Skill</div>
              <ul className="space-y-1 text-red-700">
                <li>• 爬聊天记录（被动、冰冷）</li>
                <li>• 生成 AI 替身（ELIZA 效应）</li>
                <li>• 静态快照，过时即废</li>
                <li>• 可能侵犯隐私</li>
              </ul>
            </div>
            <div className="p-4 bg-green-50 rounded-xl">
              <div className="font-medium text-green-600 mb-2">✅ Warm Handover</div>
              <ul className="space-y-1 text-green-700">
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
