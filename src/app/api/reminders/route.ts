import { NextRequest, NextResponse } from 'next/server';
import { getPendingReminders, markReminderSent, getDb, sendWebhook } from '@/lib/db';

const PHASES = [
  { days: 30, label: 'T-30 天', message: '交接倒计时 30 天，请确认离职日期和接手人' },
  { days: 21, label: 'T-21 天', message: '交接倒计时 21 天，请安排首轮访谈' },
  { days: 14, label: 'T-14 天', message: '交接倒计时 14 天，接手人应开始参与日常工作' },
  { days: 7, label: 'T-7 天', message: '交接倒计时 7 天，请完成所有访谈' },
  { days: 3, label: 'T-3 天', message: '交接倒计时 3 天，请确认所有文档已完成' },
  { days: 1, label: 'T-1 天', message: '明天就是最后一天了，请做好最后确认' },
  { days: 0, label: 'T-0 天', message: '今天是最后一天，好好告别 🫡' },
];

export async function GET() {
  // Just return pending reminders for debugging
  const pending = getPendingReminders();
  return NextResponse.json(pending);
}

export async function POST(req: NextRequest) {
  // Trigger reminder check — called by external cron or manually
  try {
    const db = getDb();
    const handovers = db.prepare('SELECT * FROM handovers WHERE departure_date IS NOT NULL').all() as any[];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sent: any[] = [];

    for (const h of handovers) {
      const departureDate = new Date(h.departure_date);
      departureDate.setHours(0, 0, 0, 0);
      const daysRemaining = Math.ceil((departureDate.getTime() - today.getTime()) / 86400000);

      for (const phase of PHASES) {
        if (daysRemaining === phase.days) {
          // Check if already sent today
          const alreadySent = db.prepare(
            'SELECT id FROM reminders WHERE handover_id = ? AND phase = ? AND sent = 1 AND DATE(sent_at) = DATE("now")'
          ).get(h.id, phase.label);

          if (alreadySent) continue;

          // Get integration webhooks
          const integration = db.prepare('SELECT * FROM integrations WHERE handover_id = ?').get(h.id) as any;

          const payload = {
            msg_type: 'text',
            content: {
              text: `🤝 Warm Handover 交接提醒\n\n📋 项目: ${h.project_name}\n👤 离职人: ${h.person_name}\n🤝 接手人: ${h.successor_name}\n⏰ 阶段: ${phase.label}\n📅 剩余: ${daysRemaining} 天\n\n${phase.message}`,
            },
          };

          // Send to all configured webhooks
          const webhooks = [
            integration?.feishu_webhook,
            integration?.dingtalk_webhook,
            integration?.slack_webhook,
          ].filter(Boolean);

          for (const url of webhooks) {
            try {
              await sendWebhook(url, payload);
            } catch {
              console.error(`[Reminders] Failed to send to ${url}`);
            }
          }

          // Record the reminder
          db.prepare(
            'INSERT INTO reminders (handover_id, phase, sent, sent_at) VALUES (?, ?, 1, CURRENT_TIMESTAMP)'
          ).run(h.id, phase.label);

          sent.push({ handoverId: h.id, personName: h.person_name, phase: phase.label, daysRemaining });
        }
      }
    }

    return NextResponse.json({ ok: true, sent, count: sent.length });
  } catch (e: any) {
    console.error('[API/reminders] Error:', e);
    return NextResponse.json({ error: e.message || 'Failed' }, { status: 500 });
  }
}
