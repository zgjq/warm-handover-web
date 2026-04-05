import { NextRequest, NextResponse } from 'next/server';
import { searchAnswers } from '@/lib/db';

export async function POST(req: NextRequest) {
  const { handoverId, query } = await req.json();
  if (!handoverId || !query) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  const results = searchAnswers(Number(handoverId), query);
  return NextResponse.json(results);
}
