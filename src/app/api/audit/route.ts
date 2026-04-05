import { NextRequest, NextResponse } from 'next/server';
import { getAuditLog } from '@/lib/db';

export async function GET(req: NextRequest) {
  const handoverId = req.nextUrl.searchParams.get('handoverId');
  if (!handoverId) return NextResponse.json({ error: 'Missing handoverId' }, { status: 400 });
  const logs = getAuditLog(Number(handoverId));
  return NextResponse.json(logs);
}
