/**
 * AI Smart Follow-up Engine
 * Analyzes existing answers and suggests follow-up questions
 * to fill knowledge gaps
 */

import { getQuestionsForRole } from './questions';

export interface FollowUpSuggestion {
  category: string;
  questionKey: string;
  questionLabel: string;
  questionText: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

// Patterns that indicate incomplete answers
const INCOMPLETE_PATTERNS = [
  { pattern: /^(嗯|啊|哦|好|行|可以|没问题|不知道|忘了|忘了说)$/i, reason: '回答过于简短，建议补充详细信息' },
  { pattern: /etc|等等|还有/i, reason: '回答中使用了"等等"，建议列出所有项目' },
  { pattern: /应该|可能|大概|也许/i, reason: '回答不够确定，建议确认具体信息' },
];

// Cross-reference rules: if A is answered but B is not, suggest B
const CROSS_REF_RULES: Record<string, { ifAnswered: string[]; thenAsk: string; reason: string }[]> = {
  'PROJECT.md': [
    {
      ifAnswered: ['core_modules'],
      thenAsk: 'hidden_knowledge',
      reason: '你提到了核心模块，但没有提到任何隐藏的 hack 或 workaround',
    },
    {
      ifAnswered: ['core_modules', 'key_decisions'],
      thenAsk: 'incidents',
      reason: '你提到了架构和决策，但没有提到任何线上事故或踩坑经验',
    },
  ],
  'PEOPLE.md': [
    {
      ifAnswered: ['key_contacts'],
      thenAsk: 'landmines',
      reason: '你提到了联系人，但没有提到任何"不能踩的雷"',
    },
  ],
  'LESSONS.md': [
    {
      ifAnswered: ['redo_differently'],
      thenAsk: 'message_to_successor',
      reason: '你提到了重来会怎么做，但没有给下一任留言',
    },
  ],
  'TODO.md': [
    {
      ifAnswered: ['known_issues'],
      thenAsk: 'time_sensitive',
      reason: '你提到了已知问题，但没有提到时间敏感事项',
    },
  ],
};

export function analyzeAnswers(handoverId: number, answers: Record<string, string>, role: string): FollowUpSuggestion[] {
  const suggestions: FollowUpSuggestion[] = [];
  const categories = getQuestionsForRole(role);

  // Check for incomplete answers
  for (const cat of categories) {
    for (const q of cat.questions) {
      const key = `${cat.file}::${q.key}`;
      const answer = answers[key] || '';

      // Check for incomplete patterns
      for (const rule of INCOMPLETE_PATTERNS) {
        if (rule.pattern.test(answer)) {
          suggestions.push({
            category: cat.file,
            questionKey: q.key,
            questionLabel: q.label,
            questionText: q.text,
            reason: rule.reason,
            priority: 'medium',
          });
          break;
        }
      }

      // Check for very short answers (< 20 chars)
      if (answer.trim().length > 0 && answer.trim().length < 20) {
        suggestions.push({
          category: cat.file,
          questionKey: q.key,
          questionLabel: q.label,
          questionText: q.text,
          reason: '回答较短（少于 20 字），建议补充更多细节',
          priority: 'low',
        });
      }
    }
  }

  // Check cross-reference rules
  for (const [category, rules] of Object.entries(CROSS_REF_RULES)) {
    for (const rule of rules) {
      const allAnswered = rule.ifAnswered.every(k => {
        const key = `${category}::${k}`;
        return answers[key]?.trim();
      });
      const notAnswered = !answers[`${category}::${rule.thenAsk}`]?.trim();

      if (allAnswered && notAnswered) {
        const cat = categories.find(c => c.file === category);
        const q = cat?.questions.find(q => q.key === rule.thenAsk);
        if (q) {
          suggestions.push({
            category,
            questionKey: rule.thenAsk,
            questionLabel: q.label,
            questionText: q.text,
            reason: rule.reason,
            priority: 'high',
          });
        }
      }
    }
  }

  // Check for completely unanswered categories
  for (const cat of categories) {
    const answeredCount = cat.questions.filter(q => answers[`${cat.file}::${q.key}`]?.trim()).length;
    if (answeredCount === 0) {
      const firstQ = cat.questions[0];
      suggestions.push({
        category: cat.file,
        questionKey: firstQ.key,
        questionLabel: firstQ.label,
        questionText: firstQ.text,
        reason: `「${cat.file.replace('.md', '')}」部分完全没有回答`,
        priority: 'high',
      });
    }
  }

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  suggestions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return suggestions;
}

export function getFollowUpSummary(handoverId: number, answers: Record<string, string>, role: string): {
  total: number;
  highPriority: number;
  summary: string;
} {
  const suggestions = analyzeAnswers(handoverId, answers, role);
  const highPriority = suggestions.filter(s => s.priority === 'high').length;

  let summary = '';
  if (suggestions.length === 0) {
    summary = '✅ 所有回答都很完整，没有发现遗漏！';
  } else if (highPriority > 0) {
    summary = `⚠️ 发现 ${suggestions.length} 条建议，其中 ${highPriority} 条高优先级`;
  } else {
    summary = `💡 发现 ${suggestions.length} 条改进建议`;
  }

  return { total: suggestions.length, highPriority, summary };
}
