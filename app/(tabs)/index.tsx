import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Typography, Spacing, Radius, Shadow } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import MonthCalendar from '@/components/feature/MonthCalendar';
import DashboardCards from '@/components/feature/DashboardCards';
import { useApp } from '@/hooks/useApp';
import { parseDate } from '@/services/storage';

function formatRupee(amount: number): string {
  return '₹' + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function getInitials(name: string): string {
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { selectedDate, getEntryForDate, settings } = useApp();

  const entry = getEntryForDate(selectedDate);
  const workCount = entry ? entry.workCount : 0;
  const caratWeight = entry?.caratWeight ?? 0;
  const caratRate = settings.caratRate ?? 100;
  const totalEarnings = (workCount * settings.ratePerUnit) + (caratWeight * caratRate);

  const d = parseDate(selectedDate);
  const DAYS_S = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const MONTHS_S = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dateLabel = `${DAYS_S[d.getDay()]}, ${d.getDate()} ${MONTHS_S[d.getMonth()]}`;

  const username = settings.username || 'Worker';
  const initials = getInitials(username);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.gradientPrimaryStart }]} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.gradientPrimaryStart} />

      <LinearGradient
        colors={[colors.gradientPrimaryStart, colors.gradientPrimaryEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.topRow}>
          <View style={styles.greetingBlock}>
            <Text style={styles.greetingText}>{getGreeting()},</Text>
            <Text style={styles.usernameText} numberOfLines={1}>{username} 👋</Text>
          </View>
          <Pressable style={styles.avatarCircle} onPress={() => router.push('/(tabs)/settings')}>
            <Text style={styles.avatarInitials}>{initials}</Text>
          </Pressable>
        </View>

        <View style={styles.actionRow}>
          <View style={styles.rateChip}>
            <MaterialIcons name="currency-rupee" size={12} color="rgba(255,255,255,0.8)" />
            <Text style={styles.rateChipText}>{settings.ratePerUnit.toFixed(2)}/unit</Text>
            <View style={styles.rateDot} />
            <MaterialIcons name="diamond" size={11} color="rgba(255,255,255,0.8)" />
            <Text style={styles.rateChipText}>{(settings.caratRate ?? 100).toFixed(0)}/ct</Text>
          </View>
          <Pressable onPress={() => router.push(`/entry/${selectedDate}`)} style={styles.logBtn}>
            <MaterialIcons name="add" size={18} color={colors.primary} />
            <Text style={[styles.logBtnText, { color: colors.primary }]}>Log Work</Text>
          </Pressable>
        </View>
      </LinearGradient>

      <ScrollView
        style={[styles.scroll, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Calendar */}
        <View style={styles.calCard}>
          <MonthCalendar />
        </View>

        {/* Selected date bar */}
        <Pressable
          style={[styles.selectedBar, { backgroundColor: colors.surface, borderLeftColor: colors.primaryMid }]}
          onPress={() => router.push(`/entry/${selectedDate}`)}
        >
          <View style={styles.selectedLeft}>
            <View style={[styles.selectedIconWrap, { backgroundColor: colors.primaryLight }]}>
              <MaterialIcons name="event" size={16} color={colors.primary} />
            </View>
            <View>
              <Text style={[styles.selectedDateText, { color: colors.onSurface }]}>{dateLabel}</Text>
              <View style={styles.selectedBadgeRow}>
                {workCount > 0 ? (
                  <View style={[styles.selectedBadge, { backgroundColor: colors.primaryLight }]}>
                    <Text style={[styles.selectedBadgeText, { color: colors.primary }]}>{workCount} units</Text>
                  </View>
                ) : null}
                {caratWeight > 0 ? (
                  <View style={[styles.selectedBadge, { backgroundColor: colors.accentLight }]}>
                    <MaterialIcons name="diamond" size={10} color={colors.accent} />
                    <Text style={[styles.selectedBadgeText, { color: colors.accent }]}>{caratWeight.toFixed(2)} ct</Text>
                  </View>
                ) : null}
                {workCount === 0 && caratWeight === 0 ? (
                  <Text style={[styles.selectedBadgeText, { color: colors.onSurfaceSubtle }]}>No entry</Text>
                ) : null}
              </View>
            </View>
          </View>
          <View style={styles.selectedRight}>
            <Text style={[styles.selectedEarningLabel, { color: colors.onSurfaceSubtle }]}>Earned</Text>
            <Text style={[styles.selectedEarningAmt, { color: colors.primary }]}>{formatRupee(totalEarnings)}</Text>
          </View>
          <View style={[styles.selectedEditBtn, { backgroundColor: colors.primary }]}>
            <MaterialIcons name={entry ? 'edit' : 'add'} size={16} color={colors.onPrimary} />
          </View>
        </Pressable>

        <View style={styles.sectionRow}>
          <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Dashboard</Text>
          <Text style={[styles.sectionSub, { color: colors.onSurfaceSubtle }]}>Live earnings summary</Text>
        </View>

        <DashboardCards />
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  headerGradient: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  greetingBlock: { flex: 1, marginRight: Spacing.md },
  greetingText: { ...Typography.bodyMedium, color: 'rgba(255,255,255,0.75)' },
  usernameText: { ...Typography.headlineLarge, color: '#fff' },
  avatarCircle: {
    width: 46, height: 46, borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.45)',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarInitials: { ...Typography.labelLarge, color: '#fff', fontSize: 15 },
  actionRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  rateChip: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: Radius.full,
  },
  rateChipText: { ...Typography.labelSmall, color: 'rgba(255,255,255,0.9)', marginLeft: 3 },
  rateDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.5)', marginHorizontal: 6 },
  logBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.full, ...Shadow.md,
  },
  logBtnText: { ...Typography.labelLarge, marginLeft: 4 },
  scroll: {
    flex: 1,
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    marginTop: -Radius.xxl,
  },
  scrollContent: { paddingTop: Spacing.xl, paddingHorizontal: Spacing.lg },
  calCard: { marginBottom: Spacing.md, borderRadius: Radius.xl, overflow: 'hidden', ...Shadow.md },

  selectedBar: {
    flexDirection: 'row', alignItems: 'center', borderRadius: Radius.lg,
    padding: Spacing.md, marginBottom: Spacing.xl, ...Shadow.sm, borderLeftWidth: 4,
  },
  selectedLeft: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  selectedIconWrap: {
    width: 34, height: 34, borderRadius: Radius.md,
    alignItems: 'center', justifyContent: 'center', marginRight: Spacing.sm,
  },
  selectedBadgeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  selectedBadge: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 7, paddingVertical: 3, borderRadius: Radius.full, marginRight: 5,
  },
  selectedDateText: { ...Typography.labelLarge },
  selectedBadgeText: { ...Typography.labelSmall, marginLeft: 2 },
  selectedRight: { alignItems: 'flex-end', marginRight: Spacing.sm },
  selectedEarningLabel: { ...Typography.labelSmall },
  selectedEarningAmt: { ...Typography.headlineSmall },
  selectedEditBtn: {
    width: 32, height: 32, borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center',
  },
  sectionRow: {
    flexDirection: 'row', alignItems: 'baseline',
    justifyContent: 'space-between', marginBottom: Spacing.md,
  },
  sectionTitle: { ...Typography.headlineMedium },
  sectionSub: { ...Typography.bodySmall },
});
