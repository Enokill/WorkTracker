import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
} from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadow } from '@/constants/theme';
import { useApp } from '@/hooks/useApp';
import { parseDate } from '@/services/storage';

function formatRupee(amount: number): string {
  return '₹' + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function formatCount(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

interface SummaryCardProps {
  label: string;
  sublabel?: string;
  count?: number;
  amount: number;
  accent?: string;
}

function SummaryCard({ label, sublabel, count, amount, accent = Colors.primary }: SummaryCardProps) {
  return (
    <View style={[styles.card, { borderTopColor: accent }]}>
      <Text style={styles.cardLabel}>{label}</Text>
      {sublabel ? <Text style={styles.cardSublabel}>{sublabel}</Text> : null}
      {count !== undefined ? (
        <Text style={styles.cardCount}>
          {formatCount(count)} <Text style={styles.cardUnit}>Units</Text>
        </Text>
      ) : null}
      <Text style={[styles.cardAmount, { color: accent }]}>{formatRupee(amount)}</Text>
    </View>
  );
}

function SelectedDayCard() {
  const { selectedDate, getEntryForDate, settings } = useApp();
  const entry = getEntryForDate(selectedDate);
  const workCount = entry ? entry.workCount : 0;
  const earnings = workCount * settings.ratePerUnit;

  const d = parseDate(selectedDate);
  const label = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long' });

  return (
    <View style={[styles.card, { borderTopColor: Colors.secondary }]}>
      <Text style={styles.cardLabel}>Selected Day</Text>
      <Text style={styles.cardSublabel}>{label}</Text>
      <Text style={styles.cardCount}>
        {formatCount(workCount)} <Text style={styles.cardUnit}>Units</Text>
      </Text>
      <Text style={[styles.cardAmount, { color: Colors.secondary }]}>{formatRupee(earnings)}</Text>
    </View>
  );
}

function AdvanceSalaryCard() {
  const { advanceSalary, updateAdvanceSalary } = useApp();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState('');

  const handlePress = () => {
    setValue(advanceSalary.toString());
    setEditing(true);
  };

  const handleSave = async () => {
    const parsed = parseFloat(value);
    await updateAdvanceSalary(isNaN(parsed) ? 0 : parsed);
    setEditing(false);
  };

  return (
    <View style={[styles.card, { borderTopColor: Colors.warning }]}>
      <Text style={styles.cardLabel}>Advance Salary</Text>
      <Text style={styles.cardSublabel}>This month</Text>
      {editing ? (
        <View style={styles.advanceEditRow}>
          <Text style={styles.rupeePrefix}>₹</Text>
          <TextInput
            style={styles.advanceInput}
            value={value}
            onChangeText={setValue}
            keyboardType="decimal-pad"
            autoFocus
            onBlur={handleSave}
            onSubmitEditing={handleSave}
          />
        </View>
      ) : (
        <Pressable onPress={handlePress}>
          <Text style={[styles.cardAmount, { color: Colors.warning }]}>{formatRupee(advanceSalary)}</Text>
          <Text style={styles.tapToEdit}>Tap to edit</Text>
        </Pressable>
      )}
    </View>
  );
}

function PayableCard() {
  const { payableIncome } = useApp();
  const isNegative = payableIncome < 0;
  return (
    <View style={[styles.card, styles.payableCard]}>
      <Text style={[styles.cardLabel, { color: Colors.onPrimary }]}>Payable Income</Text>
      <Text style={[styles.cardSublabel, { color: 'rgba(255,255,255,0.7)' }]}>Month Earnings − Advance</Text>
      <Text style={[styles.cardAmountLarge, { color: isNegative ? Colors.errorLight : Colors.onPrimary }]}>
        {formatRupee(payableIncome)}
      </Text>
    </View>
  );
}

export default function DashboardCards() {
  const { weekTotal, monthTotal, weekEarnings, monthEarnings, settings } = useApp();

  return (
    <View>
      {/* Row 1: Week + Month */}
      <View style={styles.row}>
        <SummaryCard
          label="Running Week"
          sublabel="Sun – Sat"
          count={weekTotal}
          amount={weekEarnings}
          accent={Colors.primary}
        />
        <View style={styles.rowSpacer} />
        <SummaryCard
          label="Current Month"
          sublabel={`@ ₹${settings.ratePerUnit}/unit`}
          count={monthTotal}
          amount={monthEarnings}
          accent={Colors.accent}
        />
      </View>

      {/* Row 2: Selected Day + Advance */}
      <View style={styles.row}>
        <SelectedDayCard />
        <View style={styles.rowSpacer} />
        <AdvanceSalaryCard />
      </View>

      {/* Row 3: Payable (full width) */}
      <PayableCard />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  rowSpacer: {
    width: Spacing.md,
  },
  card: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderTopWidth: 3,
    borderTopColor: Colors.primary,
    ...Shadow.sm,
  },
  cardLabel: {
    ...Typography.labelMedium,
    color: Colors.onSurfaceVariant,
    marginBottom: 2,
  },
  cardSublabel: {
    ...Typography.bodySmall,
    color: Colors.onSurfaceSubtle,
    marginBottom: Spacing.sm,
  },
  cardCount: {
    ...Typography.headlineSmall,
    color: Colors.onSurface,
    marginBottom: 2,
  },
  cardUnit: {
    ...Typography.bodySmall,
    color: Colors.onSurfaceVariant,
  },
  cardAmount: {
    ...Typography.headlineMedium,
    marginTop: 2,
  },
  cardAmountLarge: {
    ...Typography.displayMedium,
    marginTop: Spacing.sm,
  },
  advanceEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: Colors.warning,
    paddingBottom: 2,
    marginTop: Spacing.sm,
  },
  rupeePrefix: {
    ...Typography.headlineMedium,
    color: Colors.warning,
    marginRight: 4,
  },
  advanceInput: {
    ...Typography.headlineMedium,
    color: Colors.warning,
    flex: 1,
    padding: 0,
  },
  tapToEdit: {
    ...Typography.labelSmall,
    color: Colors.onSurfaceSubtle,
    marginTop: 4,
  },
  payableCard: {
    backgroundColor: Colors.primary,
    borderTopWidth: 3,
    borderTopColor: Colors.primaryDark,
    paddingVertical: Spacing.xl,
    marginBottom: 0,
  },
});
