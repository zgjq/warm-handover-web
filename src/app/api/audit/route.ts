import { NextRequest, NextResponse } from 'next/server';
import { getAuditLog } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const handoverId = req.nextUrl.searchParams.get('handoverId');
    if (!handoverId) return NextResponse.json({ error: 'Missing handoverId' }, { status: 400 });
    const logs = getAuditLog(Number(handoverId));
    return NextResponse.json(logs);
  } catch (e: any) {
    if (e.message === 'DATABASE_UNAVAILABLE') return NextResponse.json({ error: 'DB unavailable' }, { status: 503 });
    return NextResponse.json({ error: e.message || 'Failed' }, { status: 500 });
  }
}
