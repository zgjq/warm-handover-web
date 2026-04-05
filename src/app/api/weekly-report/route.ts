import { NextRequest, NextResponse } from 'next/server';
import { generateWeeklyReport, formatWeeklyReportAsMarkdown } from '@/lib/weekly-report';

export async function GET(req: NextRequest) {
  const report = generateWeeklyReport();
  const format = req.nextUrl.searchParams.get('format');

  if (format === 'markdown') {
    return new NextResponse(formatWeeklyReportAsMarkdown(report), {
      headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
    });
  }

  return NextResponse.json(report);
}
