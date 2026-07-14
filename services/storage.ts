import AsyncStorage from '@react-native-async-storage/async-storage';

export interface WorkEntry {
  date: string; // YYYY-MM-DD
  workCount: number;
  caratWeight?: number;   // weight in carats (optional second entry type)
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppSettings {
  ratePerUnit: number;    // rate per work unit (₹)
  caratRate?: number;     // rate per carat (₹), default 100
  caratEnabled?: boolean; // feature flag — show/hide all carat UI
  username?: string;
}

export interface CustomDateColor {
  [date: string]: 'red' | 'default';
}

const KEYS = {
  ENTRIES: 'work_entries',
  SETTINGS: 'app_settings',
  DATE_COLORS: 'date_colors',
  ADVANCE: 'advance_salary',
};

export interface BackupData {
  version: number;
  exportedAt: string;
  entries: WorkEntry[];
  settings: AppSettings;
  dateColors: CustomDateColor;
  advanceKeys: Array<{ key: string; value: number }>;
}

// ─── Work Entries ─────────────────────────────────────────────────────────────

export async function getAllEntries(): Promise<WorkEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.ENTRIES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveEntry(entry: WorkEntry): Promise<void> {
  const all = await getAllEntries();
  const idx = all.findIndex(e => e.date === entry.date);
  const now = new Date().toISOString();
  if (idx >= 0) {
    all[idx] = { ...entry, updatedAt: now };
  } else {
    all.push({ ...entry, createdAt: now, updatedAt: now });
  }
  await AsyncStorage.setItem(KEYS.ENTRIES, JSON.stringify(all));
}

export async function deleteEntry(date: string): Promise<void> {
  const all = await getAllEntries();
  await AsyncStorage.setItem(KEYS.ENTRIES, JSON.stringify(all.filter(e => e.date !== date)));
}

export async function getEntry(date: string): Promise<WorkEntry | null> {
  const all = await getAllEntries();
  return all.find(e => e.date === date) ?? null;
}

// ─── Settings ─────────────────────────────────────────────────────────────────

const DEFAULT_SETTINGS: AppSettings = {
  ratePerUnit: 2.75,
  caratRate: 100,
  caratEnabled: false, // OFF by default for new installs
};

export async function getSettings(): Promise<AppSettings> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.SETTINGS);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed: AppSettings = JSON.parse(raw);
    // Merge defaults so new fields are present for existing users
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
}

// ─── Date Colors ──────────────────────────────────────────────────────────────

export async function getDateColors(): Promise<CustomDateColor> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.DATE_COLORS);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export async function saveDateColor(date: string, color: 'red' | 'default'): Promise<void> {
  const colors = await getDateColors();
  if (color === 'default') {
    delete colors[date];
  } else {
    colors[date] = color;
  }
  await AsyncStorage.setItem(KEYS.DATE_COLORS, JSON.stringify(colors));
}

// ─── Advance Salary (per month key = YYYY-MM) ─────────────────────────────────

export async function getAdvanceSalary(monthKey: string): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(`${KEYS.ADVANCE}_${monthKey}`);
    return raw ? parseFloat(raw) : 0;
  } catch {
    return 0;
  }
}

export async function saveAdvanceSalary(monthKey: string, amount: number): Promise<void> {
  await AsyncStorage.setItem(`${KEYS.ADVANCE}_${monthKey}`, amount.toString());
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getMonthKey(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}`;
}

export function getWeekDates(): string[] {
  const today = new Date();
  const dayOfWeek = today.getDay();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - dayOfWeek + i);
    return formatDate(d);
  });
}

export function formatDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function parseDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

// ─── Backup & Restore ─────────────────────────────────────────────────────────

export async function exportBackup(): Promise<BackupData> {
  const [entries, settings, dateColors] = await Promise.all([
    getAllEntries(),
    getSettings(),
    getDateColors(),
  ]);

  const allKeys = await AsyncStorage.getAllKeys();
  const advanceKeys: Array<{ key: string; value: number }> = [];
  for (const k of allKeys) {
    if (k.startsWith(KEYS.ADVANCE + '_')) {
      const raw = await AsyncStorage.getItem(k);
      advanceKeys.push({ key: k, value: raw ? parseFloat(raw) : 0 });
    }
  }

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    entries,
    settings,
    dateColors,
    advanceKeys,
  };
}

export async function importBackup(data: BackupData): Promise<void> {
  await Promise.all([
    AsyncStorage.setItem(KEYS.ENTRIES, JSON.stringify(data.entries)),
    AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(data.settings)),
    AsyncStorage.setItem(KEYS.DATE_COLORS, JSON.stringify(data.dateColors)),
  ]);
  for (const { key, value } of data.advanceKeys) {
    await AsyncStorage.setItem(key, value.toString());
  }
}
