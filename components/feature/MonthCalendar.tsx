import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  Animated,
} from 'react-native';
import { Typography, Spacing, Radius, Shadow } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
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

// ─── Long Press Context Menu ──────────────────────────────────────────────────
interface LongPressMenuProps {
  visible: boolean;
  date: string;
  onClose: () => void;
  onMakeRed: () => void;
  onReset: () => void;
  colors: ReturnType<typeof useTheme>['colors'];
}

function LongPressMenu({ visible, date, onClose, onMakeRed, onReset, colors }: LongPressMenuProps) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable style={[styles.overlay, { backgroundColor: colors.overlay }]} onPress={onClose}>
        <View style={[styles.contextMenu, { backgroundColor: colors.surface }]}>
          <Text style={[styles.contextTitle, { color: colors.onSurfaceVariant, borderBottomColor: colors.border }]}>
            {date}
          </Text>
          <Pressable style={styles.contextItem} onPress={onMakeRed}>
            <Text style={[styles.contextItemText, { color: colors.error }]}>Make Date Red</Text>
          </Pressable>
          <View style={[styles.contextDivider, { backgroundColor: colors.border }]} />
          <Pressable style={styles.contextItem} onPress={onReset}>
            <Text style={[styles.contextItemText, { color: colors.onSurface }]}>Reset to Default</Text>
          </Pressable>
          <View style={[styles.contextDivider, { backgroundColor: colors.border }]} />
          <Pressable style={styles.contextItem} onPress={onClose}>
            <Text style={[styles.contextItemText, { color: colors.onSurfaceVariant }]}>Cancel</Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

// ─── Month Picker ─────────────────────────────────────────────────────────────
interface MonthPickerProps {
  visible: boolean;
  year: number;
  month: number;
  onClose: () => void;
  onSelect: (year: number, month: number) => void;
  colors: ReturnType<typeof useTheme>['colors'];
}

function MonthPicker({ visible, year, month, onClose, onSelect, colors }: MonthPickerProps) {
  const [pickerYear, setPickerYear] = useState(year);
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable style={[styles.overlay, { backgroundColor: colors.overlay }]} onPress={onClose}>
        <Pressable style={[styles.pickerContainer, { backgroundColor: colors.surface }]} onPress={() => {}}>
          <View style={styles.pickerHeader}>
            <Pressable onPress={() => setPickerYear(y => y - 1)} style={styles.pickerArrow} hitSlop={8}>
              <Text style={[styles.pickerArrowText, { color: colors.primary }]}>‹</Text>
            </Pressable>
            <Text style={[styles.pickerYear, { color: colors.onSurface }]}>{pickerYear}</Text>
            <Pressable onPress={() => setPickerYear(y => y + 1)} style={styles.pickerArrow} hitSlop={8}>
              <Text style={[styles.pickerArrowText, { color: colors.primary }]}>›</Text>
            </Pressable>
          </View>
          <View style={styles.pickerMonths}>
            {MONTH_NAMES.map((name, idx) => {
              const m = idx + 1;
              const isSelected = pickerYear === year && m === month;
              return (
                <Pressable
                  key={m}
                  style={[
                    styles.pickerMonth,
                    { backgroundColor: colors.surfaceVariant },
                    isSelected && { backgroundColor: colors.primary },
                  ]}
                  onPress={() => { onSelect(pickerYear, m); onClose(); }}
                >
                  <Text style={[
                    styles.pickerMonthText,
                    { color: isSelected ? colors.onPrimary : colors.onSurface },
                  ]}>
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

// ─── Day Cell ─────────────────────────────────────────────────────────────────
interface DayCellProps {
  day: number;
  dateStr: string;
  isToday: boolean;
  isSelected: boolean;
  isRed: boolean;
  hasEntry: boolean;
  hasCarats: boolean;
  showCaratDot: boolean;
  onPress: () => void;
  onPressIn: () => void;
  onPressOut: () => void;
  colors: ReturnType<typeof useTheme>['colors'];
}

function DayCell({
  day, isToday, isSelected, isRed, hasEntry, hasCarats, showCaratDot,
  onPress, onPressIn, onPressOut, colors,
}: DayCellProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.86, useNativeDriver: true, speed: 40 }).start();
    onPressIn();
  };
  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30 }).start();
    onPressOut();
  };

  let dayTextColor = colors.onSurface;
  if (isRed) dayTextColor = colors.error;
  if (isSelected) dayTextColor = colors.onPrimary;
  else if (isToday) dayTextColor = colors.primary;

  return (
    <Pressable style={styles.dayCell} onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View style={[
        styles.dayInner,
        isToday && !isSelected && {
          backgroundColor: colors.primaryLight,
          borderWidth: 2,
          borderColor: colors.primary,
        },
        isSelected && {
          backgroundColor: colors.primary,
          elevation: 4,
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.4,
          shadowRadius: 6,
        },
        { transform: [{ scale }] },
      ]}>
        <Text style={[
          styles.dayNumber,
          { color: dayTextColor, fontWeight: isSelected || isToday ? '700' : '400' },
        ]}>
          {day}
        </Text>
        <View style={styles.dotRow}>
          {hasEntry ? (
            <View style={[styles.dot, { backgroundColor: isSelected ? colors.onPrimary : colors.accent }]} />
          ) : null}
          {showCaratDot && hasCarats ? (
            <View style={[styles.dot, { backgroundColor: isSelected ? colors.onPrimary : colors.accentMid, marginLeft: hasEntry ? 2 : 0 }]} />
          ) : null}
          {!hasEntry && (!showCaratDot || !hasCarats) ? <View style={styles.dotPlaceholder} /> : null}
        </View>
      </Animated.View>
    </Pressable>
  );
}

// ─── Main Calendar ────────────────────────────────────────────────────────────
export default function MonthCalendar() {
  const { colors } = useTheme();
  const {
    currentYear, currentMonth, selectedDate,
    setSelectedDate, setCurrentMonth, entries, dateColors, setDateColor, caratEnabled,
  } = useApp();

  const [longPressDate, setLongPressDate] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const today = formatDate(new Date());
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const entryMap = new Map(entries.map(e => [e.date, e]));

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
    longPressTimer.current = setTimeout(() => setLongPressDate(dateStr), 600);
  };
  const handlePressOut = () => {
    if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; }
  };
  const handleDayPress = (dateStr: string) => {
    if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; }
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
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {/* Calendar Header */}
      <View style={[styles.headerBar, { backgroundColor: colors.gradientPrimaryStart }]}>
        <Pressable onPress={goToPrev} style={styles.navBtn} hitSlop={8}>
          <Text style={styles.navBtnText}>‹</Text>
        </Pressable>
        <Pressable onPress={() => setShowPicker(true)} style={styles.monthTitle}>
          <Text style={styles.monthTitleText}>{MONTH_NAMES[currentMonth - 1]} {currentYear}</Text>
        </Pressable>
        <Pressable onPress={goToNext} style={styles.navBtn} hitSlop={8}>
          <Text style={styles.navBtnText}>›</Text>
        </Pressable>
        <Pressable onPress={goToToday} style={styles.todayBtn}>
          <Text style={styles.todayBtnText}>Today</Text>
        </Pressable>
      </View>

      {/* Day name row */}
      <View style={[styles.dayNamesRow, { backgroundColor: colors.primaryLight }]}>
        {DAY_NAMES.map((d, i) => (
          <Text key={d} style={[styles.dayName, { color: i === 0 ? colors.error : colors.primary }]}>{d}</Text>
        ))}
      </View>

      {/* Calendar grid */}
      <View style={styles.gridArea}>
        {weeks.map((week, wi) => (
          <View key={wi} style={styles.weekRow}>
            {week.map((cell, ci) => {
              if (!cell) return <View key={ci} style={styles.dayCell} />;
              const { day, dateStr } = cell;
              const entry = entryMap.get(dateStr);
              const isSunday = ci === 0;
              const customColor = dateColors[dateStr];
              const isRed = customColor === 'red' || (isSunday && !customColor);
              return (
                <DayCell
                  key={dateStr}
                  day={day}
                  dateStr={dateStr}
                  isToday={dateStr === today}
                  isSelected={dateStr === selectedDate}
                  isRed={isRed}
                  hasEntry={!!entry && entry.workCount > 0}
                  hasCarats={!!(entry?.caratWeight && entry.caratWeight > 0)}
                  showCaratDot={caratEnabled}
                  onPress={() => handleDayPress(dateStr)}
                  onPressIn={() => handlePressIn(dateStr)}
                  onPressOut={handlePressOut}
                  colors={colors}
                />
              );
            })}
          </View>
        ))}
      </View>

      {/* Legend strip */}
      <View style={[styles.legendStrip, { borderTopColor: colors.border }]}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.accent }]} />
          <Text style={[styles.legendText, { color: colors.onSurfaceSubtle }]}>Units</Text>
        </View>
        {caratEnabled ? (
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.accentMid }]} />
            <Text style={[styles.legendText, { color: colors.onSurfaceSubtle }]}>Carats</Text>
          </View>
        ) : null}
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.primary, borderWidth: 2, borderColor: colors.primary }]} />
          <Text style={[styles.legendText, { color: colors.onSurfaceSubtle }]}>Today</Text>
        </View>
      </View>

      <LongPressMenu
        visible={!!longPressDate}
        date={longPressDate || ''}
        onClose={() => setLongPressDate(null)}
        onMakeRed={() => { if (longPressDate) setDateColor(longPressDate, 'red'); setLongPressDate(null); }}
        onReset={() => { if (longPressDate) setDateColor(longPressDate, 'default'); setLongPressDate(null); }}
        colors={colors}
      />
      <MonthPicker
        visible={showPicker}
        year={currentYear}
        month={currentMonth}
        onClose={() => setShowPicker(false)}
        onSelect={(y, m) => setCurrentMonth(y, m)}
        colors={colors}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderRadius: Radius.xl, overflow: 'hidden', ...Shadow.md },

  headerBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md,
  },
  navBtn: {
    width: 36, height: 36, borderRadius: Radius.full,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  navBtnText: { fontSize: 22, color: '#FFFFFF', lineHeight: 26, fontWeight: '700' },
  monthTitle: { flex: 1, marginHorizontal: Spacing.sm },
  monthTitleText: { ...Typography.headlineMedium, color: '#FFFFFF' },
  todayBtn: {
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
    borderRadius: Radius.full, backgroundColor: 'rgba(255,255,255,0.22)',
  },
  todayBtnText: { ...Typography.labelMedium, color: '#FFFFFF' },

  dayNamesRow: {
    flexDirection: 'row', paddingVertical: Spacing.xs, paddingHorizontal: Spacing.xs,
  },
  dayName: {
    flex: 1, textAlign: 'center',
    ...Typography.labelSmall, fontWeight: '700', paddingVertical: 4,
  },

  gridArea: { paddingHorizontal: Spacing.xs, paddingTop: Spacing.xs, paddingBottom: 2 },
  weekRow: { flexDirection: 'row' },
  dayCell: { flex: 1, alignItems: 'center', paddingVertical: 3 },
  dayInner: {
    width: 38, height: 44, borderRadius: Radius.md,
    alignItems: 'center', justifyContent: 'center',
  },
  dayNumber: { ...Typography.bodyMedium },
  dotRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  dot: { width: 5, height: 5, borderRadius: 3 },
  dotPlaceholder: { width: 5, height: 5 },

  legendStrip: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg, borderTopWidth: 1,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginRight: Spacing.xl },
  legendDot: { width: 8, height: 8, borderRadius: 4, marginRight: 5 },
  legendText: { ...Typography.labelSmall, fontSize: 10 },

  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  contextMenu: { borderRadius: Radius.xl, width: 240, overflow: 'hidden', ...Shadow.lg },
  contextTitle: {
    ...Typography.labelMedium, textAlign: 'center',
    padding: Spacing.lg, borderBottomWidth: 1,
  },
  contextItem: { padding: Spacing.lg, alignItems: 'center' },
  contextItemText: { ...Typography.bodyLarge },
  contextDivider: { height: 1 },

  pickerContainer: { borderRadius: Radius.xl, width: 300, padding: Spacing.lg, ...Shadow.lg },
  pickerHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: Spacing.lg,
  },
  pickerArrow: { padding: Spacing.sm },
  pickerArrowText: { fontSize: 28, lineHeight: 32 },
  pickerYear: { ...Typography.headlineLarge },
  pickerMonths: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -Spacing.xs },
  pickerMonth: {
    width: '30%', margin: Spacing.xs,
    paddingVertical: Spacing.md, borderRadius: Radius.md, alignItems: 'center',
  },
  pickerMonthText: { ...Typography.labelLarge },
});
