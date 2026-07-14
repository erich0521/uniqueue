import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView, Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LOGIN_URL } from '../../constants/backend';

// ─── Palette (matches RoleSelectScreen) ─────────────────────────────────────
const C = {
  oliveGreen: '#556B2F',
  darkGreen: '#006400',
  cream: '#FAF7F2',
  iconBg: '#E3EDD8',
  text: '#1F2A17',
  textMuted: '#5C6B4F',
  border: 'rgba(85,107,47,0.14)',
  borderFocus: '#556B2F',
  white: '#FFFFFF',
  error: '#B91C1C',
  errorBg: '#FEF2F2',
};

export default function StudentLoginScreen() {
  const insets = useSafeAreaInsets();

  const [srCode, setSrCode] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [srFocused, setSrFocused] = useState(false);
  const [pwFocused, setPwFocused] = useState(false);

  async function handleLogin() {
    setError('');

    if (!srCode.trim()) {
      setError('Please enter your SR-Code.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(LOGIN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sr_code: srCode.trim(),
          password,
        }),
      });

      const text = await response.text();
      console.log(text);
      const result = JSON.parse(text);

      if (!result.success) {
        throw new Error(result.message || 'Invalid SR-Code or password.');
      }

      // Save the logged-in student's data so other screens (like Profile) can read it
      await AsyncStorage.setItem('studentData', JSON.stringify(result.student));

      router.replace('/student/dashboard' as any);
    } catch (err: any) {
      setError(err.message || 'Invalid SR-Code or password. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: C.cream }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          {/* ── Logo badge ──────────────────────────────────────────── */}
          <View style={styles.iconBadge}>
            <Image
              source={require('../../assets/images/logo.png')}
              style={styles.iconLogo}
              resizeMode="contain"
            />
          </View>

          {/* ── Heading ─────────────────────────────────────────────── */}
          <Text style={styles.heading}>Student Sign In</Text>
          <Text style={styles.subheading}>
            Enter your SR-Code and password to access your portal.
          </Text>

          {/* ── Error banner ────────────────────────────────────────── */}
          {error ? (
            <View style={styles.errorBanner}>
              <Ionicons name="warning-outline" size={14} color={C.error} style={{ marginTop: 2 }} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* ── Form ────────────────────────────────────────────────── */}
          <View style={styles.form}>
            {/* SR-Code */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>SR-Code</Text>
              <TextInput
                style={[styles.input, srFocused && styles.inputFocused]}
                placeholder="e.g. 21-12345"
                placeholderTextColor={C.textMuted}
                value={srCode}
                onChangeText={setSrCode}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="default"
                returnKeyType="next"
                onFocus={() => setSrFocused(true)}
                onBlur={() => setSrFocused(false)}
              />
            </View>

            {/* Password */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={[styles.passwordRow, pwFocused && styles.inputFocused]}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter your password"
                  placeholderTextColor={C.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                  onFocus={() => setPwFocused(true)}
                  onBlur={() => setPwFocused(false)}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword((v) => !v)}
                  activeOpacity={0.7}
                  style={styles.eyeBtn}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={C.textMuted}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot password */}
            <TouchableOpacity
              style={styles.forgotBtn}
              activeOpacity={0.7}
              onPress={() => {
                /* TODO: forgot password route */
              }}
            >
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            {/* Login button */}
            <TouchableOpacity
              style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
              activeOpacity={0.8}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={C.white} />
              ) : (
                <Text style={styles.loginBtnText}>SIGN IN</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* ── Divider ─────────────────────────────────────────────── */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerLabel}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* ── Sign Up ─────────────────────────────────────────────── */}
          <View style={styles.signUpRow}>
            <Text style={styles.signUpPrompt}>Don't have an account? </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push('/login/student-signup' as any)}
            >
              <Text style={styles.signUpLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Footer ──────────────────────────────────────────────── */}
        <Text style={styles.footer}>
          © 2026 Batangas State University - TNEU
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    backgroundColor: C.cream,
  },
  card: {
    backgroundColor: C.white,
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 30,
    paddingBottom: 24,
    marginTop: 75,
    marginBottom: 18,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  iconBadge: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: C.iconBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 20,
    alignSelf: 'center',
  },
  iconLogo: {
    width: 40,
    height: 40,
  },
  heading: {
    fontSize: 26,
    fontWeight: '800',
    color: C.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subheading: {
    fontSize: 14,
    color: C.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
    paddingHorizontal: 8,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: C.errorBg,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: C.error,
    lineHeight: 18,
  },
  form: {
    gap: 4,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: C.text,
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  input: {
    backgroundColor: C.white,
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: C.text,
  },
  inputFocused: {
    borderColor: C.borderFocus,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 13,
    fontSize: 15,
    color: C.text,
  },
  eyeBtn: {
    paddingLeft: 10,
    paddingVertical: 8,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginTop: -6,
    marginBottom: 22,
  },
  forgotText: {
    fontSize: 13,
    color: C.oliveGreen,
    fontWeight: '600',
  },
  loginBtn: {
    backgroundColor: C.darkGreen,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: C.darkGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  loginBtnDisabled: {
    opacity: 0.6,
  },
  loginBtnText: {
    color: C.white,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 28,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: C.border,
  },
  dividerLabel: {
    fontSize: 13,
    color: C.textMuted,
  },
  signUpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  signUpPrompt: {
    fontSize: 14,
    color: C.textMuted,
  },
  signUpLink: {
    fontSize: 14,
    fontWeight: '700',
    color: C.oliveGreen,
  },
  footer: {
    textAlign: 'center',
    fontSize: 11,
    color: C.textMuted,
    marginTop: 120,
    marginBottom: 8,
  },
});