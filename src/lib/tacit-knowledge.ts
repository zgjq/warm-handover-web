/**
 * Tacit Knowledge (默会知识) Engine
 * Based on Michael Polanyi's theory: "We know more than we can tell"
 * 
 * Captures knowledge that is:
 * - Experiential (gained through doing, not reading)
 * - Intuitive (pattern recognition without articulable rules)
 * - Contextual (embedded in specific situations)
 * - Social (understanding people, politics, unspoken norms)
 * - Embodied (muscle memory, timing, "feel" for things)
 */

export interface TacitKnowledgePrompt {
  id: string;
  category: string;
  label: string;
  prompt: string;
  hint: string;
  example: string;
}

export const tacitKnowledgePrompts: TacitKnowledgePrompt[] = [
  {
    id: 'gut_feeling',
    category: 'LESSONS.md',
    label: '直觉与预感',
    prompt: '有没有那种"说不清为什么，但就是感觉不对劲"的时刻？后来验证了吗？',
    hint: '不是逻辑分析的结果，而是一种"感觉"。可能是某个人的语气、某个数据的微小变化、或者某个时间点的巧合。',
    example: '每次老李说"这个很简单"的时候，最后都出了大问题。不是他说的内容有问题，而是他说这句话时的语气和时机，让我知道事情没那么简单。',
  },
  {
    id: 'pattern_recognition',
    category: 'LESSONS.md',
    label: '模式识别',
    prompt: '有没有"看到 X 就知道要出问题"的经验？你说不清具体规则，但就是能认出来。',
    hint: '就像老医生看一眼病人就知道大概什么问题。不是基于检查报告，而是基于某种"感觉"。',
    example: '监控面板上的曲线看起来"太平了"——不是超过了阈值，而是缺少了正常的波动。这通常意味着某个采集脚本静默失败了，要马上查。',
  },
  {
    id: 'social_dynamics',
    category: 'PEOPLE.md',
    label: '人际潜规则',
    prompt: '有哪些"没人明说但大家都知道"的人际规则？比如"找 A 之前先跟 B 打个招呼"。',
    hint: '这些规则不会写在员工手册里，但违反了你就会吃亏。',
    example: '需要运维帮忙的时候，不要直接在群里 @ 他们。先私聊问一句"现在方便吗"，得到肯定回复后再说正事。否则他们会觉得被命令，配合度会低很多。',
  },
  {
    id: 'timing_sense',
    category: 'LESSONS.md',
    label: '时机感',
    prompt: '有没有"什么时候做什么事"的经验？不是流程规定的，而是你摸索出来的。',
    hint: '比如"周二下午发版比周一早上安全"、"跟老板汇报要先发微信再打电话"。',
    example: '数据库迁移不要在月底做——不是因为技术原因，而是月底财务跑报表，DB 负载高，迁移容易超时。而且万一出问题，财务那边会炸。',
  },
  {
    id: 'hidden_constraints',
    category: 'PROJECT.md',
    label: '隐性约束',
    prompt: '有哪些不是技术限制、但实际存在的约束？比如"老板讨厌某个方案所以不能用"。',
    hint: '这些约束不会出现在架构文档里，但决策时必须考虑。',
    example: '不能用 MongoDB 不是因为技术不合适，而是 CTO 上次在一个大会上公开批评过 MongoDB，所以现在公司内部对它有成见。用 Redis 替代，效果一样但没人会质疑。',
  },
  {
    id: 'tribal_wisdom',
    category: 'LESSONS.md',
    label: '部落智慧',
    prompt: '有没有"老人都知道但新人不知道"的事情？不是技术，是一种"这里的做事方式"。',
    hint: '每个团队都有自己的"部落智慧"——那些不成文的、但大家都遵守的做事方式。',
    example: '每周三的站会，如果有人没来，不要直接开始。等 5 分钟，或者私聊问一下。因为老张周三经常去看牙医，但大家都知道，等他 5 分钟他会很感激，下次会更配合。',
  },
];

/**
 * Generate tacit knowledge questions for a given role
 * Returns a subset of prompts most relevant to the role
 */
export function getTacitKnowledgeQuestions(role: string): TacitKnowledgePrompt[] {
  // All tacit knowledge prompts are relevant to any role
  // In the future we could filter/sort based on role
  return tacitKnowledgePrompts;
}

/**
 * Generate a tacit knowledge section for the output markdown
 */
export function generateTacitKnowledgeSection(answers: Record<string, string>): string {
  const relevantAnswers = tacitKnowledgePrompts
    .map(p => ({
      prompt: p,
      answer: answers[`TACIT::${p.id}`] || '',
    }))
    .filter(item => item.answer.trim());

  if (relevantAnswers.length === 0) return '';

  let content = '## 默会知识（Tacit Knowledge）\n\n';
  content += '> 这些知识无法完全用语言描述，但它们是经验的核心部分。\n\n';

  for (const { prompt, answer } of relevantAnswers) {
    content += `### ${prompt.label}\n\n${answer}\n\n`;
  }

  return content;
}
