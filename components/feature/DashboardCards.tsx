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
import { Typography, Spacing, Radius, Shadow } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/hooks/useApp';
import { parseDate } from '@/services/storage';

function formatRupee(amount: number): string {
  return '₹' + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
function formatCount(n: number): string {
  return n.toLocaleString('en-IN');
}

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ─── Earnings Card (gradient) ─────────────────────────────────────────────────
interface EarningsCardProps {
  label: string;
  sublabel: string;
  count: number;
  countLabel: string;
  amount: number;
  iconName: string;
  gradientColors: readonly [string, string];
  secondaryCount?: number;
  secondaryLabel?: string;
  showSecondary?: boolean;
}

function EarningsCard({
  label, sublabel, count, countLabel, amount, iconName, gradientColors,
  secondaryCount, secondaryLabel, showSecondary,
}: EarningsCardProps) {
  return (
    <LinearGradient colors={gradientColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradientCard}>
      <View style={styles.cardTopRow}>
        <View style={styles.cardIconWrap}>
          <MaterialIcons name={iconName as any} size={18} color="rgba(255,255,255,0.9)" />
        </View>
        <Text style={styles.gradientCardLabel} numberOfLines={1}>{label}</Text>
      </View>
      <Text style={styles.gradientCardCount}>{formatCount(count)}</Text>
      <Text style={styles.gradientCardUnit}>{countLabel}</Text>
      {showSecondary && secondaryCount != null && secondaryCount > 0 ? (
        <Text style={styles.gradientSecondary}>+ {secondaryCount.toFixed(2)} {secondaryLabel}</Text>
      ) : null}
      <View style={styles.gradientDivider} />
      <View style={styles.cardBottomRow}>
        <Text style={styles.gradientSublabel} numberOfLines={1}>{sublabel}</Text>
        <Text style={styles.gradientCardAmount}>{formatRupee(amount)}</Text>
      </View>
    </LinearGradient>
  );
}

// ─── Selected Day Card ────────────────────────────────────────────────────────
function SelectedDayCard() {
  const { colors } = useTheme();
  const { selectedDate, getEntryForDate, settings, caratEnabled } = useApp();
  const entry = getEntryForDate(selectedDate);
  const workCount = entry?.workCount ?? 0;
  const caratWeight = caratEnabled ? (entry?.caratWeight ?? 0) : 0;
  const caratRate = settings.caratRate ?? 100;
  const earnings = (workCount * settings.ratePerUnit) + (caratEnabled ? caratWeight * caratRate : 0);
  const d = parseDate(selectedDate);
  const label = `${DAYS_SHORT[d.getDay()]}, ${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;

  return (
    <View style={[styles.surfaceCard, { backgroundColor: colors.surface, borderLeftColor: colors.secondary }]}>
      <View style={styles.cardTopRow}>
        <View style={[styles.surfaceIconWrap, { backgroundColor: colors.secondaryLight }]}>
          <MaterialIcons name="event" size={16} color={colors.secondary} />
        </View>
        <Text style={[styles.surfaceCardLabel, { color: colors.onSurfaceVariant }]}>Selected Day</Text>
      </View>
      <Text style={[styles.surfaceCardDate, { color: colors.onSurfaceSubtle }]}>{label}</Text>
      <Text style={[styles.surfaceCardCount, { color: colors.onSurface }]}>{formatCount(workCount)}</Text>
      <Text style={[styles.surfaceCardUnit, { color: colors.onSurfaceSubtle }]}>units</Text>
      {caratEnabled && caratWeight > 0 ? (
        <Text style={[styles.surfaceCardUnit, { color: colors.accentMid, marginTop: 1 }]}>
          + {caratWeight.toFixed(2)} ct
        </Text>
      ) : null}
      <Text style={[styles.surfaceCardAmount, { color: colors.secondary }]}>{formatRupee(earnings)}</Text>
    </View>
  );
}

// ─── Advance Salary Card ──────────────────────────────────────────────────────
function AdvanceSalaryCard() {
  const { colors } = useTheme();
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
    <View style={[styles.surfaceCard, { backgroundColor: colors.surface, borderLeftColor: colors.warningMid }]}>
      <View style={styles.cardTopRow}>
        <View style={[styles.surfaceIconWrap, { backgroundColor: colors.warningLight }]}>
          <MaterialIcons name="account-balance-wallet" size={16} color={colors.warning} />
        </View>
        <Text style={[styles.surfaceCardLabel, { color: colors.onSurfaceVariant }]}>Advance</Text>
      </View>
      <Text style={[styles.surfaceCardDate, { color: colors.onSurfaceSubtle }]}>This month</Text>
      {editing ? (
        <View style={styles.advanceEditRow}>
          <Text style={[styles.surfaceCardAmount, { color: colors.warning, marginBottom: 0 }]}>₹</Text>
          <TextInput
            style={[styles.surfaceCardAmount, styles.advanceInput, { color: colors.warning }]}
            value={value}
            onChangeText={setValue}
            keyboardType="decimal-pad"
            autoFocus
            onBlur={handleSave}
            onSubmitEditing={handleSave}
            placeholder="0.00"
            placeholderTextColor={colors.warningMid + '70'}
          />
        </View>
      ) : (
        <Pressable onPress={handlePress} hitSlop={8}>
          <Text style={[styles.surfaceCardAmount, { color: colors.warning }]}>{formatRupee(advanceSalary)}</Text>
          <View style={styles.tapEditChip}>
            <MaterialIcons name="edit" size={10} color={colors.onSurfaceSubtle} />
            <Text style={[styles.tapEditText, { color: colors.onSurfaceSubtle }]}>tap to edit</Text>
          </View>
        </Pressable>
      )}
    </View>
  );
}

// ─── Payable Income Card ──────────────────────────────────────────────────────
function PayableCard() {
  const { colors } = useTheme();
  const { payableIncome, monthEarnings, advanceSalary } = useApp();
  const isNegative = payableIncome < 0;

  return (
    <LinearGradient
      colors={
        isNegative
          ? ([colors.error, '#7F1D1D'] as const)
          : ([colors.gradientPrimaryStart, colors.primaryMid] as const)
      }
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
        <Text style={styles.payableFormula} numberOfLines={1}>
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

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DashboardCards() {
  const { colors } = useTheme();
  const { weekTotal, monthTotal, weekEarnings, monthEarnings, settings, entries, caratEnabled, currentYear, currentMonth } = useApp();

  const today = new Date();
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - today.getDay() + i);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });

  const weekCarats = caratEnabled
    ? entries.filter(e => weekDates.includes(e.date)).reduce((s, e) => s + (e.caratWeight ?? 0), 0)
    : 0;

  const monthPrefix = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
  const monthCarats = caratEnabled
    ? entries.filter(e => e.date.startsWith(monthPrefix)).reduce((s, e) => s + (e.caratWeight ?? 0), 0)
    : 0;

  return (
    <View>
      <View style={styles.row}>
        <EarningsCard
          label="This Week"
          sublabel="Sun – Sat"
          count={weekTotal}
          countLabel="units"
          amount={weekEarnings}
          iconName="date-range"
          gradientColors={[colors.primaryMid, '#60A5FA']}
          secondaryCount={weekCarats}
          secondaryLabel="ct"
          showSecondary={caratEnabled}
        />
        <View style={{ width: Spacing.md }} />
        <EarningsCard
          label="This Month"
          sublabel={`₹${settings.ratePerUnit}/unit`}
          count={monthTotal}
          countLabel="units"
          amount={monthEarnings}
          iconName="bar-chart"
          gradientColors={[colors.accent, colors.gradientAccentEnd]}
          secondaryCount={monthCarats}
          secondaryLabel="ct"
          showSecondary={caratEnabled}
        />
      </View>

      <View style={styles.row}>
        <SelectedDayCard />
        <View style={{ width: Spacing.md }} />
        <AdvanceSalaryCard />
      </View>

      <PayableCard />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', marginBottom: Spacing.md },

  gradientCard: {
    flex: 1,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    ...Shadow.md,
  },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
  cardIconWrap: {
    width: 30, height: 30, borderRadius: Radius.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
    marginRight: Spacing.sm, flexShrink: 0,
  },
  gradientCardLabel: { ...Typography.labelMedium, color: 'rgba(255,255,255,0.85)', flex: 1 },
  gradientCardCount: { fontSize: 28, fontWeight: '800', color: '#FFFFFF', letterSpacing: -1, marginTop: Spacing.xs },
  gradientCardUnit: { ...Typography.labelSmall, color: 'rgba(255,255,255,0.65)', marginBottom: 2 },
  gradientSecondary: { ...Typography.labelSmall, color: 'rgba(255,255,255,0.75)', marginBottom: Spacing.xs },
  gradientDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: Spacing.sm },
  cardBottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  gradientSublabel: { ...Typography.labelSmall, color: 'rgba(255,255,255,0.65)', flex: 1, marginRight: 4 },
  gradientCardAmount: { ...Typography.headlineSmall, color: '#FFFFFF' },

  surfaceCard: {
    flex: 1, borderRadius: Radius.xl, padding: Spacing.lg, borderLeftWidth: 4, ...Shadow.sm,
  },
  surfaceIconWrap: {
    width: 28, height: 28, borderRadius: Radius.md,
    alignItems: 'center', justifyContent: 'center', marginRight: Spacing.sm, flexShrink: 0,
  },
  surfaceCardLabel: { ...Typography.labelMedium, flex: 1 },
  surfaceCardDate: { ...Typography.bodySmall, marginTop: 2, marginBottom: Spacing.sm },
  surfaceCardCount: { fontSize: 24, fontWeight: '800', letterSpacing: -0.8 },
  surfaceCardUnit: { ...Typography.labelSmall, marginBottom: Spacing.xs },
  surfaceCardAmount: { ...Typography.headlineMedium, marginTop: Spacing.xs },
  tapEditChip: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  tapEditText: { ...Typography.labelSmall, marginLeft: 3, fontSize: 10 },
  advanceEditRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: Spacing.xs },
  advanceInput: { flex: 1, padding: 0, includeFontPadding: false },

  payableCard: {
    borderRadius: Radius.xl, padding: Spacing.xl,
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', ...Shadow.lg,
  },
  payableLeft: { flex: 1, marginRight: Spacing.md },
  payableIconRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
  payableIconWrap: {
    width: 36, height: 36, borderRadius: Radius.lg,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center', marginRight: Spacing.sm, flexShrink: 0,
  },
  payableLabel: { ...Typography.headlineSmall, color: '#FFFFFF' },
  payableFormula: { ...Typography.bodySmall, color: 'rgba(255,255,255,0.65)', lineHeight: 18 },
  payableRight: { alignItems: 'flex-end', flexShrink: 0 },
  payableAmount: { fontSize: 26, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.8 },
  payableSubLabel: { ...Typography.labelSmall, color: 'rgba(255,255,255,0.65)', marginTop: 2 },
});
