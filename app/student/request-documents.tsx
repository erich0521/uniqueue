import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DOCUMENTS_URL, REQUEST_DOCUMENT_URL } from '../../constants/backend';

console.log('[UniQueue] REQUEST_DOCUMENT_URL:', REQUEST_DOCUMENT_URL);

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
  shadow: '#0F2A1808',
};

type StudentData = {
  id: number;
};

type DocumentItem = {
  id: number;
  name: string;
  office_id: number;
  office_name: string;
  processing_time: number | null;
  requirements: string[];
};

type SelectedMap = Record<number, number>; // document_id -> quantity

type RequestType = 'walkin' | 'appointment';

export default function RequestDocumentsScreen() {
  const insets = useSafeAreaInsets();
  const [student, setStudent] = useState<StudentData | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selected, setSelected] = useState<SelectedMap>({});
  const [requestType, setRequestType] = useState<RequestType>('walkin');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        const raw = await AsyncStorage.getItem('studentData');
        setStudent(raw ? JSON.parse(raw) : null);

        const res = await fetch(DOCUMENTS_URL);
        const data = await res.json();

        if (!data.success) {
          setErrorMsg(data.message ?? 'Unable to load documents.');
          return;
        }

        setDocuments(data.documents ?? []);
      } catch (err) {
        console.log('REQUEST DOCS LOAD ERROR:', err);
        setErrorMsg('Could not reach the server. Check your connection and try again.');
      } finally {
        setLoading(false);
      }
    }

    init();
  }, []);

  const selectedOfficeId = useMemo(() => {
    const firstSelectedId = Object.keys(selected).map(Number)[0];
    if (!firstSelectedId) return null;
    return documents.find((d) => d.id === firstSelectedId)?.office_id ?? null;
  }, [selected, documents]);

  const toggleDocument = useCallback(
    (doc: DocumentItem) => {
      setSelected((prev) => {
        const next = { ...prev };

        if (next[doc.id]) {
          delete next[doc.id];
          return next;
        }

        if (selectedOfficeId !== null && doc.office_id !== selectedOfficeId) {
          Alert.alert(
            'One office at a time',
            'You can only request documents from a single office per submission. Please finish this request first, then submit another for a different office.'
          );
          return prev;
        }

        next[doc.id] = 1;
        return next;
      });
    },
    [selectedOfficeId]
  );

  const changeQuantity = useCallback((docId: number, delta: number) => {
    setSelected((prev) => {
      const current = prev[docId] ?? 1;
      const nextQty = Math.max(1, current + delta);
      return { ...prev, [docId]: nextQty };
    });
  }, []);

  const selectedCount = Object.keys(selected).length;

  const handleSubmit = useCallback(async () => {
    if (!student?.id) {
      Alert.alert('Session expired', 'Please log in again.');
      return;
    }

    if (selectedCount === 0) {
      Alert.alert('No documents selected', 'Please select at least one document to request.');
      return;
    }

    if (requestType === 'appointment' && !/^\d{4}-\d{2}-\d{2}$/.test(appointmentDate)) {
      Alert.alert('Invalid date', 'Please enter the appointment date as YYYY-MM-DD.');
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        student_id: student.id,
        type: requestType,
        appointment_date: requestType === 'appointment' ? appointmentDate : null,
        documents: Object.entries(selected).map(([documentId, quantity]) => ({
          document_id: Number(documentId),
          quantity,
        })),
      };

      const res = await fetch(REQUEST_DOCUMENT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!data.success) {
        Alert.alert('Request failed', data.message ?? 'Please try again.');
        return;
      }

      Alert.alert(
        'Request submitted',
        `Your ticket number is ${data.ticket.queue_number}. You can track it on the Queue Status screen.`,
        [{ text: 'View queue status', onPress: () => router.replace('/student/queue') }]
      );
    } catch (err) {
      console.log('REQUEST DOCS SUBMIT ERROR:', err);
      Alert.alert('Something went wrong', 'Could not reach the server. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [student, selected, selectedCount, requestType, appointmentDate]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { paddingTop: insets.top + 18 }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          activeOpacity={0.75}
        >
          <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.heading}>Request Documents</Text>
        <Text style={styles.headerDescription}>
          Choose the documents you need, then submit to join the queue.
        </Text>
      </View>

      <View style={styles.body}>
        {loading ? (
          <View style={styles.centerState}>
            <ActivityIndicator size="large" color={C.primary} />
            <Text style={styles.centerStateText}>Loading available documents...</Text>
          </View>
        ) : errorMsg ? (
          <View style={styles.centerState}>
            <Ionicons name="alert-circle-outline" size={34} color={C.danger} />
            <Text style={styles.centerStateText}>{errorMsg}</Text>
          </View>
        ) : documents.length === 0 ? (
          <View style={styles.centerState}>
            <Text style={styles.centerStateText}>No documents are available to request right now.</Text>
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Available documents</Text>

            {documents.map((doc) => {
              const isSelected = Boolean(selected[doc.id]);
              const quantity = selected[doc.id] ?? 1;

              return (
                <TouchableOpacity
                  key={doc.id}
                  style={[styles.docCard, isSelected && styles.docCardSelected]}
                  activeOpacity={0.85}
                  onPress={() => toggleDocument(doc)}
                >
                  <View style={styles.docCardTop}>
                    <View
                      style={[styles.checkbox, isSelected && styles.checkboxChecked]}
                    >
                      {isSelected && (
                        <Ionicons name="checkmark" size={13} color="#FFFFFF" />
                      )}
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.docName}>{doc.name}</Text>
                      <Text style={styles.docOffice}>{doc.office_name}</Text>
                    </View>

                    {doc.processing_time !== null && (
                      <View style={styles.processingPill}>
                        <Ionicons name="time-outline" size={11} color={C.warning} />
                        <Text style={styles.processingText}>~{doc.processing_time}m</Text>
                      </View>
                    )}
                  </View>

                  {doc.requirements.length > 0 && (
                    <View style={styles.requirementsBox}>
                      <Text style={styles.requirementsLabel}>Requirements:</Text>
                      {doc.requirements.map((req, i) => (
                        <Text key={i} style={styles.requirementItem}>
                          • {req}
                        </Text>
                      ))}
                    </View>
                  )}

                  {isSelected && (
                    <View style={styles.qtyRow}>
                      <Text style={styles.qtyLabel}>Quantity</Text>
                      <View style={styles.qtyControls}>
                        <TouchableOpacity
                          style={styles.qtyBtn}
                          onPress={() => changeQuantity(doc.id, -1)}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="remove" size={15} color={C.primary} />
                        </TouchableOpacity>
                        <Text style={styles.qtyValue}>{quantity}</Text>
                        <TouchableOpacity
                          style={styles.qtyBtn}
                          onPress={() => changeQuantity(doc.id, 1)}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="add" size={15} color={C.primary} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}

            <Text style={styles.sectionTitle}>How would you like to proceed?</Text>

            <View style={styles.typeToggleRow}>
              <TouchableOpacity
                style={[
                  styles.typeOption,
                  requestType === 'walkin' && styles.typeOptionActive,
                ]}
                onPress={() => setRequestType('walkin')}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="walk-outline"
                  size={16}
                  color={requestType === 'walkin' ? '#FFFFFF' : C.primary}
                />
                <Text
                  style={[
                    styles.typeOptionText,
                    requestType === 'walkin' && styles.typeOptionTextActive,
                  ]}
                >
                  Walk-in today
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.typeOption,
                  requestType === 'appointment' && styles.typeOptionActive,
                ]}
                onPress={() => setRequestType('appointment')}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="calendar-outline"
                  size={16}
                  color={requestType === 'appointment' ? '#FFFFFF' : C.primary}
                />
                <Text
                  style={[
                    styles.typeOptionText,
                    requestType === 'appointment' && styles.typeOptionTextActive,
                  ]}
                >
                  Schedule appointment
                </Text>
              </TouchableOpacity>
            </View>

            {requestType === 'appointment' && (
              <View style={styles.dateInputBox}>
                <Text style={styles.dateInputLabel}>Appointment date (YYYY-MM-DD)</Text>
                <TextInput
                  style={styles.dateInput}
                  placeholder="2026-07-20"
                  placeholderTextColor={C.muted}
                  value={appointmentDate}
                  onChangeText={setAppointmentDate}
                  keyboardType="numbers-and-punctuation"
                />
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.submitBtn,
                (selectedCount === 0 || submitting) && styles.submitBtnDisabled,
              ]}
              onPress={handleSubmit}
              activeOpacity={0.85}
              disabled={selectedCount === 0 || submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="paper-plane-outline" size={17} color="#FFFFFF" />
                  <Text style={styles.submitBtnText}>
                    Submit request {selectedCount > 0 ? `(${selectedCount})` : ''}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </>
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
    paddingBottom: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    color: C.surface,
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  headerDescription: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.72)',
    lineHeight: 19,
    maxWidth: '92%',
  },

  body: {
    paddingHorizontal: 16,
    marginTop: 20,
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

  sectionTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: C.text,
    marginBottom: 12,
    marginTop: 4,
  },

  docCard: {
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 10,
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 1,
  },
  docCardSelected: {
    borderColor: C.primary,
    borderWidth: 1.5,
    backgroundColor: C.primarySoft,
  },
  docCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: C.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: C.primary,
    borderColor: C.primary,
  },
  docName: {
    fontSize: 14,
    fontWeight: '700',
    color: C.text,
    marginBottom: 2,
  },
  docOffice: {
    fontSize: 11.5,
    color: C.textMuted,
  },
  processingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FBF3DF',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  processingText: {
    fontSize: 10,
    fontWeight: '700',
    color: C.warning,
  },

  requirementsBox: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  requirementsLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: C.textMuted,
    marginBottom: 4,
  },
  requirementItem: {
    fontSize: 12,
    color: C.textMuted,
    lineHeight: 18,
  },

  qtyRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: C.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  qtyLabel: {
    fontSize: 12.5,
    fontWeight: '600',
    color: C.text,
  },
  qtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  qtyBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyValue: {
    fontSize: 14,
    fontWeight: '700',
    color: C.text,
    minWidth: 16,
    textAlign: 'center',
  },

  typeToggleRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  typeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.surface,
  },
  typeOptionActive: {
    backgroundColor: C.primary,
    borderColor: C.primary,
  },
  typeOptionText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: C.primary,
  },
  typeOptionTextActive: {
    color: '#FFFFFF',
  },

  dateInputBox: {
    marginBottom: 18,
  },
  dateInputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: C.textMuted,
    marginBottom: 6,
  },
  dateInput: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: C.text,
  },

  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: C.primary,
    borderRadius: 16,
    paddingVertical: 15,
    marginTop: 4,
    marginBottom: 8,
  },
  submitBtnDisabled: {
    backgroundColor: C.muted,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});