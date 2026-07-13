import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Shadow } from '@/constants/theme';
import { useApp } from '@/hooks/useApp';
import { useAlert } from '@/template';
import { parseDate } from '@/services/storage';

function formatRupee(n: number): string {
  return '₹' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export default function EntryScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const router = useRouter();
  const { getEntryForDate, saveEntry, deleteEntry, settings } = useApp();
  const { showAlert } = useAlert();

  const existing = date ? getEntryForDate(date) : undefined;

  const [workCount, setWorkCount] = useState(existing ? existing.workCount.toString() : '');
  const [caratWeight, setCaratWeight] = useState(
    existing && existing.weightInCarats != null ? existing.weightInCarats.toString() : ''
  );
  const [notes, setNotes] = useState(existing ? existing.notes : '');
  const [saving, setSaving] = useState(false);

  const parsedDate = date ? parseDate(date) : new Date();
  const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dateLabel = `${WEEKDAYS[parsedDate.getDay()]}, ${parsedDate.getDate()} ${MONTHS[parsedDate.getMonth()]} ${parsedDate.getFullYear()}`;

  const unitCount = parseInt(workCount) || 0;
  const caratCount = parseFloat(caratWeight) || 0;
  const ratePerUnit = settings.ratePerUnit;
  const ratePerCarat = settings.ratePerCarat || 0;

  const unitEarnings = unitCount * ratePerUnit;
  const caratEarnings = caratCount * ratePerCarat;
  const totalEarnings = unitEarnings + caratEarnings;

  const handleSave = async () => {
    const countVal = parseInt(workCount) || 0;
    const caratVal = parseFloat(caratWeight) || 0;
    if (countVal < 0 || caratVal < 0) {
      showAlert('Invalid Entry', 'Values cannot be negative.');
      return;
    }
    if (countVal === 0 && caratVal === 0 && !notes.trim()) {
      showAlert('Empty Entry', 'Please enter at least a work count, carat weight, or a note.');
      return;
    }
    if (!date) return;
    setSaving(true);
    await saveEntry({
      date,
      workCount: countVal,
      weightInCarats: caratVal > 0 ? caratVal : undefined,
      notes: notes || '',
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setSaving(false);
    router.back();
  };

  const handleDelete = () => {
    if (!date || !existing) return;
    showAlert('Delete Entry', 'Remove this work entry? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteEntry(date);
          router.back();
        },
      },
    ]);
  };

  return (
    <>
      <Stack.Screen options={{ title: existing ? 'Edit Entry' : 'Log Work', headerShown: true }} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Date header */}
          <View style={styles.dateCard}>
            <View style={styles.dateIconWrap}>
              <MaterialIcons name="event" size={22} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.dateText}>{dateLabel}</Text>
              <View style={styles.ratePills}>
                <View style={styles.ratePill}>
                  <MaterialIcons name="bar-chart" size={10} color={Colors.primary} />
                  <Text style={styles.ratePillText}>₹{ratePerUnit.toFixed(2)}/unit</Text>
                </View>
                {ratePerCarat > 0 ? (
                  <View style={[styles.ratePill, styles.ratePillGold]}>
                    <Text style={styles.ratePillTextGold}>◆ ₹{ratePerCarat.toFixed(0)}/ct</Text>
                  </View>
                ) : null}
              </View>
            </View>
          </View>

          {/* ── Work Units section ── */}
          <View style={styles.sectionBox}>
            <View style={styles.sectionBoxHeader}>
              <View style={[styles.sectionBoxIcon, { backgroundColor: Colors.primaryLight }]}>
                <MaterialIcons name="bar-chart" size={16} color={Colors.primary} />
              </View>
              <Text style={styles.sectionBoxTitle}>Work Units</Text>
              {unitCount > 0 ? (
                <View style={styles.sectionBadge}>
                  <Text style={styles.sectionBadgeText}>{formatRupee(unitEarnings)}</Text>
                </View>
              ) : null}
            </View>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.mainInput}
                value={workCount}
                onChangeText={setWorkCount}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={Colors.onSurfaceSubtle}
                autoFocus={!existing}
                returnKeyType="next"
              />
              <Text style={styles.inputUnit}>units</Text>
              {workCount !== '' ? (
                <Pressable onPress={() => setWorkCount('')} hitSlop={8}>
                  <MaterialIcons name="clear" size={18} color={Colors.onSurfaceSubtle} />
                </Pressable>
              ) : null}
            </View>
            {unitCount > 0 ? (
              <View style={styles.miniEarningsRow}>
                <Text style={styles.miniFormula}>{unitCount} × ₹{ratePerUnit.toFixed(2)}</Text>
                <Text style={styles.miniAmount}>{formatRupee(unitEarnings)}</Text>
              </View>
            ) : null}
          </View>

          {/* ── Carat Weight section ── */}
          <View style={[styles.sectionBox, styles.sectionBoxGold]}>
            <View style={styles.sectionBoxHeader}>
              <View style={[styles.sectionBoxIcon, { backgroundColor: Colors.goldLight }]}>
                <Text style={styles.caratIcon}>◆</Text>
              </View>
              <Text style={[styles.sectionBoxTitle, { color: Colors.gold }]}>Carat Weight</Text>
              {caratCount > 0 ? (
                <View style={[styles.sectionBadge, styles.sectionBadgeGold]}>
                  <Text style={[styles.sectionBadgeText, { color: Colors.gold }]}>{formatRupee(caratEarnings)}</Text>
                </View>
              ) : null}
            </View>
            <View style={[styles.inputWrapper, styles.inputWrapperGold]}>
              <TextInput
                style={[styles.mainInput, { color: Colors.gold }]}
                value={caratWeight}
                onChangeText={setCaratWeight}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={Colors.goldBright + '60'}
                returnKeyType="next"
              />
              <Text style={[styles.inputUnit, { color: Colors.goldMid }]}>carats</Text>
              {caratWeight !== '' ? (
                <Pressable onPress={() => setCaratWeight('')} hitSlop={8}>
                  <MaterialIcons name="clear" size={18} color={Colors.goldMid} />
                </Pressable>
              ) : null}
            </View>
            {caratCount > 0 ? (
              <View style={styles.miniEarningsRow}>
                <Text style={[styles.miniFormula, { color: Colors.goldMid }]}>
                  {caratCount.toFixed(2)} ct × ₹{ratePerCarat.toFixed(0)}
                </Text>
                <Text style={[styles.miniAmount, { color: Colors.gold }]}>{formatRupee(caratEarnings)}</Text>
              </View>
            ) : (
              <Text style={styles.caratHint}>
                Set rate per carat in Settings · current: ₹{ratePerCarat.toFixed(0)}/ct
              </Text>
            )}
          </View>

          {/* Total earnings preview */}
          {totalEarnings > 0 ? (
            <View style={styles.totalCard}>
              <View style={styles.totalLeft}>
                <Text style={styles.totalLabel}>Total Day Earnings</Text>
                {unitCount > 0 && caratCount > 0 ? (
                  <Text style={styles.totalBreakdown}>
                    {formatRupee(unitEarnings)} units + {formatRupee(caratEarnings)} carats
                  </Text>
                ) : null}
              </View>
              <Text style={styles.totalAmount}>{formatRupee(totalEarnings)}</Text>
            </View>
          ) : null}

          {/* Notes */}
          <View style={styles.sectionBox}>
            <View style={styles.sectionBoxHeader}>
              <View style={[styles.sectionBoxIcon, { backgroundColor: Colors.surfaceVariant }]}>
                <MaterialIcons name="notes" size={16} color={Colors.onSurfaceVariant} />
              </View>
              <Text style={styles.sectionBoxTitle}>Notes (Optional)</Text>
            </View>
            <View style={[styles.inputWrapper, styles.notesWrapper]}>
              <TextInput
                style={[styles.mainInput, styles.notesInput]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Any notes for this day..."
                placeholderTextColor={Colors.onSurfaceSubtle}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Save button */}
          <Pressable
            style={[styles.primaryBtn, saving && { opacity: 0.6 }]}
            onPress={handleSave}
            disabled={saving}
          >
            <MaterialIcons name="check" size={20} color={Colors.onPrimary} />
            <Text style={styles.primaryBtnText}>
              {saving ? 'Saving...' : existing ? 'Update Entry' : 'Save Entry'}
            </Text>
          </Pressable>

          {existing ? (
            <Pressable style={styles.deleteBtn} onPress={handleDelete}>
              <MaterialIcons name="delete-outline" size={18} color={Colors.error} />
              <Text style={styles.deleteBtnText}>Delete Entry</Text>
            </Pressable>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, paddingBottom: 40 },

  dateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryContainer,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    ...Shadow.sm,
  },
  dateIconWrap: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  dateText: { ...Typography.headlineSmall, color: Colors.onSurface },
  ratePills: { flexDirection: 'row', marginTop: 6 },
  ratePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    marginRight: 6,
  },
  ratePillGold: { backgroundColor: Colors.goldLight },
  ratePillText: { ...Typography.labelSmall, color: Colors.primary, marginLeft: 3 },
  ratePillTextGold: { ...Typography.labelSmall, color: Colors.gold },

  // Section boxes
  sectionBox: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadow.sm,
  },
  sectionBoxGold: {
    borderWidth: 1.5,
    borderColor: Colors.goldBright + '50',
    backgroundColor: '#FFFBEB',
  },
  sectionBoxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionBoxIcon: {
    width: 30,
    height: 30,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  caratIcon: { fontSize: 13, color: Colors.gold },
  sectionBoxTitle: { ...Typography.labelLarge, color: Colors.onSurfaceVariant, flex: 1 },
  sectionBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  sectionBadgeGold: { backgroundColor: Colors.goldLight },
  sectionBadgeText: { ...Typography.labelSmall, color: Colors.primary, fontWeight: '700' },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceVariant,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  inputWrapperGold: {
    borderColor: Colors.goldBright + '60',
    backgroundColor: '#FEFCE8',
  },
  mainInput: {
    ...Typography.displayMedium,
    color: Colors.onSurface,
    flex: 1,
    padding: 0,
    includeFontPadding: false,
  },
  inputUnit: {
    ...Typography.labelMedium,
    color: Colors.onSurfaceSubtle,
    marginLeft: Spacing.sm,
    marginRight: Spacing.xs,
  },
  miniEarningsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  miniFormula: { ...Typography.bodySmall, color: Colors.onSurfaceVariant },
  miniAmount: { ...Typography.headlineSmall, color: Colors.primary },
  caratHint: {
    ...Typography.bodySmall,
    color: Colors.goldMid,
    marginTop: Spacing.sm,
    fontStyle: 'italic',
  },

  notesWrapper: { alignItems: 'flex-start', minHeight: 100 },
  notesInput: {
    ...Typography.bodyLarge,
    lineHeight: 24,
    minHeight: 80,
    fontSize: 15,
  },

  // Total card
  totalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.gradientPrimaryStart,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.md,
    ...Shadow.lg,
  },
  totalLeft: { flex: 1, marginRight: Spacing.md },
  totalLabel: { ...Typography.labelLarge, color: 'rgba(255,255,255,0.8)' },
  totalBreakdown: { ...Typography.bodySmall, color: 'rgba(255,255,255,0.6)', marginTop: 3 },
  totalAmount: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.onPrimary,
    letterSpacing: -0.8,
  },

  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
    elevation: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  primaryBtnText: { ...Typography.headlineSmall, color: Colors.onPrimary, marginLeft: Spacing.sm },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    borderRadius: Radius.xl,
    borderWidth: 1.5,
    borderColor: Colors.error + '60',
    backgroundColor: Colors.errorLight,
  },
  deleteBtnText: { ...Typography.labelLarge, color: Colors.error, marginLeft: Spacing.sm },
});
