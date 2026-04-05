import { getAnswers, getHandover } from './db';
import { baseCategories, getQuestionsForRole } from './questions';

export function generateMarkdown(handoverId: number): Record<string, string> {
  const handover = getHandover(handoverId);
  if (!handover) throw new Error('Handover not found');

  const answers = getAnswers(handoverId);
  const answerMap = new Map<string, string>();
  for (const a of answers) {
    answerMap.set(`${a.category}::${a.question_key}`, a.answer || '');
  }

  const categories = getQuestionsForRole(handover.role || 'backend');
  const dateStr = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });

  const result: Record<string, string> = {};

  for (const cat of categories) {
    let content = `# ${handover.project_name || '项目'} 交接 — ${cat.file.replace('.md', '')}\n\n`;
    content += `> 访谈日期: ${dateStr}\n`;
    content += `> 离职人: ${handover.person_name}\n`;
    content += `> 接手人: ${handover.successor_name || '待确定'}\n\n`;
    content += `---\n\n`;

    let hasContent = false;
    for (const q of cat.questions) {
      const answer = answerMap.get(`${cat.file}::${q.key}`) || '';
      if (answer.trim()) {
        content += `## ${q.label}\n\n${answer}\n\n`;
        hasContent = true;
      }
    }

    if (!hasContent) {
      content += '_（此部分暂无记录）_\n';
    }

    result[cat.file] = content;
  }

  return result;
}

export function generateAllMarkdown(handoverId: number): Record<string, string> {
  return generateMarkdown(handoverId);
}
