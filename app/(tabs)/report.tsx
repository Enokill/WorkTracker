import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, Radius, Shadow } from '@/constants/theme';
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

interface StatCardProps {
  icon: string;
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}

function StatCard({ icon, label, value, sub, accent = Colors.primary }: StatCardProps) {
  return (
    <View style={[styles.statCard, { borderTopColor: accent }]}>
      <MaterialIcons name={icon as any} size={20} color={accent} />
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color: accent }]}>{value}</Text>
      {sub ? <Text style={styles.statSub}>{sub}</Text> : null}
    </View>
  );
}

export default function ReportScreen() {
  const router = useRouter();
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

  const monthEntries = useMemo(() => {
    return entries.filter(e => e.date.startsWith(monthPrefix));
  }, [entries, monthPrefix]);

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
      const dayOfWeek = new Date(reportYear, reportMonth - 1, d).getDay();
      result.push({
        date: dateStr,
        day: d,
        count,
        isBest: false,
        isToday: dateStr === today,
        isSunday: dayOfWeek === 0,
      });
    }
    // Mark best
    if (maxCount > 0) {
      const bestIdx = result.findIndex(b => b.count === maxCount);
      if (bestIdx >= 0) result[bestIdx] = { ...result[bestIdx], isBest: true };
    }
    return result;
  }, [monthPrefix, daysInMonth, entryMap, today, reportYear, reportMonth]);

  const maxCount = Math.max(...bars.map(b => b.count), 0);

  // Stats
  const daysWorked = monthEntries.length;
  const totalUnits = monthEntries.reduce((s, e) => s + e.workCount, 0);
  const avgUnits = daysWorked > 0 ? Math.round(totalUnits / daysWorked) : 0;
  const totalEarnings = totalUnits * settings.ratePerUnit;

  const bestBar = bars.find(b => b.isBest && b.count > 0);
  const bestDate = bestBar ? parseDate(bestBar.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—';
  const bestCount = bestBar ? bestBar.count : 0;

  const handleBarPress = (date: string) => {
    setSelectedDate(date);
    setCurrentMonth(reportYear, reportMonth);
  };

  // Entry list for this month
  const sortedEntries = [...monthEntries].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Monthly Report</Text>
          <Text style={styles.subtitle}>Work units &amp; earnings breakdown</Text>
        </View>
        <Pressable
          style={styles.todayBtn}
          onPress={() => {
            const now = new Date();
            setReportYear(now.getFullYear());
            setReportMonth(now.getMonth() + 1);
          }}
        >
          <Text style={styles.todayBtnText}>This Month</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Month nav */}
        <View style={styles.monthNav}>
          <Pressable onPress={goPrev} style={styles.navBtn} hitSlop={8}>
            <MaterialIcons name="chevron-left" size={24} color={Colors.primary} />
          </Pressable>
          <Text style={styles.monthLabel}>
            {MONTH_NAMES[reportMonth - 1]} {reportYear}
          </Text>
          <Pressable onPress={goNext} style={styles.navBtn} hitSlop={8}>
            <MaterialIcons name="chevron-right" size={24} color={Colors.primary} />
          </Pressable>
        </View>

        {/* Summary earnings banner */}
        <View style={styles.earningsBanner}>
          <View>
            <Text style={styles.bannerLabel}>Total Earnings</Text>
            <Text style={styles.bannerAmount}>{formatRupee(totalEarnings)}</Text>
            <Text style={styles.bannerSub}>
              {formatCount(totalUnits)} units @ ₹{settings.ratePerUnit.toFixed(2)}/unit
            </Text>
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
          <StatCard
            icon="bar-chart"
            label="Total Units"
            value={formatCount(totalUnits)}
            sub="this month"
            accent={Colors.primary}
          />
          <View style={{ width: Spacing.md }} />
          <StatCard
            icon="trending-up"
            label="Daily Avg"
            value={avgUnits > 0 ? formatCount(avgUnits) : '—'}
            sub="units/day"
            accent={Colors.secondary}
          />
        </View>
        <View style={styles.statRow}>
          <StatCard
            icon="star"
            label="Best Day"
            value={bestDate}
            sub={bestCount > 0 ? `${formatCount(bestCount)} units` : 'No entries'}
            accent={Colors.accent}
          />
          <View style={{ width: Spacing.md }} />
          <StatCard
            icon="currency-rupee"
            label="Per Day Avg"
            value={daysWorked > 0 ? formatRupee(totalEarnings / daysWorked) : '—'}
            sub="earned avg"
            accent={Colors.warning}
          />
        </View>

        {/* Bar chart */}
        <Text style={styles.sectionTitle}>Daily Work Units</Text>
        <View style={styles.chartCard}>
          {/* Y-axis hint */}
          <View style={styles.yAxisHint}>
            <Text style={styles.yAxisLabel}>{maxCount > 0 ? formatCount(maxCount) : ''}</Text>
            <Text style={styles.yAxisLabel}>{maxCount > 0 ? formatCount(Math.round(maxCount / 2)) : ''}</Text>
            <Text style={styles.yAxisLabel}>0</Text>
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
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.accent }]} />
            <Text style={styles.legendText}>Best day</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.primary }]} />
            <Text style={styles.legendText}>Worked</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.error }]} />
            <Text style={styles.legendText}>Sunday</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.primaryLight, borderWidth: 1, borderColor: Colors.primary }]} />
            <Text style={styles.legendText}>Today</Text>
          </View>
        </View>

        {/* Entry list */}
        {sortedEntries.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>Entry Log</Text>
            <View style={styles.entryListCard}>
              {sortedEntries.map((entry, idx) => {
                const d = parseDate(entry.date);
                const label = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
                const earnings = entry.workCount * settings.ratePerUnit;
                const isBest = bestBar?.date === entry.date;
                return (
                  <Pressable
                    key={entry.date}
                    style={[
                      styles.entryRow,
                      idx < sortedEntries.length - 1 && styles.entryRowBorder,
                      isBest && styles.entryRowBest,
                    ]}
                    onPress={() => router.push(`/entry/${entry.date}`)}
                  >
                    <View style={styles.entryLeft}>
                      <Text style={[styles.entryDate, isBest && { color: Colors.accent }]}>{label}</Text>
                      {entry.notes ? (
                        <Text style={styles.entryNotes} numberOfLines={1}>{entry.notes}</Text>
                      ) : null}
                    </View>
                    <View style={styles.entryRight}>
                      <Text style={styles.entryUnits}>{formatCount(entry.workCount)} units</Text>
                      <Text style={[styles.entryEarnings, isBest && { color: Colors.accent }]}>
                        {formatRupee(earnings)}
                      </Text>
                    </View>
                    {isBest ? (
                      <View style={styles.bestBadge}>
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
            <MaterialIcons name="insert-chart-outlined" size={48} color={Colors.border} />
            <Text style={styles.emptyTitle}>No entries for {MONTH_NAMES[reportMonth - 1]}</Text>
            <Text style={styles.emptySub}>Go to Home and tap a date to log your work units.</Text>
          </View>
        ) : null}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.background,
  },
  title: { ...Typography.headlineLarge, color: Colors.onSurface },
  subtitle: { ...Typography.bodySmall, color: Colors.onSurfaceSubtle },
  todayBtn: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  todayBtnText: { ...Typography.labelMedium, color: Colors.primary },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm },

  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    ...Shadow.sm,
  },
  navBtn: {
    padding: Spacing.sm,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryLight,
  },
  monthLabel: {
    ...Typography.headlineMedium,
    color: Colors.onSurface,
    marginHorizontal: Spacing.xl,
    minWidth: 160,
    textAlign: 'center',
  },

  earningsBanner: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    ...Shadow.md,
  },
  bannerLabel: { ...Typography.labelMedium, color: 'rgba(255,255,255,0.75)', marginBottom: 4 },
  bannerAmount: { ...Typography.displayMedium, color: Colors.onPrimary },
  bannerSub: { ...Typography.bodySmall, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  bannerDivider: { width: 1, height: 56, backgroundColor: 'rgba(255,255,255,0.25)', marginHorizontal: Spacing.xl },
  bannerRight: { alignItems: 'center' },
  bannerSmallLabel: { ...Typography.labelSmall, color: 'rgba(255,255,255,0.7)' },
  bannerSmallValue: { ...Typography.displayMedium, color: Colors.onPrimary },

  statRow: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderTopWidth: 3,
    ...Shadow.sm,
  },
  statLabel: { ...Typography.labelSmall, color: Colors.onSurfaceVariant, marginTop: 6, marginBottom: 2 },
  statValue: { ...Typography.headlineMedium, color: Colors.onSurface },
  statSub: { ...Typography.bodySmall, color: Colors.onSurfaceSubtle, marginTop: 2 },

  sectionTitle: {
    ...Typography.headlineSmall,
    color: Colors.onSurface,
    marginBottom: Spacing.md,
    marginTop: Spacing.sm,
  },
  chartCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    overflow: 'hidden',
    flexDirection: 'row',
    ...Shadow.md,
    marginBottom: Spacing.sm,
  },
  yAxisHint: {
    width: 36,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingVertical: Spacing.md,
    paddingRight: 6,
    paddingBottom: 52,
  },
  yAxisLabel: { ...Typography.labelSmall, color: Colors.onSurfaceSubtle, fontSize: 9 },

  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Spacing.xl,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginRight: Spacing.lg, marginBottom: Spacing.xs },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
  legendText: { ...Typography.labelSmall, color: Colors.onSurfaceVariant },

  entryListCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    ...Shadow.sm,
    marginBottom: Spacing.md,
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  entryRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  entryRowBest: {
    backgroundColor: Colors.accentLight,
  },
  entryLeft: { flex: 1 },
  entryDate: { ...Typography.labelLarge, color: Colors.onSurface },
  entryNotes: { ...Typography.bodySmall, color: Colors.onSurfaceVariant, marginTop: 2 },
  entryRight: { alignItems: 'flex-end', marginRight: Spacing.sm },
  entryUnits: { ...Typography.bodySmall, color: Colors.onSurfaceVariant },
  entryEarnings: { ...Typography.headlineSmall, color: Colors.primary },
  bestBadge: {
    backgroundColor: Colors.accent,
    width: 22,
    height: 22,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bestBadgeText: { color: '#fff', fontSize: 12 },

  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
  },
  emptyTitle: {
    ...Typography.headlineSmall,
    color: Colors.onSurfaceVariant,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  emptySub: {
    ...Typography.bodyMedium,
    color: Colors.onSurfaceSubtle,
    textAlign: 'center',
  },
});
