import { router } from 'expo-router';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ─── Palette ────────────────────────────────────────────────────────────────
const C = {
  oliveGreen: '#556B2F',
  darkGreen: '#006400',
  cream: '#FAF7F2',
  iconBg: '#E3EDD8', // light olive tint for icon boxes
  text: '#1F2A17',
  textMuted: '#5C6B4F',
  border: 'rgba(85,107,47,0.14)',
  white: '#FFFFFF',
};

const ROLES = [
  {
    key: 'student',
    icon: '🎓',
    title: 'Student',
    desc: 'I want to check queues and request documents from the registrar.',
    cta: 'ENTER STUDENT PORTAL',
    route: '/login/student',
  },
  {
    key: 'office-admin',
    icon: '🛡️',
    title: 'Office Admin',
    desc: 'I need to manage counters, monitor queue traffic, and serve students.',
    cta: 'ACCESS ADMIN DASHBOARD',
    route: '/login/office-admin',
  },
  
] as const;

export default function RoleSelectScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      showsVerticalScrollIndicator={false}
    >
     
      <View style={styles.content}>
        {/* ── Hero illustration ──────────────────────────────────── */}
        <View style={styles.hero}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.heroLogo}
            resizeMode="contain"
          />
        </View>

        {/* ── Welcome copy ───────────────────────────────────────── */}
        <Text style={styles.heading}>Welcome to Uni-Queue</Text>
        <Text style={styles.subheading}>
          Modernizing campus productivity. Select your role to get started with
          institutional efficiency.
        </Text>

        {/* ── Role cards ──────────────────────────────────────────── */}
        {ROLES.map((role) => (
          <View key={role.key} style={styles.card}>
            <View style={styles.cardIconBox}>
              <Text style={styles.cardIcon}>{role.icon}</Text>
            </View>
            <Text style={styles.cardTitle}>{role.title}</Text>
            <Text style={styles.cardDesc}>{role.desc}</Text>
            <TouchableOpacity
              style={styles.cardLink}
              activeOpacity={0.7}
              onPress={() => router.push(role.route as any)}
            >
              <Text style={styles.cardLinkText}>{role.cta}</Text>
              <Text style={styles.cardLinkArrow}>→</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* ── Footer ──────────────────────────────────────────────── */}
        <View style={styles.footer}>
          <Text style={styles.footerCopy}>
            © 2026 Batangas State University - TNEU. All rights reserved.
          </Text>
         
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
  content: {
    paddingHorizontal: 20,
  },

  // Top bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    backgroundColor: C.cream,
  },
  topBarTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: C.darkGreen,
  },

  // Hero
  hero: {
    marginTop: 32,
    height: 180,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  heroLogo: {
    width: 150,
    height: 150,
    marginBottom: -20,
  },

  // Welcome copy
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: C.text,
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 10,
  },
  subheading: {
    fontSize: 14,
    color: C.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
    paddingHorizontal: 6,
  },

  // Role card
  card: {
    backgroundColor: C.white,
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  cardIconBox: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: C.iconBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  cardIcon: {
    fontSize: 24,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: C.text,
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 13,
    color: C.textMuted,
    lineHeight: 19,
    marginBottom: 14,
  },
  cardLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
  },
  cardLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: C.oliveGreen,
    letterSpacing: 0.4,
  },
  cardLinkArrow: {
    fontSize: 14,
    color: C.oliveGreen,
    fontWeight: '700',
  },

  // Footer
  footer: {
    marginTop: 52,
    paddingTop: 50,
    borderTopWidth: 1,
    borderTopColor: C.border,
    alignItems: 'center',
  },
  footerCopy: {
    fontSize: 12,
    color: C.textMuted,
    textAlign: 'center',
    marginBottom: 10,
  },
  footerLinks: {
    flexDirection: 'row',
    gap: 20,
  },
});