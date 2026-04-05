/**
 * AI Service — OpenRouter-powered features for Warm Handover
 * Uses free OpenRouter models for intelligent handover assistance
 */

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const API_KEY = process.env.OPENROUTER_API_KEY || '';

// Free model that works without credits
const MODEL = 'qwen/qwen3.6-plus:free';

async function chat(prompt: string): Promise<string> {
  if (!API_KEY) {
    console.warn('[AI] OPENROUTER_API_KEY not set');
    return '';
  }

  try {
    const res = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'HTTP-Referer': 'https://warm-handover.killclaw.xyz',
        'X-Title': 'Warm Handover',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('[AI] OpenRouter error:', res.status, err);
      return '';
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || '';
  } catch (e) {
    console.error('[AI] chat failed:', e);
    return '';
  }
}

function extractJSON(text: string): any {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

// ── AI Answer Quality Assessment ──

export async function assessAnswerQuality(question: string, answer: string): Promise<{
  score: number;
  feedback: string;
  needsFollowUp: boolean;
  suggestions: string[];
}> {
  const prompt = `你是一位知识交接质量评估专家。请评估以下问答对的质量：

问题：${question}
回答：${answer}

请从以下维度评估（0-100分）：
1. 完整性：回答是否充分覆盖了问题的要点
2. 具体性：回答是否包含具体的细节、数据、示例
3. 可操作性：接手者能否根据这个回答采取行动
4. 清晰度：回答是否容易理解

返回 JSON 格式（只返回 JSON，不要其他内容）：
{"score": 数字(0-100), "feedback": "简短的评估反馈（50字以内）", "needsFollowUp": true或false, "suggestions": ["如果需要追问，给出1-2个具体的追问问题"]}`;

  const text = await chat(prompt);
  const result = extractJSON(text);
  if (result) return result;
  return { score: 50, feedback: '评估失败', needsFollowUp: false, suggestions: [] };
}

// ── AI Smart Follow-up Questions ──

export async function generateFollowUpQuestions(
  role: string,
  answeredQuestions: { category: string; question: string; answer: string }[],
  unansweredQuestions: { category: string; question: string }[]
): Promise<{ questions: string[]; reasoning: string }> {
  const answeredText = answeredQuestions
    .map(q => `【${q.category}】${q.question}\n回答：${q.answer}`)
    .join('\n\n');

  const prompt = `你是一位资深技术管理者，正在帮助一位即将离职的员工做知识交接。

角色：${role}

已回答的问题和答案：
${answeredText}

请根据已回答的内容，分析哪些方面还需要深入挖掘，生成 2-3 个个性化的追问问题。
这些问题应该关注已回答但不够深入的地方、可能被忽略的关键风险、帮助接手者快速上手。

返回 JSON 格式（只返回 JSON，不要其他内容）：
{"questions": ["追问问题1", "追问问题2", "追问问题3"], "reasoning": "为什么问这些问题的简短说明（50字以内）"}`;

  const text = await chat(prompt);
  const result = extractJSON(text);
  if (result) return result;
  return { questions: [], reasoning: '生成失败' };
}

// ── AI Handover Summary Generation ──

export async function generateHandoverSummary(
  personName: string,
  projectName: string,
  role: string,
  answers: { category: string; question: string; answer: string }[]
): Promise<string> {
  const answersText = answers
    .map(a => `【${a.category}】${a.question}\n${a.answer}`)
    .join('\n\n');

  const prompt = `你是一位知识管理专家。请根据以下交接内容，生成一份简洁的交接摘要（300字以内），帮助接手者快速了解核心信息：

离职人：${personName}
项目：${projectName}
角色：${role}

交接内容：
${answersText}

请用以下格式输出：

## 项目概述
（一句话描述项目是做什么的）

## 核心架构
（关键技术栈和架构要点）

## 关键风险
（需要特别注意的问题和风险）

## 接手建议
（给接手者的 2-3 条建议）

只输出以上内容，不要其他内容。`;

  return await chat(prompt) || '摘要生成失败';
}

// ── AI Knowledge Base Q&A ──

export async function answerFromKnowledgeBase(
  query: string,
  context: { personName: string; projectName: string; answers: { category: string; question: string; answer: string }[] }
): Promise<{ answer: string; sources: string[] }> {
  const contextText = context.answers
    .map(a => `【${a.category}】${a.question}\n${a.answer}`)
    .join('\n\n');

  const prompt = `你是一位知识助手，基于以下交接内容回答问题。

交接人：${context.personName}
项目：${context.projectName}

交接内容：
${contextText}

用户问题：${query}

请基于交接内容回答问题。如果交接内容中没有相关信息，请明确说明"交接内容中没有相关信息"，并给出可能的查找方向。

回答格式：
直接回答问题，并在最后列出参考来源（格式：参考：[类别] 问题）。`;

  const text = await chat(prompt);
  if (!text) return { answer: '回答生成失败', sources: [] };

  // Extract sources
  const sources: string[] = [];
  const sourceMatches = text.match(/参考[：:]\s*\[([^\]]+)\]\s*([^\n]+)/g);
  if (sourceMatches) sources.push(...sourceMatches);

  return { answer: text, sources };
}
