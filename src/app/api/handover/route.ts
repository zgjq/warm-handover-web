import { NextRequest, NextResponse } from 'next/server';
import { getHandover, listHandovers, createHandover, updateHandover, saveAnswer, getAnswers, getAnswerCount, calculateScore, getDb } from '@/lib/db';

function dbError() {
  return NextResponse.json({ error: 'Database unavailable in serverless environment. Use LocalStorage mode.', status: 503 });
}

export async function GET(req: NextRequest) {
  try {
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
  } catch (e: any) {
    if (e.message === 'DATABASE_UNAVAILABLE') return dbError();
    console.error('[API/handover GET]', e);
    return NextResponse.json({ error: e.message || 'Internal error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
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
  } catch (e: any) {
    if (e.message === 'DATABASE_UNAVAILABLE') return dbError();
    console.error('[API/handover POST]', e);
    return NextResponse.json({ error: e.message || 'Internal error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    const db = getDb();
    db.prepare('DELETE FROM answers WHERE handover_id = ?').run(Number(id));
    db.prepare('DELETE FROM comments WHERE handover_id = ?').run(Number(id));
    db.prepare('DELETE FROM checklist_items WHERE handover_id = ?').run(Number(id));
    db.prepare('DELETE FROM reminders WHERE handover_id = ?').run(Number(id));
    db.prepare('DELETE FROM scores WHERE handover_id = ?').run(Number(id));
    db.prepare('DELETE FROM integrations WHERE handover_id = ?').run(Number(id));
    db.prepare('DELETE FROM audit_log WHERE handover_id = ?').run(Number(id));
    db.prepare('DELETE FROM handovers WHERE id = ?').run(Number(id));
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e.message === 'DATABASE_UNAVAILABLE') return dbError();
    console.error('[API/handover DELETE]', e);
    return NextResponse.json({ error: e.message || 'Delete failed' }, { status: 500 });
  }
}
