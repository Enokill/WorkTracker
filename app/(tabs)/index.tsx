import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import MonthCalendar from '@/components/feature/MonthCalendar';
import DashboardCards from '@/components/feature/DashboardCards';
import { useApp } from '@/hooks/useApp';
import { parseDate } from '@/services/storage';

function formatRupee(amount: number): string {
  return '₹' + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export default function HomeScreen() {
  const router = useRouter();
  const { selectedDate, getEntryForDate, settings } = useApp();

  const entry = getEntryForDate(selectedDate);
  const workCount = entry ? entry.workCount : 0;
  const d = parseDate(selectedDate);
  const dateLabel = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });

  const handleAddEntry = () => {
    router.push(`/entry/${selectedDate}`);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      {/* Top bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.appTitle}>Work Tracker</Text>
          <Text style={styles.appSub}>Daily earnings diary</Text>
        </View>
        <Pressable onPress={handleAddEntry} style={styles.addBtn}>
          <MaterialIcons name="add" size={22} color={Colors.onPrimary} />
          <Text style={styles.addBtnText}>Log Work</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Calendar */}
        <View style={styles.calSection}>
          <MonthCalendar />
        </View>

        {/* Selected date quick info */}
        <View style={styles.selectedBar}>
          <View style={styles.selectedInfo}>
            <MaterialIcons name="event" size={16} color={Colors.primary} />
            <Text style={styles.selectedDateText}>{dateLabel}</Text>
          </View>
          <View style={styles.selectedStats}>
            <Text style={styles.selectedCount}>{workCount} units</Text>
            <Text style={styles.selectedEarning}>{formatRupee(workCount * settings.ratePerUnit)}</Text>
          </View>
          <Pressable onPress={handleAddEntry} style={styles.editBtn}>
            <MaterialIcons name={entry ? 'edit' : 'add'} size={18} color={Colors.primary} />
          </Pressable>
        </View>

        {/* Dashboard */}
        <Text style={styles.sectionTitle}>Dashboard</Text>
        <DashboardCards />

        <View style={styles.bottomPad} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.background,
  },
  appTitle: {
    ...Typography.headlineLarge,
    color: Colors.onSurface,
  },
  appSub: {
    ...Typography.bodySmall,
    color: Colors.onSurfaceSubtle,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.full,
    elevation: 3,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  addBtnText: {
    ...Typography.labelLarge,
    color: Colors.onPrimary,
    marginLeft: 4,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  calSection: {
    marginBottom: Spacing.md,
  },
  selectedBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
    elevation: 2,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  selectedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectedDateText: {
    ...Typography.labelLarge,
    color: Colors.onSurface,
    marginLeft: 6,
  },
  selectedStats: {
    alignItems: 'flex-end',
    marginRight: Spacing.md,
  },
  selectedCount: {
    ...Typography.labelMedium,
    color: Colors.onSurfaceVariant,
  },
  selectedEarning: {
    ...Typography.headlineSmall,
    color: Colors.primary,
  },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    ...Typography.headlineSmall,
    color: Colors.onSurface,
    marginBottom: Spacing.md,
  },
  bottomPad: { height: 32 },
});
