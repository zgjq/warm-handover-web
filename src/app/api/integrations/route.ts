import { NextRequest, NextResponse } from 'next/server';
import { saveIntegration, getIntegration } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const handoverId = req.nextUrl.searchParams.get('handoverId');
    if (!handoverId) return NextResponse.json({ error: 'Missing handoverId' }, { status: 400 });
    const integration = getIntegration(Number(handoverId));
    return NextResponse.json(integration || {});
  } catch (e: any) {
    if (e.message === 'DATABASE_UNAVAILABLE') return NextResponse.json({ error: 'DB unavailable' }, { status: 503 });
    return NextResponse.json({ error: e.message || 'Failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { handoverId, ...data } = await req.json();
    if (!handoverId) return NextResponse.json({ error: 'Missing handoverId' }, { status: 400 });
    saveIntegration(Number(handoverId), data);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e.message === 'DATABASE_UNAVAILABLE') return NextResponse.json({ error: 'DB unavailable' }, { status: 503 });
    return NextResponse.json({ error: e.message || 'Failed' }, { status: 500 });
  }
}
