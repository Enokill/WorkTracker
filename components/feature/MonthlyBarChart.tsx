import React, { useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Typography, Spacing, Radius } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { parseDate } from '@/services/storage';

export interface DayBar {
  date: string;
  day: number;
  count: number;
  isBest: boolean;
  isToday: boolean;
  isSunday: boolean;
}

interface MonthlyBarChartProps {
  bars: DayBar[];
  maxCount: number;
  rate: number;
  onBarPress?: (date: string) => void;
  selectedDate?: string;
}

const BAR_WIDTH = 36;
const BAR_SPACING = 8;
const CHART_HEIGHT = 180;
const MIN_BAR_HEIGHT = 4;

function formatRupee(n: number): string {
  return '₹' + n.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export default function MonthlyBarChart({ bars, maxCount, rate, onBarPress, selectedDate }: MonthlyBarChartProps) {
  const scrollRef = useRef<ScrollView>(null);
  const { colors } = useTheme();

  if (bars.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: colors.onSurfaceVariant }]}>No work entries this month yet.</Text>
        <Text style={[styles.emptySubText, { color: colors.onSurfaceSubtle }]}>Tap any calendar date to log work units.</Text>
      </View>
    );
  }

  const effective = maxCount > 0 ? maxCount : 1;

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.scrollContent, { paddingRight: Spacing.xl }]}
    >
      {bars.map((bar) => {
        const barH = bar.count > 0
          ? Math.max(MIN_BAR_HEIGHT, (bar.count / effective) * CHART_HEIGHT)
          : 0;
        const isSelected = bar.date === selectedDate;

        let barColor = colors.primary;
        if (bar.isBest && bar.count > 0) barColor = colors.accent;
        if (bar.isSunday && !bar.isBest) barColor = colors.error;
        if (isSelected) barColor = colors.primaryDark;

        const d = parseDate(bar.date);
        const weekday = WEEKDAYS[d.getDay()];

        return (
          <Pressable key={bar.date} style={styles.barWrapper} onPress={() => onBarPress?.(bar.date)}>
            {bar.isBest && bar.count > 0 ? (
              <View style={[styles.bestTag, { backgroundColor: colors.accent }]}>
                <Text style={styles.bestTagText}>Best</Text>
              </View>
            ) : <View style={styles.bestTagPlaceholder} />}

            <Text style={[styles.countLabel, { color: bar.count === 0 ? colors.border : colors.onSurface }]}>
              {bar.count > 0 ? bar.count : ''}
            </Text>

            <View style={styles.barTrack}>
              <View style={[styles.barBg, { backgroundColor: colors.primaryLight + '55' }]}>
                {bar.count > 0 ? (
                  <View style={[styles.barFill, { height: barH, backgroundColor: barColor, opacity: isSelected ? 1 : 0.85, borderRadius: bar.isBest ? Radius.sm : 4 }]} />
                ) : (
                  <View style={[styles.barEmpty, { backgroundColor: colors.border }]} />
                )}
              </View>
            </View>

            <View style={[
              styles.dayLabel,
              bar.isToday && { backgroundColor: colors.primaryLight },
              isSelected && { backgroundColor: colors.primary },
            ]}>
              <Text style={[
                styles.dayNum,
                { color: bar.isSunday ? colors.error : colors.onSurface },
                (bar.isToday || isSelected) && { color: isSelected ? colors.onPrimary : colors.primary },
              ]}>
                {bar.day}
              </Text>
              <Text style={[
                styles.weekdayLabel,
                { color: colors.onSurfaceSubtle },
                (bar.isToday || isSelected) && { color: isSelected ? colors.onPrimary : colors.primary },
              ]}>
                {weekday}
              </Text>
            </View>

            {isSelected && bar.count > 0 ? (
              <View style={[styles.earningsTooltip, { backgroundColor: colors.primaryDark }]}>
                <Text style={[styles.earningsTooltipText, { color: colors.onPrimary }]}>{formatRupee(bar.count * rate)}</Text>
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingLeft: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.md, alignItems: 'flex-end' },
  emptyContainer: { height: 200, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xl },
  emptyText: { ...Typography.headlineSmall, textAlign: 'center', marginBottom: Spacing.sm },
  emptySubText: { ...Typography.bodyMedium, textAlign: 'center' },
  barWrapper: { width: BAR_WIDTH + BAR_SPACING, alignItems: 'center' },
  bestTag: { borderRadius: Radius.full, paddingHorizontal: 6, paddingVertical: 2, marginBottom: 2 },
  bestTagText: { ...Typography.labelSmall, color: '#fff', fontSize: 9 },
  bestTagPlaceholder: { height: 18, marginBottom: 2 },
  countLabel: { ...Typography.labelSmall, fontSize: 10, height: 14, marginBottom: 4 },
  barTrack: { height: CHART_HEIGHT, justifyContent: 'flex-end', alignItems: 'center', width: BAR_WIDTH },
  barBg: { width: BAR_WIDTH - 4, height: CHART_HEIGHT, justifyContent: 'flex-end', alignItems: 'center', borderRadius: 4 },
  barFill: { width: '100%', borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  barEmpty: { width: '100%', height: 2, borderRadius: 2 },
  dayLabel: { marginTop: 6, alignItems: 'center', paddingHorizontal: 4, paddingVertical: 3, borderRadius: Radius.md, minWidth: BAR_WIDTH - 2 },
  dayNum: { ...Typography.labelMedium, fontSize: 12 },
  weekdayLabel: { fontSize: 9, fontWeight: '500' },
  earningsTooltip: { borderRadius: Radius.sm, paddingHorizontal: 6, paddingVertical: 3, marginTop: 4 },
  earningsTooltipText: { ...Typography.labelSmall, fontSize: 10 },
});
