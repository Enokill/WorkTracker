import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Typography, Spacing, Radius, Shadow } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/hooks/useApp';
import { formatDate, parseDate, getMonthKey } from '@/services/storage';
import MonthlyBarChart, { DayBar } from '@/components/feature/MonthlyBarChart';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function formatRupee(n: number): string {
  return '₹' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
function formatCount(n: number): string {
  return n.toLocaleString('en-IN');
}

export default function ReportScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { entries, settings, selectedDate, setSelectedDate, currentYear, currentMonth, setCurrentMonth } = useApp();

  const [reportYear, setReportYear] = useState(currentYear);
  const [reportMonth, setReportMonth] = useState(currentMonth);
  const today = formatDate(new Date());

  const goPrev = () => {
    if (reportMonth === 1) { setReportYear(y => y - 1); setReportMonth(12); }
    else setReportMonth(m => m - 1);
  };
  const goNext = () => {
    if (reportMonth === 12) { setReportYear(y => y + 1); setReportMonth(1); }
    else setReportMonth(m => m + 1);
  };

  const monthPrefix = getMonthKey(reportYear, reportMonth);
  const daysInMonth = new Date(reportYear, reportMonth, 0).getDate();

  const monthEntries = useMemo(() => entries.filter(e => e.date.startsWith(monthPrefix)), [entries, monthPrefix]);
  const entryMap = useMemo(() => {
    const m: Record<string, number> = {};
    monthEntries.forEach(e => { m[e.date] = e.workCount; });
    return m;
  }, [monthEntries]);

  const bars: DayBar[] = useMemo(() => {
    const result: DayBar[] = [];
    let maxCount = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${monthPrefix}-${String(d).padStart(2, '0')}`;
      const count = entryMap[dateStr] || 0;
      if (count > maxCount) maxCount = count;
      result.push({
        date: dateStr, day: d, count,
        isBest: false,
        isToday: dateStr === today,
        isSunday: new Date(reportYear, reportMonth - 1, d).getDay() === 0,
      });
    }
    if (maxCount > 0) {
      const bestIdx = result.findIndex(b => b.count === maxCount);
      if (bestIdx >= 0) result[bestIdx] = { ...result[bestIdx], isBest: true };
    }
    return result;
  }, [monthPrefix, daysInMonth, entryMap, today, reportYear, reportMonth]);

  const maxCount = Math.max(...bars.map(b => b.count), 0);
  const daysWorked = monthEntries.length;
  const totalUnits = monthEntries.reduce((s, e) => s + e.workCount, 0);
  const totalCarats = monthEntries.reduce((s, e) => s + (e.caratWeight ?? 0), 0);
  const caratRate = settings.caratRate ?? 100;
  const unitEarnings = totalUnits * settings.ratePerUnit;
  const caratEarnings = totalCarats * caratRate;
  const totalEarnings = unitEarnings + caratEarnings;
  const avgUnits = daysWorked > 0 ? Math.round(totalUnits / daysWorked) : 0;
  const bestBar = bars.find(b => b.isBest && b.count > 0);
  const bestDate = bestBar ? parseDate(bestBar.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—';
  const bestCount = bestBar ? bestBar.count : 0;

  const handleBarPress = (date: string) => {
    setSelectedDate(date);
    setCurrentMonth(reportYear, reportMonth);
  };

  const sortedEntries = [...monthEntries].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <View>
          <Text style={[styles.title, { color: colors.onSurface }]}>Monthly Report</Text>
          <Text style={[styles.subtitle, { color: colors.onSurfaceSubtle }]}>Units & carats breakdown</Text>
        </View>
        <Pressable
          style={[styles.todayBtn, { backgroundColor: colors.primaryLight }]}
          onPress={() => { const now = new Date(); setReportYear(now.getFullYear()); setReportMonth(now.getMonth() + 1); }}
        >
          <Text style={[styles.todayBtnText, { color: colors.primary }]}>This Month</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Month nav */}
        <View style={[styles.monthNav, { backgroundColor: colors.surface }]}>
          <Pressable onPress={goPrev} style={[styles.navBtn, { backgroundColor: colors.primaryLight }]} hitSlop={8}>
            <MaterialIcons name="chevron-left" size={24} color={colors.primary} />
          </Pressable>
          <Text style={[styles.monthLabel, { color: colors.onSurface }]}>
            {MONTH_NAMES[reportMonth - 1]} {reportYear}
          </Text>
          <Pressable onPress={goNext} style={[styles.navBtn, { backgroundColor: colors.primaryLight }]} hitSlop={8}>
            <MaterialIcons name="chevron-right" size={24} color={colors.primary} />
          </Pressable>
        </View>

        {/* Earnings banner */}
        <View style={[styles.earningsBanner, { backgroundColor: colors.primary }]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerLabel}>Total Earnings</Text>
            <Text style={styles.bannerAmount}>{formatRupee(totalEarnings)}</Text>
            <View style={styles.bannerBreakRow}>
              {totalUnits > 0 ? (
                <View style={styles.bannerChip}>
                  <Text style={styles.bannerChipText}>Units: {formatRupee(unitEarnings)}</Text>
                </View>
              ) : null}
              {totalCarats > 0 ? (
                <View style={[styles.bannerChip, { marginLeft: 6 }]}>
                  <MaterialIcons name="diamond" size={10} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.bannerChipText}>{totalCarats.toFixed(2)} ct: {formatRupee(caratEarnings)}</Text>
                </View>
              ) : null}
            </View>
          </View>
          <View style={styles.bannerDivider} />
          <View style={styles.bannerRight}>
            <Text style={styles.bannerSmallLabel}>Days Worked</Text>
            <Text style={styles.bannerSmallValue}>{daysWorked}</Text>
            <Text style={styles.bannerSmallLabel}>of {daysInMonth} days</Text>
          </View>
        </View>

        {/* Stat cards */}
        <View style={styles.statRow}>
          {[
            { icon: 'bar-chart', label: 'Total Units', value: formatCount(totalUnits), sub: 'this month', accent: colors.primary },
            { icon: 'trending-up', label: 'Daily Avg', value: avgUnits > 0 ? formatCount(avgUnits) : '—', sub: 'units/day', accent: colors.secondary },
          ].map(s => (
            <View key={s.label} style={[styles.statCard, { backgroundColor: colors.surface, borderTopColor: s.accent }]}>
              <MaterialIcons name={s.icon as any} size={20} color={s.accent} />
              <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>{s.label}</Text>
              <Text style={[styles.statValue, { color: s.accent }]}>{s.value}</Text>
              <Text style={[styles.statSub, { color: colors.onSurfaceSubtle }]}>{s.sub}</Text>
            </View>
          ))}
        </View>
        <View style={styles.statRow}>
          {[
            { icon: 'star', label: 'Best Day', value: bestDate, sub: bestCount > 0 ? `${formatCount(bestCount)} units` : 'No entries', accent: colors.accent },
            { icon: 'diamond', label: 'Month Carats', value: totalCarats > 0 ? totalCarats.toFixed(2) + ' ct' : '—', sub: totalCarats > 0 ? formatRupee(caratEarnings) : 'no carat entries', accent: colors.accentMid },
          ].map(s => (
            <View key={s.label} style={[styles.statCard, { backgroundColor: colors.surface, borderTopColor: s.accent }]}>
              <MaterialIcons name={s.icon as any} size={20} color={s.accent} />
              <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>{s.label}</Text>
              <Text style={[styles.statValue, { color: s.accent }]}>{s.value}</Text>
              <Text style={[styles.statSub, { color: colors.onSurfaceSubtle }]}>{s.sub}</Text>
            </View>
          ))}
        </View>

        {/* Bar chart */}
        <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Daily Work Units</Text>
        <View style={[styles.chartCard, { backgroundColor: colors.surface }]}>
          <View style={styles.yAxisHint}>
            <Text style={[styles.yAxisLabel, { color: colors.onSurfaceSubtle }]}>{maxCount > 0 ? formatCount(maxCount) : ''}</Text>
            <Text style={[styles.yAxisLabel, { color: colors.onSurfaceSubtle }]}>{maxCount > 0 ? formatCount(Math.round(maxCount / 2)) : ''}</Text>
            <Text style={[styles.yAxisLabel, { color: colors.onSurfaceSubtle }]}>0</Text>
          </View>
          <View style={{ flex: 1 }}>
            <MonthlyBarChart
              bars={bars}
              maxCount={maxCount}
              rate={settings.ratePerUnit}
              onBarPress={handleBarPress}
              selectedDate={selectedDate}
            />
          </View>
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          {[
            { color: colors.accent, label: 'Best day' },
            { color: colors.primary, label: 'Worked' },
            { color: colors.error, label: 'Sunday' },
            { color: colors.primaryLight, label: 'Today', border: colors.primary },
          ].map(l => (
            <View key={l.label} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: l.color, borderWidth: l.border ? 1 : 0, borderColor: l.border }]} />
              <Text style={[styles.legendText, { color: colors.onSurfaceVariant }]}>{l.label}</Text>
            </View>
          ))}
        </View>

        {/* Entry list */}
        {sortedEntries.length > 0 ? (
          <>
            <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Entry Log</Text>
            <View style={[styles.entryListCard, { backgroundColor: colors.surface }]}>
              {sortedEntries.map((entry, idx) => {
                const d = parseDate(entry.date);
                const DAYS_S = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                const MONTHS_S = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                const label = `${DAYS_S[d.getDay()]}, ${d.getDate()} ${MONTHS_S[d.getMonth()]}`;
                const entryEarnings = (entry.workCount * settings.ratePerUnit) + ((entry.caratWeight ?? 0) * caratRate);
                const isBest = bestBar?.date === entry.date;
                return (
                  <Pressable
                    key={entry.date}
                    style={[
                      styles.entryRow,
                      idx < sortedEntries.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                      isBest && { backgroundColor: colors.accentLight },
                    ]}
                    onPress={() => router.push(`/entry/${entry.date}`)}
                  >
                    <View style={styles.entryLeft}>
                      <Text style={[styles.entryDate, { color: isBest ? colors.accent : colors.onSurface }]}>{label}</Text>
                      <View style={styles.entryBadgeRow}>
                        {entry.workCount > 0 ? (
                          <Text style={[styles.entryUnits, { color: colors.onSurfaceVariant }]}>{formatCount(entry.workCount)} units</Text>
                        ) : null}
                        {entry.caratWeight && entry.caratWeight > 0 ? (
                          <View style={styles.caratBadge}>
                            <MaterialIcons name="diamond" size={10} color={colors.accentMid} />
                            <Text style={[styles.caratBadgeText, { color: colors.accentMid }]}>{entry.caratWeight.toFixed(2)} ct</Text>
                          </View>
                        ) : null}
                      </View>
                      {entry.notes ? <Text style={[styles.entryNotes, { color: colors.onSurfaceVariant }]} numberOfLines={1}>{entry.notes}</Text> : null}
                    </View>
                    <View style={styles.entryRight}>
                      <Text style={[styles.entryEarnings, { color: isBest ? colors.accent : colors.primary }]}>{formatRupee(entryEarnings)}</Text>
                    </View>
                    {isBest ? (
                      <View style={[styles.bestBadge, { backgroundColor: colors.accent }]}>
                        <Text style={styles.bestBadgeText}>★</Text>
                      </View>
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
          </>
        ) : null}

        {monthEntries.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="insert-chart-outlined" size={48} color={colors.border} />
            <Text style={[styles.emptyTitle, { color: colors.onSurfaceVariant }]}>No entries for {MONTH_NAMES[reportMonth - 1]}</Text>
            <Text style={[styles.emptySub, { color: colors.onSurfaceSubtle }]}>Go to Home and tap a date to log work.</Text>
          </View>
        ) : null}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
  },
  title: { ...Typography.headlineLarge },
  subtitle: { ...Typography.bodySmall },
  todayBtn: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: Radius.full },
  todayBtnText: { ...Typography.labelMedium },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm },

  monthNav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.lg, borderRadius: Radius.lg, paddingVertical: Spacing.md, ...Shadow.sm,
  },
  navBtn: { padding: Spacing.sm, borderRadius: Radius.full },
  monthLabel: {
    ...Typography.headlineMedium, marginHorizontal: Spacing.xl,
    minWidth: 160, textAlign: 'center',
  },

  earningsBanner: {
    borderRadius: Radius.xl, padding: Spacing.xl,
    flexDirection: 'row', alignItems: 'center',
    marginBottom: Spacing.md, ...Shadow.md,
  },
  bannerLabel: { ...Typography.labelMedium, color: 'rgba(255,255,255,0.75)', marginBottom: 4 },
  bannerAmount: { ...Typography.displayMedium, color: '#fff' },
  bannerBreakRow: { flexDirection: 'row', marginTop: 4 },
  bannerChip: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full,
  },
  bannerChipText: { ...Typography.labelSmall, color: 'rgba(255,255,255,0.85)', marginLeft: 3 },
  bannerDivider: { width: 1, height: 56, backgroundColor: 'rgba(255,255,255,0.25)', marginHorizontal: Spacing.xl },
  bannerRight: { alignItems: 'center' },
  bannerSmallLabel: { ...Typography.labelSmall, color: 'rgba(255,255,255,0.7)' },
  bannerSmallValue: { ...Typography.displayMedium, color: '#fff' },

  statRow: { flexDirection: 'row', marginBottom: Spacing.md },
  statCard: {
    flex: 1, borderRadius: Radius.lg, padding: Spacing.lg, borderTopWidth: 3, ...Shadow.sm,
    marginRight: Spacing.md,
  },
  statLabel: { ...Typography.labelSmall, marginTop: 6, marginBottom: 2 },
  statValue: { ...Typography.headlineMedium },
  statSub: { ...Typography.bodySmall, marginTop: 2 },

  sectionTitle: { ...Typography.headlineSmall, marginBottom: Spacing.md, marginTop: Spacing.sm },
  chartCard: {
    borderRadius: Radius.xl, paddingTop: Spacing.md, paddingBottom: Spacing.md,
    overflow: 'hidden', flexDirection: 'row', ...Shadow.md, marginBottom: Spacing.sm,
  },
  yAxisHint: {
    width: 36, justifyContent: 'space-between', alignItems: 'flex-end',
    paddingVertical: Spacing.md, paddingRight: 6, paddingBottom: 52,
  },
  yAxisLabel: { ...Typography.labelSmall, fontSize: 9 },

  legend: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: Spacing.xl },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginRight: Spacing.lg, marginBottom: Spacing.xs },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
  legendText: { ...Typography.labelSmall },

  entryListCard: { borderRadius: Radius.xl, overflow: 'hidden', ...Shadow.sm, marginBottom: Spacing.md },
  entryRow: { flexDirection: 'row', alignItems: 'center', padding: Spacing.lg },
  entryLeft: { flex: 1 },
  entryDate: { ...Typography.labelLarge },
  entryBadgeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  entryUnits: { ...Typography.bodySmall, marginRight: 8 },
  caratBadge: { flexDirection: 'row', alignItems: 'center' },
  caratBadgeText: { ...Typography.bodySmall, marginLeft: 3 },
  entryNotes: { ...Typography.bodySmall, marginTop: 2 },
  entryRight: { alignItems: 'flex-end', marginRight: Spacing.sm },
  entryEarnings: { ...Typography.headlineSmall },
  bestBadge: { width: 22, height: 22, borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center' },
  bestBadgeText: { color: '#fff', fontSize: 12 },

  emptyState: { alignItems: 'center', paddingVertical: Spacing.xxxl },
  emptyTitle: { ...Typography.headlineSmall, marginTop: Spacing.md, marginBottom: Spacing.sm },
  emptySub: { ...Typography.bodyMedium, textAlign: 'center' },
});
