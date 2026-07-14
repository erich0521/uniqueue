import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SUBMIT_FEEDBACK_URL } from '../../constants/backend';

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
  dangerSoft: '#FBEAEA',
  warning: '#B8860B',
  starActive: '#E8B84B',
  starInactive: '#D8DED9',
};

type StudentData = { id: number };

const RATING_HINTS: Record<number, string> = {
  1: 'Very unsatisfied',
  2: 'Unsatisfied',
  3: 'Okay',
  4: 'Satisfied',
  5: 'Very satisfied',
};

export default function FeedbackScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    ticket_id?: string;
    queue_number?: string;
    office_name?: string;
  }>();

  const ticketId = params.ticket_id ? parseInt(params.ticket_id, 10) : 0;
  const queueNumber = params.queue_number ?? '';
  const officeName = params.office_name ?? 'the office';

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleSkip = () => {
    router.replace('/student/dashboard');
  };

  const handleSubmit = async () => {
    if (rating < 1) {
      setError('Please select a rating before submitting.');
      return;
    }
    if (!ticketId) {
      setError('Missing ticket information. Please try again from your dashboard.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const raw = await AsyncStorage.getItem('studentData');
      const student: StudentData | null = raw ? JSON.parse(raw) : null;

      if (!student?.id) {
        setError('No student session found. Please log in again.');
        setSubmitting(false);
        return;
      }

      const res = await fetch(SUBMIT_FEEDBACK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: student.id,
          ticket_id: ticketId,
          rating,
          comment: comment.trim() || undefined,
        }),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.message ?? 'Unable to submit feedback.');
        setSubmitting(false);
        return;
      }

      setDone(true);
    } catch (err) {
      console.log('FEEDBACK SUBMIT ERROR:', err);
      setError('Could not reach the server. Check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <View style={[styles.container, styles.centerFill]}>
        <View style={styles.successIconBox}>
          <Ionicons name="checkmark-circle" size={54} color={C.primary} />
        </View>
        <Text style={styles.successTitle}>Thanks for your feedback!</Text>
        <Text style={styles.successSub}>
          Your response helps {officeName} improve their service.
        </Text>
        <TouchableOpacity
          style={styles.doneButton}
          activeOpacity={0.85}
          onPress={() => router.replace('/student/dashboard')}
        >
          <Text style={styles.doneButtonText}>Back to Dashboard</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
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
          <Text style={styles.heading}>How was your experience?</Text>
          <Text style={styles.headerDescription}>
            Rate your recent transaction at{' '}
            <Text style={styles.headerDescriptionStrong}>{officeName}</Text>
            {queueNumber ? ` (Ticket #${queueNumber})` : ''}.
          </Text>
        </View>

        <View style={styles.body}>
          <View style={styles.card}>
            {error ? (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle-outline" size={16} color={C.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Text style={styles.fieldLabel}>Overall Satisfaction</Text>

            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((value) => (
                <TouchableOpacity
                  key={value}
                  onPress={() => {
                    setRating(value);
                    setError(null);
                  }}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
                >
                  <Ionicons
                    name={value <= rating ? 'star' : 'star-outline'}
                    size={36}
                    color={value <= rating ? C.starActive : C.starInactive}
                    style={styles.starIcon}
                  />
                </TouchableOpacity>
              ))}
            </View>

            {rating > 0 && (
              <Text style={styles.ratingHint}>{RATING_HINTS[rating]}</Text>
            )}

            <Text style={[styles.fieldLabel, { marginTop: 22 }]}>
              Comments (Optional)
            </Text>
            <TextInput
              style={styles.textarea}
              multiline
              numberOfLines={4}
              placeholder="Tell us more about your experience..."
              placeholderTextColor={C.muted}
              value={comment}
              onChangeText={setComment}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
              activeOpacity={0.85}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color={C.surface} />
              ) : (
                <Text style={styles.submitButtonText}>Submit Feedback</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.skipButton}
              activeOpacity={0.7}
              onPress={handleSkip}
              disabled={submitting}
            >
              <Text style={styles.skipButtonText}>Skip for now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
  },
  centerFill: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },

  header: {
    backgroundColor: C.primaryDark,
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 14,
    paddingVertical: 4,
    gap: 6,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.surface,
  },
  heading: {
    fontSize: 22,
    fontWeight: '800',
    color: C.surface,
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  headerDescription: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.72)',
    lineHeight: 19,
    maxWidth: '95%',
  },
  headerDescriptionStrong: {
    fontWeight: '700',
    color: 'rgba(255,255,255,0.92)',
  },

  body: {
    paddingHorizontal: 16,
    marginTop: 22,
  },

  card: {
    backgroundColor: C.surface,
    borderRadius: 22,
    padding: 22,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: C.primaryDark,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3,
  },

  errorBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: C.dangerSoft,
    borderRadius: 12,
    padding: 12,
    marginBottom: 18,
  },
  errorText: {
    flex: 1,
    fontSize: 12.5,
    color: C.danger,
    fontWeight: '500',
    lineHeight: 18,
  },

  fieldLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: C.text,
    marginBottom: 12,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  starIcon: {
    marginHorizontal: 2,
  },
  ratingHint: {
    textAlign: 'center',
    fontSize: 12.5,
    fontWeight: '600',
    color: C.textMuted,
    marginTop: 10,
  },

  textarea: {
    backgroundColor: C.background,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    minHeight: 96,
    fontSize: 13.5,
    color: C.text,
  },

  submitButton: {
    backgroundColor: C.primary,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: C.surface,
    fontWeight: '700',
    fontSize: 14,
  },
  skipButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  skipButtonText: {
    color: C.textMuted,
    fontWeight: '600',
    fontSize: 13,
  },

  successIconBox: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: C.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: C.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  successSub: {
    fontSize: 13.5,
    color: C.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
  },
  doneButton: {
    backgroundColor: C.primary,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  doneButtonText: {
    color: C.surface,
    fontWeight: '700',
    fontSize: 13.5,
  },
});