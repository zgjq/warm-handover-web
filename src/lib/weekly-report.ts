/**
 * Team weekly report generator
 * Generates a summary of all handover progress for the week
 */

import { getDb } from '@/lib/db';

interface WeeklyReport {
  weekStart: string;
  weekEnd: string;
  totalHandovers: number;
  completedHandovers: number;
  inProgressHandovers: number;
  atRiskHandovers: number;
  averageScore: number;
  handovers: {
    personName: string;
    successorName: string;
    projectName: string;
    score: number;
    riskLevel: string;
    interviewCompletion: number;
    timelineProgress: number;
    daysUntilDeparture: number | null;
  }[];
  recommendations: string[];
}

export function generateWeeklyReport(): WeeklyReport {
  const db = getDb();
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  const handovers = db.prepare(`
    SELECT h.*, 
           COALESCE(s.total_score, 0) as score,
           COALESCE(s.risk_level, 'low') as risk_level,
           COALESCE(s.interview_completion, 0) as interview_completion,
           COALESCE(s.timeline_progress, 0) as timeline_progress
    FROM handovers h
    LEFT JOIN scores s ON h.id = s.handover_id
    ORDER BY h.created_at DESC
  `).all() as any[];

  const reportHandovers = handovers.map(h => {
    const daysUntilDeparture = h.departure_date
      ? Math.ceil((new Date(h.departure_date).getTime() - now.getTime()) / 86400000)
      : null;
    return {
      personName: h.person_name,
      successorName: h.successor_name,
      projectName: h.project_name,
      score: h.score || 0,
      riskLevel: h.risk_level || 'low',
      interviewCompletion: h.interview_completion || 0,
      timelineProgress: h.timeline_progress || 0,
      daysUntilDeparture,
    };
  });

  const totalHandovers = handovers.length;
  const completedHandovers = handovers.filter(h => (h.score || 0) >= 80).length;
  const inProgressHandovers = handovers.filter(h => (h.score || 0) > 0 && (h.score || 0) < 80).length;
  const atRiskHandovers = handovers.filter(h => h.risk_level === 'high' || h.risk_level === 'critical').length;
  const averageScore = totalHandovers > 0
    ? Math.round(handovers.reduce((sum, h) => sum + (h.score || 0), 0) / totalHandovers)
    : 0;

  // Generate recommendations
  const recommendations: string[] = [];
  if (atRiskHandovers > 0) {
    recommendations.push(`⚠️ 有 ${atRiskHandovers} 个交接项目存在高风险，请及时跟进`);
  }
  const urgent = handovers.filter(h => {
    if (!h.departure_date) return false;
    const days = Math.ceil((new Date(h.departure_date).getTime() - now.getTime()) / 86400000);
    return days <= 7 && (h.score || 0) < 60;
  });
  if (urgent.length > 0) {
    recommendations.push(`🚨 ${urgent.length} 个交接项目将在 7 天内完成但评分低于 60，需要紧急处理`);
  }
  if (averageScore < 50 && totalHandovers > 0) {
    recommendations.push('📉 平均交接评分低于 50 分，建议加强交接流程管理');
  }
  if (recommendations.length === 0) {
    recommendations.push('✅ 所有交接项目进展顺利，继续保持');
  }

  return {
    weekStart: weekStart.toISOString().split('T')[0],
    weekEnd: weekEnd.toISOString().split('T')[0],
    totalHandovers,
    completedHandovers,
    inProgressHandovers,
    atRiskHandovers,
    averageScore,
    handovers: reportHandovers,
    recommendations,
  };
}

export function formatWeeklyReportAsMarkdown(report: WeeklyReport): string {
  let md = `# 交接周报 (${report.weekStart} ~ ${report.weekEnd})\n\n`;

  md += `## 概览\n\n`;
  md += `- 总交接数: ${report.totalHandovers}\n`;
  md += `- 已完成: ${report.completedHandovers}\n`;
  md += `- 进行中: ${report.inProgressHandovers}\n`;
  md += `- 高风险: ${report.atRiskHandovers}\n`;
  md += `- 平均评分: ${report.averageScore}\n\n`;

  md += `## 项目详情\n\n`;
  md += `| 离职人 | 接手人 | 项目 | 评分 | 风险 | 访谈 | 时间线 | 剩余天数 |\n`;
  md += `|--------|--------|------|------|------|------|--------|----------|\n`;
  for (const h of report.handovers) {
    md += `| ${h.personName} | ${h.successorName} | ${h.projectName} | ${h.score} | ${h.riskLevel} | ${h.interviewCompletion}% | ${h.timelineProgress}% | ${h.daysUntilDeparture ?? '未设置'} |\n`;
  }

  md += `\n## 建议\n\n`;
  for (const r of report.recommendations) {
    md += `- ${r}\n`;
  }

  return md;
}
