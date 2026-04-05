import { NextRequest, NextResponse } from 'next/server';
import { assessAnswerQuality, generateFollowUpQuestions, generateHandoverSummary, answerFromKnowledgeBase } from '@/lib/ai-service';

export async function POST(req: NextRequest) {
  try {
    const { action, ...data } = await req.json();

    if (action === 'assess') {
      const result = await assessAnswerQuality(data.question, data.answer);
      return NextResponse.json(result);
    }

    if (action === 'followup') {
      const result = await generateFollowUpQuestions(
        data.role,
        data.answeredQuestions,
        data.unansweredQuestions
      );
      return NextResponse.json(result);
    }

    if (action === 'summary') {
      const result = await generateHandoverSummary(
        data.personName,
        data.projectName,
        data.role,
        data.answers
      );
      return NextResponse.json({ summary: result });
    }

    if (action === 'qa') {
      const result = await answerFromKnowledgeBase(
        data.query,
        data.context
      );
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (e: any) {
    console.error('[API/ai] Error:', e);
    return NextResponse.json({ error: e.message || 'AI 服务失败' }, { status: 500 });
  }
}
