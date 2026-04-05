import { NextRequest, NextResponse } from 'next/server';
import { calculateScore, getScore, updateSuccessorRating } from '@/lib/db';

export async function GET(req: NextRequest) {
  const handoverId = req.nextUrl.searchParams.get('handoverId');
  if (!handoverId) return NextResponse.json({ error: 'Missing handoverId' }, { status: 400 });
  const score = calculateScore(Number(handoverId));
  return NextResponse.json(score);
}

export async function POST(req: NextRequest) {
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
}
