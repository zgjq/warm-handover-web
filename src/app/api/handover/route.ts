import { NextRequest, NextResponse } from 'next/server';
import { getHandover, listHandovers, createHandover, updateHandover, saveAnswer, getAnswers, getAnswerCount, calculateScore } from '@/lib/db';

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (id) {
    const h = getHandover(Number(id));
    if (!h) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const answers = getAnswers(Number(id));
    const { total, answered } = getAnswerCount(Number(id));
    const score = calculateScore(Number(id));
    return NextResponse.json({ ...h, answers, totalQuestions: total, answeredQuestions: answered, score });
  }
  return NextResponse.json(listHandovers());
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action, ...data } = body;

  if (action === 'create') {
    const id = createHandover(data.personName, data.successorName || '待确定', data.projectName || '项目', data.role || 'backend', data.departureDate);
    return NextResponse.json({ id });
  }

  if (action === 'update') {
    const { id, ...fields } = data;
    updateHandover(Number(id), fields);
    return NextResponse.json({ ok: true });
  }

  if (action === 'saveAnswer') {
    saveAnswer(Number(data.handoverId), data.category, data.questionKey, data.questionLabel || '', data.answer);
    calculateScore(Number(data.handoverId));
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
