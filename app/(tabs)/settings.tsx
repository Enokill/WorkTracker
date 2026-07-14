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
import { Typography, Spacing, Radius, Shadow } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/hooks/useApp';
import { useAlert } from '@/template';
import { BackupData } from '@/services/storage';
import { THEMES, ThemeId, ThemeMode } from '@/constants/themes';

function SectionHeader({ title, subtitle, colors }: { title: string; subtitle?: string; colors: any }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: colors.onSurfaceVariant }]}>{title}</Text>
      {subtitle ? <Text style={[styles.sectionSubtitle, { color: colors.onSurfaceSubtle }]}>{subtitle}</Text> : null}
    </View>
  );
}

function SettingRow({ icon, iconColor, iconBg, label, sublabel, onPress, rightElement, colors }: any) {
  return (
    <Pressable style={({ pressed }) => [styles.settingRow, pressed && { backgroundColor: colors.backgroundAlt }]} onPress={onPress}>
      <View style={[styles.settingIconWrap, { backgroundColor: iconBg }]}>
        <MaterialIcons name={icon} size={18} color={iconColor} />
      </View>
      <View style={styles.settingTextGroup}>
        <Text style={[styles.settingLabel, { color: colors.onSurface }]}>{label}</Text>
        {sublabel ? <Text style={[styles.settingSubLabel, { color: colors.onSurfaceSubtle }]}>{sublabel}</Text> : null}
      </View>
      {rightElement ?? <MaterialIcons name="chevron-right" size={20} color={colors.onSurfaceSubtle} />}
    </Pressable>
  );
}

const MODE_OPTIONS: { id: ThemeMode; label: string; icon: string }[] = [
  { id: 'auto', label: 'Auto', icon: 'brightness-auto' },
  { id: 'light', label: 'Light', icon: 'light-mode' },
  { id: 'dark', label: 'Dark', icon: 'dark-mode' },
];

export default function SettingsScreen() {
  const { colors, themeId, mode, setThemeId, setMode, themes, isDark } = useTheme();
  const { settings, updateSettings, weekTotal, entries, createBackup, restoreBackup } = useApp();
  const { showAlert } = useAlert();

  const [rateInput, setRateInput] = useState(settings.ratePerUnit.toString());
  const [caratRateInput, setCaratRateInput] = useState((settings.caratRate ?? 100).toString());
  const [usernameInput, setUsernameInput] = useState(settings.username || '');
  const [saving, setSaving] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const [savingCarat, setSavingCarat] = useState(false);
  const [backingUp, setBackingUp] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [showRestoreInput, setShowRestoreInput] = useState(false);
  const [restoreText, setRestoreText] = useState('');

  const totalEntries = entries.length;
  const allTimeWork = entries.reduce((s, e) => s + e.workCount, 0);
  const allTimeCarats = entries.reduce((s, e) => s + (e.caratWeight ?? 0), 0);
  const allTimeEarnings = (allTimeWork * settings.ratePerUnit) + (allTimeCarats * (settings.caratRate ?? 100));

  const handleSaveRate = async () => {
    const parsed = parseFloat(rateInput);
    if (isNaN(parsed) || parsed <= 0) { showAlert('Invalid Rate', 'Enter a valid positive number.'); return; }
    setSaving(true);
    await updateSettings({ ...settings, ratePerUnit: parsed });
    setSaving(false);
    showAlert('Rate Updated', `Set to \u20b9${parsed.toFixed(2)}/unit`);
  };

  const handleSaveCaratRate = async () => {
    const parsed = parseFloat(caratRateInput);
    if (isNaN(parsed) || parsed <= 0) { showAlert('Invalid Rate', 'Enter a valid positive number.'); return; }
    setSavingCarat(true);
    await updateSettings({ ...settings, caratRate: parsed });
    setSavingCarat(false);
    showAlert('Carat Rate Updated', `Set to \u20b9${parsed.toFixed(2)}/carat`);
  };

  const handleSaveName = async () => {
    const name = usernameInput.trim();
    if (!name) { showAlert('Name Required', 'Please enter your name.'); return; }
    setSavingName(true);
    await updateSettings({ ...settings, username: name });
    setSavingName(false);
    showAlert('Name Updated', `Welcome, ${name}!`);
  };

  const handleBackup = async () => {
    setBackingUp(true);
    try {
      const data = await createBackup();
      const json = JSON.stringify(data, null, 2);
      await Share.share({
        title: 'WorkTracker Backup',
        message: `WorkTracker Backup\nExported: ${new Date(data.exportedAt).toLocaleString('en-IN')}\nEntries: ${data.entries.length}\n\n--- BACKUP DATA ---\n${json}`,
      });
    } catch { showAlert('Backup Failed', 'Could not export backup data.'); }
    setBackingUp(false);
  };

  const handleRestore = () => {
    showAlert('Restore from Backup', 'Paste your backup JSON. This will REPLACE all current data.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Open Restore', onPress: () => setShowRestoreInput(true) },
    ]);
  };

  const handleConfirmRestore = async () => {
    if (!restoreText.trim()) { showAlert('Empty Input', 'Paste your backup JSON first.'); return; }
    try {
      let jsonStr = restoreText.trim();
      const jsonStart = jsonStr.indexOf('{');
      if (jsonStart > 0) jsonStr = jsonStr.slice(jsonStart);
      const data: BackupData = JSON.parse(jsonStr);
      if (!data.version || !Array.isArray(data.entries)) throw new Error('Invalid backup format');
      setRestoring(true);
      await restoreBackup(data);
      setRestoring(false);
      setShowRestoreInput(false);
      setRestoreText('');
      showAlert('Restore Complete', `Restored ${data.entries.length} entries successfully.`);
    } catch {
      setRestoring(false);
      showAlert('Restore Failed', 'Invalid backup data. Paste the complete JSON backup.');
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

          {/* Profile card */}
          <LinearGradient
            colors={[colors.gradientPrimaryStart, colors.primaryMid]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.profileCard}
          >
            <View style={styles.profileAvatar}>
              <Text style={styles.profileInitials}>{(settings.username || 'U')[0].toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.profileName}>{settings.username || 'Set your name'}</Text>
              <Text style={styles.profileSub}>{totalEntries} days · ₹{settings.ratePerUnit.toFixed(2)}/unit · ₹{(settings.caratRate ?? 100).toFixed(0)}/ct</Text>
            </View>
            <View style={styles.profileBadge}>
              <MaterialIcons name="verified" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.profileBadgeText}>Worker</Text>
            </View>
          </LinearGradient>

          {/* Stats strip */}
          <View style={[styles.statsStrip, { backgroundColor: colors.surface }]}>
            {[
              { v: totalEntries.toString(), l: 'Days' },
              { v: allTimeWork.toLocaleString('en-IN'), l: 'Units' },
              { v: allTimeCarats.toFixed(1) + ' ct', l: 'Carats' },
              { v: '₹' + (allTimeEarnings >= 1000 ? (allTimeEarnings / 1000).toFixed(1) + 'K' : allTimeEarnings.toFixed(0)), l: 'Earned', accent: true },
            ].map((s, i, arr) => (
              <React.Fragment key={s.l}>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: s.accent ? colors.accent : colors.onSurface }]}>{s.v}</Text>
                  <Text style={[styles.statLabel, { color: colors.onSurfaceSubtle }]}>{s.l}</Text>
                </View>
                {i < arr.length - 1 ? <View style={[styles.statDivider, { backgroundColor: colors.border }]} /> : null}
              </React.Fragment>
            ))}
          </View>

          {/* ── THEME SECTION ── */}
          <SectionHeader title="Appearance" subtitle="Choose theme and color mode" colors={colors} />

          {/* Mode selector */}
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <Text style={[styles.inputGroupLabel, { color: colors.onSurfaceVariant }]}>Color Mode</Text>
            <View style={styles.modeRow}>
              {MODE_OPTIONS.map(opt => {
                const isActive = mode === opt.id;
                return (
                  <Pressable
                    key={opt.id}
                    style={[
                      styles.modeBtn,
                      { backgroundColor: colors.surfaceVariant, borderColor: colors.border },
                      isActive && { backgroundColor: colors.primary, borderColor: colors.primary },
                    ]}
                    onPress={() => setMode(opt.id)}
                  >
                    <MaterialIcons name={opt.icon as any} size={18} color={isActive ? colors.onPrimary : colors.onSurfaceVariant} />
                    <Text style={[styles.modeBtnText, { color: isActive ? colors.onPrimary : colors.onSurfaceVariant }]}>{opt.label}</Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Theme palette grid */}
            <Text style={[styles.inputGroupLabel, { color: colors.onSurfaceVariant, marginTop: Spacing.lg }]}>Color Theme</Text>
            <View style={styles.themeGrid}>
              {themes.map(theme => {
                const tc = isDark ? theme.dark : theme.light;
                const isActive = themeId === theme.id;
                return (
                  <Pressable key={theme.id} style={styles.themeCard} onPress={() => setThemeId(theme.id as ThemeId)}>
                    <View style={[
                      styles.themePreview,
                      { backgroundColor: tc.gradientPrimaryStart },
                      isActive && { borderWidth: 3, borderColor: colors.primary },
                    ]}>
                      <View style={[styles.themeAccentDot, { backgroundColor: tc.accent }]} />
                      <View style={[styles.themeAccentDot, { backgroundColor: tc.primaryMid, marginTop: 4 }]} />
                      {isActive ? (
                        <View style={[styles.themeCheck, { backgroundColor: colors.onPrimary }]}>
                          <MaterialIcons name="check" size={10} color={colors.primary} />
                        </View>
                      ) : null}
                    </View>
                    <Text style={[styles.themeName, { color: isActive ? colors.primary : colors.onSurfaceVariant }]} numberOfLines={1}>
                      {theme.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* ── PROFILE ── */}
          <SectionHeader title="Profile" subtitle="Your display name" colors={colors} />
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <View style={[styles.inputGroup, { backgroundColor: colors.surfaceVariant, borderColor: colors.borderMedium }]}>
              <View style={styles.inputIconWrap}>
                <MaterialIcons name="person" size={18} color={colors.primary} />
              </View>
              <TextInput
                style={[styles.inputField, { color: colors.onSurface }]}
                value={usernameInput}
                onChangeText={setUsernameInput}
                placeholder="Enter your name"
                placeholderTextColor={colors.onSurfaceSubtle}
                returnKeyType="done"
                onSubmitEditing={handleSaveName}
              />
            </View>
            <Pressable style={[styles.saveBtn, { backgroundColor: colors.primary }, savingName && { opacity: 0.6 }]} onPress={handleSaveName} disabled={savingName}>
              <MaterialIcons name="check" size={16} color={colors.onPrimary} />
              <Text style={[styles.saveBtnText, { color: colors.onPrimary }]}>{savingName ? 'Saving...' : 'Save Name'}</Text>
            </Pressable>
          </View>

          {/* ── WORK RATE ── */}
          <SectionHeader title="Work Rate" subtitle="₹ per work unit" colors={colors} />
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <View style={[styles.inputGroup, { backgroundColor: colors.surfaceVariant, borderColor: colors.borderMedium }]}>
              <Text style={[styles.rupeeIcon, { color: colors.primary }]}>₹</Text>
              <TextInput
                style={[styles.inputField, { color: colors.onSurface }]}
                value={rateInput}
                onChangeText={setRateInput}
                keyboardType="decimal-pad"
                placeholder="2.75"
                placeholderTextColor={colors.onSurfaceSubtle}
                returnKeyType="done"
                onSubmitEditing={handleSaveRate}
              />
              <Text style={[styles.perUnitLabel, { color: colors.onSurfaceSubtle }]}>per unit</Text>
            </View>
            <Pressable style={[styles.saveBtn, { backgroundColor: colors.primary }, saving && { opacity: 0.6 }]} onPress={handleSaveRate} disabled={saving}>
              <MaterialIcons name="check" size={16} color={colors.onPrimary} />
              <Text style={[styles.saveBtnText, { color: colors.onPrimary }]}>{saving ? 'Saving...' : 'Update Rate'}</Text>
            </Pressable>
            <View style={[styles.currentRateBadge, { backgroundColor: colors.primaryLight }]}>
              <MaterialIcons name="info-outline" size={13} color={colors.primary} />
              <Text style={[styles.currentRateText, { color: colors.primary }]}>Current: ₹{settings.ratePerUnit.toFixed(2)}/unit</Text>
            </View>
          </View>

          {/* ── CARAT RATE ── */}
          <SectionHeader title="Carat Rate" subtitle="₹ per carat weight" colors={colors} />
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <View style={[styles.inputGroup, { backgroundColor: colors.surfaceVariant, borderColor: colors.borderMedium }]}>
              <MaterialIcons name="diamond" size={18} color={colors.accent} style={{ marginRight: Spacing.sm }} />
              <TextInput
                style={[styles.inputField, { color: colors.onSurface }]}
                value={caratRateInput}
                onChangeText={setCaratRateInput}
                keyboardType="decimal-pad"
                placeholder="100.00"
                placeholderTextColor={colors.onSurfaceSubtle}
                returnKeyType="done"
                onSubmitEditing={handleSaveCaratRate}
              />
              <Text style={[styles.perUnitLabel, { color: colors.onSurfaceSubtle }]}>per carat</Text>
            </View>
            <Pressable style={[styles.saveBtn, { backgroundColor: colors.accent }, savingCarat && { opacity: 0.6 }]} onPress={handleSaveCaratRate} disabled={savingCarat}>
              <MaterialIcons name="check" size={16} color="#fff" />
              <Text style={[styles.saveBtnText, { color: '#fff' }]}>{savingCarat ? 'Saving...' : 'Update Carat Rate'}</Text>
            </Pressable>
            <View style={[styles.currentRateBadge, { backgroundColor: colors.accentLight }]}>
              <MaterialIcons name="diamond" size={13} color={colors.accent} />
              <Text style={[styles.currentRateText, { color: colors.accent }]}>Current: ₹{(settings.caratRate ?? 100).toFixed(2)}/carat</Text>
            </View>
          </View>

          {/* ── DATA BACKUP ── */}
          <SectionHeader title="Data Backup" subtitle="Export and restore all work data" colors={colors} />
          <View style={[styles.menuCard, { backgroundColor: colors.surface }]}>
            <SettingRow
              icon="cloud-upload" iconColor={colors.accent} iconBg={colors.accentLight}
              label="Export Backup" sublabel={`${totalEntries} entries`}
              onPress={handleBackup} colors={colors}
              rightElement={
                <View style={[styles.actionChip, { backgroundColor: colors.accentLight }]}>
                  <Text style={[styles.actionChipText, { color: colors.accent }]}>{backingUp ? 'Exporting...' : 'Share'}</Text>
                </View>
              }
            />
            <View style={[styles.menuDivider, { backgroundColor: colors.border }]} />
            <SettingRow
              icon="cloud-download" iconColor={colors.primary} iconBg={colors.primaryLight}
              label="Restore from Backup" sublabel="Paste exported JSON"
              onPress={handleRestore} colors={colors}
              rightElement={
                <View style={[styles.actionChip, { backgroundColor: colors.primaryLight }]}>
                  <Text style={[styles.actionChipText, { color: colors.primary }]}>Restore</Text>
                </View>
              }
            />
          </View>

          {showRestoreInput ? (
            <View style={[styles.restorePanel, { backgroundColor: colors.surface, borderColor: colors.primaryLight }]}>
              <View style={styles.restorePanelHeader}>
                <MaterialIcons name="cloud-download" size={18} color={colors.primary} />
                <Text style={[styles.restorePanelTitle, { color: colors.onSurface }]}>Paste Backup JSON</Text>
                <Pressable onPress={() => { setShowRestoreInput(false); setRestoreText(''); }} hitSlop={8}>
                  <MaterialIcons name="close" size={20} color={colors.onSurfaceVariant} />
                </Pressable>
              </View>
              <TextInput
                style={[styles.restoreInput, { borderColor: colors.borderMedium, color: colors.onSurface, backgroundColor: colors.surfaceVariant }]}
                value={restoreText}
                onChangeText={setRestoreText}
                placeholder={'Paste backup JSON here...'}
                placeholderTextColor={colors.onSurfaceSubtle}
                multiline numberOfLines={8}
                textAlignVertical="top"
                autoFocus
              />
              <View style={styles.restoreActions}>
                <Pressable style={[styles.restoreCancelBtn, { borderColor: colors.borderMedium }]} onPress={() => { setShowRestoreInput(false); setRestoreText(''); }}>
                  <Text style={[styles.restoreCancelText, { color: colors.onSurfaceVariant }]}>Cancel</Text>
                </Pressable>
                <Pressable style={[styles.restoreConfirmBtn, { backgroundColor: colors.primary }, restoring && { opacity: 0.6 }]} onPress={handleConfirmRestore} disabled={restoring}>
                  <MaterialIcons name="restore" size={16} color={colors.onPrimary} />
                  <Text style={[styles.restoreConfirmText, { color: colors.onPrimary }]}>{restoring ? 'Restoring...' : 'Restore Data'}</Text>
                </Pressable>
              </View>
              <Text style={[styles.restoreWarning, { color: colors.warning }]}>This will replace all current data.</Text>
            </View>
          ) : null}

          {/* About */}
          <SectionHeader title="About" colors={colors} />
          <View style={[styles.menuCard, { backgroundColor: colors.surface }]}>
            <SettingRow
              icon="work" iconColor={colors.primary} iconBg={colors.primaryLight}
              label="Daily Work Tracker" sublabel="Version 1.1 · Units + Carats"
              colors={colors}
              rightElement={
                <View style={[styles.versionBadge, { backgroundColor: colors.primaryLight }]}>
                  <Text style={[styles.versionText, { color: colors.primary }]}>v1.1</Text>
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
  safe: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: Spacing.lg },

  profileCard: {
    borderRadius: Radius.xl, padding: Spacing.xl,
    flexDirection: 'row', alignItems: 'center',
    marginBottom: Spacing.md, ...Shadow.md,
  },
  profileAvatar: {
    width: 52, height: 52, borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center', justifyContent: 'center', marginRight: Spacing.lg,
  },
  profileInitials: { ...Typography.headlineLarge, color: '#fff' },
  profileName: { ...Typography.headlineMedium, color: '#fff', marginBottom: 2 },
  profileSub: { ...Typography.bodySmall, color: 'rgba(255,255,255,0.75)' },
  profileBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: Radius.full,
  },
  profileBadgeText: { ...Typography.labelSmall, color: 'rgba(255,255,255,0.85)', marginLeft: 3 },

  statsStrip: {
    flexDirection: 'row', borderRadius: Radius.lg,
    padding: Spacing.md, marginBottom: Spacing.xl, ...Shadow.sm,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { ...Typography.headlineSmall },
  statLabel: { ...Typography.labelSmall, marginTop: 2 },
  statDivider: { width: 1, marginVertical: 4 },

  sectionHeader: { marginBottom: Spacing.sm, marginTop: Spacing.md, paddingLeft: 4 },
  sectionTitle: { ...Typography.labelLarge, textTransform: 'uppercase', letterSpacing: 0.8 },
  sectionSubtitle: { ...Typography.bodySmall, marginTop: 2 },

  card: { borderRadius: Radius.lg, padding: Spacing.lg, marginBottom: Spacing.md, ...Shadow.sm },

  inputGroupLabel: { ...Typography.labelMedium, marginBottom: Spacing.sm },

  // Mode buttons
  modeRow: { flexDirection: 'row' },
  modeBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: Spacing.md, marginRight: Spacing.sm,
    borderRadius: Radius.md, borderWidth: 1.5,
  },
  modeBtnText: { ...Typography.labelMedium, marginLeft: 6 },

  // Theme grid
  themeGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -Spacing.xs },
  themeCard: { width: '25%', alignItems: 'center', padding: Spacing.xs, marginBottom: Spacing.sm },
  themePreview: {
    width: 54, height: 54, borderRadius: Radius.lg,
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  themeAccentDot: { width: 16, height: 6, borderRadius: 3 },
  themeCheck: {
    position: 'absolute', bottom: 4, right: 4,
    width: 18, height: 18, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center',
  },
  themeName: { ...Typography.labelSmall, textAlign: 'center', marginTop: 5, fontSize: 10 },

  inputGroup: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.OS === 'android' ? 8 : Spacing.md,
    marginBottom: Spacing.md,
  },
  inputIconWrap: { marginRight: Spacing.sm },
  rupeeIcon: { ...Typography.headlineMedium, marginRight: Spacing.sm },
  inputField: { ...Typography.headlineSmall, flex: 1, padding: 0, includeFontPadding: false },
  perUnitLabel: { ...Typography.bodyMedium, marginLeft: Spacing.xs },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderRadius: Radius.md, paddingVertical: Spacing.md, ...Shadow.sm,
  },
  saveBtnText: { ...Typography.labelLarge, marginLeft: 6 },
  currentRateBadge: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: Radius.md, padding: Spacing.sm, marginTop: Spacing.md,
  },
  currentRateText: { ...Typography.bodySmall, marginLeft: 6 },

  menuCard: { borderRadius: Radius.lg, overflow: 'hidden', marginBottom: Spacing.md, ...Shadow.sm },
  settingRow: { flexDirection: 'row', alignItems: 'center', padding: Spacing.lg },
  settingIconWrap: {
    width: 36, height: 36, borderRadius: Radius.md,
    alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md,
  },
  settingTextGroup: { flex: 1 },
  settingLabel: { ...Typography.labelLarge },
  settingSubLabel: { ...Typography.bodySmall, marginTop: 2 },
  menuDivider: { height: 1, marginLeft: 68 },
  actionChip: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: Radius.full },
  actionChipText: { ...Typography.labelSmall, fontWeight: '700' },
  versionBadge: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: Radius.full },
  versionText: { ...Typography.labelSmall },

  restorePanel: {
    borderRadius: Radius.xl, padding: Spacing.lg,
    marginBottom: Spacing.md, borderWidth: 1.5, ...Shadow.md,
  },
  restorePanelHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  restorePanelTitle: { ...Typography.headlineSmall, flex: 1, marginLeft: Spacing.sm },
  restoreInput: {
    borderWidth: 1.5, borderRadius: Radius.md, padding: Spacing.md,
    ...Typography.bodyMedium, minHeight: 160,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginBottom: Spacing.md,
  },
  restoreActions: { flexDirection: 'row' },
  restoreCancelBtn: {
    flex: 1, padding: Spacing.md, borderRadius: Radius.md,
    alignItems: 'center', borderWidth: 1.5, marginRight: Spacing.sm,
  },
  restoreCancelText: { ...Typography.labelLarge },
  restoreConfirmBtn: {
    flex: 2, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', borderRadius: Radius.md, padding: Spacing.md,
  },
  restoreConfirmText: { ...Typography.labelLarge, marginLeft: 6 },
  restoreWarning: { ...Typography.bodySmall, marginTop: Spacing.md, textAlign: 'center' },
});
