import React, { useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Dimensions,
} from 'react-native';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import { parseDate } from '@/services/storage';

export interface DayBar {
  date: string;   // YYYY-MM-DD
  day: number;    // 1-31
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

export default function MonthlyBarChart({
  bars,
  maxCount,
  rate,
  onBarPress,
  selectedDate,
}: MonthlyBarChartProps) {
  const scrollRef = useRef<ScrollView>(null);

  if (bars.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No work entries this month yet.</Text>
        <Text style={styles.emptySubText}>Tap any calendar date to log work units.</Text>
      </View>
    );
  }

  const effective = maxCount > 0 ? maxCount : 1;

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingRight: Spacing.xl },
      ]}
    >
      {bars.map((bar) => {
        const barH = bar.count > 0
          ? Math.max(MIN_BAR_HEIGHT, (bar.count / effective) * CHART_HEIGHT)
          : 0;

        const isSelected = bar.date === selectedDate;

        let barColor = Colors.primary;
        if (bar.isBest && bar.count > 0) barColor = Colors.accent;
        if (bar.isSunday && !bar.isBest) barColor = Colors.error;
        if (isSelected) barColor = Colors.primaryDark;

        const d = parseDate(bar.date);
        const weekday = d.toLocaleDateString('en-IN', { weekday: 'short' }).slice(0, 2);

        return (
          <Pressable
            key={bar.date}
            style={styles.barWrapper}
            onPress={() => onBarPress?.(bar.date)}
          >
            {/* Best tag */}
            {bar.isBest && bar.count > 0 ? (
              <View style={styles.bestTag}>
                <Text style={styles.bestTagText}>Best</Text>
              </View>
            ) : <View style={styles.bestTagPlaceholder} />}

            {/* Count label */}
            <Text style={[
              styles.countLabel,
              bar.count === 0 && styles.countLabelZero,
            ]}>
              {bar.count > 0 ? bar.count : ''}
            </Text>

            {/* Bar track */}
            <View style={styles.barTrack}>
              <View style={styles.barBg}>
                {bar.count > 0 ? (
                  <View
                    style={[
                      styles.barFill,
                      {
                        height: barH,
                        backgroundColor: barColor,
                        opacity: isSelected ? 1 : 0.85,
                        borderRadius: bar.isBest ? Radius.sm : 4,
                      },
                    ]}
                  />
                ) : (
                  <View style={styles.barEmpty} />
                )}
              </View>
            </View>

            {/* Today ring */}
            <View style={[
              styles.dayLabel,
              bar.isToday && styles.dayLabelToday,
              isSelected && styles.dayLabelSelected,
            ]}>
              <Text style={[
                styles.dayNum,
                bar.isSunday && styles.dayNumSunday,
                (bar.isToday || isSelected) && styles.dayNumHighlight,
              ]}>
                {bar.day}
              </Text>
              <Text style={[
                styles.weekdayLabel,
                (bar.isToday || isSelected) && styles.dayNumHighlight,
              ]}>
                {weekday}
              </Text>
            </View>

            {/* Earnings tooltip for selected */}
            {isSelected && bar.count > 0 ? (
              <View style={styles.earningsTooltip}>
                <Text style={styles.earningsTooltipText}>{formatRupee(bar.count * rate)}</Text>
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingLeft: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    alignItems: 'flex-end',
  },
  emptyContainer: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyText: {
    ...Typography.headlineSmall,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  emptySubText: {
    ...Typography.bodyMedium,
    color: Colors.onSurfaceSubtle,
    textAlign: 'center',
  },
  barWrapper: {
    width: BAR_WIDTH + BAR_SPACING,
    alignItems: 'center',
    marginRight: 0,
  },
  bestTag: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.full,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginBottom: 2,
  },
  bestTagText: {
    ...Typography.labelSmall,
    color: '#fff',
    fontSize: 9,
  },
  bestTagPlaceholder: {
    height: 18,
    marginBottom: 2,
  },
  countLabel: {
    ...Typography.labelSmall,
    color: Colors.onSurface,
    fontSize: 10,
    height: 14,
    marginBottom: 4,
  },
  countLabelZero: {
    color: Colors.border,
  },
  barTrack: {
    height: CHART_HEIGHT,
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: BAR_WIDTH,
  },
  barBg: {
    width: BAR_WIDTH - 4,
    height: CHART_HEIGHT,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight + '55',
    borderRadius: 4,
  },
  barFill: {
    width: '100%',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  barEmpty: {
    width: '100%',
    height: 2,
    backgroundColor: Colors.border,
    borderRadius: 2,
  },
  dayLabel: {
    marginTop: 6,
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 3,
    borderRadius: Radius.md,
    minWidth: BAR_WIDTH - 2,
  },
  dayLabelToday: {
    backgroundColor: Colors.primaryLight,
  },
  dayLabelSelected: {
    backgroundColor: Colors.primary,
  },
  dayNum: {
    ...Typography.labelMedium,
    color: Colors.onSurface,
    fontSize: 12,
  },
  dayNumSunday: {
    color: Colors.error,
  },
  dayNumHighlight: {
    color: Colors.primary,
  },
  weekdayLabel: {
    fontSize: 9,
    color: Colors.onSurfaceSubtle,
    fontWeight: '500',
  },
  earningsTooltip: {
    backgroundColor: Colors.primaryDark,
    borderRadius: Radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 3,
    marginTop: 4,
  },
  earningsTooltipText: {
    ...Typography.labelSmall,
    color: Colors.onPrimary,
    fontSize: 10,
  },
});
