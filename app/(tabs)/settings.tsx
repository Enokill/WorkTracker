import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Shadow } from '@/constants/theme';
import { useApp } from '@/hooks/useApp';
import { useAlert } from '@/template';

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

export default function SettingsScreen() {
  const { settings, updateSettings, monthTotal, weekTotal, entries } = useApp();
  const { showAlert } = useAlert();
  const [rateInput, setRateInput] = useState(settings.ratePerUnit.toString());
  const [saving, setSaving] = useState(false);

  const handleSaveRate = async () => {
    const parsed = parseFloat(rateInput);
    if (isNaN(parsed) || parsed <= 0) {
      showAlert('Invalid Rate', 'Please enter a valid positive number for the rate.');
      return;
    }
    setSaving(true);
    await updateSettings({ ...settings, ratePerUnit: parsed });
    setSaving(false);
    showAlert('Rate Updated', `New rate set to ₹${parsed.toFixed(2)} per unit. All calculations updated.`);
  };

  const totalEntries = entries.length;
  const allTimeWork = entries.reduce((s, e) => s + e.workCount, 0);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <MaterialIcons name="settings" size={28} color={Colors.primary} />
            <Text style={styles.title}>Settings</Text>
          </View>

          {/* Rate Card */}
          <SectionHeader title="Work Rate" />
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Rate Per Work Unit</Text>
            <Text style={styles.cardDesc}>
              This rate is used across all earnings calculations throughout the app.
            </Text>
            <View style={styles.rateRow}>
              <View style={styles.rateInputWrapper}>
                <Text style={styles.rupeeSymbol}>₹</Text>
                <TextInput
                  style={styles.rateInput}
                  value={rateInput}
                  onChangeText={setRateInput}
                  keyboardType="decimal-pad"
                  placeholder="2.75"
                  placeholderTextColor={Colors.onSurfaceSubtle}
                  returnKeyType="done"
                  onSubmitEditing={handleSaveRate}
                />
                <Text style={styles.rateUnit}>/ unit</Text>
              </View>
              <Pressable
                style={[styles.saveBtn, saving && { opacity: 0.6 }]}
                onPress={handleSaveRate}
                disabled={saving}
              >
                <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save'}</Text>
              </Pressable>
            </View>
            <View style={styles.currentRateBadge}>
              <MaterialIcons name="info" size={14} color={Colors.primary} />
              <Text style={styles.currentRateText}>
                Current rate: ₹{settings.ratePerUnit.toFixed(2)} per unit
              </Text>
            </View>
          </View>

          {/* Stats */}
          <SectionHeader title="Statistics" />
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <MaterialIcons name="calendar-month" size={24} color={Colors.primary} />
              <Text style={styles.statValue}>{totalEntries}</Text>
              <Text style={styles.statLabel}>Days Logged</Text>
            </View>
            <View style={styles.statCard}>
              <MaterialIcons name="bar-chart" size={24} color={Colors.accent} />
              <Text style={[styles.statValue, { color: Colors.accent }]}>
                {allTimeWork.toLocaleString('en-IN')}
              </Text>
              <Text style={styles.statLabel}>Total Units</Text>
            </View>
            <View style={styles.statCard}>
              <MaterialIcons name="date-range" size={24} color={Colors.secondary} />
              <Text style={[styles.statValue, { color: Colors.secondary }]}>
                {monthTotal.toLocaleString('en-IN')}
              </Text>
              <Text style={styles.statLabel}>This Month</Text>
            </View>
            <View style={styles.statCard}>
              <MaterialIcons name="today" size={24} color={Colors.warning} />
              <Text style={[styles.statValue, { color: Colors.warning }]}>
                {weekTotal.toLocaleString('en-IN')}
              </Text>
              <Text style={styles.statLabel}>This Week</Text>
            </View>
          </View>

          {/* About */}
          <SectionHeader title="About" />
          <View style={styles.card}>
            <View style={styles.aboutRow}>
              <MaterialIcons name="work" size={20} color={Colors.primary} />
              <Text style={styles.aboutTitle}>Daily Work Tracker</Text>
            </View>
            <Text style={styles.aboutDesc}>
              Track your daily work units and earnings. All data is stored locally on your device for fast, offline-first access.
            </Text>
            <View style={styles.aboutBadge}>
              <Text style={styles.aboutVersion}>Version 1.0</Text>
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: { padding: Spacing.lg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
    marginTop: Spacing.sm,
  },
  title: { ...Typography.displayMedium, color: Colors.onSurface },
  sectionHeader: {
    ...Typography.labelLarge,
    color: Colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
    paddingLeft: 4,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadow.sm,
  },
  cardTitle: { ...Typography.headlineSmall, color: Colors.onSurface, marginBottom: 4 },
  cardDesc: { ...Typography.bodyMedium, color: Colors.onSurfaceVariant, marginBottom: Spacing.lg },
  rateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  rateInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.OS === 'android' ? 6 : Spacing.md,
    backgroundColor: Colors.primaryContainer,
  },
  rupeeSymbol: {
    ...Typography.headlineMedium,
    color: Colors.primary,
    marginRight: 4,
  },
  rateInput: {
    ...Typography.headlineMedium,
    color: Colors.primary,
    flex: 1,
    padding: 0,
    includeFontPadding: false,
  },
  rateUnit: {
    ...Typography.bodyMedium,
    color: Colors.onSurfaceVariant,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    elevation: 2,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  saveBtnText: { ...Typography.labelLarge, color: Colors.onPrimary },
  currentRateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.md,
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.md,
    padding: Spacing.sm,
  },
  currentRateText: { ...Typography.bodySmall, color: Colors.primary },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Spacing.md,
    marginHorizontal: -Spacing.xs,
  },
  statCard: {
    flex: 1,
    minWidth: '44%',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    ...Shadow.sm,
    margin: Spacing.xs,
  },
  statValue: {
    ...Typography.displayMedium,
    color: Colors.onSurface,
    marginTop: 6,
  },
  statLabel: {
    ...Typography.labelMedium,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  aboutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  aboutTitle: { ...Typography.headlineSmall, color: Colors.onSurface },
  aboutDesc: { ...Typography.bodyMedium, color: Colors.onSurfaceVariant, lineHeight: 22, marginBottom: Spacing.md },
  aboutBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
  },
  aboutVersion: { ...Typography.labelSmall, color: Colors.primary },
});
