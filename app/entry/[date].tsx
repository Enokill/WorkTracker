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
  Switch,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Typography, Spacing, Radius, Shadow } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/hooks/useApp';
import { useAlert } from '@/template';
import { parseDate } from '@/services/storage';

function formatRupee(n: number): string {
  return '₹' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function EntryScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const { getEntryForDate, saveEntry, deleteEntry, settings, caratEnabled } = useApp();
  const { showAlert } = useAlert();

  const existing = date ? getEntryForDate(date) : undefined;

  const [workCount, setWorkCount] = useState(existing ? existing.workCount.toString() : '');
  const [caratWeight, setCaratWeight] = useState(
    existing?.caratWeight != null ? existing.caratWeight.toString() : ''
  );
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [saving, setSaving] = useState(false);

  const parsedDate = date ? parseDate(date) : new Date();
  const dateLabel = `${WEEKDAYS[parsedDate.getDay()]}, ${parsedDate.getDate()} ${MONTHS[parsedDate.getMonth()]} ${parsedDate.getFullYear()}`;

  const units = parseInt(workCount) || 0;
  const carats = caratEnabled ? (parseFloat(caratWeight) || 0) : 0;
  const caratRate = settings.caratRate ?? 100;
  const unitEarnings = units * settings.ratePerUnit;
  const caratEarnings = caratEnabled ? carats * caratRate : 0;
  const totalEarnings = unitEarnings + caratEarnings;

  const handleSave = async () => {
    const countVal = parseInt(workCount) || 0;
    const caratVal = caratEnabled ? (parseFloat(caratWeight) || 0) : 0;
    if (countVal < 0 || caratVal < 0) {
      showAlert('Invalid Entry', 'Values cannot be negative.');
      return;
    }
    if (!date) return;
    setSaving(true);
    await saveEntry({
      date,
      workCount: countVal,
      caratWeight: caratEnabled && caratVal > 0 ? caratVal : undefined,
      notes: notes || '',
      createdAt: existing?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setSaving(false);
    router.back();
  };

  const handleDelete = () => {
    if (!date || !existing) return;
    showAlert('Delete Entry', 'Remove this work entry?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => { await deleteEntry(date); router.back(); },
      },
    ]);
  };

  return (
    <>
      <Stack.Screen options={{ title: existing ? 'Edit Entry' : 'Log Work', headerShown: true }} />
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: colors.background }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Date header */}
          <View style={[styles.dateCard, {
            backgroundColor: colors.primaryContainer,
            borderLeftColor: colors.primary,
          }]}>
            <MaterialIcons name="event" size={20} color={colors.primary} />
            <View style={{ flex: 1, marginLeft: Spacing.md }}>
              <Text style={[styles.dateText, { color: colors.onSurface }]}>{dateLabel}</Text>
              <Text style={[styles.dateSub, { color: colors.onSurfaceVariant }]}>
                ₹{settings.ratePerUnit.toFixed(2)}/unit
                {caratEnabled ? ` · ₹${caratRate.toFixed(2)}/carat` : ''}
              </Text>
            </View>
          </View>

          {/* ── Work Units Block ── */}
          <View style={[styles.entryBlock, { backgroundColor: colors.surface }]}>
            <View style={styles.entryBlockHeader}>
              <View style={[styles.entryTypeTag, { backgroundColor: colors.primaryLight }]}>
                <MaterialIcons name="bar-chart" size={14} color={colors.primary} />
                <Text style={[styles.entryTypeText, { color: colors.primary }]}>Work Units</Text>
              </View>
              <Text style={[styles.entryTypeRate, { color: colors.onSurfaceSubtle }]}>
                ₹{settings.ratePerUnit.toFixed(2)}/unit
              </Text>
            </View>
            <View style={[styles.inputWrapper, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}>
              <MaterialIcons name="bar-chart" size={20} color={colors.primary} style={{ marginRight: 8 }} />
              <TextInput
                style={[styles.mainInput, { color: colors.onSurface }]}
                value={workCount}
                onChangeText={setWorkCount}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={colors.onSurfaceSubtle}
                autoFocus={!existing}
                returnKeyType="next"
              />
              <Text style={[styles.unitLabel, { color: colors.onSurfaceSubtle }]}>units</Text>
              {workCount !== '' ? (
                <Pressable onPress={() => setWorkCount('')} hitSlop={8}>
                  <MaterialIcons name="clear" size={18} color={colors.onSurfaceSubtle} />
                </Pressable>
              ) : null}
            </View>
            {units > 0 ? (
              <View style={styles.miniEarning}>
                <MaterialIcons name="currency-rupee" size={13} color={colors.accent} />
                <Text style={[styles.miniEarningText, { color: colors.accent }]}>
                  {units} × ₹{settings.ratePerUnit.toFixed(2)} = {formatRupee(unitEarnings)}
                </Text>
              </View>
            ) : null}
          </View>

          {/* ── Carat Weight Block (conditional) ── */}
          {caratEnabled ? (
            <View style={[styles.entryBlock, { backgroundColor: colors.surface }]}>
              <View style={styles.entryBlockHeader}>
                <View style={[styles.entryTypeTag, { backgroundColor: colors.accentLight }]}>
                  <MaterialIcons name="diamond" size={14} color={colors.accent} />
                  <Text style={[styles.entryTypeText, { color: colors.accent }]}>Carat Weight</Text>
                </View>
                <Text style={[styles.entryTypeRate, { color: colors.onSurfaceSubtle }]}>
                  ₹{caratRate.toFixed(2)}/carat
                </Text>
              </View>
              <View style={[styles.inputWrapper, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}>
                <MaterialIcons name="diamond" size={20} color={colors.accent} style={{ marginRight: 8 }} />
                <TextInput
                  style={[styles.mainInput, { color: colors.onSurface }]}
                  value={caratWeight}
                  onChangeText={setCaratWeight}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor={colors.onSurfaceSubtle}
                  returnKeyType="next"
                />
                <Text style={[styles.unitLabel, { color: colors.onSurfaceSubtle }]}>ct</Text>
                {caratWeight !== '' ? (
                  <Pressable onPress={() => setCaratWeight('')} hitSlop={8}>
                    <MaterialIcons name="clear" size={18} color={colors.onSurfaceSubtle} />
                  </Pressable>
                ) : null}
              </View>
              {carats > 0 ? (
                <View style={styles.miniEarning}>
                  <MaterialIcons name="currency-rupee" size={13} color={colors.accentMid} />
                  <Text style={[styles.miniEarningText, { color: colors.accentMid }]}>
                    {carats} ct × ₹{caratRate.toFixed(2)} = {formatRupee(caratEarnings)}
                  </Text>
                </View>
              ) : null}
            </View>
          ) : null}

          {/* Total earnings preview */}
          {(units > 0 || (caratEnabled && carats > 0)) ? (
            <View style={[styles.earningsCard, {
              backgroundColor: colors.primaryContainer,
              borderColor: colors.primaryLight,
            }]}>
              <View style={styles.earningsRow}>
                <View style={{ flex: 1, marginRight: Spacing.md }}>
                  <Text style={[styles.earningsLabel, { color: colors.primary }]}>
                    {caratEnabled ? "Today's Total Earnings" : "Today's Earnings"}
                  </Text>
                  <View style={{ marginTop: 4 }}>
                    {units > 0 ? (
                      <Text style={[styles.earningsLine, { color: colors.onSurfaceVariant }]}>
                        Units: {formatRupee(unitEarnings)}
                      </Text>
                    ) : null}
                    {caratEnabled && carats > 0 ? (
                      <Text style={[styles.earningsLine, { color: colors.onSurfaceVariant }]}>
                        Carats: {formatRupee(caratEarnings)}
                      </Text>
                    ) : null}
                  </View>
                </View>
                <Text style={[styles.earningsAmount, { color: colors.primary }]}>{formatRupee(totalEarnings)}</Text>
              </View>
            </View>
          ) : null}

          {/* Notes */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Notes (Optional)</Text>
            <View style={[styles.inputWrapper, styles.notesWrapper, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}>
              <TextInput
                style={[styles.mainInput, styles.notesInput, { color: colors.onSurface }]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Any notes for this day..."
                placeholderTextColor={colors.onSurfaceSubtle}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Save */}
          <Pressable
            style={[styles.primaryBtn, { backgroundColor: colors.primary }, saving && { opacity: 0.6 }]}
            onPress={handleSave}
            disabled={saving}
          >
            <MaterialIcons name="check" size={20} color={colors.onPrimary} />
            <Text style={[styles.primaryBtnText, { color: colors.onPrimary }]}>
              {saving ? 'Saving...' : existing ? 'Update Entry' : 'Save Entry'}
            </Text>
          </Pressable>

          {existing ? (
            <Pressable
              style={[styles.deleteBtn, { borderColor: colors.error + '60', backgroundColor: colors.errorLight }]}
              onPress={handleDelete}
            >
              <MaterialIcons name="delete-outline" size={18} color={colors.error} />
              <Text style={[styles.deleteBtnText, { color: colors.error }]}>Delete Entry</Text>
            </Pressable>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xxxl },

  dateCard: {
    flexDirection: 'row', alignItems: 'center',
    marginBottom: Spacing.lg, borderRadius: Radius.lg,
    padding: Spacing.lg, borderLeftWidth: 4,
  },
  dateText: { ...Typography.headlineSmall },
  dateSub: { ...Typography.bodySmall, marginTop: 2 },

  entryBlock: {
    borderRadius: Radius.lg, padding: Spacing.lg,
    marginBottom: Spacing.md, ...Shadow.sm,
  },
  entryBlockHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: Spacing.md,
  },
  entryTypeTag: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingVertical: 5, borderRadius: Radius.full,
  },
  entryTypeText: { ...Typography.labelMedium, marginLeft: 5 },
  entryTypeRate: { ...Typography.bodySmall },

  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: Radius.md, padding: Spacing.md,
    borderWidth: 1.5,
  },
  mainInput: {
    ...Typography.headlineMedium, flex: 1,
    padding: 0, includeFontPadding: false,
  },
  unitLabel: { ...Typography.bodyMedium, marginRight: Spacing.sm },
  miniEarning: {
    flexDirection: 'row', alignItems: 'center',
    marginTop: Spacing.sm, paddingHorizontal: 2,
  },
  miniEarningText: { ...Typography.bodySmall, marginLeft: 4, fontWeight: '600' },

  earningsCard: {
    borderRadius: Radius.lg, padding: Spacing.lg,
    borderWidth: 1.5, marginBottom: Spacing.lg,
  },
  earningsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  earningsLabel: { ...Typography.labelLarge },
  earningsLine: { ...Typography.bodySmall, lineHeight: 18 },
  earningsAmount: { ...Typography.displayMedium },

  section: { marginBottom: Spacing.lg },
  label: { ...Typography.labelLarge, paddingLeft: 4, marginBottom: Spacing.sm },
  notesWrapper: { alignItems: 'flex-start', minHeight: 100 },
  notesInput: { ...Typography.bodyLarge, lineHeight: 24, minHeight: 80 },

  primaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderRadius: Radius.lg, padding: Spacing.lg, marginTop: Spacing.sm, elevation: 4,
  },
  primaryBtnText: { ...Typography.headlineSmall, marginLeft: Spacing.sm },
  deleteBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    padding: Spacing.lg, borderRadius: Radius.lg,
    borderWidth: 1.5, marginTop: Spacing.md,
  },
  deleteBtnText: { ...Typography.labelLarge, marginLeft: Spacing.sm },
});
