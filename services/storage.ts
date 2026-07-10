import AsyncStorage from '@react-native-async-storage/async-storage';

export interface WorkEntry {
  date: string; // YYYY-MM-DD
  workCount: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppSettings {
  ratePerUnit: number;
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

// Work Entries
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
  if (idx >= 0) {
    all[idx] = { ...entry, updatedAt: new Date().toISOString() };
  } else {
    all.push({ ...entry, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  }
  await AsyncStorage.setItem(KEYS.ENTRIES, JSON.stringify(all));
}

export async function deleteEntry(date: string): Promise<void> {
  const all = await getAllEntries();
  const filtered = all.filter(e => e.date !== date);
  await AsyncStorage.setItem(KEYS.ENTRIES, JSON.stringify(filtered));
}

export async function getEntry(date: string): Promise<WorkEntry | null> {
  const all = await getAllEntries();
  return all.find(e => e.date === date) || null;
}

// Settings
export async function getSettings(): Promise<AppSettings> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.SETTINGS);
    return raw ? JSON.parse(raw) : { ratePerUnit: 2.75 };
  } catch {
    return { ratePerUnit: 2.75 };
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
}

// Date Colors
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

// Advance Salary (per month: key = YYYY-MM)
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

// Helpers
export function getMonthKey(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}`;
}

export function getWeekDates(): string[] {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday
  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - dayOfWeek + i);
    dates.push(formatDate(d));
  }
  return dates;
}

export function formatDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function parseDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}
