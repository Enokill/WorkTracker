import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Shadow } from '@/constants/theme';
import { useApp } from '@/hooks/useApp';
import { useAlert } from '@/template';
import { BackupData } from '@/services/storage';

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

interface SettingRowProps {
  icon: string;
  iconColor: string;
  iconBg: string;
  label: string;
  sublabel?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  dangerous?: boolean;
}

function SettingRow({ icon, iconColor, iconBg, label, sublabel, onPress, rightElement, dangerous }: SettingRowProps) {
  return (
    <Pressable style={({ pressed }) => [styles.settingRow, pressed && styles.settingRowPressed]} onPress={onPress}>
      <View style={[styles.settingIconWrap, { backgroundColor: iconBg }]}>
        <MaterialIcons name={icon as any} size={18} color={iconColor} />
      </View>
      <View style={styles.settingTextGroup}>
        <Text style={[styles.settingLabel, dangerous && { color: Colors.error }]}>{label}</Text>
        {sublabel ? <Text style={styles.settingSubLabel}>{sublabel}</Text> : null}
      </View>
      {rightElement ? rightElement : (
        <MaterialIcons name="chevron-right" size={20} color={Colors.onSurfaceSubtle} />
      )}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const { settings, updateSettings, monthTotal, weekTotal, entries, createBackup, restoreBackup, refresh } = useApp();
  const { showAlert } = useAlert();

  const [rateInput, setRateInput] = useState(settings.ratePerUnit.toString());
  const [usernameInput, setUsernameInput] = useState(settings.username || '');
  const [saving, setSaving] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const [backingUp, setBackingUp] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const totalEntries = entries.length;
  const allTimeWork = entries.reduce((s, e) => s + e.workCount, 0);
  const allTimeEarnings = allTimeWork * settings.ratePerUnit;

  const handleSaveRate = async () => {
    const parsed = parseFloat(rateInput);
    if (isNaN(parsed) || parsed <= 0) {
      showAlert('Invalid Rate', 'Please enter a valid positive number for the rate.');
      return;
    }
    setSaving(true);
    await updateSettings({ ...settings, ratePerUnit: parsed });
    setSaving(false);
    showAlert('Rate Updated', `New rate set to \u20b9${parsed.toFixed(2)} per unit.`);
  };

  const handleSaveName = async () => {
    const name = usernameInput.trim();
    if (!name) {
      showAlert('Name Required', 'Please enter your name.');
      return;
    }
    setSavingName(true);
    await updateSettings({ ...settings, username: name });
    setSavingName(false);
    showAlert('Name Updated', `Welcome, ${name}!`);
  };

  // --- Backup ---
  const handleBackup = async () => {
    setBackingUp(true);
    try {
      const data = await createBackup();
      const json = JSON.stringify(data, null, 2);
      await Share.share({
        title: 'WorkTracker Backup',
        message: `WorkTracker Backup\nExported: ${new Date(data.exportedAt).toLocaleString('en-IN')}\nEntries: ${data.entries.length}\n\n--- BACKUP DATA (copy all below) ---\n${json}`,
      });
    } catch (e) {
      showAlert('Backup Failed', 'Could not export backup data.');
    }
    setBackingUp(false);
  };

  // --- Restore ---
  const restoreInputRef = useRef('');

  const handleRestore = () => {
    showAlert(
      'Restore from Backup',
      'Paste your backup JSON below. This will REPLACE all current data.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open Restore Input',
          onPress: () => setShowRestoreInput(true),
        },
      ]
    );
  };

  const [showRestoreInput, setShowRestoreInput] = useState(false);
  const [restoreText, setRestoreText] = useState('');

  const handleConfirmRestore = async () => {
    if (!restoreText.trim()) {
      showAlert('Empty Input', 'Please paste your backup JSON first.');
      return;
    }
    try {
      // Extract JSON from the pasted text (in case they pasted the full share message)
      let jsonStr = restoreText.trim();
      const jsonStart = jsonStr.indexOf('{');
      if (jsonStart > 0) jsonStr = jsonStr.slice(jsonStart);

      const data: BackupData = JSON.parse(jsonStr);
      if (!data.version || !Array.isArray(data.entries)) {
        throw new Error('Invalid backup format');
      }
      setRestoring(true);
      await restoreBackup(data);
      setRestoring(false);
      setShowRestoreInput(false);
      setRestoreText('');
      showAlert('Restore Complete', `Restored ${data.entries.length} entries successfully.`);
    } catch {
      setRestoring(false);
      showAlert('Restore Failed', 'Invalid backup data. Make sure you pasted the complete JSON backup.');
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

          {/* Profile header */}
          <LinearGradient
            colors={[Colors.gradientPrimaryStart, Colors.primaryMid]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.profileCard}
          >
            <View style={styles.profileAvatar}>
              <Text style={styles.profileInitials}>
                {(settings.username || 'U')[0].toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.profileName}>{settings.username || 'Set your name'}</Text>
              <Text style={styles.profileSub}>{totalEntries} days logged · ₹{settings.ratePerUnit.toFixed(2)}/unit</Text>
            </View>
            <View style={styles.profileBadge}>
              <MaterialIcons name="verified" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.profileBadgeText}>Worker</Text>
            </View>
          </LinearGradient>

          {/* Stats strip */}
          <View style={styles.statsStrip}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalEntries}</Text>
              <Text style={styles.statLabel}>Days</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{allTimeWork.toLocaleString('en-IN')}</Text>
              <Text style={styles.statLabel}>Total Units</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: Colors.accent }]}>
                {'₹' + (allTimeEarnings >= 1000
                  ? (allTimeEarnings / 1000).toFixed(1) + 'K'
                  : allTimeEarnings.toFixed(0))}
              </Text>
              <Text style={styles.statLabel}>Earned</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{weekTotal.toLocaleString('en-IN')}</Text>
              <Text style={styles.statLabel}>This Week</Text>
            </View>
          </View>

          {/* Username */}
          <SectionHeader title="Profile" subtitle="Your display name on the home screen" />
          <View style={styles.card}>
            <View style={styles.inputGroup}>
              <View style={styles.inputIconWrap}>
                <MaterialIcons name="person" size={18} color={Colors.primary} />
              </View>
              <TextInput
                style={styles.inputField}
                value={usernameInput}
                onChangeText={setUsernameInput}
                placeholder="Enter your name"
                placeholderTextColor={Colors.onSurfaceSubtle}
                returnKeyType="done"
                onSubmitEditing={handleSaveName}
              />
            </View>
            <Pressable
              style={[styles.saveBtn, savingName && { opacity: 0.6 }]}
              onPress={handleSaveName}
              disabled={savingName}
            >
              <MaterialIcons name="check" size={16} color={Colors.onPrimary} />
              <Text style={styles.saveBtnText}>{savingName ? 'Saving...' : 'Save Name'}</Text>
            </Pressable>
          </View>

          {/* Rate */}
          <SectionHeader title="Work Rate" subtitle="Applied to all earnings calculations" />
          <View style={styles.card}>
            <View style={styles.inputGroup}>
              <View style={styles.inputIconWrap}>
                <Text style={styles.rupeeIcon}>₹</Text>
              </View>
              <TextInput
                style={styles.inputField}
                value={rateInput}
                onChangeText={setRateInput}
                keyboardType="decimal-pad"
                placeholder="2.75"
                placeholderTextColor={Colors.onSurfaceSubtle}
                returnKeyType="done"
                onSubmitEditing={handleSaveRate}
              />
              <Text style={styles.perUnitLabel}>per unit</Text>
            </View>
            <Pressable
              style={[styles.saveBtn, saving && { opacity: 0.6 }]}
              onPress={handleSaveRate}
              disabled={saving}
            >
              <MaterialIcons name="check" size={16} color={Colors.onPrimary} />
              <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Update Rate'}</Text>
            </Pressable>
            <View style={styles.currentRateBadge}>
              <MaterialIcons name="info-outline" size={13} color={Colors.primary} />
              <Text style={styles.currentRateText}>Current: ₹{settings.ratePerUnit.toFixed(2)} per unit</Text>
            </View>
          </View>

          {/* Backup & Restore */}
          <SectionHeader title="Data Backup" subtitle="Export and restore all your work data" />
          <View style={styles.menuCard}>
            <SettingRow
              icon="cloud-upload"
              iconColor={Colors.accent}
              iconBg={Colors.accentLight}
              label="Export Backup"
              sublabel={`${totalEntries} entries will be exported`}
              onPress={handleBackup}
              rightElement={
                <View style={styles.actionChip}>
                  <Text style={[styles.actionChipText, { color: Colors.accent }]}>
                    {backingUp ? 'Exporting...' : 'Share'}
                  </Text>
                </View>
              }
            />
            <View style={styles.menuDivider} />
            <SettingRow
              icon="cloud-download"
              iconColor={Colors.primary}
              iconBg={Colors.primaryLight}
              label="Restore from Backup"
              sublabel="Paste exported JSON to restore data"
              onPress={handleRestore}
              rightElement={
                <View style={[styles.actionChip, { backgroundColor: Colors.primaryLight }]}>
                  <Text style={[styles.actionChipText, { color: Colors.primary }]}>Restore</Text>
                </View>
              }
            />
          </View>

          {/* Restore input panel */}
          {showRestoreInput ? (
            <View style={styles.restorePanel}>
              <View style={styles.restorePanelHeader}>
                <MaterialIcons name="cloud-download" size={18} color={Colors.primary} />
                <Text style={styles.restorePanelTitle}>Paste Backup JSON</Text>
                <Pressable onPress={() => { setShowRestoreInput(false); setRestoreText(''); }} hitSlop={8}>
                  <MaterialIcons name="close" size={20} color={Colors.onSurfaceVariant} />
                </Pressable>
              </View>
              <TextInput
                style={styles.restoreInput}
                value={restoreText}
                onChangeText={setRestoreText}
                placeholder={`Paste your backup JSON here...\n\n{\n  "version": 1,\n  "entries": [...]\n}`}
                placeholderTextColor={Colors.onSurfaceSubtle}
                multiline
                numberOfLines={8}
                textAlignVertical="top"
                autoFocus
              />
              <View style={styles.restoreActions}>
                <Pressable
                  style={styles.restoreCancelBtn}
                  onPress={() => { setShowRestoreInput(false); setRestoreText(''); }}
                >
                  <Text style={styles.restoreCancelText}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={[styles.restoreConfirmBtn, restoring && { opacity: 0.6 }]}
                  onPress={handleConfirmRestore}
                  disabled={restoring}
                >
                  <MaterialIcons name="restore" size={16} color={Colors.onPrimary} />
                  <Text style={styles.restoreConfirmText}>{restoring ? 'Restoring...' : 'Restore Data'}</Text>
                </Pressable>
              </View>
              <Text style={styles.restoreWarning}>
                ⚠ This will replace all current data with the backup.
              </Text>
            </View>
          ) : null}

          {/* About */}
          <SectionHeader title="About" />
          <View style={styles.menuCard}>
            <SettingRow
              icon="work"
              iconColor={Colors.primary}
              iconBg={Colors.primaryLight}
              label="Daily Work Tracker"
              sublabel="Version 1.0 · Local storage"
              rightElement={
                <View style={styles.versionBadge}>
                  <Text style={styles.versionText}>v1.0</Text>
                </View>
              }
            />
          </View>

          <View style={{ height: 48 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: { padding: Spacing.lg },

  // Profile card
  profileCard: {
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    ...Shadow.md,
    // no gap
  },
  profileAvatar: {
    width: 52,
    height: 52,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.lg,
  },
  profileInitials: {
    ...Typography.headlineLarge,
    color: Colors.onPrimary,
  },
  profileName: {
    ...Typography.headlineMedium,
    color: Colors.onPrimary,
    marginBottom: 2,
  },
  profileSub: {
    ...Typography.bodySmall,
    color: 'rgba(255,255,255,0.75)',
  },
  profileBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  profileBadgeText: {
    ...Typography.labelSmall,
    color: 'rgba(255,255,255,0.85)',
    marginLeft: 3,
  },

  // Stats strip
  statsStrip: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
    ...Shadow.sm,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...Typography.headlineSmall,
    color: Colors.onSurface,
  },
  statLabel: {
    ...Typography.labelSmall,
    color: Colors.onSurfaceSubtle,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginVertical: 4,
  },

  // Section header
  sectionHeader: {
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
    paddingLeft: 4,
  },
  sectionTitle: {
    ...Typography.labelLarge,
    color: Colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  sectionSubtitle: {
    ...Typography.bodySmall,
    color: Colors.onSurfaceSubtle,
    marginTop: 2,
  },

  // Card
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadow.sm,
  },

  // Input group
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.borderMedium,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.OS === 'android' ? 8 : Spacing.md,
    backgroundColor: Colors.surfaceVariant,
    marginBottom: Spacing.md,
  },
  inputIconWrap: {
    marginRight: Spacing.sm,
  },
  rupeeIcon: {
    ...Typography.headlineMedium,
    color: Colors.primary,
    marginRight: Spacing.sm,
  },
  inputField: {
    ...Typography.headlineSmall,
    color: Colors.onSurface,
    flex: 1,
    padding: 0,
    includeFontPadding: false,
  },
  perUnitLabel: {
    ...Typography.bodyMedium,
    color: Colors.onSurfaceSubtle,
    marginLeft: Spacing.xs,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    ...Shadow.sm,
  },
  saveBtnText: {
    ...Typography.labelLarge,
    color: Colors.onPrimary,
    marginLeft: 6,
  },
  currentRateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    marginTop: Spacing.md,
  },
  currentRateText: {
    ...Typography.bodySmall,
    color: Colors.primary,
    marginLeft: 6,
  },

  // Menu card (list of rows)
  menuCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    ...Shadow.sm,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  settingRowPressed: {
    backgroundColor: Colors.backgroundAlt,
  },
  settingIconWrap: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  settingTextGroup: {
    flex: 1,
  },
  settingLabel: {
    ...Typography.labelLarge,
    color: Colors.onSurface,
  },
  settingSubLabel: {
    ...Typography.bodySmall,
    color: Colors.onSurfaceSubtle,
    marginTop: 2,
  },
  menuDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: 68,
  },
  actionChip: {
    backgroundColor: Colors.accentLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  actionChipText: {
    ...Typography.labelSmall,
    fontWeight: '700',
  },
  versionBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  versionText: {
    ...Typography.labelSmall,
    color: Colors.primary,
  },

  // Restore panel
  restorePanel: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.primaryLight,
    ...Shadow.md,
  },
  restorePanelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  restorePanelTitle: {
    ...Typography.headlineSmall,
    color: Colors.onSurface,
    flex: 1,
    marginLeft: Spacing.sm,
  },
  restoreInput: {
    borderWidth: 1.5,
    borderColor: Colors.borderMedium,
    borderRadius: Radius.md,
    padding: Spacing.md,
    ...Typography.bodyMedium,
    color: Colors.onSurface,
    backgroundColor: Colors.surfaceVariant,
    minHeight: 160,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginBottom: Spacing.md,
  },
  restoreActions: {
    flexDirection: 'row',
  },
  restoreCancelBtn: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.borderMedium,
    marginRight: Spacing.sm,
  },
  restoreCancelText: {
    ...Typography.labelLarge,
    color: Colors.onSurfaceVariant,
  },
  restoreConfirmBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  restoreConfirmText: {
    ...Typography.labelLarge,
    color: Colors.onPrimary,
    marginLeft: 6,
  },
  restoreWarning: {
    ...Typography.bodySmall,
    color: Colors.warning,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
});
