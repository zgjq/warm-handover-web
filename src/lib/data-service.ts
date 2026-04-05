/**
 * Unified data service — bridges LocalStorage and API
 * All data operations go through here for consistency
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
}

// LocalStorage helpers
function lsGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function lsSet(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('LocalStorage write failed:', e);
    throw new Error('保存失败，可能是存储空间不足');
  }
}

// Auto-save indicator
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

// Core operations
export const DataService = {
  // Create a new handover
  create(data: Omit<HandoverData, 'id' | 'createdAt' | 'answers'>): number {
    const id = Date.now();
    const handover: HandoverData = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
      answers: {},
    };
    lsSet(`handover_${id}`, handover);

    const list = lsGet<HandoverListItem[]>('handover_list', []);
    list.unshift({
      id,
      personName: data.personName,
      successorName: data.successorName,
      projectName: data.projectName,
      departureDate: data.departureDate,
      createdAt: handover.createdAt,
      status: 'in_progress',
    });
    lsSet('handover_list', list);

    return id;
  },

  // Get a single handover
  get(id: number): HandoverData | null {
    return lsGet<HandoverData | null>(`handover_${id}`, null);
  },

  // List all handovers
  list(): HandoverListItem[] {
    return lsGet<HandoverListItem[]>('handover_list', []);
  },

  // Save an answer with auto-save indicator
  saveAnswer(handoverId: number, category: string, questionKey: string, questionLabel: string, answer: string): void {
    setSaveStatus('saving');

    try {
      const handover = this.get(handoverId);
      if (!handover) throw new Error('交接记录不存在');

      handover.answers[`${category}::${questionKey}`] = answer;

      // Update question label if provided
      if (questionLabel && !handover.answers[`${category}::${questionKey}::label`]) {
        handover.answers[`${category}::${questionKey}::label`] = questionLabel;
      }

      lsSet(`handover_${handoverId}`, handover);

      // Debounce the "saved" status
      if (saveTimeout) clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => setSaveStatus('saved'), 300);
    } catch (e) {
      setSaveStatus('error');
      throw e;
    }
  },

  // Get answers for a handover
  getAnswers(handoverId: number): Record<string, string> {
    const h = this.get(handoverId);
    return h?.answers || {};
  },

  // Get answer count
  getAnswerStats(handoverId: number): { total: number; answered: number } {
    const answers = this.getAnswers(handoverId);
    const allKeys = Object.keys(answers).filter(k => !k.includes('::label'));
    const answered = allKeys.filter(k => answers[k]?.trim()).length;
    return { total: allKeys.length, answered };
  },

  // Update handover fields
  update(id: number, fields: Partial<HandoverData>): void {
    const handover = this.get(id);
    if (!handover) throw new Error('交接记录不存在');
    Object.assign(handover, fields);
    lsSet(`handover_${id}`, handover);
  },

  // Delete a handover
  delete(id: number): void {
    localStorage.removeItem(`handover_${id}`);
    localStorage.removeItem(`checklist_${id}`);
    const list = this.list().filter(h => h.id !== id);
    lsSet('handover_list', list);
  },

  // Search handovers
  search(query: string): HandoverListItem[] {
    const list = this.list();
    if (!query.trim()) return list;
    const q = query.toLowerCase();
    return list.filter(h =>
      h.personName.toLowerCase().includes(q) ||
      h.projectName.toLowerCase().includes(q) ||
      h.successorName?.toLowerCase().includes(q)
    );
  },

  // Checklist
  getChecklist(id: number): Record<string, boolean> {
    return lsGet(`checklist_${id}`, {});
  },

  setChecklist(id: number, data: Record<string, boolean>): void {
    lsSet(`checklist_${id}`, data);
  },

  // Export all data (for backup)
  exportAll(): string {
    const data: Record<string, unknown> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('handover_') || key?.startsWith('checklist_')) {
        data[key] = localStorage.getItem(key);
      }
    }
    return JSON.stringify(data, null, 2);
  },

  // Import data (from backup)
  importAll(json: string): void {
    const data = JSON.parse(json);
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        localStorage.setItem(key, value);
      }
    }
  },
};
