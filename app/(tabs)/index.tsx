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
import { Colors, Typography, Spacing, Radius, Shadow } from '@/constants/theme';
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
  const { selectedDate, getEntryForDate, settings } = useApp();

  const entry = getEntryForDate(selectedDate);
  const workCount = entry ? entry.workCount : 0;
  const d = parseDate(selectedDate);
  const dateLabel = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
  const username = settings.username || 'Worker';
  const initials = getInitials(username);

  const handleAddEntry = () => {
    router.push(`/entry/${selectedDate}`);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.gradientPrimaryStart} />

      {/* Gradient Header */}
      <LinearGradient
        colors={[Colors.gradientPrimaryStart, Colors.gradientPrimaryEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        {/* Top row: greeting + avatar */}
        <View style={styles.topRow}>
          <View style={styles.greetingBlock}>
            <Text style={styles.greetingText}>{getGreeting()},</Text>
            <Text style={styles.usernameText} numberOfLines={1}>{username} 👋</Text>
          </View>
          <Pressable style={styles.avatarCircle} onPress={() => router.push('/(tabs)/settings')}>
            <Text style={styles.avatarInitials}>{initials}</Text>
          </Pressable>
        </View>

        {/* Log work button row */}
        <View style={styles.actionRow}>
          <View style={styles.rateChip}>
            <MaterialIcons name="currency-rupee" size={12} color="rgba(255,255,255,0.8)" />
            <Text style={styles.rateChipText}>{settings.ratePerUnit.toFixed(2)}/unit</Text>
          </View>
          <Pressable onPress={handleAddEntry} style={styles.logBtn}>
            <MaterialIcons name="add" size={18} color={Colors.primary} />
            <Text style={styles.logBtnText}>Log Work</Text>
          </Pressable>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Calendar card */}
        <View style={styles.calCard}>
          <MonthCalendar />
        </View>

        {/* Selected date pill */}
        <Pressable style={styles.selectedBar} onPress={handleAddEntry}>
          <View style={styles.selectedLeft}>
            <View style={styles.selectedIconWrap}>
              <MaterialIcons name="event" size={16} color={Colors.primary} />
            </View>
            <View>
              <Text style={styles.selectedDateText}>{dateLabel}</Text>
              <Text style={styles.selectedUnitText}>{workCount} units logged</Text>
            </View>
          </View>
          <View style={styles.selectedRight}>
            <Text style={styles.selectedEarningLabel}>Earned</Text>
            <Text style={styles.selectedEarningAmt}>{formatRupee(workCount * settings.ratePerUnit)}</Text>
          </View>
          <View style={styles.selectedEditBtn}>
            <MaterialIcons name={entry ? 'edit' : 'add'} size={16} color={Colors.onPrimary} />
          </View>
        </Pressable>

        {/* Dashboard heading */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Dashboard</Text>
          <Text style={styles.sectionSub}>Live earnings summary</Text>
        </View>

        <DashboardCards />

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.gradientPrimaryStart,
  },
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
  greetingBlock: {
    flex: 1,
    marginRight: Spacing.md,
  },
  greetingText: {
    ...Typography.bodyMedium,
    color: 'rgba(255,255,255,0.75)',
  },
  usernameText: {
    ...Typography.headlineLarge,
    color: Colors.onPrimary,
  },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    ...Typography.labelLarge,
    color: Colors.onPrimary,
    fontSize: 15,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  rateChipText: {
    ...Typography.labelSmall,
    color: 'rgba(255,255,255,0.9)',
    marginLeft: 3,
  },
  logBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.onPrimary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.full,
    ...Shadow.md,
  },
  logBtnText: {
    ...Typography.labelLarge,
    color: Colors.primary,
    marginLeft: 4,
  },
  scroll: {
    flex: 1,
    backgroundColor: Colors.background,
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    marginTop: -Radius.xxl,
  },
  scrollContent: {
    paddingTop: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  calCard: {
    marginBottom: Spacing.md,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    ...Shadow.md,
  },
  selectedBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
    ...Shadow.sm,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primaryMid,
  },
  selectedLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedIconWrap: {
    width: 34,
    height: 34,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  selectedDateText: {
    ...Typography.labelLarge,
    color: Colors.onSurface,
  },
  selectedUnitText: {
    ...Typography.bodySmall,
    color: Colors.onSurfaceSubtle,
    marginTop: 1,
  },
  selectedRight: {
    alignItems: 'flex-end',
    marginRight: Spacing.sm,
  },
  selectedEarningLabel: {
    ...Typography.labelSmall,
    color: Colors.onSurfaceSubtle,
  },
  selectedEarningAmt: {
    ...Typography.headlineSmall,
    color: Colors.primary,
  },
  selectedEditBtn: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.headlineMedium,
    color: Colors.onSurface,
  },
  sectionSub: {
    ...Typography.bodySmall,
    color: Colors.onSurfaceSubtle,
  },
});
