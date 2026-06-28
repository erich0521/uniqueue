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
  darkGreen: '#3A5A1C',
  oliveGreen: '#556B2F',
  lightGreenBg: '#EAF3DE',
  cream: '#F3F6EE',
  text: '#1F2A17',
  textMuted: '#7A916A',
  textLight: 'rgba(255,255,255,0.65)',
  white: '#FFFFFF',
  border: 'rgba(85,107,47,0.14)',
  badgeText: '#3A5A1C',
  dotGreen: '#62A635',
  dotYellow: '#D4A017',
  dotRed: '#C0392B',
  statusPill: 'rgba(255,255,255,0.15)',
  statusPillBorder: 'rgba(255,255,255,0.18)',
  avatarBg: 'rgba(255,255,255,0.18)',
  avatarBorder: 'rgba(255,255,255,0.3)',
};

const ACTIONS = [
  {
    title: 'Queue Status',
    description: 'Check live progress for all offices',
    icon: 'time-outline' as const,
  },
  {
    title: 'Request Documents',
    description: 'Submit walk-in requests',
    icon: 'document-text-outline' as const,
  },
  {
    title: 'My Transactions',
    description: 'Track all your transactions',
    icon: 'layers-outline' as const,
  },
  {
    title: 'Feedback',
    description: 'Rate your completed service',
    icon: 'chatbubbles-outline' as const,
  },
];

const OFFICES = [
  { name: 'Registration Office', wait: '~8 min', dotColor: C.dotGreen },
  { name: 'Cashiering Office', wait: '~22 min', dotColor: C.dotYellow },
  { name: 'Scholarship Office', wait: '~5 min', dotColor: C.dotGreen },
];

export default function StudentDashboardScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Header ── */}
      <View style={[styles.topBar, { paddingTop: insets.top + 16 }]}>
        <View style={styles.topRow}>
          <View>
            <Text style={styles.greeting}>Good morning 👋</Text>
            <Text style={styles.userName}>Student Dashboard</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>S</Text>
          </View>
        </View>

        <View style={styles.statusPill}>
          <View style={styles.liveDot} />
          <Text style={styles.statusPillText}>
            All offices open · Ready to use
          </Text>
        </View>
      </View>

      {/* ── Body ── */}
      <View style={styles.body}>

        {/* Queue Banner */}
        <View style={styles.queueBanner}>
          <View style={styles.queueIcon}>
            <Ionicons name="time-outline" size={22} color={C.darkGreen} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.queueLabel}>LIVE QUEUE</Text>
            <Text style={styles.queueTitle}>Queue Status</Text>
            <Text style={styles.queueSub}>Tap to see current wait times</Text>
          </View>
          <View style={styles.liveBadge}>
            <Text style={styles.liveBadgeText}>Live</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionLabel}>Quick actions</Text>
        <View style={styles.cardGrid}>
          {ACTIONS.map((action) => (
            <TouchableOpacity
              key={action.title}
              style={styles.actionCard}
              activeOpacity={0.75}
            >
              <View style={styles.cardIconBox}>
                <Ionicons name={action.icon} size={20} color={C.darkGreen} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{action.title}</Text>
                <Text style={styles.cardDesc}>{action.description}</Text>
              </View>
              <Ionicons
                name="arrow-forward-outline"
                size={14}
                color={C.textMuted}
                style={{ marginTop: 'auto' }}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Office Queue Preview */}
        <Text style={styles.sectionLabel}>Office queue preview</Text>
        {OFFICES.map((office) => (
          <View key={office.name} style={styles.officeRow}>
            <View style={[styles.officeDot, { backgroundColor: office.dotColor }]} />
            <Text style={styles.officeName}>{office.name}</Text>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.officeWaitLabel}>Est. wait</Text>
              <Text style={styles.officeWait}>{office.wait}</Text>
            </View>
          </View>
        ))}

        {/* Sign Out */}
        <View style={styles.logoutRow}>
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={() => router.replace('/login/student')}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={16} color={C.oliveGreen} />
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
    backgroundColor: C.cream,
  },

  // ── Top Bar ──
  topBar: {
    backgroundColor: C.darkGreen,
    paddingHorizontal: 20,
    paddingBottom: 28,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  greeting: {
    fontSize: 13,
    color: C.textLight,
    marginBottom: 2,
  },
  userName: {
    fontSize: 20,
    fontWeight: '500',
    color: C.white,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: C.avatarBg,
    borderWidth: 2,
    borderColor: C.avatarBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '500',
    color: C.white,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    backgroundColor: C.statusPill,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: C.statusPillBorder,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#8BC34A',
  },
  statusPillText: {
    fontSize: 12,
    color: '#C8E6A0',
  },

  // ── Body ──
  body: {
    paddingHorizontal: 16,
    marginTop: -14,
  },

  // Queue Banner
  queueBanner: {
    backgroundColor: C.white,
    borderRadius: 18,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 0.5,
    borderColor: C.border,
    marginBottom: 22,
  },
  queueIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: C.lightGreenBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  queueLabel: {
    fontSize: 11,
    color: C.textMuted,
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  queueTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: C.text,
  },
  queueSub: {
    fontSize: 12,
    color: C.textMuted,
    marginTop: 2,
  },
  liveBadge: {
    backgroundColor: C.lightGreenBg,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  liveBadgeText: {
    fontSize: 11,
    fontWeight: '500',
    color: C.badgeText,
  },

  // Section Label
  sectionLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: C.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 12,
  },

  // Action Cards Grid
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 22,
  },
  actionCard: {
    backgroundColor: C.white,
    borderRadius: 18,
    padding: 16,
    borderWidth: 0.5,
    borderColor: C.border,
    width: '48%',
    gap: 10,
  },
  cardIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: C.lightGreenBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: C.text,
    lineHeight: 18,
  },
  cardDesc: {
    fontSize: 11,
    color: C.textMuted,
    lineHeight: 16,
    marginTop: 2,
  },

  // Office Rows
  officeRow: {
    backgroundColor: C.white,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 0.5,
    borderColor: C.border,
    marginBottom: 8,
  },
  officeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  officeName: {
    fontSize: 13,
    fontWeight: '500',
    color: C.text,
    flex: 1,
  },
  officeWaitLabel: {
    fontSize: 11,
    color: C.textMuted,
  },
  officeWait: {
    fontSize: 13,
    fontWeight: '500',
    color: C.text,
    textAlign: 'right',
  },

  // Logout
  logoutRow: {
    alignItems: 'center',
    marginTop: 24,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: C.white,
    borderWidth: 0.5,
    borderColor: C.border,
  },
  logoutText: {
    fontSize: 13,
    fontWeight: '500',
    color: C.oliveGreen,
  },
});