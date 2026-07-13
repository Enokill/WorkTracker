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
import { Typography, Spacing, Radius, Shadow } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/hooks/useApp';
import { useAlert } from '@/template';
import { parseDate } from '@/services/storage';

function formatRupee(n: number): string {
  return '₹' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export default function EntryScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const { getEntryForDate, saveEntry, deleteEntry, settings } = useApp();
  const { showAlert } = useAlert();

  const existing = date ? getEntryForDate(date) : undefined;

  const [workCount, setWorkCount] = useState(existing ? existing.workCount.toString() : '');
  const [caratWeight, setCaratWeight] = useState(
    existing?.caratWeight != null ? existing.caratWeight.toString() : ''
  );
  const [notes, setNotes] = useState(existing ? existing.notes : '');
  const [saving, setSaving] = useState(false);

  const parsedDate = date ? parseDate(date) : new Date();
  const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dateLabel = `${WEEKDAYS[parsedDate.getDay()]}, ${parsedDate.getDate()} ${MONTHS[parsedDate.getMonth()]} ${parsedDate.getFullYear()}`;

  const units = parseInt(workCount) || 0;
  const carats = parseFloat(caratWeight) || 0;
  const unitEarnings = units * settings.ratePerUnit;
  const caratRate = settings.caratRate ?? 100;
  const caratEarnings = carats * caratRate;
  const totalEarnings = unitEarnings + caratEarnings;

  const handleSave = async () => {
    const countVal = parseInt(workCount) || 0;
    const caratVal = parseFloat(caratWeight) || 0;
    if (countVal < 0 || caratVal < 0) {
      showAlert('Invalid Entry', 'Values cannot be negative.');
      return;
    }
    if (!date) return;
    setSaving(true);
    await saveEntry({
      date,
      workCount: countVal,
      caratWeight: caratVal > 0 ? caratVal : undefined,
      notes: notes || '',
      createdAt: existing?.createdAt || new Date().toISOString(),
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

  const styles = makeStyles(colors);

  return (
    <>
      <Stack.Screen options={{ title: existing ? 'Edit Entry' : 'Log Work', headerShown: true }} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Date header */}
          <View style={styles.dateCard}>
            <MaterialIcons name="event" size={20} color={colors.primary} />
            <View style={{ flex: 1, marginLeft: Spacing.md }}>
              <Text style={styles.dateText}>{dateLabel}</Text>
              <Text style={styles.dateSub}>@ ₹{settings.ratePerUnit.toFixed(2)}/unit · ₹{caratRate.toFixed(2)}/carat</Text>
            </View>
          </View>

          {/* ── Entry Type 1: Work Units ── */}
          <View style={styles.entryBlock}>
            <View style={styles.entryBlockHeader}>
              <View style={[styles.entryTypeTag, { backgroundColor: colors.primaryLight }]}>
                <MaterialIcons name="bar-chart" size={14} color={colors.primary} />
                <Text style={[styles.entryTypeText, { color: colors.primary }]}>Work Units</Text>
              </View>
              <Text style={styles.entryTypeRate}>₹{settings.ratePerUnit.toFixed(2)}/unit</Text>
            </View>
            <View style={styles.inputWrapper}>
              <MaterialIcons name="bar-chart" size={20} color={colors.primary} style={{ marginRight: 8 }} />
              <TextInput
                style={styles.mainInput}
                value={workCount}
                onChangeText={setWorkCount}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={colors.onSurfaceSubtle}
                autoFocus={!existing}
                returnKeyType="next"
              />
              <Text style={styles.unitLabel}>units</Text>
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

          {/* ── Entry Type 2: Carat Weight ── */}
          <View style={styles.entryBlock}>
            <View style={styles.entryBlockHeader}>
              <View style={[styles.entryTypeTag, { backgroundColor: colors.accentLight }]}>
                <MaterialIcons name="diamond" size={14} color={colors.accent} />
                <Text style={[styles.entryTypeText, { color: colors.accent }]}>Carat Weight</Text>
              </View>
              <Text style={styles.entryTypeRate}>₹{caratRate.toFixed(2)}/carat</Text>
            </View>
            <View style={styles.inputWrapper}>
              <MaterialIcons name="diamond" size={20} color={colors.accent} style={{ marginRight: 8 }} />
              <TextInput
                style={styles.mainInput}
                value={caratWeight}
                onChangeText={setCaratWeight}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={colors.onSurfaceSubtle}
                returnKeyType="next"
              />
              <Text style={styles.unitLabel}>ct</Text>
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

          {/* Total earnings preview */}
          {(units > 0 || carats > 0) ? (
            <View style={styles.earningsCard}>
              <View style={styles.earningsRow}>
                <View>
                  <Text style={[styles.earningsLabel, { color: colors.primary }]}>Today's Total Earnings</Text>
                  <View style={{ marginTop: 4 }}>
                    {units > 0 ? (
                      <Text style={styles.earningsLine}>Units: {formatRupee(unitEarnings)}</Text>
                    ) : null}
                    {carats > 0 ? (
                      <Text style={styles.earningsLine}>Carats: {formatRupee(caratEarnings)}</Text>
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
            <View style={[styles.inputWrapper, styles.notesWrapper]}>
              <TextInput
                style={[styles.mainInput, styles.notesInput]}
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
            <Pressable style={[styles.deleteBtn, { borderColor: colors.error + '60', backgroundColor: colors.errorLight }]} onPress={handleDelete}>
              <MaterialIcons name="delete-outline" size={18} color={colors.error} />
              <Text style={[styles.deleteBtnText, { color: colors.error }]}>Delete Entry</Text>
            </Pressable>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

function makeStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    scroll: { flex: 1, backgroundColor: colors.background },
    content: { padding: Spacing.lg },
    dateCard: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: Spacing.lg,
      backgroundColor: colors.primaryContainer,
      borderRadius: Radius.lg,
      padding: Spacing.lg,
      borderLeftWidth: 4,
      borderLeftColor: colors.primary,
    },
    dateText: { ...Typography.headlineSmall, color: colors.onSurface },
    dateSub: { ...Typography.bodySmall, color: colors.onSurfaceVariant, marginTop: 2 },

    entryBlock: {
      backgroundColor: colors.surface,
      borderRadius: Radius.lg,
      padding: Spacing.lg,
      marginBottom: Spacing.md,
      ...Shadow.sm,
    },
    entryBlockHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: Spacing.md,
    },
    entryTypeTag: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: Spacing.md,
      paddingVertical: 5,
      borderRadius: Radius.full,
    },
    entryTypeText: {
      ...Typography.labelMedium,
      marginLeft: 5,
    },
    entryTypeRate: {
      ...Typography.bodySmall,
      color: colors.onSurfaceSubtle,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surfaceVariant,
      borderRadius: Radius.md,
      padding: Spacing.md,
      borderWidth: 1.5,
      borderColor: colors.border,
    },
    mainInput: {
      ...Typography.headlineMedium,
      color: colors.onSurface,
      flex: 1,
      padding: 0,
      includeFontPadding: false,
    },
    unitLabel: {
      ...Typography.bodyMedium,
      color: colors.onSurfaceSubtle,
      marginRight: Spacing.sm,
    },
    miniEarning: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: Spacing.sm,
      paddingHorizontal: 2,
    },
    miniEarningText: {
      ...Typography.bodySmall,
      marginLeft: 4,
      fontWeight: '600',
    },

    earningsCard: {
      backgroundColor: colors.primaryContainer,
      borderRadius: Radius.lg,
      padding: Spacing.lg,
      borderWidth: 1.5,
      borderColor: colors.primaryLight,
      marginBottom: Spacing.lg,
    },
    earningsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    earningsLabel: { ...Typography.labelLarge },
    earningsLine: { ...Typography.bodySmall, color: colors.onSurfaceVariant, lineHeight: 18 },
    earningsAmount: { ...Typography.displayMedium },

    section: { marginBottom: Spacing.lg },
    label: { ...Typography.labelLarge, paddingLeft: 4, marginBottom: Spacing.sm },
    notesWrapper: { alignItems: 'flex-start', minHeight: 100 },
    notesInput: { ...Typography.bodyLarge, lineHeight: 24, minHeight: 80 },

    primaryBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: Radius.lg,
      padding: Spacing.lg,
      marginTop: Spacing.sm,
      elevation: 4,
    },
    primaryBtnText: { ...Typography.headlineSmall, marginLeft: Spacing.sm },
    deleteBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: Spacing.lg,
      borderRadius: Radius.lg,
      borderWidth: 1.5,
      marginTop: Spacing.md,
    },
    deleteBtnText: { ...Typography.labelLarge, marginLeft: Spacing.sm },
  });
}
