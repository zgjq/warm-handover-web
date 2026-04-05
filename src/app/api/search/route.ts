import { NextRequest, NextResponse } from 'next/server';
import { searchAnswers } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { handoverId, query } = await req.json();
    if (!handoverId || !query) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    const results = searchAnswers(Number(handoverId), query);
    return NextResponse.json(results);
  } catch (e: any) {
    if (e.message === 'DATABASE_UNAVAILABLE') return NextResponse.json({ error: 'DB unavailable, use LocalStorage mode' }, { status: 503 });
    return NextResponse.json({ error: e.message || 'Search failed' }, { status: 500 });
  }
}
