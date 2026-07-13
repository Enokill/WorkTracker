import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  WorkEntry,
  AppSettings,
  CustomDateColor,
  BackupData,
  getAllEntries,
  saveEntry as storageSaveEntry,
  deleteEntry as storageDeleteEntry,
  getSettings,
  saveSettings as storageSaveSettings,
  getDateColors,
  saveDateColor as storageSaveDateColor,
  getAdvanceSalary,
  saveAdvanceSalary as storageSaveAdvanceSalary,
  getMonthKey,
  getWeekDates,
  formatDate,
  exportBackup,
  importBackup,
} from '@/services/storage';

interface AppContextType {
  // Data
  entries: WorkEntry[];
  settings: AppSettings;
  dateColors: CustomDateColor;
  advanceSalary: number;
  loading: boolean;

  // Selected state
  selectedDate: string;
  currentYear: number;
  currentMonth: number; // 1-12

  // Actions
  setSelectedDate: (date: string) => void;
  setCurrentMonth: (year: number, month: number) => void;
  saveEntry: (entry: WorkEntry) => Promise<void>;
  deleteEntry: (date: string) => Promise<void>;
  updateSettings: (s: AppSettings) => Promise<void>;
  setDateColor: (date: string, color: 'red' | 'default') => Promise<void>;
  updateAdvanceSalary: (amount: number) => Promise<void>;
  getEntryForDate: (date: string) => WorkEntry | undefined;
  refresh: () => Promise<void>;
  createBackup: () => Promise<BackupData>;
  restoreBackup: (data: BackupData) => Promise<void>;

  // Computed
  weekTotal: number;
  monthTotal: number;
  weekEarnings: number;
  monthEarnings: number;
  payableIncome: number;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const today = new Date();
  const todayStr = formatDate(today);

  const [entries, setEntries] = useState<WorkEntry[]>([]);
  const [settings, setSettings] = useState<AppSettings>({ ratePerUnit: 2.75 });
  const [dateColors, setDateColors] = useState<CustomDateColor>({});
  const [advanceSalary, setAdvanceSalary] = useState(0);
  const [loading, setLoading] = useState(true);

  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonthState] = useState(today.getMonth() + 1);

  const setCurrentMonth = (year: number, month: number) => {
    setCurrentYear(year);
    setCurrentMonthState(month);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    const [e, s, dc] = await Promise.all([
      getAllEntries(),
      getSettings(),
      getDateColors(),
    ]);
    const mk = getMonthKey(currentYear, currentMonth);
    const adv = await getAdvanceSalary(mk);
    setEntries(e);
    setSettings(s);
    setDateColors(dc);
    setAdvanceSalary(adv);
    setLoading(false);
  }, [currentYear, currentMonth]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refresh = useCallback(async () => {
    await loadData();
  }, [loadData]);

  const saveEntry = useCallback(async (entry: WorkEntry) => {
    await storageSaveEntry(entry);
    setEntries(prev => {
      const idx = prev.findIndex(e => e.date === entry.date);
      const updated = [...prev];
      if (idx >= 0) {
        updated[idx] = entry;
      } else {
        updated.push(entry);
      }
      return updated;
    });
  }, []);

  const deleteEntry = useCallback(async (date: string) => {
    await storageDeleteEntry(date);
    setEntries(prev => prev.filter(e => e.date !== date));
  }, []);

  const updateSettings = useCallback(async (s: AppSettings) => {
    await storageSaveSettings(s);
    setSettings(s);
  }, []);

  const setDateColor = useCallback(async (date: string, color: 'red' | 'default') => {
    await storageSaveDateColor(date, color);
    setDateColors(prev => {
      const next = { ...prev };
      if (color === 'default') {
        delete next[date];
      } else {
        next[date] = color;
      }
      return next;
    });
  }, []);

  const createBackup = useCallback(async (): Promise<BackupData> => {
    return exportBackup();
  }, []);

  const restoreBackup = useCallback(async (data: BackupData): Promise<void> => {
    await importBackup(data);
    await loadData();
  }, [loadData]);

  const updateAdvanceSalary = useCallback(async (amount: number) => {
    const mk = getMonthKey(currentYear, currentMonth);
    await storageSaveAdvanceSalary(mk, amount);
    setAdvanceSalary(amount);
  }, [currentYear, currentMonth]);

  const getEntryForDate = useCallback((date: string) => {
    return entries.find(e => e.date === date);
  }, [entries]);

  // Computed values
  const weekDates = getWeekDates();
  const weekTotal = entries
    .filter(e => weekDates.includes(e.date))
    .reduce((sum, e) => sum + e.workCount, 0);

  const monthPrefix = getMonthKey(currentYear, currentMonth);
  const monthTotal = entries
    .filter(e => e.date.startsWith(monthPrefix))
    .reduce((sum, e) => sum + e.workCount, 0);

  const rate = settings.ratePerUnit;
  const weekEarnings = weekTotal * rate;
  const monthEarnings = monthTotal * rate;
  const payableIncome = monthEarnings - advanceSalary;

  return (
    <AppContext.Provider value={{
      entries,
      settings,
      dateColors,
      advanceSalary,
      loading,
      selectedDate,
      currentYear,
      currentMonth,
      setSelectedDate,
      setCurrentMonth,
      saveEntry,
      deleteEntry,
      updateSettings,
      setDateColor,
      updateAdvanceSalary,
      getEntryForDate,
      refresh,
      createBackup,
      restoreBackup,
      weekTotal,
      monthTotal,
      weekEarnings,
      monthEarnings,
      payableIncome,
    }}>
      {children}
    </AppContext.Provider>
  );
}
