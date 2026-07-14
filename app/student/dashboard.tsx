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
  primaryDarker: '#0F331B',
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
  { label: 'In queue today', value: '1', icon: 'people-outline' as const },
  { label: 'Est. wait', value: '10m', icon: 'time-outline' as const },
  { label: 'Offices open', value: '3', icon: 'business-outline' as const },
];

// Mock "current queue" state — swap for real API data when ready.
const CURRENT_QUEUE = {
  code: 'Q-0001',
  status: 'WAITING' as const,
  officeName: 'Registrar',
};

const OFFICES = [
  { name: 'Registrar', hours: '08:00 AM – 04:00 PM', open: true },
  { name: 'Scholarship', hours: '08:00 AM – 05:00 PM', open: true },
  { name: 'Cashier', hours: '08:00 AM – 05:00 PM', open: true },
];

const OFFICE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  Registrar: 'document-text-outline',
  Scholarship: 'school-outline',
  Cashier: 'cash-outline',
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

  const handleJoinQueue = useCallback((officeName: string) => {
    router.push({
      pathname: '/student/request-documents',
      params: { office: officeName },
    } as any);
  }, []);

  const handleTrackQueue = useCallback(() => {
    router.push('/student/queue');
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
        {/* decorative background accents */}
        <View style={styles.headerCircleLg} />
        <View style={styles.headerCircleSm} />

        <View style={styles.headerRow}>
          <View style={styles.headerTextGroup}>
            <Text style={styles.greeting}>{greeting.toUpperCase()}</Text>
            <Text style={styles.heading}>
              {firstName || 'Student'}
            </Text>
            {student?.sr_code ? (
              <View style={styles.srCodePill}>
                <Ionicons name="card-outline" size={11} color="rgba(255,255,255,0.75)" />
                <Text style={styles.srCode}>{student.sr_code}</Text>
              </View>
            ) : null}
          </View>
          <TouchableOpacity
            style={styles.avatarRing}
            onPress={() => router.push('/student/profile')}
            activeOpacity={0.75}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.metricRow}>
          {METRICS.map((metric, i) => (
            <View
              key={metric.label}
              style={[
                styles.metricCard,
                i !== METRICS.length - 1 && styles.metricDivider,
              ]}
            >
              <View style={styles.metricIconWrap}>
                <Ionicons name={metric.icon} size={13} color={C.primary} />
              </View>
              <Text style={styles.metricValue}>{metric.value}</Text>
              <Text style={styles.metricLabel}>{metric.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.sectionTitleRow}>
          <View style={styles.sectionAccent} />
          <Text style={styles.sectionTitle}>Your Current Queue</Text>
        </View>

        <View style={styles.queueCard}>
          <View style={styles.queueCardTop}>
            <View style={styles.queueNumberRow}>
              <View style={styles.queueBadge}>
                <Ionicons name="ticket-outline" size={16} color={C.primary} />
              </View>
              <Text style={styles.queueNumber}>#{CURRENT_QUEUE.code}</Text>
            </View>
            <View style={styles.statusPill}>
              <View style={styles.statusDot} />
              <Text style={styles.statusPillText}>{CURRENT_QUEUE.status}</Text>
            </View>
          </View>

          <View style={styles.queueDivider} />

          <View style={styles.queueOfficeRow}>
            <Ionicons name="business-outline" size={14} color={C.textMuted} />
            <Text style={styles.queueOfficeText}>{CURRENT_QUEUE.officeName}</Text>
          </View>

          <TouchableOpacity
            style={styles.trackButton}
            activeOpacity={0.8}
            onPress={handleTrackQueue}
          >
            <Text style={styles.trackButtonText}>Track Queue</Text>
            <Ionicons name="arrow-forward" size={14} color={C.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.sectionTitleRow}>
          <View style={styles.sectionAccent} />
          <Text style={styles.sectionTitle}>Available Offices</Text>
        </View>

        <View style={styles.officeGrid}>
          {OFFICES.map((office) => (
            <View key={office.name} style={styles.officeCard}>
              <View style={styles.officeIconWrap}>
                <Ionicons
                  name={OFFICE_ICONS[office.name] ?? 'business-outline'}
                  size={16}
                  color={C.primary}
                />
              </View>

              <Text style={styles.officeName}>{office.name}</Text>

              <View style={styles.officeHoursRow}>
                <View
                  style={[
                    styles.officeDot,
                    { backgroundColor: office.open ? C.success : C.muted },
                  ]}
                />
                <Text style={styles.officeHours}>{office.hours}</Text>
              </View>

              <TouchableOpacity
                style={styles.joinButton}
                activeOpacity={0.8}
                onPress={() => handleJoinQueue(office.name)}
              >
                <Text style={styles.joinButtonText}>Join Queue</Text>
              </TouchableOpacity>
            </View>
          ))}
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
    paddingBottom: 22,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  headerCircleLg: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.05)',
    top: -80,
    right: -50,
  },
  headerCircleSm: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: C.primaryDarker,
    top: 40,
    right: 60,
    opacity: 0.5,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
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
    fontSize: 24,
    fontWeight: '800',
    color: C.surface,
    letterSpacing: -0.3,
  },
  srCodePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.10)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  srCode: {
    fontSize: 11.5,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },
  avatarRing: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 15,
    fontWeight: '700',
    color: C.surface,
  },
  metricRow: {
    flexDirection: 'row',
    backgroundColor: C.surface,
    borderRadius: 18,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 6,
  },
  metricCard: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricDivider: {
    borderRightWidth: 1,
    borderRightColor: C.border,
  },
  metricIconWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: C.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  metricValue: {
    fontSize: 17,
    fontWeight: '800',
    color: C.primaryDark,
    marginBottom: 3,
    letterSpacing: -0.3,
  },
  metricLabel: {
    fontSize: 10.5,
    color: C.muted,
    textAlign: 'center',
    fontWeight: '500',
  },

  body: {
    paddingHorizontal: 16,
    marginTop: 24,
  },

  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionAccent: {
    width: 4,
    height: 16,
    borderRadius: 2,
    backgroundColor: C.primary,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: C.text,
    letterSpacing: -0.2,
  },

  queueCard: {
    backgroundColor: C.surface,
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 28,
    shadowColor: C.primaryDark,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3,
  },
  queueCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  queueNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  queueBadge: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: C.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  queueNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: C.primary,
    letterSpacing: -0.5,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: C.warningSoft,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: C.warning,
  },
  statusPillText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: C.warning,
    letterSpacing: 0.4,
  },
  queueDivider: {
    height: 1,
    backgroundColor: C.border,
    marginBottom: 14,
  },
  queueOfficeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 18,
  },
  queueOfficeText: {
    fontSize: 13,
    color: C.textMuted,
    fontWeight: '500',
  },
  trackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: C.primary,
    backgroundColor: C.primarySoft,
  },
  trackButtonText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: C.primary,
  },

  officeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 22,
  },
  officeCard: {
    flexBasis: '48%',
    backgroundColor: C.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: C.primaryDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 1,
  },
  officeIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 11,
    backgroundColor: C.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  officeName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: C.text,
    marginBottom: 8,
  },
  officeHoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
  },
  officeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  officeHours: {
    fontSize: 10.5,
    color: C.textMuted,
    fontWeight: '500',
  },
  joinButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: C.primary,
  },
  joinButtonText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: C.primary,
  },
});