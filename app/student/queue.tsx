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
  counter_name?: string | null;
};

const STATUS_LABELS: Record<TicketStatus, string> = {
  waiting: 'Waiting in queue',
  called: 'Called — head to the window',
  in_progress: 'Being processed',
  done: 'Completed',
  cancelled: 'Cancelled',
};

const STATUS_TONES: Record<TicketStatus, { bg: string; fg: string }> = {
  waiting: { bg: 'rgba(255,255,255,0.16)', fg: C.surface },
  called: { bg: 'rgba(255,255,255,0.16)', fg: C.surface },
  in_progress: { bg: 'rgba(255,255,255,0.16)', fg: C.surface },
  done: { bg: 'rgba(255,255,255,0.16)', fg: C.surface },
  cancelled: { bg: 'rgba(255,255,255,0.16)', fg: C.surface },
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

function formatTimeNow() {
  return new Date().toLocaleTimeString('en-PH', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

export default function QueueScreen() {
  const insets = useSafeAreaInsets();
  const [student, setStudent] = useState<StudentData | null>(null);
  const [ticket, setTicket] = useState<QueueTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

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
      setLastUpdated(formatTimeNow());
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

  const handleLeaveFeedback = useCallback(() => {
    if (!ticket) return;
    router.push({
      pathname: '/student/feedback',
      params: {
        ticket_id: ticket.id,
        queue_number: ticket.queue_number,
        office_name: ticket.office_name,
      },
    } as any);
  }, [ticket]);

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
      <View style={[styles.topHeader, { paddingTop: insets.top + 18 }]}>
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
            {/* Office banner — mirrors the office's status bar */}
            <View style={styles.banner}>
              <Text style={styles.bannerOfficeName}>{ticket.office_name}</Text>
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
            </View>

            <View style={styles.cardInner}>
              {ticket.priority && (
                <View style={styles.priorityPill}>
                  <Ionicons name="star" size={11} color={C.warning} />
                  <Text style={styles.priorityPillText}>Priority</Text>
                </View>
              )}

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

              {/* Highlighted ticket number box */}
              <View style={styles.ticketBox}>
                <Text style={styles.ticketLabel}>YOUR TICKET NUMBER</Text>
                <Text style={styles.ticketNumber}>{ticket.queue_number}</Text>
              </View>

              {/* Stat grid: people ahead / wait / counter */}
              <View style={styles.statGrid}>
                <View style={styles.statCell}>
                  <Text style={styles.statLabel}>PEOPLE AHEAD</Text>
                  <Text style={styles.statValue}>
                    {Math.max(ticket.position - 1, 0)}
                  </Text>
                </View>
                <View style={styles.statCell}>
                  <Text style={styles.statLabel}>ESTIMATED WAIT</Text>
                  <Text style={styles.statValue}>
                    {ticket.status === 'waiting'
                      ? `~${ticket.estimated_wait_minutes}m`
                      : '—'}
                  </Text>
                </View>
              </View>

              <View style={styles.counterCell}>
                <Text style={styles.statLabel}>ASSIGNED COUNTER</Text>
                <Text
                  style={[
                    styles.statValue,
                    !ticket.counter_name && styles.statValueMuted,
                  ]}
                >
                  {ticket.counter_name || 'Unassigned'}
                </Text>
              </View>

              {ticket.status === 'called' && (
                <View style={styles.calledBanner}>
                  <Ionicons name="megaphone-outline" size={16} color={C.info} />
                  <Text style={styles.calledBannerText}>
                    It's your turn — please proceed to the window.
                  </Text>
                </View>
              )}

              {ticket.status === 'done' && (
                <TouchableOpacity
                  style={styles.feedbackButton}
                  activeOpacity={0.85}
                  onPress={handleLeaveFeedback}
                >
                  <Ionicons name="star-outline" size={15} color={C.surface} />
                  <Text style={styles.feedbackButtonText}>Leave Feedback</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Footer: last updated + manual refresh */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                {lastUpdated ? `Last updated: ${lastUpdated}` : ' '}
              </Text>
              <TouchableOpacity
                style={styles.refreshBtn}
                onPress={handleRefresh}
                activeOpacity={0.8}
                disabled={refreshing}
              >
                {refreshing ? (
                  <ActivityIndicator size="small" color={C.primary} />
                ) : (
                  <>
                    <Ionicons name="refresh" size={13} color={C.primary} />
                    <Text style={styles.refreshBtnText}>Refresh Now</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
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

  topHeader: {
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
    borderRadius: 22,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
    shadowColor: C.primaryDark,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3,
  },

  // Office banner strip (mirrors the reference's red top bar)
  banner: {
    backgroundColor: C.primary,
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bannerOfficeName: {
    fontSize: 17,
    fontWeight: '800',
    color: C.surface,
    letterSpacing: -0.2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 10,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  cardInner: {
    padding: 20,
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
    marginBottom: 10,
  },
  priorityPillText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: C.warning,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  metaText: {
    fontSize: 12.5,
    color: C.textMuted,
    fontWeight: '500',
  },

  ticketBox: {
    backgroundColor: C.primarySoft,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 12,
  },
  ticketLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: C.primary,
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  ticketNumber: {
    fontSize: 34,
    fontWeight: '800',
    color: C.primaryDark,
    letterSpacing: -0.5,
  },

  statGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  statCell: {
    flex: 1,
    backgroundColor: C.background,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  counterCell: {
    backgroundColor: C.background,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    color: C.muted,
    letterSpacing: 0.5,
    marginBottom: 5,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: C.primaryDark,
  },
  statValueMuted: {
    color: C.muted,
    fontWeight: '600',
    fontSize: 14,
  },

  calledBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: C.infoSoft,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 8,
  },
  calledBannerText: {
    fontSize: 12.5,
    color: C.info,
    fontWeight: '700',
    flexShrink: 1,
  },

  feedbackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: C.primary,
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 10,
  },
  feedbackButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: C.surface,
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: C.border,
    backgroundColor: C.background,
  },
  footerText: {
    fontSize: 11,
    color: C.muted,
    fontWeight: '500',
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: C.primary,
  },
  refreshBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: C.primary,
  },
});