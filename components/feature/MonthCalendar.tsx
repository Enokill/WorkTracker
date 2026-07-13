import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
} from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadow } from '@/constants/theme';
import { useApp } from '@/hooks/useApp';
import { formatDate } from '@/services/storage';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month - 1, 1).getDay();
}

interface LongPressMenuProps {
  visible: boolean;
  date: string;
  onClose: () => void;
  onMakeRed: () => void;
  onReset: () => void;
}

function LongPressMenu({ visible, date, onClose, onMakeRed, onReset }: LongPressMenuProps) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.contextMenu}>
          <Text style={styles.contextTitle}>{date}</Text>
          <Pressable style={styles.contextItem} onPress={onMakeRed}>
            <Text style={[styles.contextItemText, { color: Colors.error }]}>Make Date Red</Text>
          </Pressable>
          <View style={styles.contextDivider} />
          <Pressable style={styles.contextItem} onPress={onReset}>
            <Text style={styles.contextItemText}>Reset to Default</Text>
          </Pressable>
          <View style={styles.contextDivider} />
          <Pressable style={styles.contextItem} onPress={onClose}>
            <Text style={[styles.contextItemText, { color: Colors.onSurfaceVariant }]}>Cancel</Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

interface MonthPickerProps {
  visible: boolean;
  year: number;
  month: number;
  onClose: () => void;
  onSelect: (year: number, month: number) => void;
}

function MonthPicker({ visible, year, month, onClose, onSelect }: MonthPickerProps) {
  const [pickerYear, setPickerYear] = useState(year);

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.pickerContainer} onPress={() => {}}>
          <View style={styles.pickerHeader}>
            <Pressable onPress={() => setPickerYear(y => y - 1)} style={styles.pickerArrow}>
              <Text style={styles.pickerArrowText}>‹</Text>
            </Pressable>
            <Text style={styles.pickerYear}>{pickerYear}</Text>
            <Pressable onPress={() => setPickerYear(y => y + 1)} style={styles.pickerArrow}>
              <Text style={styles.pickerArrowText}>›</Text>
            </Pressable>
          </View>
          <View style={styles.pickerMonths}>
            {MONTH_NAMES.map((name, idx) => {
              const m = idx + 1;
              const isSelected = pickerYear === year && m === month;
              return (
                <Pressable
                  key={m}
                  style={[styles.pickerMonth, isSelected && styles.pickerMonthSelected]}
                  onPress={() => { onSelect(pickerYear, m); onClose(); }}
                >
                  <Text style={[styles.pickerMonthText, isSelected && styles.pickerMonthTextSelected]}>
                    {name.slice(0, 3)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export default function MonthCalendar() {
  const {
    currentYear,
    currentMonth,
    selectedDate,
    setSelectedDate,
    setCurrentMonth,
    entries,
    dateColors,
    setDateColor,
  } = useApp();

  const [longPressDate, setLongPressDate] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const today = formatDate(new Date());

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const entryDates = new Set(entries.map(e => e.date));

  const goToPrev = () => {
    if (currentMonth === 1) setCurrentMonth(currentYear - 1, 12);
    else setCurrentMonth(currentYear, currentMonth - 1);
  };

  const goToNext = () => {
    if (currentMonth === 12) setCurrentMonth(currentYear + 1, 1);
    else setCurrentMonth(currentYear, currentMonth + 1);
  };

  const goToToday = () => {
    const d = new Date();
    setCurrentMonth(d.getFullYear(), d.getMonth() + 1);
    setSelectedDate(today);
  };

  const handlePressIn = (dateStr: string) => {
    longPressTimer.current = setTimeout(() => {
      setLongPressDate(dateStr);
    }, 600);
  };

  const handlePressOut = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleDayPress = (dateStr: string) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    setSelectedDate(dateStr);
  };

  // Build calendar grid
  const cells: Array<{ day: number; dateStr: string } | null> = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({ day: d, dateStr });
  }
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: Array<Array<{ day: number; dateStr: string } | null>> = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={goToPrev} style={styles.navBtn} hitSlop={8}>
          <Text style={styles.navBtnText}>‹</Text>
        </Pressable>
        <Pressable onPress={() => setShowPicker(true)} style={styles.monthTitle}>
          <Text style={styles.monthTitleText}>
            {MONTH_NAMES[currentMonth - 1]} {currentYear}
          </Text>
        </Pressable>
        <Pressable onPress={goToNext} style={styles.navBtn} hitSlop={8}>
          <Text style={styles.navBtnText}>›</Text>
        </Pressable>
        <Pressable onPress={goToToday} style={styles.todayBtn}>
          <Text style={styles.todayBtnText}>Today</Text>
        </Pressable>
      </View>

      {/* Day names */}
      <View style={styles.dayNamesRow}>
        {DAY_NAMES.map((d, i) => (
          <Text
            key={d}
            style={[styles.dayName, i === 0 && { color: Colors.error }]}
          >
            {d}
          </Text>
        ))}
      </View>

      {/* Weeks */}
      {weeks.map((week, wi) => (
        <View key={wi} style={styles.weekRow}>
          {week.map((cell, ci) => {
            if (!cell) return <View key={ci} style={styles.dayCell} />;
            const { day, dateStr } = cell;
            const isToday = dateStr === today;
            const isSelected = dateStr === selectedDate;
            const isSunday = ci === 0;
            const hasEntry = entryDates.has(dateStr);
            const customColor = dateColors[dateStr];
            const isRed = customColor === 'red' || (isSunday && !customColor);

            let dayTextColor = Colors.onSurface;
            if (isRed) dayTextColor = Colors.error;
            if (isSelected || isToday) dayTextColor = Colors.onPrimary;

            return (
              <Pressable
                key={dateStr}
                style={styles.dayCell}
                onPress={() => handleDayPress(dateStr)}
                onPressIn={() => handlePressIn(dateStr)}
                onPressOut={handlePressOut}
              >
                <View style={[
                  styles.dayInner,
                  isToday && !isSelected && styles.todayInner,
                  isSelected && styles.selectedInner,
                ]}>
                  <Text style={[styles.dayNumber, { color: dayTextColor }, isSelected && styles.dayNumberSelected]}>
                    {day}
                  </Text>
                  {hasEntry ? (
                    <View style={[styles.dot, isSelected && { backgroundColor: Colors.onPrimary }]} />
                  ) : <View style={styles.dotPlaceholder} />}
                </View>
              </Pressable>
            );
          })}
        </View>
      ))}

      {/* Long press menu */}
      <LongPressMenu
        visible={!!longPressDate}
        date={longPressDate || ''}
        onClose={() => setLongPressDate(null)}
        onMakeRed={() => {
          if (longPressDate) setDateColor(longPressDate, 'red');
          setLongPressDate(null);
        }}
        onReset={() => {
          if (longPressDate) setDateColor(longPressDate, 'default');
          setLongPressDate(null);
        }}
      />

      {/* Month picker */}
      <MonthPicker
        visible={showPicker}
        year={currentYear}
        month={currentMonth}
        onClose={() => setShowPicker(false)}
        onSelect={(y, m) => setCurrentMonth(y, m)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    ...Shadow.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  navBtn: {
    padding: Spacing.xs,
    borderRadius: Radius.full,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryLight,
  },
  navBtnText: {
    fontSize: 22,
    color: Colors.primary,
    lineHeight: 26,
    fontWeight: '600',
  },
  monthTitle: {
    flex: 1,
    marginHorizontal: Spacing.sm,
  },
  monthTitleText: {
    ...Typography.headlineMedium,
    color: Colors.onSurface,
  },
  todayBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryLight,
  },
  todayBtnText: {
    ...Typography.labelMedium,
    color: Colors.primary,
  },
  dayNamesRow: {
    flexDirection: 'row',
    marginBottom: Spacing.xs,
  },
  dayName: {
    flex: 1,
    textAlign: 'center',
    ...Typography.labelSmall,
    color: Colors.onSurfaceVariant,
    paddingVertical: Spacing.xs,
  },
  weekRow: {
    flexDirection: 'row',
  },
  dayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 2,
  },
  dayInner: {
    width: 38,
    height: 42,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayInner: {
    backgroundColor: Colors.primaryLight,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: Radius.lg,
  },
  selectedInner: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 6,
  },
  dayNumber: {
    ...Typography.bodyMedium,
    fontWeight: '500',
  },
  dayNumberSelected: {
    fontWeight: '800',
    fontSize: 15,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.accent,
    marginTop: 2,
  },
  dotPlaceholder: {
    width: 5,
    height: 5,
    marginTop: 2,
  },
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contextMenu: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    width: 240,
    overflow: 'hidden',
    ...Shadow.lg,
  },
  contextTitle: {
    ...Typography.labelMedium,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  contextItem: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
  contextItemText: {
    ...Typography.bodyLarge,
    color: Colors.onSurface,
  },
  contextDivider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  pickerContainer: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    width: 300,
    padding: Spacing.lg,
    ...Shadow.lg,
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  pickerArrow: {
    padding: Spacing.sm,
  },
  pickerArrowText: {
    fontSize: 28,
    color: Colors.primary,
    lineHeight: 32,
  },
  pickerYear: {
    ...Typography.headlineLarge,
    color: Colors.onSurface,
  },
  pickerMonths: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -Spacing.xs,
  },
  pickerMonth: {
    width: '30%',
    margin: Spacing.xs,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
    backgroundColor: Colors.surfaceVariant,
  },
  pickerMonthSelected: {
    backgroundColor: Colors.primary,
  },
  pickerMonthText: {
    ...Typography.labelLarge,
    color: Colors.onSurface,
  },
  pickerMonthTextSelected: {
    color: Colors.onPrimary,
  },
});
