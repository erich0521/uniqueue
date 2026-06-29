import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const C = {
  background: '#F5F7F2',
  primary: '#1E5D33',
  primarySoft: '#E6F2E9',
  accent: '#74B06E',
  surface: '#FFFFFF',
  border: 'rgba(30, 93, 51, 0.14)',
  text: '#1F2F23',
  textMuted: '#6A7A6B',
  textSecondary: '#68846C',
  muted: '#9EA79A',
  danger: '#C0392B',
  warning: '#D4A017',
  success: '#4F9D55',
  shadow: '#00000008',
};

const METRICS = [
  { label: 'Open requests', value: '4' },
  { label: 'Offices open', value: '3' },
  { label: 'Avg wait', value: '12 min' },
];

const ACTIONS = [
  {
    title: 'Queue status',
    description: 'See live wait times across offices',
    icon: 'speedometer-outline' as const,
  },
  {
    title: 'Request documents',
    description: 'Submit forms and requests',
    icon: 'document-text-outline' as const,
  },
  {
    title: 'My transactions',
    description: 'Review recent activity',
    icon: 'receipt-outline' as const,
  },
  {
    title: 'Feedback',
    description: 'Share your experience',
    icon: 'chatbubbles-outline' as const,
  },
];

const OFFICES = [
  { name: 'Registration Office', wait: '~8 min', status: 'On time', color: C.success },
  { name: 'Cashiering Office', wait: '~22 min', status: 'Busy', color: C.warning },
  { name: 'Scholarship Office', wait: '~5 min', status: 'Open now', color: C.success },
];

export default function StudentDashboardScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>Good morning</Text>
            <Text style={styles.heading}>Student Dashboard</Text>
          </View>
          <TouchableOpacity
            style={styles.avatar}
            onPress={() => router.push('/student/profile')}
            activeOpacity={0.75}
          >
            <Text style={styles.avatarText}>EC</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.headerDescription}>
          Manage your queue, track wait times, and submit service requests from one place.
        </Text>

        <View style={styles.metricRow}>
          {METRICS.map((metric) => (
            <View key={metric.label} style={styles.metricCard}>
              <Text style={styles.metricValue}>{metric.value}</Text>
              <Text style={styles.metricLabel}>{metric.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.body}>
        <TouchableOpacity style={styles.queueSummary} activeOpacity={0.85}>
          <View style={styles.queueSummaryTop}>
            <View style={styles.queueBadge}>
              <Ionicons name="time-outline" size={18} color={C.primary} />
              <Text style={styles.queueBadgeText}>Live queue</Text>
            </View>
            <Text style={styles.queueStatus}>Estimated wait</Text>
          </View>
          <View style={styles.queueSummaryBody}>
            <View>
              <Text style={styles.queueTitle}>Cashiering Office</Text>
              <Text style={styles.queueSubtitle}>Currently 22 minutes</Text>
            </View>
            <View style={styles.queueCountBadge}>
              <Text style={styles.queueCountText}>#18</Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick actions</Text>
        </View>

        <View style={styles.cardGrid}>
          {ACTIONS.map((action) => (
            <TouchableOpacity
              key={action.title}
              style={styles.actionCard}
              activeOpacity={0.8}
            >
              <View style={styles.cardIconBox}>
                <Ionicons name={action.icon} size={20} color={C.primary} />
              </View>
              <Text style={styles.cardTitle}>{action.title}</Text>
              <Text style={styles.cardDesc}>{action.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.sectionHeaderAlt}>
          <Text style={styles.sectionTitle}>Office queue preview</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.viewAll}>View all</Text>
          </TouchableOpacity>
        </View>

        {OFFICES.map((office) => (
          <View key={office.name} style={styles.officeRow}>
            <View style={styles.officeInfo}>
              <Text style={styles.officeName}>{office.name}</Text>
              <Text style={styles.officeStatus}>{office.status}</Text>
            </View>
            <View style={styles.officeMetrics}>
              <Text style={[styles.officeWait, { color: office.color }]}>{office.wait}</Text>
            </View>
          </View>
        ))}

        <View style={styles.logoutRow}>
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={() => router.replace('/login/student')}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={16} color={C.primary} />
            <Text style={styles.logoutText}>Sign out</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
  },

  header: {
    backgroundColor: C.primary,
    paddingHorizontal: 20,
    paddingBottom: 28,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  greeting: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 2,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: C.surface,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: C.surface,
  },
  headerDescription: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 20,
    marginBottom: 20,
    maxWidth: '88%',
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  metricCard: {
    flex: 1,
    backgroundColor: C.surface,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
    color: C.primary,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 11,
    color: C.muted,
    textAlign: 'center',
  },

  body: {
    paddingHorizontal: 16,
    marginTop: -24,
  },
  queueSummary: {
    backgroundColor: C.surface,
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 22,
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 18,
    elevation: 3,
  },
  queueSummaryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  queueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    backgroundColor: C.primarySoft,
  },
  queueBadgeText: {
    fontSize: 12,
    color: C.primary,
    fontWeight: '600',
  },
  queueStatus: {
    fontSize: 12,
    color: C.textSecondary,
  },
  queueSummaryBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  queueTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: C.text,
    marginBottom: 6,
  },
  queueSubtitle: {
    fontSize: 13,
    color: C.textMuted,
    lineHeight: 20,
  },
  queueCountBadge: {
    backgroundColor: C.primarySoft,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  queueCountText: {
    fontSize: 16,
    fontWeight: '700',
    color: C.primary,
  },

  sectionHeader: {
    marginBottom: 10,
  },
  sectionHeaderAlt: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: C.text,
  },
  viewAll: {
    fontSize: 12,
    color: C.primary,
    fontWeight: '600',
  },

  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  actionCard: {
    flexBasis: '48%',
    backgroundColor: C.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 2,
  },
  cardIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: C.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: C.text,
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 12,
    color: C.textMuted,
    lineHeight: 18,
  },

  officeRow: {
    backgroundColor: C.surface,
    borderRadius: 18,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 10,
  },
  officeInfo: {
    flex: 1,
    paddingRight: 12,
  },
  officeName: {
    fontSize: 14,
    fontWeight: '700',
    color: C.text,
    marginBottom: 4,
  },
  officeStatus: {
    fontSize: 12,
    color: C.textMuted,
  },
  officeMetrics: {
    alignItems: 'flex-end',
  },
  officeWait: {
    fontSize: 16,
    fontWeight: '700',
  },

  logoutRow: {
    alignItems: 'center',
    marginTop: 26,
    marginBottom: 12,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '700',
    color: C.primary,
  },
});