import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  shadow: '#0F2A1808',
  error: '#C0392B',
  errorSoft: '#FBEAE8',
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

export default function StudentProfileScreen() {
  const insets = useSafeAreaInsets();
  const [student, setStudent] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);

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
          console.log('PROFILE LOAD ERROR:', err);
          if (isActive) setStudent(null);
        } finally {
          if (isActive) setLoading(false);
        }
      }

      loadStudent();

      return () => {
        isActive = false;
      };
    }, [])
  );

  async function handleLogout() {
    await AsyncStorage.removeItem('studentData');
    router.replace('/login/student-login' as any);
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  if (!student) {
    return (
      <View style={[styles.container, styles.centered, { paddingHorizontal: 24 }]}>
        <View style={styles.emptyIconWrap}>
          <Ionicons name="person-circle-outline" size={44} color={C.muted} />
        </View>
        <Text style={styles.noDataTitle}>No student signed in</Text>
        <Text style={styles.noDataText}>Please sign in again to view your profile.</Text>
        <TouchableOpacity
          style={styles.goToLoginBtn}
          activeOpacity={0.85}
          onPress={() => router.replace('/login/student-login' as any)}
        >
          <Text style={styles.goToLoginText}>Go to Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const fullName = `${student.first_name} ${student.last_name}`;
  const collegeLabel = student.college_name || 'Not set';
  const courseLabel = student.program_name || 'No program set';
  const yearLevelLabel = student.year_level ? `${student.year_level}${ordinalSuffix(student.year_level)} Year` : 'Not set';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.75}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="arrow-back" size={20} color={C.surface} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={{ width: 28 }} />
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarLetter}>{student.first_name.charAt(0)}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.nameText} numberOfLines={1}>{fullName}</Text>
            <View style={styles.srCodeChip}>
              <Text style={styles.srCodeText}>{student.sr_code}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>STUDENT DETAILS</Text>

          {/* College — label on top, full-width value below, right-aligned, can wrap */}
          <View style={styles.detailRowStacked}>
            <View style={styles.detailLabelGroup}>
              <Ionicons name="school-outline" size={16} color={C.textMuted} />
              <Text style={styles.detailLabel}>College</Text>
            </View>
            <Text style={styles.detailValueStacked}>{collegeLabel}</Text>
          </View>

          <View style={styles.rowDivider} />

          {/* Program — same stacked, right-aligned treatment */}
          <View style={styles.detailRowStacked}>
            <View style={styles.detailLabelGroup}>
              <Ionicons name="book-outline" size={16} color={C.textMuted} />
              <Text style={styles.detailLabel}>Program</Text>
            </View>
            <Text style={styles.detailValueStacked}>{courseLabel}</Text>
          </View>

          <View style={styles.rowDivider} />

          <View style={styles.detailRow}>
            <View style={styles.detailLabelGroup}>
              <Ionicons name="calendar-outline" size={16} color={C.textMuted} />
              <Text style={styles.detailLabel}>Year level</Text>
            </View>
            <Text style={styles.detailValue}>{yearLevelLabel}</Text>
          </View>
        </View>

        <View style={styles.actionSection}>
          <Text style={styles.sectionLabel}>ACCOUNT</Text>

          <TouchableOpacity style={styles.actionRow} activeOpacity={0.7}>
            <View style={styles.actionLeft}>
              <View style={styles.actionIconBox}>
                <Ionicons name="create-outline" size={17} color={C.primary} />
              </View>
              <Text style={styles.actionText}>Edit profile</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={C.muted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionRow} activeOpacity={0.7}>
            <View style={styles.actionLeft}>
              <View style={styles.actionIconBox}>
                <Ionicons name="lock-closed-outline" size={17} color={C.primary} />
              </View>
              <Text style={styles.actionText}>Change password</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={C.muted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionRow, { borderBottomWidth: 0 }]}
            activeOpacity={0.7}
            onPress={handleLogout}
          >
            <View style={styles.actionLeft}>
              <View style={[styles.actionIconBox, { backgroundColor: C.errorSoft }]}>
                <Ionicons name="log-out-outline" size={17} color={C.error} />
              </View>
              <Text style={[styles.actionText, { color: C.error }]}>Log out</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

function ordinalSuffix(n: number) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  emptyIconWrap: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: C.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  noDataTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: C.text,
    marginBottom: 2,
  },
  noDataText: {
    fontSize: 13,
    color: C.textMuted,
    textAlign: 'center',
    marginBottom: 12,
  },
  goToLoginBtn: {
    marginTop: 8,
    backgroundColor: C.primaryDark,
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 28,
  },
  goToLoginText: {
    color: C.surface,
    fontSize: 14,
    fontWeight: '700',
  },

  header: {
    backgroundColor: C.primaryDark,
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: C.surface,
    letterSpacing: -0.2,
  },

  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.28)',
  },
  avatarLetter: {
    fontSize: 24,
    fontWeight: '700',
    color: C.surface,
  },
  profileInfo: {
    flex: 1,
  },
  nameText: {
    fontSize: 18,
    fontWeight: '700',
    color: C.surface,
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  srCodeChip: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  srCodeText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 0.3,
  },

  body: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  section: {
    backgroundColor: C.surface,
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 14,
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 2,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: C.muted,
    letterSpacing: 0.6,
    marginBottom: 14,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  // Stacked layout for long values (College, Program):
  // label row on top, value below spanning full width, right-aligned, wraps freely.
  detailRowStacked: {
    paddingVertical: 4,
  },
  detailLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailLabel: {
    fontSize: 13.5,
    color: C.textMuted,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 13.5,
    fontWeight: '700',
    color: C.text,
    maxWidth: '55%',
    textAlign: 'right',
  },
  detailValueStacked: {
    fontSize: 13.5,
    fontWeight: '700',
    color: C.text,
    textAlign: 'right',
    marginTop: 6,
  },
  rowDivider: {
    height: 1,
    backgroundColor: C.border,
    marginVertical: 12,
  },

  actionSection: {
    backgroundColor: C.surface,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 2,
    marginBottom: 24,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: C.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: C.text,
  },
});