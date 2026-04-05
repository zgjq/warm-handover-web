import { NextRequest, NextResponse } from 'next/server';
import { addComment, getComments } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const handoverId = req.nextUrl.searchParams.get('handoverId');
    const answerId = req.nextUrl.searchParams.get('answerId');
    if (!handoverId) return NextResponse.json({ error: 'Missing handoverId' }, { status: 400 });
    const comments = getComments(Number(handoverId), answerId ? Number(answerId) : undefined);
    return NextResponse.json(comments);
  } catch (e: any) {
    if (e.message === 'DATABASE_UNAVAILABLE') return NextResponse.json({ error: 'DB unavailable, use LocalStorage mode' }, { status: 503 });
    return NextResponse.json({ error: e.message || 'Failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { handoverId, userName, userRole, content, answerId } = await req.json();
    if (!handoverId || !userName || !content) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    const id = addComment(Number(handoverId), userName, userRole || 'successor', content, answerId);
    return NextResponse.json({ id });
  } catch (e: any) {
    if (e.message === 'DATABASE_UNAVAILABLE') return NextResponse.json({ error: 'DB unavailable, use LocalStorage mode' }, { status: 503 });
    return NextResponse.json({ error: e.message || 'Failed' }, { status: 500 });
  }
}
