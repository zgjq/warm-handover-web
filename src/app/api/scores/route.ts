import { NextRequest, NextResponse } from 'next/server';
import { calculateScore, getScore, updateSuccessorRating } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const handoverId = req.nextUrl.searchParams.get('handoverId');
    if (!handoverId) return NextResponse.json({ error: 'Missing handoverId' }, { status: 400 });
    const score = calculateScore(Number(handoverId));
    return NextResponse.json(score);
  } catch (e: any) {
    if (e.message === 'DATABASE_UNAVAILABLE') return NextResponse.json({ error: 'DB unavailable' }, { status: 503 });
    return NextResponse.json({ error: e.message || 'Failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { handoverId, action, rating } = await req.json();
    if (!handoverId) return NextResponse.json({ error: 'Missing handoverId' }, { status: 400 });
    if (action === 'recalculate') {
      const score = calculateScore(Number(handoverId));
      return NextResponse.json(score);
    }
    if (action === 'rate' && rating !== undefined) {
      updateSuccessorRating(Number(handoverId), Number(rating));
      const score = calculateScore(Number(handoverId));
      return NextResponse.json(score);
    }
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (e: any) {
    if (e.message === 'DATABASE_UNAVAILABLE') return NextResponse.json({ error: 'DB unavailable' }, { status: 503 });
    return NextResponse.json({ error: e.message || 'Failed' }, { status: 500 });
  }
}
