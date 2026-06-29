import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const C = {
  background: '#F5F7F2',
  primary: '#1E5D33',
  primarySoft: '#E6F2E9',
  surface: '#FFFFFF',
  border: 'rgba(30, 93, 51, 0.14)',
  text: '#1F2F23',
  textMuted: '#6A7A6B',
  shadow: '#00000008',
};

const PROFILE = {
  name: 'Erich Castillo',
  studentId: '21-12345',
  course: 'BS Information Technology',
  yearLevel: '3rd Year',
  email: 'erich.castillo@batsu.edu.ph',
  phone: '+63 912 345 6789',
};

export default function StudentProfileScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { paddingTop: insets.top + 18 }]}> 
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.75}
          >
            <Ionicons name="arrow-back" size={18} color={C.surface} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={{ width: 60 }} />
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarLetter}>{PROFILE.name.charAt(0)}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.nameText}>{PROFILE.name}</Text>
            <Text style={styles.roleText}>{PROFILE.course}</Text>
          </View>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Student details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Student ID</Text>
            <Text style={styles.detailValue}>{PROFILE.studentId}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Course</Text>
            <Text style={styles.detailValue}>{PROFILE.course}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Year level</Text>
            <Text style={styles.detailValue}>{PROFILE.yearLevel}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Contact</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Email</Text>
            <Text style={styles.detailValue}>{PROFILE.email}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Phone</Text>
            <Text style={styles.detailValue}>{PROFILE.phone}</Text>
          </View>
        </View>

        <View style={styles.actionSection}>
          <Text style={styles.actionHeading}>Account</Text>
          <TouchableOpacity style={styles.actionRow} activeOpacity={0.8}>
            <Text style={styles.actionText}>Edit profile</Text>
            <Ionicons name="chevron-forward" size={20} color={C.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionRow} activeOpacity={0.8}>
            <Text style={styles.actionText}>Change password</Text>
            <Ionicons name="chevron-forward" size={20} color={C.primary} />
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
    paddingBottom: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backText: {
    color: C.surface,
    fontSize: 14,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: C.surface,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 24,
    padding: 18,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    fontSize: 26,
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
    marginBottom: 4,
  },
  roleText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 20,
  },
  body: {
    paddingHorizontal: 16,
    marginTop: -20,
  },
  section: {
    backgroundColor: C.surface,
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 14,
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.04,
    shadowRadius: 14,
    elevation: 2,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: C.primary,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 13,
    color: C.textMuted,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: C.text,
    maxWidth: '60%',
    textAlign: 'right',
  },
  actionSection: {
    backgroundColor: C.surface,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.04,
    shadowRadius: 14,
    elevation: 2,
    marginBottom: 24,
  },
  actionHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: C.text,
    marginBottom: 14,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(30,93,51,0.08)',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.primary,
  },
});