import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { QUEUE_STATUS_URL } from '../../constants/backend';

const C = {
  background: '#F4F6F3',
  primary: '#1E5D33',
  primaryDark: '#164726',
  primarySoft: '#E6F2E9',
  surface: '#FFFFFF',
  border: 'rgba(30, 93, 51, 0.10)',
  text: '#1B2A20',
  textMuted: '#6C7B6E',
  muted: '#9CA69D',
  danger: '#C0392B',
  warning: '#B8860B',
  warningSoft: '#FBF3DF',
  success: '#2F8F4E',
  successSoft: '#E6F5EA',
  info: '#2C6E8F',
  infoSoft: '#E6F0F5',
  shadow: '#0F2A1808',
};

type StudentData = {
  id: number;
  first_name: string;
  last_name: string;
  sr_code: string;
};

type TicketStatus = 'waiting' | 'called' | 'in_progress' | 'done' | 'cancelled';
type TicketType = 'walkin' | 'appointment';

type QueueTicket = {
  id: number;
  queue_number: string;
  office_name: string;
  status: TicketStatus;
  type: TicketType;
  priority: boolean;
  appointment_date: string | null;
  position: number;
  estimated_wait_minutes: number;
};

const STATUS_LABELS: Record<TicketStatus, string> = {
  waiting: 'Waiting',
  called: 'Called — head to the window',
  in_progress: 'Being processed',
  done: 'Completed',
  cancelled: 'Cancelled',
};

const STATUS_TONES: Record<TicketStatus, { bg: string; fg: string }> = {
  waiting: { bg: C.warningSoft, fg: C.warning },
  called: { bg: C.infoSoft, fg: C.info },
  in_progress: { bg: C.successSoft, fg: C.success },
  done: { bg: C.successSoft, fg: C.success },
  cancelled: { bg: '#FBEAEA', fg: C.danger },
};

function formatAppointmentDate(dateStr: string | null) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function QueueScreen() {
  const insets = useSafeAreaInsets();
  const [student, setStudent] = useState<StudentData | null>(null);
  const [ticket, setTicket] = useState<QueueTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchQueueStatus = useCallback(async (studentId: number) => {
    try {
      setErrorMsg(null);
      const res = await fetch(`${QUEUE_STATUS_URL}?student_id=${studentId}`);
      const data = await res.json();

      if (!data.success) {
        setErrorMsg(data.message ?? 'Unable to load queue status.');
        setTicket(null);
        return;
      }

      setTicket(data.in_queue ? data.queue : null);
    } catch (err) {
      console.log('QUEUE STATUS FETCH ERROR:', err);
      setErrorMsg('Could not reach the server. Check your connection and try again.');
      setTicket(null);
    }
  }, []);

  const loadEverything = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem('studentData');
      const parsed: StudentData | null = raw ? JSON.parse(raw) : null;
      setStudent(parsed);

      if (parsed?.id) {
        await fetchQueueStatus(parsed.id);
      } else {
        setErrorMsg('No student session found. Please log in again.');
      }
    } catch (err) {
      console.log('QUEUE SCREEN LOAD ERROR:', err);
      setErrorMsg('Something went wrong while loading your queue status.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [fetchQueueStatus]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadEverything();
    }, [loadEverything])
  );

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadEverything();
  }, [loadEverything]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={C.primary}
          colors={[C.primary]}
        />
      }
    >
      <View style={[styles.header, { paddingTop: insets.top + 18 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Ionicons name="chevron-back" size={20} color={C.surface} />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerDescription}>
          Track your current position and estimated wait time in real time.
        </Text>
      </View>

      <View style={styles.body}>
        {loading ? (
          <View style={styles.centerState}>
            <ActivityIndicator size="large" color={C.primary} />
            <Text style={styles.centerStateText}>Loading your queue status...</Text>
          </View>
        ) : errorMsg ? (
          <View style={styles.centerState}>
            <Ionicons name="alert-circle-outline" size={34} color={C.danger} />
            <Text style={styles.centerStateText}>{errorMsg}</Text>
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={handleRefresh}
              activeOpacity={0.8}
            >
              <Text style={styles.retryBtnText}>Try again</Text>
            </TouchableOpacity>
          </View>
        ) : !ticket ? (
          <View style={styles.centerState}>
            <View style={styles.emptyIconBox}>
              <Ionicons name="time-outline" size={30} color={C.primary} />
            </View>
            <Text style={styles.emptyTitle}>You're not in any queue</Text>
            <Text style={styles.centerStateText}>
              Once you join a queue at an office, your live status will show up here.
            </Text>
          </View>
        ) : (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <View style={styles.badgeRow}>
                <View
                  style={[
                    styles.statusPill,
                    { backgroundColor: STATUS_TONES[ticket.status].bg },
                  ]}
                >
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: STATUS_TONES[ticket.status].fg },
                    ]}
                  />
                  <Text
                    style={[
                      styles.statusPillText,
                      { color: STATUS_TONES[ticket.status].fg },
                    ]}
                  >
                    {STATUS_LABELS[ticket.status]}
                  </Text>
                </View>

                {ticket.priority && (
                  <View style={styles.priorityPill}>
                    <Ionicons name="star" size={11} color={C.warning} />
                    <Text style={styles.priorityPillText}>Priority</Text>
                  </View>
                )}
              </View>

              <Text style={styles.officeName}>{ticket.office_name}</Text>

              <View style={styles.metaRow}>
                <Ionicons
                  name={ticket.type === 'appointment' ? 'calendar-outline' : 'walk-outline'}
                  size={14}
                  color={C.textMuted}
                />
                <Text style={styles.metaText}>
                  {ticket.type === 'appointment' ? 'Appointment' : 'Walk-in'}
                  {ticket.type === 'appointment' && ticket.appointment_date
                    ? ` · ${formatAppointmentDate(ticket.appointment_date)}`
                    : ''}
                </Text>
              </View>
            </View>

            <View style={styles.numberRow}>
              <View style={styles.numberBlock}>
                <Text style={styles.numberLabel}>TICKET NO.</Text>
                <Text style={styles.numberValue}>{ticket.queue_number}</Text>
              </View>
              <View style={styles.numberDivider} />
              <View style={styles.numberBlock}>
                <Text style={styles.numberLabel}>PEOPLE AHEAD</Text>
                <Text style={styles.numberValue}>
                  {Math.max(ticket.position - 1, 0)}
                </Text>
              </View>
            </View>

            {ticket.status === 'waiting' && (
              <View style={styles.waitRow}>
                <Ionicons name="hourglass-outline" size={16} color={C.textMuted} />
                <Text style={styles.waitText}>
                  Estimated wait: ~{ticket.estimated_wait_minutes} min
                </Text>
              </View>
            )}

            {ticket.status === 'called' && (
              <View style={styles.waitRow}>
                <Ionicons name="megaphone-outline" size={16} color={C.info} />
                <Text style={[styles.waitText, { color: C.info, fontWeight: '600' }]}>
                  It's your turn — please proceed to the window.
                </Text>
              </View>
            )}
          </View>
        )}
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 16,
    paddingVertical: 4,
    gap: 6,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.surface,
  },
  heading: {
    fontSize: 23,
    fontWeight: '700',
    color: C.surface,
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  headerDescription: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.72)',
    lineHeight: 19,
    maxWidth: '92%',
  },

  body: {
    paddingHorizontal: 16,
    marginTop: 22,
  },

  centerState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  centerStateText: {
    fontSize: 13.5,
    color: C.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 10,
  },
  emptyIconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: C.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  emptyTitle: {
    fontSize: 15.5,
    fontWeight: '700',
    color: C.text,
    marginTop: 4,
  },
  retryBtn: {
    marginTop: 16,
    backgroundColor: C.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 14,
  },
  retryBtnText: {
    color: C.surface,
    fontWeight: '700',
    fontSize: 13,
  },

  card: {
    backgroundColor: C.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 2,
  },
  cardTop: {
    marginBottom: 18,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    paddingHorizontal: 9,
    paddingVertical: 4,
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
  priorityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: C.warningSoft,
  },
  priorityPillText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: C.warning,
  },
  officeName: {
    fontSize: 18,
    fontWeight: '700',
    color: C.text,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12.5,
    color: C.textMuted,
    fontWeight: '500',
  },

  numberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.background,
    borderRadius: 16,
    paddingVertical: 16,
    marginBottom: 16,
  },
  numberBlock: {
    flex: 1,
    alignItems: 'center',
  },
  numberDivider: {
    width: 1,
    height: 36,
    backgroundColor: C.border,
  },
  numberLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    color: C.muted,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  numberValue: {
    fontSize: 22,
    fontWeight: '800',
    color: C.primaryDark,
  },

  waitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  waitText: {
    fontSize: 12.5,
    color: C.textMuted,
    fontWeight: '500',
  },
});