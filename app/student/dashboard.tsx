import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const C = {
  background: '#F4F6F3',
  primary: '#1E5D33',
  primaryDark: '#164726',
  primarySoft: '#E6F2E9',
  accent: '#74B06E',
  surface: '#FFFFFF',
  border: 'rgba(30, 93, 51, 0.10)',
  text: '#1B2A20',
  textMuted: '#6C7B6E',
  textSecondary: '#5C7860',
  muted: '#9CA69D',
  danger: '#C0392B',
  warning: '#B8860B',
  warningSoft: '#FBF3DF',
  success: '#2F8F4E',
  successSoft: '#E6F5EA',
  shadow: '#0F2A1808',
};

type StudentData = {
  id: number;
  first_name: string;
  last_name: string;
  sr_code: string;
  college_id: number;
  program_id: number;
  year_level: number | null;
  college_name: string | null;
  program_name: string | null;
};

const METRICS = [
  { label: 'Open requests', value: '4' },
  { label: 'Offices open', value: '3' },
  { label: 'Avg wait', value: '12m' },
];

const ACTIONS = [
  {
    title: 'Queue status',
    description: 'Live wait times',
    icon: 'speedometer-outline' as const,
    route: '/student/queue' as const,
  },
  {
    title: 'Request documents',
    description: 'Submit a form',
    icon: 'document-text-outline' as const,
    route: '/student/request-documents' as const,
  },
  {
    title: 'My transactions',
    description: 'Recent activity',
    icon: 'receipt-outline' as const,
    route: null,
  },
  {
    title: 'Feedback',
    description: 'Share your input',
    icon: 'chatbubbles-outline' as const,
    route: null,
  },
];

const OFFICES = [
  { name: 'Registration Office', wait: '~8 min', status: 'On time', tone: 'success' as const },
  { name: 'Cashiering Office', wait: '~22 min', status: 'Busy', tone: 'warning' as const },
  { name: 'Scholarship Office', wait: '~5 min', status: 'Open now', tone: 'success' as const },
];

const TONE_STYLES = {
  success: { bg: C.successSoft, fg: C.success },
  warning: { bg: C.warningSoft, fg: C.warning },
};

function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function getInitials(firstName?: string, lastName?: string) {
  const f = firstName?.charAt(0) ?? '';
  const l = lastName?.charAt(0) ?? '';
  return (f + l).toUpperCase() || '?';
}

export default function StudentDashboardScreen() {
  const insets = useSafeAreaInsets();
  const [student, setStudent] = useState<StudentData | null>(null);

  // Re-read from storage every time this screen comes into focus,
  // in case the logged-in student changed (e.g. after logout/login).
  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function loadStudent() {
        try {
          const raw = await AsyncStorage.getItem('studentData');
          if (isActive) {
            setStudent(raw ? JSON.parse(raw) : null);
          }
        } catch (err) {
          console.log('DASHBOARD LOAD ERROR:', err);
          if (isActive) setStudent(null);
        }
      }

      loadStudent();

      return () => {
        isActive = false;
      };
    }, [])
  );

  const handleActionPress = useCallback((route: string | null) => {
    if (route) {
      router.push(route as any);
    }
    // Actions without a route yet are silently ignored for now.
    // Swap this else-branch for an Alert or a "coming soon" toast if you want feedback.
  }, []);

  const firstName = student?.first_name ?? '';
  const initials = getInitials(student?.first_name, student?.last_name);
  const greeting = getTimeGreeting();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { paddingTop: insets.top + 18 }]}>
        <View style={styles.headerRow}>
          <View style={styles.headerTextGroup}>
            <Text style={styles.greeting}>
              {greeting.toUpperCase()}{firstName ? `, ${firstName.toUpperCase()}` : ''}
            </Text>
            <Text style={styles.heading}>Student Dashboard</Text>
          </View>
          <TouchableOpacity
            style={styles.avatar}
            onPress={() => router.push('/student/profile')}
            activeOpacity={0.75}
          >
            <Text style={styles.avatarText}>{initials}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.headerDescription}>
          Manage your queue, track wait times, and submit service requests from one place.
        </Text>

        <View style={styles.metricRow}>
          {METRICS.map((metric, i) => (
            <View
              key={metric.label}
              style={[
                styles.metricCard,
                i !== METRICS.length - 1 && styles.metricDivider,
              ]}
            >
              <Text style={styles.metricValue}>{metric.value}</Text>
              <Text style={styles.metricLabel}>{metric.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.body}>
        <TouchableOpacity
          style={styles.queueSummary}
          activeOpacity={0.85}
          onPress={() => router.push('/student/queue')}
        >
          <View style={styles.queueSummaryTop}>
            <View style={styles.queueBadge}>
              <Ionicons name="time-outline" size={15} color={C.primary} />
              <Text style={styles.queueBadgeText}>LIVE QUEUE</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={C.muted} />
          </View>
          <View style={styles.queueSummaryBody}>
            <View style={{ flex: 1 }}>
              <Text style={styles.queueTitle}>Cashiering Office</Text>
              <Text style={styles.queueSubtitle}>Estimated wait · 22 minutes</Text>
            </View>
            <View style={styles.queueCountBadge}>
              <Text style={styles.queueCountLabel}>YOUR NO.</Text>
              <Text style={styles.queueCountText}>18</Text>
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
              onPress={() => handleActionPress(action.route)}
            >
              <View style={styles.cardIconBox}>
                <Ionicons name={action.icon} size={19} color={C.primary} />
              </View>
              <Text style={styles.cardTitle}>{action.title}</Text>
              <Text style={styles.cardDesc}>{action.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.sectionHeaderAlt}>
          <Text style={styles.sectionTitle}>Office queue preview</Text>
          <TouchableOpacity activeOpacity={0.7} style={styles.viewAllBtn}>
            <Text style={styles.viewAll}>View all</Text>
            <Ionicons name="chevron-forward" size={13} color={C.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.officeGroup}>
          {OFFICES.map((office, i) => {
            const tone = TONE_STYLES[office.tone];
            return (
              <View
                key={office.name}
                style={[
                  styles.officeRow,
                  i !== OFFICES.length - 1 && styles.officeRowBorder,
                ]}
              >
                <View style={styles.officeInfo}>
                  <Text style={styles.officeName}>{office.name}</Text>
                  <View style={[styles.statusPill, { backgroundColor: tone.bg }]}>
                    <View style={[styles.statusDot, { backgroundColor: tone.fg }]} />
                    <Text style={[styles.statusPillText, { color: tone.fg }]}>
                      {office.status}
                    </Text>
                  </View>
                </View>
                <Text style={styles.officeWait}>{office.wait}</Text>
              </View>
            );
          })}
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
    backgroundColor: C.primaryDark,
    paddingHorizontal: 20,
    paddingBottom: 26,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerTextGroup: {
    flex: 1,
    paddingRight: 12,
  },
  greeting: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.65)',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  heading: {
    fontSize: 23,
    fontWeight: '700',
    color: C.surface,
    letterSpacing: -0.3,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: C.surface,
  },
  headerDescription: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.72)',
    lineHeight: 19,
    marginBottom: 20,
    maxWidth: '90%',
  },
  metricRow: {
    flexDirection: 'row',
    backgroundColor: C.surface,
    borderRadius: 18,
    paddingVertical: 4,
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 4,
  },
  metricCard: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricDivider: {
    borderRightWidth: 1,
    borderRightColor: C.border,
  },
  metricValue: {
    fontSize: 17,
    fontWeight: '700',
    color: C.primaryDark,
    marginBottom: 3,
  },
  metricLabel: {
    fontSize: 10.5,
    color: C.muted,
    textAlign: 'center',
    fontWeight: '500',
  },

  body: {
    paddingHorizontal: 16,
    marginTop: 22,
  },
  queueSummary: {
    backgroundColor: C.surface,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 26,
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 2,
  },
  queueSummaryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  queueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: C.primarySoft,
  },
  queueBadgeText: {
    fontSize: 10.5,
    color: C.primary,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  queueSummaryBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  queueTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: C.text,
    marginBottom: 4,
  },
  queueSubtitle: {
    fontSize: 12.5,
    color: C.textMuted,
  },
  queueCountBadge: {
    backgroundColor: C.primaryDark,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 64,
  },
  queueCountLabel: {
    fontSize: 8.5,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  queueCountText: {
    fontSize: 18,
    fontWeight: '800',
    color: C.surface,
  },

  sectionHeader: {
    marginBottom: 12,
  },
  sectionHeaderAlt: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: C.text,
    letterSpacing: -0.2,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewAll: {
    fontSize: 12.5,
    color: C.primary,
    fontWeight: '600',
  },

  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 26,
  },
  actionCard: {
    flexBasis: '48%',
    backgroundColor: C.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 1,
  },
  cardIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: C.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: C.text,
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 11.5,
    color: C.textMuted,
    lineHeight: 16,
  },

  officeGroup: {
    backgroundColor: C.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 22,
    overflow: 'hidden',
  },
  officeRow: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  officeRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  officeInfo: {
    flex: 1,
    paddingRight: 12,
    gap: 6,
  },
  officeName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: C.text,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  statusPillText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  officeWait: {
    fontSize: 14.5,
    fontWeight: '700',
    color: C.text,
  },
});