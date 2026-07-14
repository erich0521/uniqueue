import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLLEGES_URL, PROGRAMS_URL, REGISTER_URL } from '../../constants/backend';

// ─── Types (matches colleges.php / programs.php column aliases) ─────────────
type College = { college_id: number; college_name: string };
type Program = { program_id: number; program_name: string };

// ─── Palette ─────────────────────────────────────────────────────────────────
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

export default function StudentSignupScreen() {
  const insets = useSafeAreaInsets();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [srCode, setSrCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // College / Program data + selection
  const [colleges, setColleges] = useState<College[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedCollege, setSelectedCollege] = useState<College | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [collegesLoading, setCollegesLoading] = useState(true);
  const [programsLoading, setProgramsLoading] = useState(false);

  const [collegeModalVisible, setCollegeModalVisible] = useState(false);
  const [programModalVisible, setProgramModalVisible] = useState(false);

  const [focusedField, setFocusedField] = useState<string | null>(null);

  // ── Fetch colleges on mount ──────────────────────────────────────────────
  useEffect(() => {
    async function fetchColleges() {
      try {
        const response = await fetch(COLLEGES_URL);
        const data = await response.json();
        // colleges.php returns a plain array, not { success, colleges }
        setColleges(Array.isArray(data) ? data : []);
      } catch (err: any) {
        console.log('COLLEGES ERROR:', err);
        setError('Could not connect to server to load colleges.');
      } finally {
        setCollegesLoading(false);
      }
    }
    fetchColleges();
  }, []);

  // ── Fetch programs whenever selected college changes ────────────────────
  async function handleSelectCollege(college: College) {
    setSelectedCollege(college);
    setSelectedProgram(null);
    setPrograms([]);
    setCollegeModalVisible(false);
    setProgramsLoading(true);

    try {
      const response = await fetch(`${PROGRAMS_URL}?college_id=${college.college_id}`);
      const data = await response.json();
      // programs.php returns a plain array, not { success, programs }
      setPrograms(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.log('PROGRAMS ERROR:', err);
      setError('Could not connect to server to load programs.');
    } finally {
      setProgramsLoading(false);
    }
  }

  async function handleSignUp() {
    setError('');

    if (!firstName.trim()) return setError('Please enter your first name.');
    if (!lastName.trim()) return setError('Please enter your last name.');
    if (!srCode.trim()) return setError('Please enter your SR-Code.');
    if (!selectedCollege) return setError('Please select a college.');
    if (!selectedProgram) return setError('Please select a program.');
    if (!password) return setError('Please enter a password.');
    if (password.length < 8) return setError('Password must be at least 8 characters.');
    if (password !== confirmPassword) return setError('Passwords do not match.');

    setLoading(true);

    try {
      const response = await fetch(REGISTER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          sr_code: srCode.trim(),
          college_id: selectedCollege.college_id,
          program_id: selectedProgram.program_id,
          password,
        }),
      });

      const text = await response.text();
      console.log(text);
      const result = JSON.parse(text);

      if (!result.success) {
        throw new Error(result.message || 'Registration failed.');
      }

      setLoading(false);
      setError('');
      alert(result.message);
      router.replace('/student/dashboard' as any);
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Registration failed. Please try again.');
    }
  }

  const field = (key: string) => ({
    onFocus: () => setFocusedField(key),
    onBlur: () => setFocusedField(null),
  });

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: C.cream }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.headerBar, { paddingTop: insets.top + 8 }]}> 
        <TouchableOpacity
          style={styles.back}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={18} color={C.oliveGreen} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: 16, paddingBottom: insets.bottom + 32 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          {/* ── Icon badge ──────────────────────────────────────────── */}
          <View style={styles.iconBadge}>
            <Ionicons name="person-add" size={30} color={C.oliveGreen} />
          </View>

          {/* ── Heading ─────────────────────────────────────────────── */}
          <Text style={styles.heading}>Create Account</Text>
          <Text style={styles.subheading}>
            Fill in your details to register as a student.
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

            {/* Name row */}
            <View style={styles.row}>
              <View style={[styles.fieldGroup, { flex: 1 }]}>
              <Text style={styles.label}>First Name</Text>
                <TextInput
                  style={[styles.input, focusedField === 'firstName' && styles.inputFocused]}
                  placeholder="Juan"
                  placeholderTextColor={C.textMuted}
                  value={firstName}
                  onChangeText={setFirstName}
                  autoCapitalize="words"
                  returnKeyType="next"
                  {...field('firstName')}
                />
              </View>
              <View style={[styles.fieldGroup, { flex: 1 }]}>
              <Text style={styles.label}>Last Name</Text>
                <TextInput
                  style={[styles.input, focusedField === 'lastName' && styles.inputFocused]}
                  placeholder="Dela Cruz"
                  placeholderTextColor={C.textMuted}
                  value={lastName}
                  onChangeText={setLastName}
                  autoCapitalize="words"
                  returnKeyType="next"
                  {...field('lastName')}
                />
              </View>
            </View>

            {/* SR-Code */}
            <View style={styles.fieldGroup}>
            <Text style={styles.label}>SR-Code</Text>
              <TextInput
                style={[styles.input, focusedField === 'srCode' && styles.inputFocused]}
                placeholder="e.g. 21-12345"
                placeholderTextColor={C.textMuted}
                value={srCode}
                onChangeText={setSrCode}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                {...field('srCode')}
              />
            </View>

            {/* College Selection */}
            <View style={styles.fieldGroup}>
            <Text style={styles.label}>College</Text>
              <TouchableOpacity
                style={[styles.input, styles.selectInput, focusedField === 'college' && styles.inputFocused]}
                onPress={() => setCollegeModalVisible(true)}
                activeOpacity={0.7}
                disabled={collegesLoading}
              >
                <Text style={[styles.selectText, !selectedCollege && styles.placeholderText]}>
                  {collegesLoading
                    ? 'Loading colleges...'
                    : selectedCollege?.college_name || 'Select your college'}
                </Text>
                {collegesLoading ? (
                  <ActivityIndicator size="small" color={C.oliveGreen} />
                ) : (
                  <Ionicons name="chevron-down" size={20} color={C.textMuted} />
                )}
              </TouchableOpacity>
            </View>

            {/* Program Selection */}
            <View style={styles.fieldGroup}>
            <Text style={styles.label}>Program</Text>
              <TouchableOpacity
                style={[styles.input, styles.selectInput, focusedField === 'program' && styles.inputFocused]}
                onPress={() => selectedCollege ? setProgramModalVisible(true) : setError('Please select a college first.')}
                activeOpacity={0.7}
                disabled={!selectedCollege || programsLoading}
              >
                <Text style={[styles.selectText, !selectedProgram && styles.placeholderText, !selectedCollege && styles.disabledText]}>
                  {programsLoading
                    ? 'Loading programs...'
                    : selectedProgram?.program_name || 'Select your program'}
                </Text>
                {programsLoading ? (
                  <ActivityIndicator size="small" color={C.oliveGreen} />
                ) : (
                  <Ionicons name="chevron-down" size={20} color={!selectedCollege ? C.border : C.textMuted} />
                )}
              </TouchableOpacity>
            </View>

            {/* Password */}
            <View style={styles.fieldGroup}>
            <Text style={styles.label}>Password</Text>
              <View style={[styles.passwordRow, focusedField === 'password' && styles.inputFocused]}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="At least 8 characters"
                  placeholderTextColor={C.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  returnKeyType="next"
                  {...field('password')}
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

            {/* Confirm Password */}
            <View style={styles.fieldGroup}>
            <Text style={styles.label}>Confirm Password</Text>
              <View style={[styles.passwordRow, focusedField === 'confirmPassword' && styles.inputFocused]}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Re-enter your password"
                  placeholderTextColor={C.textMuted}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  returnKeyType="done"
                  onSubmitEditing={handleSignUp}
                  {...field('confirmPassword')}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword((v) => !v)}
                  activeOpacity={0.7}
                  style={styles.eyeBtn}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={C.textMuted}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Sign Up button */}
            <TouchableOpacity
              style={[styles.signUpBtn, loading && styles.btnDisabled]}
              activeOpacity={0.8}
              onPress={handleSignUp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={C.white} />
              ) : (
                <Text style={styles.signUpBtnText}>CREATE ACCOUNT</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* ── Divider ─────────────────────────────────────────────── */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerLabel}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* ── Already have account ─────────────────────────────────── */}
          <View style={styles.loginRow}>
            <Text style={styles.loginPrompt}>Already have an account? </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.back()}
            >
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Footer ──────────────────────────────────────────────── */}
        <Text style={styles.footer}>
          © 2026 Batangas State University - TNEU
        </Text>
      </ScrollView>

      {/* ── College Modal ──────────────────────────────────────────── */}
      <Modal
        visible={collegeModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setCollegeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select College</Text>
              <TouchableOpacity onPress={() => setCollegeModalVisible(false)} activeOpacity={0.7}>
                <Ionicons name="close" size={24} color={C.text} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={colleges}
              keyExtractor={(item: College) => String(item.college_id)}
              renderItem={({ item }: { item: College }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleSelectCollege(item)}
                  activeOpacity={0.7}
                >
                  <View style={styles.modalItemContent}>
                    <Text style={styles.modalItemText}>{item.college_name}</Text>
                    {selectedCollege?.college_id === item.college_id && (
                      <Ionicons name="checkmark" size={20} color={C.darkGreen} />
                    )}
                  </View>
                </TouchableOpacity>
              )}
              scrollEnabled={true}
            />
          </View>
        </View>
      </Modal>

      {/* ── Program Modal ──────────────────────────────────────────── */}
      <Modal
        visible={programModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setProgramModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Program</Text>
              <TouchableOpacity onPress={() => setProgramModalVisible(false)} activeOpacity={0.7}>
                <Ionicons name="close" size={24} color={C.text} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={programs}
              keyExtractor={(item: Program) => String(item.program_id)}
              renderItem={({ item }: { item: Program }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedProgram(item);
                    setProgramModalVisible(false);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.modalItemContent}>
                    <Text style={styles.modalItemText}>{item.program_name}</Text>
                    {selectedProgram?.program_id === item.program_id && (
                      <Ionicons name="checkmark" size={20} color={C.darkGreen} />
                    )}
                  </View>
                </TouchableOpacity>
              )}
              scrollEnabled={true}
            />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  headerBar: {
    paddingHorizontal: 24,
    paddingBottom: 12,
    backgroundColor: C.cream,
    zIndex: 10,
  },
  scrollView: {
    flex: 1,
    backgroundColor: C.cream,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    backgroundColor: C.cream,
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  backText: {
    fontSize: 14,
    color: C.oliveGreen,
    fontWeight: '600',
  },
  card: {
    backgroundColor: C.white,
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 24,
    marginTop: 8,
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
    marginBottom: 20,
    alignSelf: 'center',
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
    marginBottom: 18,
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
  row: {
    flexDirection: 'row',
    gap: 12,
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
  signUpBtn: {
    backgroundColor: C.darkGreen,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    shadowColor: C.darkGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  signUpBtnText: {
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
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  loginPrompt: {
    fontSize: 14,
    color: C.textMuted,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '700',
    color: C.oliveGreen,
  },
  footer: {
    textAlign: 'center',
    fontSize: 11,
    color: C.textMuted,
    marginTop: 18,
    marginBottom: 8,
  },
  selectInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 10,
  },
  selectText: {
    flex: 1,
    fontSize: 15,
    color: C.text,
  },
  placeholderText: {
    color: C.textMuted,
  },
  disabledText: {
    color: C.textMuted,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: C.cream,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingTop: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: C.text,
  },
  modalItem: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  modalItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalItemText: {
    fontSize: 15,
    color: C.text,
    flex: 1,
  },
});