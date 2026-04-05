import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'handover.db');

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (db) return db;

  const fs = require('fs');
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');

  // Core tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS handovers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      person_name TEXT NOT NULL,
      successor_name TEXT DEFAULT '待确定',
      project_name TEXT DEFAULT '项目',
      role TEXT DEFAULT 'backend',
      departure_date TEXT,
      status TEXT DEFAULT 'draft',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS answers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      handover_id INTEGER NOT NULL,
      category TEXT NOT NULL,
      question_key TEXT NOT NULL,
      question_label TEXT DEFAULT '',
      answer TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (handover_id) REFERENCES handovers(id)
    );

    CREATE TABLE IF NOT EXISTS checklist_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      handover_id INTEGER NOT NULL,
      phase TEXT NOT NULL,
      item TEXT NOT NULL,
      completed INTEGER DEFAULT 0,
      FOREIGN KEY (handover_id) REFERENCES handovers(id)
    );

    -- v2: Comments
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      handover_id INTEGER NOT NULL,
      answer_id INTEGER,
      user_name TEXT NOT NULL,
      user_role TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (handover_id) REFERENCES handovers(id)
    );

    -- v2: Reminders
    CREATE TABLE IF NOT EXISTS reminders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      handover_id INTEGER NOT NULL,
      phase TEXT NOT NULL,
      sent INTEGER DEFAULT 0,
      sent_at DATETIME,
      webhook_url TEXT,
      FOREIGN KEY (handover_id) REFERENCES handovers(id)
    );

    -- v2: Scores
    CREATE TABLE IF NOT EXISTS scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      handover_id INTEGER NOT NULL UNIQUE,
      interview_completion INTEGER DEFAULT 0,
      timeline_progress INTEGER DEFAULT 0,
      document_quality INTEGER DEFAULT 0,
      successor_rating INTEGER DEFAULT 0,
      total_score INTEGER DEFAULT 0,
      risk_level TEXT DEFAULT 'low',
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (handover_id) REFERENCES handovers(id)
    );

    -- v2: Audit log
    CREATE TABLE IF NOT EXISTS audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      handover_id INTEGER,
      user_name TEXT,
      action TEXT NOT NULL,
      details TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- v2: Integration settings
    CREATE TABLE IF NOT EXISTS integrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      handover_id INTEGER NOT NULL UNIQUE,
      feishu_webhook TEXT,
      dingtalk_webhook TEXT,
      slack_webhook TEXT,
      email_to TEXT,
      confluence_url TEXT,
      jira_url TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (handover_id) REFERENCES handovers(id)
    );

    -- v2: FTS5 full-text search
    CREATE VIRTUAL TABLE IF NOT EXISTS answers_fts USING fts5(
      category, question_key, question_label, answer,
      content='answers', content_rowid='id'
    );

    -- Triggers to keep FTS index in sync
    CREATE TRIGGER IF NOT EXISTS answers_ai AFTER INSERT ON answers BEGIN
      INSERT INTO answers_fts(rowid, category, question_key, question_label, answer)
      VALUES (new.id, new.category, new.question_key, new.question_label, new.answer);
    END;

    CREATE TRIGGER IF NOT EXISTS answers_ad AFTER DELETE ON answers BEGIN
      INSERT INTO answers_fts(answers_fts, rowid, category, question_key, question_label, answer)
      VALUES ('delete', old.id, old.category, old.question_key, old.question_label, old.answer);
    END;

    CREATE TRIGGER IF NOT EXISTS answers_au AFTER UPDATE ON answers BEGIN
      INSERT INTO answers_fts(answers_fts, rowid, category, question_key, question_label, answer)
      VALUES ('delete', old.id, old.category, old.question_key, old.question_label, old.answer);
      INSERT INTO answers_fts(rowid, category, question_key, question_label, answer)
      VALUES (new.id, new.category, new.question_key, new.question_label, new.answer);
    END;
  `);

  return db;
}

// Handover CRUD
export function createHandover(personName: string, successorName: string, projectName: string, role: string, departureDate?: string) {
  const db = getDb();
  const stmt = db.prepare('INSERT INTO handovers (person_name, successor_name, project_name, role, departure_date) VALUES (?, ?, ?, ?, ?)');
  const result = stmt.run(personName, successorName, projectName, role, departureDate || null);
  logAudit(result.lastInsertRowid as number, null, 'created', `Handover created: ${personName} → ${successorName}`);
  return result.lastInsertRowid as number;
}

export function getHandover(id: number) {
  const db = getDb();
  return db.prepare('SELECT * FROM handovers WHERE id = ?').get(id) as any;
}

export function listHandovers() {
  const db = getDb();
  return db.prepare('SELECT h.*, COALESCE(s.total_score, 0) as score, COALESCE(s.risk_level, "low") as risk_level FROM handovers h LEFT JOIN scores s ON h.id = s.handover_id ORDER BY h.updated_at DESC').all() as any[];
}

export function updateHandover(id: number, data: Record<string, any>) {
  const db = getDb();
  const fields = Object.entries(data).map(([k]) => `${k} = ?`).join(', ');
  const values = Object.values(data);
  db.prepare(`UPDATE handovers SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(...values, id);
}

// Answers
export function saveAnswer(handoverId: number, category: string, questionKey: string, questionLabel: string, answer: string) {
  const db = getDb();
  const existing = db.prepare('SELECT id FROM answers WHERE handover_id = ? AND category = ? AND question_key = ?').get(handoverId, category, questionKey);
  if (existing) {
    db.prepare('UPDATE answers SET answer = ?, updated_at = CURRENT_TIMESTAMP WHERE handover_id = ? AND category = ? AND question_key = ?').run(answer, handoverId, category, questionKey);
  } else {
    db.prepare('INSERT INTO answers (handover_id, category, question_key, question_label, answer) VALUES (?, ?, ?, ?, ?)').run(handoverId, category, questionKey, questionLabel, answer);
  }
}

export function getAnswers(handoverId: number) {
  const db = getDb();
  return db.prepare('SELECT * FROM answers WHERE handover_id = ? ORDER BY category, id').all(handoverId) as any[];
}

export function getAnswerCount(handoverId: number) {
  const db = getDb();
  const row = db.prepare('SELECT COUNT(*) as total, COUNT(CASE WHEN answer IS NOT NULL AND answer != "" THEN 1 END) as answered FROM answers WHERE handover_id = ?').get(handoverId) as any;
  return row;
}

// Comments
export function addComment(handoverId: number, userName: string, userRole: string, content: string, answerId?: number) {
  const db = getDb();
  const result = db.prepare('INSERT INTO comments (handover_id, user_name, user_role, content, answer_id) VALUES (?, ?, ?, ?, ?)').run(handoverId, userName, userRole, content, answerId || null);
  logAudit(handoverId, userName, 'comment', `Comment added by ${userName} (${userRole})`);
  return result.lastInsertRowid as number;
}

export function getComments(handoverId: number, answerId?: number) {
  const db = getDb();
  if (answerId) {
    return db.prepare('SELECT * FROM comments WHERE handover_id = ? AND answer_id = ? ORDER BY created_at ASC').all(handoverId, answerId) as any[];
  }
  return db.prepare('SELECT * FROM comments WHERE handover_id = ? ORDER BY created_at ASC').all(handoverId) as any[];
}

// Scores
export function calculateScore(handoverId: number) {
  const db = getDb();
  const handover = getHandover(handoverId);
  if (!handover) return null;

  // Interview completion
  const { total, answered } = getAnswerCount(handoverId);
  const interviewCompletion = total > 0 ? Math.round((answered / total) * 100) : 0;

  // Timeline progress
  const checklistTotal = db.prepare('SELECT COUNT(*) as cnt FROM checklist_items WHERE handover_id = ?').get(handoverId) as any;
  const checklistDone = db.prepare('SELECT COUNT(*) as cnt FROM checklist_items WHERE handover_id = ? AND completed = 1').get(handoverId) as any;
  const timelineProgress = checklistTotal.cnt > 0 ? Math.round((checklistDone.cnt / checklistTotal.cnt) * 100) : 0;

  // Document quality (avg answer length, penalize empty)
  const answers = getAnswers(handoverId);
  let documentQuality = 0;
  if (answers.length > 0) {
    const avgLen = answers.reduce((sum, a) => sum + (a.answer?.length || 0), 0) / answers.length;
    documentQuality = Math.min(100, Math.round(avgLen / 2)); // 200 chars = 100%
  }

  // Total score
  const existingScore = db.prepare('SELECT successor_rating FROM scores WHERE handover_id = ?').get(handoverId) as any;
  const successorRating = existingScore?.successor_rating || 0;
  const totalScore = Math.round(interviewCompletion * 0.4 + timelineProgress * 0.3 + documentQuality * 0.2 + successorRating * 2);

  // Risk level
  let riskLevel = 'low';
  if (totalScore < 40) riskLevel = 'critical';
  else if (totalScore < 60) riskLevel = 'high';
  else if (totalScore < 80) riskLevel = 'medium';

  db.prepare(`
    INSERT INTO scores (handover_id, interview_completion, timeline_progress, document_quality, successor_rating, total_score, risk_level, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(handover_id) DO UPDATE SET
      interview_completion = ?, timeline_progress = ?, document_quality = ?,
      successor_rating = ?, total_score = ?, risk_level = ?, updated_at = CURRENT_TIMESTAMP
  `).run(
    handoverId, interviewCompletion, timelineProgress, documentQuality, successorRating, totalScore, riskLevel,
    interviewCompletion, timelineProgress, documentQuality, successorRating, totalScore, riskLevel
  );

  return { interviewCompletion, timelineProgress, documentQuality, successorRating, totalScore, riskLevel };
}

export function getScore(handoverId: number) {
  const db = getDb();
  return db.prepare('SELECT * FROM scores WHERE handover_id = ?').get(handoverId) as any;
}

export function updateSuccessorRating(handoverId: number, rating: number) {
  const db = getDb();
  db.prepare('INSERT OR IGNORE INTO scores (handover_id) VALUES (?)').run(handoverId);
  db.prepare('UPDATE scores SET successor_rating = ?, updated_at = CURRENT_TIMESTAMP WHERE handover_id = ?').run(rating, handoverId);
  calculateScore(handoverId);
}

// Search (FTS5)
export function searchAnswers(handoverId: number, query: string) {
  const db = getDb();
  const sanitized = query.replace(/["*]/g, '');
  return db.prepare(`
    SELECT a.*, rank
    FROM answers_fts f
    JOIN answers a ON a.id = f.rowid
    WHERE a.handover_id = ? AND answers_fts MATCH ?
    ORDER BY rank
    LIMIT 20
  `).all(handoverId, sanitized) as any[];
}

// Audit log
function logAudit(handoverId: number | null, userName: string | null, action: string, details: string) {
  const db = getDb();
  db.prepare('INSERT INTO audit_log (handover_id, user_name, action, details) VALUES (?, ?, ?, ?)').run(handoverId, userName, action, details);
}

export function getAuditLog(handoverId: number) {
  const db = getDb();
  return db.prepare('SELECT * FROM audit_log WHERE handover_id = ? ORDER BY created_at DESC LIMIT 50').all(handoverId) as any[];
}

// Integrations
export function saveIntegration(handoverId: number, data: Record<string, string | null>) {
  const db = getDb();
  const fields = Object.entries(data).map(([k]) => `${k} = ?`).join(', ');
  const values = Object.values(data);
  db.prepare(`
    INSERT INTO integrations (handover_id, ${Object.keys(data).join(', ')}, updated_at)
    VALUES (?, ${values.map(() => '?').join(', ')}, CURRENT_TIMESTAMP)
    ON CONFLICT(handover_id) DO UPDATE SET ${fields}, updated_at = CURRENT_TIMESTAMP
  `).run(handoverId, ...values, ...values);
}

export function getIntegration(handoverId: number) {
  const db = getDb();
  return db.prepare('SELECT * FROM integrations WHERE handover_id = ?').get(handoverId) as any;
}

// Reminders
export function getPendingReminders() {
  const db = getDb();
  return db.prepare(`
    SELECT r.*, h.person_name, h.successor_name, h.project_name, h.departure_date
    FROM reminders r
    JOIN handovers h ON r.handover_id = h.id
    WHERE r.sent = 0
    ORDER BY r.phase
  `).all() as any[];
}

export function markReminderSent(reminderId: number) {
  const db = getDb();
  db.prepare('UPDATE reminders SET sent = 1, sent_at = CURRENT_TIMESTAMP WHERE id = ?').run(reminderId);
}

// Webhook sender
export async function sendWebhook(url: string, payload: any) {
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return true;
  } catch {
    return false;
  }
}
