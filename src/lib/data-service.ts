/**
 * Unified data service — API-first with LocalStorage offline fallback
 * All frontend data operations go through here.
 */

export interface HandoverData {
  id: number;
  personName: string;
  successorName: string;
  projectName: string;
  departureDate?: string;
  role: string;
  createdAt: string;
  answers: Record<string, string>;
}

export interface HandoverListItem {
  id: number;
  personName: string;
  successorName?: string;
  projectName: string;
  departureDate?: string;
  createdAt: string;
  status: string;
  score?: number;
  risk_level?: string;
}

export interface ApiError {
  error: string;
  status?: number;
}

// ── API wrapper with error handling ──

async function apiFetch(url: string, options?: RequestInit): Promise<any> {
  try {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || `请求失败 (${res.status})`);
    }
    return res.json();
  } catch (e: any) {
    // Network error — fall back to LocalStorage
    if (e instanceof TypeError && e.message.includes('fetch')) {
      console.warn('[DataService] API unavailable, using LocalStorage fallback');
      throw new Error('NETWORK_OFFLINE');
    }
    throw e;
  }
}

// ── LocalStorage helpers (offline fallback) ──

function lsGet<T>(key: string, fallback: T): T {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function lsSet(key: string, value: unknown): void {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('[DataService] LocalStorage write failed:', e);
  }
}

// ── Auto-save indicator ──

let saveTimeout: ReturnType<typeof setTimeout> | null = null;
let saveStatus: 'idle' | 'saving' | 'saved' | 'error' = 'idle';
const saveStatusListeners = new Set<(status: typeof saveStatus) => void>();

export function getSaveStatus() { return saveStatus; }
export function onSaveStatusChange(cb: (status: typeof saveStatus) => void) {
  saveStatusListeners.add(cb);
  return () => saveStatusListeners.delete(cb);
}

function setSaveStatus(status: typeof saveStatus) {
  saveStatus = status;
  saveStatusListeners.forEach(cb => cb(status));
}

// ── Core operations ──

export const DataService = {
  // Create a new handover (API → LocalStorage fallback)
  async create(data: Omit<HandoverData, 'id' | 'createdAt' | 'answers'>): Promise<number> {
    setSaveStatus('saving');
    try {
      const result = await apiFetch('/api/handover', {
        method: 'POST',
        body: JSON.stringify({ action: 'create', ...data }),
      });
      setSaveStatus('saved');
      // Mirror to LocalStorage for offline continuity
      const id = result.id;
      lsSet(`handover_${id}`, { ...data, id, createdAt: new Date().toISOString(), answers: {} });
      const list = lsGet<HandoverListItem[]>('handover_list', []);
      list.unshift({ ...data, id, createdAt: new Date().toISOString(), status: 'in_progress' });
      lsSet('handover_list', list);
      return id;
    } catch (e: any) {
      if (e.message === 'NETWORK_OFFLINE') {
        // Full LocalStorage fallback
        const id = Date.now();
        const handover: HandoverData = { ...data, id, createdAt: new Date().toISOString(), answers: {} };
        lsSet(`handover_${id}`, handover);
        const list = lsGet<HandoverListItem[]>('handover_list', []);
        list.unshift({ ...data, id, createdAt: handover.createdAt, status: 'in_progress' });
        lsSet('handover_list', list);
        setSaveStatus('saved');
        return id;
      }
      setSaveStatus('error');
      throw e;
    }
  },

  // Get a single handover (API → LocalStorage fallback)
  async get(id: number): Promise<HandoverData | null> {
    try {
      const data = await apiFetch(`/api/handover?id=${id}`);
      // Normalize API response to HandoverData shape
      return {
        id: data.id,
        personName: data.person_name,
        successorName: data.successor_name,
        projectName: data.project_name,
        departureDate: data.departure_date,
        role: data.role,
        createdAt: data.created_at,
        answers: this._answersToMap(data.answers || []),
      };
    } catch (e: any) {
      if (e.message === 'NETWORK_OFFLINE') {
        return lsGet<HandoverData | null>(`handover_${id}`, null);
      }
      throw e;
    }
  },

  // List all handovers (API → LocalStorage fallback)
  async list(): Promise<HandoverListItem[]> {
    try {
      const items = await apiFetch('/api/handover');
      return (items || []).map((h: any) => ({
        id: h.id,
        personName: h.person_name,
        successorName: h.successor_name,
        projectName: h.project_name,
        departureDate: h.departure_date,
        createdAt: h.created_at,
        status: h.status || 'in_progress',
        score: h.score || 0,
        risk_level: h.risk_level || 'low',
      }));
    } catch (e: any) {
      if (e.message === 'NETWORK_OFFLINE') {
        return lsGet<HandoverListItem[]>('handover_list', []);
      }
      throw e;
    }
  },

  // Save an answer (API → LocalStorage fallback)
  async saveAnswer(handoverId: number, category: string, questionKey: string, questionLabel: string, answer: string): Promise<void> {
    setSaveStatus('saving');
    try {
      await apiFetch('/api/handover', {
        method: 'POST',
        body: JSON.stringify({ action: 'saveAnswer', handoverId, category, questionKey, questionLabel, answer }),
      });
      // Mirror to LocalStorage
      const handover = lsGet<HandoverData | null>(`handover_${handoverId}`, null);
      if (handover) {
        handover.answers[`${category}::${questionKey}`] = answer;
        if (questionLabel && !handover.answers[`${category}::${questionKey}::label`]) {
          handover.answers[`${category}::${questionKey}::label`] = questionLabel;
        }
        lsSet(`handover_${handoverId}`, handover);
      }
      if (saveTimeout) clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => setSaveStatus('saved'), 300);
    } catch (e: any) {
      if (e.message === 'NETWORK_OFFLINE') {
        const handover = lsGet<HandoverData | null>(`handover_${handoverId}`, null);
        if (!handover) throw new Error('交接记录不存在');
        handover.answers[`${category}::${questionKey}`] = answer;
        if (questionLabel && !handover.answers[`${category}::${questionKey}::label`]) {
          handover.answers[`${category}::${questionKey}::label`] = questionLabel;
        }
        lsSet(`handover_${handoverId}`, handover);
        if (saveTimeout) clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => setSaveStatus('saved'), 300);
        return;
      }
      setSaveStatus('error');
      throw e;
    }
  },

  // Get answers for a handover
  getAnswers(handoverId: number): Record<string, string> {
    const h = lsGet<HandoverData | null>(`handover_${handoverId}`, null);
    return h?.answers || {};
  },

  // Get answer stats
  getAnswerStats(handoverId: number): { total: number; answered: number } {
    const answers = this.getAnswers(handoverId);
    const allKeys = Object.keys(answers).filter(k => !k.includes('::label'));
    const answered = allKeys.filter(k => answers[k]?.trim()).length;
    return { total: allKeys.length, answered };
  },

  // Update handover fields
  async update(id: number, fields: Partial<HandoverData>): Promise<void> {
    try {
      await apiFetch('/api/handover', {
        method: 'POST',
        body: JSON.stringify({ action: 'update', id, ...fields }),
      });
    } catch (e: any) {
      if (e.message !== 'NETWORK_OFFLINE') throw e;
    }
    // Always update LocalStorage
    const handover = lsGet<HandoverData | null>(`handover_${id}`, null);
    if (!handover) throw new Error('交接记录不存在');
    Object.assign(handover, fields);
    lsSet(`handover_${id}`, handover);
  },

  // Delete a handover
  async delete(id: number): Promise<void> {
    try {
      await apiFetch(`/api/handover?id=${id}`, { method: 'DELETE' });
    } catch {
      // API may not have DELETE — continue with LocalStorage
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(`handover_${id}`);
      localStorage.removeItem(`checklist_${id}`);
    }
    const list = lsGet<HandoverListItem[]>('handover_list', []);
    lsSet('handover_list', list.filter(h => h.id !== id));
  },

  // Search handovers
  async search(query: string): Promise<HandoverListItem[]> {
    const list = await this.list();
    if (!query.trim()) return list;
    const q = query.toLowerCase();
    return list.filter(h =>
      h.personName.toLowerCase().includes(q) ||
      h.projectName.toLowerCase().includes(q) ||
      h.successorName?.toLowerCase().includes(q)
    );
  },

  // Checklist (LocalStorage)
  getChecklist(id: number): Record<string, boolean> {
    return lsGet(`checklist_${id}`, {});
  },

  async setChecklist(id: number, data: Record<string, boolean>): Promise<void> {
    lsSet(`checklist_${id}`, data);
  },

  // Export all data
  exportAll(): string {
    const data: Record<string, unknown> = {};
    if (typeof localStorage === 'undefined') return '{}';
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('handover_') || key?.startsWith('checklist_')) {
        data[key] = localStorage.getItem(key);
      }
    }
    return JSON.stringify(data, null, 2);
  },

  importAll(json: string): void {
    const data = JSON.parse(json);
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        localStorage.setItem(key, value);
      }
    }
  },

  // Internal: convert API answers array to map
  _answersToMap(answers: any[]): Record<string, string> {
    const map: Record<string, string> = {};
    for (const a of answers) {
      map[`${a.category}::${a.question_key}`] = a.answer || '';
      if (a.question_label) {
        map[`${a.category}::${a.question_key}::label`] = a.question_label;
      }
    }
    return map;
  },
};
