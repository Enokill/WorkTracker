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
import { SafeAreaView } from 'react-native-safe-area-context';
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
  const [notes, setNotes] = useState(existing ? existing.notes : '');
  const [saving, setSaving] = useState(false);

  const parsedDate = date ? parseDate(date) : new Date();
  const dateLabel = parsedDate.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const count = parseInt(workCount) || 0;
  const earnings = count * settings.ratePerUnit;

  const handleSave = async () => {
    const countVal = parseInt(workCount);
    if (isNaN(countVal) || countVal < 0) {
      showAlert('Invalid Entry', 'Please enter a valid work count (0 or more).');
      return;
    }
    if (!date) return;
    setSaving(true);
    await saveEntry({
      date,
      workCount: countVal,
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
        {/* Date card */}
        <View style={styles.dateCard}>
          <MaterialIcons name="event" size={20} color={Colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.dateText}>{dateLabel}</Text>
            <Text style={styles.dateSub}>@ ₹{settings.ratePerUnit.toFixed(2)} per unit</Text>
          </View>
        </View>

        {/* Work count input */}
        <View style={styles.section}>
          <Text style={styles.label}>Work Count *</Text>
          <View style={styles.inputWrapper}>
            <MaterialIcons name="bar-chart" size={20} color={Colors.primary} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.mainInput}
              value={workCount}
              onChangeText={setWorkCount}
              keyboardType="numeric"
              placeholder="Enter units completed"
              placeholderTextColor={Colors.onSurfaceSubtle}
              autoFocus={!existing}
              returnKeyType="next"
            />
            {workCount !== '' ? (
              <Pressable onPress={() => setWorkCount('')} hitSlop={8}>
                <MaterialIcons name="clear" size={18} color={Colors.onSurfaceSubtle} />
              </Pressable>
            ) : null}
          </View>
        </View>

        {/* Earnings preview */}
        {count > 0 ? (
          <View style={styles.earningsCard}>
            <View style={styles.earningsRow}>
              <View>
                <Text style={styles.earningsLabel}>Today's Earnings</Text>
                <Text style={styles.earningsFormula}>
                  {count} units × ₹{settings.ratePerUnit.toFixed(2)}
                </Text>
              </View>
              <Text style={styles.earningsAmount}>{formatRupee(earnings)}</Text>
            </View>
          </View>
        ) : null}

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.label}>Notes (Optional)</Text>
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

        {/* Actions */}
        <Pressable
          style={[styles.primaryBtn, saving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={saving}
        >
          <MaterialIcons name="check" size={20} color={Colors.onPrimary} />
          <Text style={styles.primaryBtnText}>{saving ? 'Saving...' : existing ? 'Update Entry' : 'Save Entry'}</Text>
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
  content: { padding: Spacing.lg },
  dateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    backgroundColor: Colors.primaryContainer,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  dateText: { ...Typography.headlineSmall, color: Colors.onSurface, marginLeft: Spacing.md },
  dateSub: { ...Typography.bodySmall, color: Colors.onSurfaceVariant, marginTop: 2 },
  section: { marginBottom: Spacing.lg },
  label: { ...Typography.labelLarge, color: Colors.onSurfaceVariant, paddingLeft: 4 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    marginTop: Spacing.sm,
    ...Shadow.sm,
  },
  mainInput: {
    ...Typography.headlineSmall,
    color: Colors.onSurface,
    flex: 1,
    padding: 0,
    includeFontPadding: false,
  },
  notesWrapper: { alignItems: 'flex-start', minHeight: 100 },
  notesInput: {
    ...Typography.bodyLarge,
    lineHeight: 24,
    minHeight: 80,
  },
  earningsCard: {
    backgroundColor: Colors.accentLight,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.accent + '40',
    marginBottom: Spacing.lg,
  },
  earningsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  earningsLabel: { ...Typography.labelLarge, color: Colors.accent },
  earningsFormula: { ...Typography.bodySmall, color: Colors.onSurfaceVariant, marginTop: 2 },
  earningsAmount: {
    ...Typography.displayMedium,
    color: Colors.accent,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginTop: Spacing.sm,
    elevation: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  primaryBtnText: { ...Typography.headlineSmall, color: Colors.onPrimary, marginLeft: Spacing.sm },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.error + '60',
    backgroundColor: Colors.errorLight,
  },
  deleteBtnText: { ...Typography.labelLarge, color: Colors.error, marginLeft: Spacing.sm },
});
