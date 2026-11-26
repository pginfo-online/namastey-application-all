import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, Alert, StyleSheet, ActivityIndicator, TouchableOpacity, Modal, Linking,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import AppHeader from '../../components/layout/AppHeader';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import useTheme from '../../hooks/useTheme';
import useBooking from '../../hooks/useBooking';
import useToast from '../../hooks/useToast';
import { formatDate, formatPrice, formatDateTime } from '../../utils/formatters';

const BookingDetailScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { colors, spacing, borderRadius } = theme;
  const { 
    fetchBookingById, 
    selectedBooking, 
    cancelBooking, 
    acceptQuotation, 
    submitFeedback, 
    isLoading 
  } = useBooking();
  const toast = useToast();
  const id = route.params?.id;

  // Feedback State
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [issues, setIssues] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  useEffect(() => {
    if (id) fetchBookingById(id);
  }, [id]);

  const handleCancel = () => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        { text: 'Keep Booking', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            const result = await cancelBooking(id, 'Cancelled by mobile user');
            if (result.success) {
              toast.success('Booking cancelled.');
            } else {
              toast.error(result.message);
            }
          },
        },
      ]
    );
  };

  const handleAcceptQuote = () => {
    Alert.alert(
      'Approve Quotation',
      'Do you approve the proposed price for this welcome service?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: async () => {
            const result = await acceptQuotation(id);
            if (result.success) {
              toast.success('Quotation approved! Booking confirmed.');
              fetchBookingById(id);
            } else {
              toast.error(result.message);
            }
          },
        },
      ]
    );
  };

  const handleFeedbackSubmit = async () => {
    setSubmittingFeedback(true);
    const result = await submitFeedback(id, {
      rating,
      text: feedbackText,
      suggestions,
      issues,
    });
    setSubmittingFeedback(false);
    if (result.success) {
      toast.success('Thank you for your feedback!');
      setShowFeedbackModal(false);
      fetchBookingById(id);
    } else {
      toast.error(result.message);
    }
  };

  const handleDialPhone = (phone) => {
    Linking.openURL(`tel:${phone}`).catch(() => {
      toast.error('Unable to open dialer.');
    });
  };

  const canCancel =
    selectedBooking &&
    !['cancelled', 'completed'].includes(selectedBooking.status);

  if (isLoading && !selectedBooking) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <AppHeader title="Booking Detail" onBack={() => navigation.goBack()} />
        <ActivityIndicator size="large" color={colors.primary} style={{ flex: 1 }} />
      </View>
    );
  }

  const b = selectedBooking;
  if (!b) return null;

  const InfoRow = ({ icon, label, value }) => (
    <View style={styles.infoRow}>
      <Feather name={icon} size={16} color={colors.primary} style={styles.icon} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.infoLabel, { color: colors.textTertiary }]}>{label}</Text>
        <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{value}</Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader title="Booking Detail" onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ padding: spacing[4] }}>
          
          {/* Status header */}
          <Card>
            <View style={styles.statusRow}>
              <View>
                <Text style={[styles.bookingId, { color: colors.primary }]}>
                  {b.bookingId}
                </Text>
                <Text style={[styles.packageName, { color: colors.textPrimary }]}>
                  {b.package?.name}
                </Text>
              </View>
              <Badge status={b.status} size="md" />
            </View>
            <Text style={[styles.total, { color: colors.primary }]}>
              {formatPrice(b.totalAmount)}
            </Text>
          </Card>

          {/* Quotation Review Box */}
          {b.status === 'quotation_sent' && (
            <Card style={{ marginTop: spacing[3], borderLeftWidth: 4, borderLeftColor: colors.primary }}>
              <Text style={[styles.sectionTitle, { color: colors.primary }]}>Proposed Quotation</Text>
              <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 8 }}>
                Notes: {b.quotation?.notes || 'No specific terms.'}
              </Text>
              <Row label="Quoted Amount" value={formatPrice(b.quotation?.price)} bold />
              <Button
                title="Approve & Confirm Booking"
                onPress={handleAcceptQuote}
                style={{ marginTop: 12 }}
                leftIcon={<Feather name="check" size={16} color="#fff" />}
              />
            </Card>
          )}

          {/* Operations Greeter Widget */}
          {b.operations?.assignedName ? (
            <Card style={{ marginTop: spacing[3], borderLeftWidth: 4, borderLeftColor: colors.success }}>
              <Text style={[styles.sectionTitle, { color: colors.success }]}>Greeting Assistant</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'between', marginTop: 6 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.textPrimary }}>
                    {b.operations.assignedName}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
                    Your VIP coordinator desk greeter
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleDialPhone(b.operations.assignedPhone)}
                  style={{
                    backgroundColor: colors.success + '15',
                    padding: 10,
                    borderRadius: 30,
                    borderWidth: 1,
                    borderColor: colors.success + '40',
                  }}
                >
                  <Feather name="phone" size={18} color={colors.success} />
                </TouchableOpacity>
              </View>
            </Card>
          ) : null}

          {/* Stepper Status Timeline */}
          {b.timeline && b.timeline.length > 0 && (
            <Card style={{ marginTop: spacing[3] }}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginBottom: 16 }]}>
                Real-Time Timeline Status
              </Text>
              {b.timeline.map((node, index) => (
                <View key={index} style={styles.timelineRow}>
                  <View style={styles.timelineDotColumn}>
                    <View style={[styles.timelineDot, { backgroundColor: colors.primary }]} />
                    {index < b.timeline.length - 1 && (
                      <View style={[styles.timelineConnector, { backgroundColor: colors.border }]} />
                    )}
                  </View>
                  <View style={styles.timelineContent}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ fontSize: 13, fontWeight: 'bold', color: colors.textPrimary, textTransform: 'uppercase' }}>
                        {node.status.replace(/_/g, ' ')}
                      </Text>
                      <Text style={{ fontSize: 10, color: colors.textTertiary }}>
                        {new Date(node.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                    {node.comment ? (
                      <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 3 }}>
                        {node.comment}
                      </Text>
                    ) : null}
                  </View>
                </View>
              ))}
            </Card>
          )}

          {/* Location */}
          <Card style={{ marginTop: spacing[3] }}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              📍 Location
            </Text>
            <InfoRow icon="map-pin" label="From" value={`${b.fromArea}, ${b.fromCity}`} />
            <InfoRow icon="map-pin" label="To" value={`${b.toArea}, ${b.toCity}`} />
            {b.pickupAddress ? (
              <InfoRow icon="navigation" label="Pickup Address" value={b.pickupAddress} />
            ) : null}
            {b.dropAddress ? (
              <InfoRow icon="navigation" label="Drop Address" value={b.dropAddress} />
            ) : null}
          </Card>

          {/* Guest particulars */}
          <Card style={{ marginTop: spacing[3] }}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              👤 Guest Details
            </Text>
            <InfoRow icon="user" label="Name" value={b.customerName} />
            <InfoRow icon="mail" label="Email" value={b.customerEmail} />
            <InfoRow icon="phone" label="Mobile" value={b.customerMobile} />
            {b.flightNumber ? <InfoRow icon="plane" label="Flight" value={b.flightNumber} /> : null}
            <InfoRow icon="users" label="Guests" value={String(b.numberOfGuests)} />
            {b.vipRequirements ? <InfoRow icon="alert-triangle" label="VIP Requirements" value={b.vipRequirements} /> : null}
          </Card>

          {/* Schedule */}
          <Card style={{ marginTop: spacing[3] }}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              📅 Schedule
            </Text>
            <InfoRow icon="calendar" label="Date" value={formatDate(b.scheduledDate)} />
            <InfoRow icon="clock" label="Time" value={b.scheduledTime} />
          </Card>

          {/* Package */}
          <Card style={{ marginTop: spacing[3] }}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              📦 Package & Theme
            </Text>
            <InfoRow icon="gift" label="Package" value={b.package?.name} />
            <InfoRow icon="dollar-sign" label="Package Price" value={formatPrice(b.packagePrice)} />
            {b.culturalTheme?.name ? (
              <InfoRow icon="star" label="Theme" value={b.culturalTheme.name} />
            ) : null}
          </Card>

          {/* Add-ons */}
          {b.addons?.length > 0 && (
            <Card style={{ marginTop: spacing[3] }}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                ✨ Add-Ons
              </Text>
              {b.addons.map((a) => (
                <InfoRow
                  key={a.id}
                  icon="plus-circle"
                  label={a.name}
                  value={formatPrice(a.price)}
                />
              ))}
            </Card>
          )}

          {/* Special Instructions */}
          {b.specialInstructions ? (
            <Card style={{ marginTop: spacing[3] }}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                📝 Special Instructions
              </Text>
              <Text style={[styles.instructions, { color: colors.textSecondary }]}>
                {b.specialInstructions}
              </Text>
            </Card>
          ) : null}

          {/* Feedback Section */}
          {b.status === 'completed' && (
            <Card style={{ marginTop: spacing[3] }}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                ⭐ Feedback & Reviews
              </Text>
              {b.feedback?.rating ? (
                <View>
                  <View style={{ flexDirection: 'row', gap: 4, marginVertical: 4 }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Feather key={s} name="star" size={16} color={colors.primary} style={{ opacity: b.feedback.rating >= s ? 1 : 0.2 }} />
                    ))}
                  </View>
                  <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 4 }}>
                    Comment: {b.feedback.text || 'No review comments left.'}
                  </Text>
                </View>
              ) : (
                <Button
                  title="Share Welcome Feedback"
                  onPress={() => setShowFeedbackModal(true)}
                  leftIcon={<Feather name="edit-3" size={16} color="#fff" />}
                  style={{ marginTop: 8 }}
                />
              )}
            </Card>
          )}

          {/* Booking Meta */}
          <Card style={{ marginTop: spacing[3] }}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              ℹ️ Booking Info
            </Text>
            <InfoRow icon="clock" label="Booked On" value={formatDateTime(b.createdAt)} />
            {b.cancelledAt && (
              <InfoRow icon="x-circle" label="Cancelled On" value={formatDateTime(b.cancelledAt)} />
            )}
            {b.cancelReason ? (
              <InfoRow icon="alert-circle" label="Cancel Reason" value={b.cancelReason} />
            ) : null}
          </Card>

          {/* Cancel Button */}
          {canCancel && (
            <Button
              title="Cancel Booking"
              variant="danger"
              onPress={handleCancel}
              loading={isLoading}
              leftIcon={<Feather name="x-circle" size={18} color={colors.error} />}
              style={{ marginTop: spacing[6] }}
            />
          )}
        </View>
      </ScrollView>

      {/* FEEDBACK OVERLAY MODAL */}
      <Modal
        visible={showFeedbackModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFeedbackModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface, borderRadius: borderRadius.lg }]}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.textPrimary, textAlign: 'center', marginBottom: 16 }}>
              Share Welcome Review
            </Text>

            {/* Stars selection */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 20 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                  <Feather
                    name="star"
                    size={28}
                    color={colors.primary}
                    style={{ opacity: rating >= star ? 1 : 0.25 }}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <Input
              label="Feedback Review Comment"
              value={feedbackText}
              onChangeText={setFeedbackText}
              placeholder="e.g. The traditional tilak welcome was great!"
            />

            <Input
              label="Suggestions (Optional)"
              value={suggestions}
              onChangeText={setSuggestions}
              placeholder="e.g. Provide regional cold water bottles"
            />

            <Input
              label="Report Issues (Optional)"
              value={issues}
              onChangeText={setIssues}
              placeholder="e.g. Buggy transit was late"
            />

            <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
              <Button
                title="Submit"
                onPress={handleFeedbackSubmit}
                loading={submittingFeedback}
                style={{ flex: 1 }}
              />
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => setShowFeedbackModal(false)}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
};

const Row = ({ label, value, bold }) => (
  <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}>
    <Text style={{ fontSize: 13, color: '#666' }}>{label}</Text>
    <Text style={{ fontSize: 13, fontWeight: bold ? '700' : '400', color: '#111' }}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1 },
  scroll: { flexGrow: 1, paddingBottom: 40 },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bookingId: { fontSize: 13, fontWeight: '700', letterSpacing: 0.5 },
  packageName: { fontSize: 20, fontWeight: '700', marginTop: 2 },
  total: { fontSize: 28, fontWeight: '800' },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  icon: { marginRight: 12, marginTop: 2 },
  infoLabel: { fontSize: 11, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { fontSize: 14, fontWeight: '600', marginTop: 2 },
  instructions: { fontSize: 14, lineHeight: 21 },
  
  // Timeline styles
  timelineRow: { flexDirection: 'row', minHeight: 48 },
  timelineDotColumn: { alignItems: 'center', width: 24 },
  timelineDot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
  timelineConnector: { flex: 1, width: 2, marginVertical: 4 },
  timelineContent: { flex: 1, paddingLeft: 8, paddingBottom: 16 },

  // Modal styles
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { padding: 20 },
});

export default BookingDetailScreen;
