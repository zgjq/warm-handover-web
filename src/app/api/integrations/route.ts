import { NextRequest, NextResponse } from 'next/server';
import { saveIntegration, getIntegration } from '@/lib/db';

export async function GET(req: NextRequest) {
  const handoverId = req.nextUrl.searchParams.get('handoverId');
  if (!handoverId) return NextResponse.json({ error: 'Missing handoverId' }, { status: 400 });
  const integration = getIntegration(Number(handoverId));
  return NextResponse.json(integration || {});
}

export async function POST(req: NextRequest) {
  const { handoverId, ...data } = await req.json();
  if (!handoverId) return NextResponse.json({ error: 'Missing handoverId' }, { status: 400 });
  saveIntegration(Number(handoverId), data);
  return NextResponse.json({ ok: true });
}
