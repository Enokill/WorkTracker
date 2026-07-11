import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Shadow } from '@/constants/theme';
import { useApp } from '@/hooks/useApp';
import { parseDate } from '@/services/storage';

function formatRupee(amount: number): string {
  return '₹' + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function formatCount(n: number): string {
  return n.toLocaleString('en-IN');
}

interface EarningsCardProps {
  label: string;
  sublabel: string;
  count: number;
  amount: number;
  iconName: string;
  gradientColors: readonly [string, string];
}

function EarningsCard({ label, sublabel, count, amount, iconName, gradientColors }: EarningsCardProps) {
  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradientCard}
    >
      <View style={styles.cardTopRow}>
        <View style={styles.cardIconWrap}>
          <MaterialIcons name={iconName as any} size={18} color="rgba(255,255,255,0.9)" />
        </View>
        <Text style={styles.gradientCardLabel}>{label}</Text>
      </View>
      <Text style={styles.gradientCardCount}>{formatCount(count)}</Text>
      <Text style={styles.gradientCardUnit}>units</Text>
      <View style={styles.gradientDivider} />
      <View style={styles.cardBottomRow}>
        <Text style={styles.gradientSublabel}>{sublabel}</Text>
        <Text style={styles.gradientCardAmount}>{formatRupee(amount)}</Text>
      </View>
    </LinearGradient>
  );
}

function SelectedDayCard() {
  const { selectedDate, getEntryForDate, settings } = useApp();
  const entry = getEntryForDate(selectedDate);
  const workCount = entry ? entry.workCount : 0;
  const earnings = workCount * settings.ratePerUnit;
  const d = parseDate(selectedDate);
  const label = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', weekday: 'short' });

  return (
    <View style={[styles.surfaceCard, { borderLeftColor: Colors.secondary }]}>
      <View style={styles.cardTopRow}>
        <View style={[styles.surfaceIconWrap, { backgroundColor: Colors.secondaryLight }]}>
          <MaterialIcons name="event" size={16} color={Colors.secondary} />
        </View>
        <Text style={styles.surfaceCardLabel}>Selected Day</Text>
      </View>
      <Text style={styles.surfaceCardDate}>{label}</Text>
      <Text style={styles.surfaceCardCount}>{formatCount(workCount)}</Text>
      <Text style={styles.surfaceCardUnit}>units</Text>
      <Text style={[styles.surfaceCardAmount, { color: Colors.secondary }]}>{formatRupee(earnings)}</Text>
    </View>
  );
}

function AdvanceSalaryCard() {
  const { advanceSalary, updateAdvanceSalary } = useApp();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState('');

  const handlePress = () => {
    setValue(advanceSalary > 0 ? advanceSalary.toString() : '');
    setEditing(true);
  };

  const handleSave = async () => {
    const parsed = parseFloat(value);
    await updateAdvanceSalary(isNaN(parsed) ? 0 : parsed);
    setEditing(false);
  };

  return (
    <View style={[styles.surfaceCard, { borderLeftColor: Colors.warningMid }]}>
      <View style={styles.cardTopRow}>
        <View style={[styles.surfaceIconWrap, { backgroundColor: Colors.warningLight }]}>
          <MaterialIcons name="account-balance-wallet" size={16} color={Colors.warning} />
        </View>
        <Text style={styles.surfaceCardLabel}>Advance Salary</Text>
      </View>
      <Text style={styles.surfaceCardDate}>This month</Text>
      {editing ? (
        <View style={styles.advanceEditRow}>
          <Text style={[styles.surfaceCardAmount, { color: Colors.warning, marginBottom: 0 }]}>₹</Text>
          <TextInput
            style={[styles.surfaceCardAmount, styles.advanceInput, { color: Colors.warning }]}
            value={value}
            onChangeText={setValue}
            keyboardType="decimal-pad"
            autoFocus
            onBlur={handleSave}
            onSubmitEditing={handleSave}
            placeholder="0.00"
            placeholderTextColor={Colors.warningMid + '70'}
          />
        </View>
      ) : (
        <Pressable onPress={handlePress} hitSlop={8}>
          <Text style={[styles.surfaceCardAmount, { color: Colors.warning }]}>
            {formatRupee(advanceSalary)}
          </Text>
          <View style={styles.tapEditChip}>
            <MaterialIcons name="edit" size={10} color={Colors.onSurfaceSubtle} />
            <Text style={styles.tapEditText}>tap to edit</Text>
          </View>
        </Pressable>
      )}
    </View>
  );
}

function PayableCard() {
  const { payableIncome, monthEarnings, advanceSalary } = useApp();
  const isNegative = payableIncome < 0;

  return (
    <LinearGradient
      colors={isNegative
        ? [Colors.error, '#991B1B'] as const
        : [Colors.gradientPrimaryStart, Colors.primaryMid] as const}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.payableCard}
    >
      <View style={styles.payableLeft}>
        <View style={styles.payableIconRow}>
          <View style={styles.payableIconWrap}>
            <MaterialIcons name="payments" size={20} color="rgba(255,255,255,0.9)" />
          </View>
          <Text style={styles.payableLabel}>Payable Income</Text>
        </View>
        <Text style={styles.payableFormula}>
          {formatRupee(monthEarnings)} − {formatRupee(advanceSalary)} advance
        </Text>
      </View>
      <View style={styles.payableRight}>
        <Text style={styles.payableAmount}>{formatRupee(payableIncome)}</Text>
        <Text style={styles.payableSubLabel}>net payable</Text>
      </View>
    </LinearGradient>
  );
}

export default function DashboardCards() {
  const { weekTotal, monthTotal, weekEarnings, monthEarnings, settings } = useApp();

  return (
    <View>
      {/* Row 1: Week + Month gradient cards */}
      <View style={styles.row}>
        <EarningsCard
          label="This Week"
          sublabel="Sun – Sat"
          count={weekTotal}
          amount={weekEarnings}
          iconName="date-range"
          gradientColors={[Colors.primaryMid, '#60A5FA']}
        />
        <View style={{ width: Spacing.md }} />
        <EarningsCard
          label="This Month"
          sublabel={`₹${settings.ratePerUnit}/unit`}
          count={monthTotal}
          amount={monthEarnings}
          iconName="bar-chart"
          gradientColors={[Colors.accent, Colors.gradientAccentEnd]}
        />
      </View>

      {/* Row 2: Selected Day + Advance */}
      <View style={styles.row}>
        <SelectedDayCard />
        <View style={{ width: Spacing.md }} />
        <AdvanceSalaryCard />
      </View>

      {/* Row 3: Payable Income (full width) */}
      <PayableCard />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },

  // Gradient card (Week / Month)
  gradientCard: {
    flex: 1,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    ...Shadow.md,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  cardIconWrap: {
    width: 30,
    height: 30,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  gradientCardLabel: {
    ...Typography.labelMedium,
    color: 'rgba(255,255,255,0.85)',
  },
  gradientCardCount: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.onPrimary,
    letterSpacing: -1,
    marginTop: Spacing.xs,
  },
  gradientCardUnit: {
    ...Typography.labelSmall,
    color: 'rgba(255,255,255,0.65)',
    marginBottom: Spacing.sm,
  },
  gradientDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: Spacing.sm,
  },
  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  gradientSublabel: {
    ...Typography.labelSmall,
    color: 'rgba(255,255,255,0.65)',
  },
  gradientCardAmount: {
    ...Typography.headlineSmall,
    color: Colors.onPrimary,
  },

  // Surface card (Selected Day / Advance)
  surfaceCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderLeftWidth: 4,
    ...Shadow.sm,
  },
  surfaceIconWrap: {
    width: 28,
    height: 28,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  surfaceCardLabel: {
    ...Typography.labelMedium,
    color: Colors.onSurfaceVariant,
  },
  surfaceCardDate: {
    ...Typography.bodySmall,
    color: Colors.onSurfaceSubtle,
    marginTop: 2,
    marginBottom: Spacing.sm,
  },
  surfaceCardCount: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.onSurface,
    letterSpacing: -0.8,
  },
  surfaceCardUnit: {
    ...Typography.labelSmall,
    color: Colors.onSurfaceSubtle,
    marginBottom: Spacing.xs,
  },
  surfaceCardAmount: {
    ...Typography.headlineMedium,
    marginTop: Spacing.xs,
  },
  tapEditChip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  tapEditText: {
    ...Typography.labelSmall,
    color: Colors.onSurfaceSubtle,
    marginLeft: 3,
    fontSize: 10,
  },
  advanceEditRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: Spacing.xs,
  },
  advanceInput: {
    flex: 1,
    padding: 0,
    includeFontPadding: false,
  },

  // Payable card
  payableCard: {
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 0,
    ...Shadow.lg,
  },
  payableLeft: {
    flex: 1,
    marginRight: Spacing.md,
  },
  payableIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  payableIconWrap: {
    width: 36,
    height: 36,
    borderRadius: Radius.lg,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  payableLabel: {
    ...Typography.headlineSmall,
    color: Colors.onPrimary,
  },
  payableFormula: {
    ...Typography.bodySmall,
    color: 'rgba(255,255,255,0.65)',
    lineHeight: 18,
  },
  payableRight: {
    alignItems: 'flex-end',
  },
  payableAmount: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.onPrimary,
    letterSpacing: -0.8,
  },
  payableSubLabel: {
    ...Typography.labelSmall,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 2,
  },
});
