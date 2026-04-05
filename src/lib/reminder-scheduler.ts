/**
 * Reminder scheduler — runs on server startup
 * Checks for upcoming handover milestones and triggers notifications
 */

import cron from 'node-cron';
import { getDb } from '@/lib/db';

interface ReminderPayload {
  handoverId: number;
  phase: string;
  personName: string;
  successorName: string;
  projectName: string;
  daysRemaining: number;
}

const PHASES = [
  { days: 30, label: 'T-30 天', message: '交接倒计时 30 天，请确认离职日期和接手人' },
  { days: 21, label: 'T-21 天', message: '交接倒计时 21 天，请安排首轮访谈' },
  { days: 14, label: 'T-14 天', message: '交接倒计时 14 天，接手人应开始参与日常工作' },
  { days: 7, label: 'T-7 天', message: '交接倒计时 7 天，请完成所有访谈' },
  { days: 3, label: 'T-3 天', message: '交接倒计时 3 天，请确认所有文档已完成' },
  { days: 1, label: 'T-1 天', message: '明天就是最后一天了，请做好最后确认' },
  { days: 0, label: 'T-0 天', message: '今天是最后一天，好好告别 🫡' },
];

// Track sent reminders to avoid duplicates
const sentReminders = new Set<string>();

function getReminderKey(handoverId: number, phase: string): string {
  return `${handoverId}-${phase}-${new Date().toDateString()}`;
}

export async function sendWebhookNotification(url: string, payload: ReminderPayload): Promise<boolean> {
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        msg_type: 'text',
        content: {
          text: `🤝 Warm Handover 交接提醒\n\n📋 项目: ${payload.projectName}\n👤 离职人: ${payload.personName}\n🤝 接手人: ${payload.successorName}\n⏰ 阶段: ${payload.phase}\n📅 剩余: ${payload.daysRemaining} 天`,
        },
      }),
    });
    return true;
  } catch {
    return false;
  }
}

export function checkAndSendReminders() {
  try {
    const db = getDb();
    const handovers = db.prepare('SELECT id, person_name, successor_name, project_name, departure_date FROM handovers WHERE departure_date IS NOT NULL').all() as any[];
    const today = new Date();

    for (const h of handovers) {
      const departureDate = new Date(h.departure_date);
      const daysRemaining = Math.ceil((departureDate.getTime() - today.getTime()) / 86400000);

      for (const phase of PHASES) {
        if (daysRemaining === phase.days) {
          const key = getReminderKey(h.id, phase.label);
          if (sentReminders.has(key)) continue;

          const payload: ReminderPayload = {
            handoverId: h.id,
            phase: phase.label,
            personName: h.person_name,
            successorName: h.successor_name || '待确定',
            projectName: h.project_name,
            daysRemaining,
          };

          console.log(`[Reminder] ${phase.label} for ${h.person_name} → ${h.successor_name || '待确定'} (${h.project_name})`);
          sentReminders.add(key);
        }
      }
    }
  } catch (e) {
    console.error('[Reminder] Error checking reminders:', e);
  }
}

// Start cron job — runs every hour
export function startReminderScheduler() {
  checkAndSendReminders();
  cron.schedule('0 * * * *', () => {
    checkAndSendReminders();
  });
  console.log('[Reminder] Scheduler started — checks every hour');
}
