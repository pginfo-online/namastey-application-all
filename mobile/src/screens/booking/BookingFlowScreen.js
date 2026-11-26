import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Platform, StyleSheet,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Feather } from '@expo/vector-icons';
import AppHeader from '../../components/layout/AppHeader';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import useTheme from '../../hooks/useTheme';
import useBooking from '../../hooks/useBooking';
import useToast from '../../hooks/useToast';
import { formatDate } from '../../utils/formatters';

const BookingFlowScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { colors, spacing, borderRadius } = theme;
  const {
    cities, bookingForm, setBookingField, loadStaticData, resetBookingForm,
  } = useBooking();
  const toast = useToast();

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    loadStaticData();
    resetBookingForm();
  }, []);

  const fromAreas = cities.find((c) => c.id === bookingForm.fromCity?.id)?.areas || [];
  const toAreas = cities.find((c) => c.id === bookingForm.toCity?.id)?.areas || [];

  const handleNext = () => {
    if (!bookingForm.fromCity) return toast.error('Please select a From City');
    if (!bookingForm.fromArea) return toast.error('Please select a Pickup Location');
    if (!bookingForm.toCity) return toast.error('Please select a To City');
    if (!bookingForm.toArea) return toast.error('Please select a Drop Location');
    if (!bookingForm.scheduledDate) return toast.error('Please select a date');
    if (!bookingForm.scheduledTime) return toast.error('Please select a time');
    if (!bookingForm.customerName) return toast.error('Please enter Guest Name');
    if (!bookingForm.customerEmail) return toast.error('Please enter Guest Email');
    if (!bookingForm.customerMobile) return toast.error('Please enter Guest Mobile');
    navigation.navigate('PackageSelect');
  };

  const renderPicker = (label, value, items, onSelect) => (
    <View style={{ marginBottom: spacing[4] }}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
        {items.map((item) => {
          const selected = value?.id === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => onSelect(item)}
              style={[
                styles.chip,
                {
                  backgroundColor: selected ? colors.primary : colors.surfaceElevated,
                  borderColor: selected ? colors.primary : colors.border,
                  borderRadius: borderRadius.full,
                },
              ]}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: selected ? '#fff' : colors.textPrimary },
                ]}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) setBookingField('scheduledDate', selectedDate);
  };

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      const h = selectedTime.getHours();
      const m = selectedTime.getMinutes();
      const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      setBookingField('scheduledTime', timeStr);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        title="Select Location"
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Step indicator */}
        <View style={[styles.stepBar, { marginHorizontal: spacing[4] }]}>
          {['Location', 'Package', 'Theme', 'Summary'].map((s, i) => (
            <View key={s} style={styles.stepItem}>
              <View style={[
                styles.stepDot,
                { backgroundColor: i === 0 ? colors.primary : colors.border },
              ]} />
              <Text style={[
                styles.stepLabel,
                { color: i === 0 ? colors.primary : colors.textTertiary },
              ]}>{s}</Text>
            </View>
          ))}
        </View>

        <View style={{ padding: spacing[4] }}>
          {/* From City */}
          {renderPicker('From City', bookingForm.fromCity, cities, (c) => {
            setBookingField('fromCity', c);
            setBookingField('fromArea', null);
          })}

          {/* From Area */}
          {bookingForm.fromCity && renderPicker(
            'Pickup Location',
            bookingForm.fromArea,
            fromAreas,
            (a) => setBookingField('fromArea', a)
          )}

          {/* To City */}
          {renderPicker('To City', bookingForm.toCity, cities, (c) => {
            setBookingField('toCity', c);
            setBookingField('toArea', null);
          })}

          {/* To Area */}
          {bookingForm.toCity && renderPicker(
            'Drop Location',
            bookingForm.toArea,
            toAreas,
            (a) => setBookingField('toArea', a)
          )}

          {/* Date & Time */}
          <Text style={[styles.label, { color: colors.textSecondary }]}>Date & Time</Text>
          <View style={styles.dtRow}>
            <TouchableOpacity
              style={[
                styles.dtBtn,
                { backgroundColor: colors.surfaceElevated, borderColor: colors.border, borderRadius: borderRadius.lg },
              ]}
              onPress={() => setShowDatePicker(true)}
            >
              <Feather name="calendar" size={18} color={colors.primary} />
              <Text style={[styles.dtText, { color: colors.textPrimary }]}>
                {bookingForm.scheduledDate ? formatDate(bookingForm.scheduledDate) : 'Select Date'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.dtBtn,
                { backgroundColor: colors.surfaceElevated, borderColor: colors.border, borderRadius: borderRadius.lg },
              ]}
              onPress={() => setShowTimePicker(true)}
            >
              <Feather name="clock" size={18} color={colors.primary} />
              <Text style={[styles.dtText, { color: colors.textPrimary }]}>
                {bookingForm.scheduledTime || 'Select Time'}
              </Text>
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={bookingForm.scheduledDate || new Date()}
              mode="date"
              minimumDate={new Date()}
              onChange={handleDateChange}
            />
          )}
          {showTimePicker && (
            <DateTimePicker
              value={new Date()}
              mode="time"
              is24Hour={false}
              onChange={handleTimeChange}
            />
          )}

          {/* Customer & Guest details */}
          <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginTop: spacing[4], marginBottom: spacing[2] }]}>
            Guest & Contact Details
          </Text>

          <Input
            label="Guest Full Name *"
            value={bookingForm.customerName}
            onChangeText={(v) => setBookingField('customerName', v)}
            placeholder="e.g. Rajesh Kumar"
          />

          <Input
            label="Guest Email Address *"
            value={bookingForm.customerEmail}
            onChangeText={(v) => setBookingField('customerEmail', v)}
            placeholder="e.g. rajesh@example.com"
            keyboardType="email-address"
          />

          <Input
            label="Guest Mobile Number (Indian) *"
            value={bookingForm.customerMobile}
            onChangeText={(v) => setBookingField('customerMobile', v)}
            placeholder="e.g. 9876543210"
            keyboardType="phone-pad"
          />

          <Input
            label="Flight Number (Optional)"
            value={bookingForm.flightNumber}
            onChangeText={(v) => setBookingField('flightNumber', v)}
            placeholder="e.g. AI-101"
            autoCapitalize="characters"
          />

          <Input
            label="Number of Guests"
            value={String(bookingForm.numberOfGuests)}
            onChangeText={(v) => setBookingField('numberOfGuests', Math.max(1, Number(v) || 1))}
            placeholder="e.g. 1"
            keyboardType="number-pad"
          />

          <Input
            label="VIP / Special Requirements (Optional)"
            value={bookingForm.vipRequirements}
            onChangeText={(v) => setBookingField('vipRequirements', v)}
            placeholder="e.g. Wheelchair assistance, fast baggage"
            multiline
            numberOfLines={2}
          />

          <Input
            label="Sponsoring Company Name (Optional)"
            value={bookingForm.companyName}
            onChangeText={(v) => setBookingField('companyName', v)}
            placeholder="e.g. Acme Corp"
          />

          <Input
            label="Guest City (Optional)"
            value={bookingForm.city}
            onChangeText={(v) => setBookingField('city', v)}
            placeholder="e.g. Mumbai"
          />

          <Button
            title="Next — Select Package"
            onPress={handleNext}
            rightIcon={<Feather name="arrow-right" size={18} color="#fff" />}
            style={{ marginTop: spacing[6] }}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, paddingBottom: 40 },
  stepBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  stepItem: { alignItems: 'center' },
  stepDot: { width: 10, height: 10, borderRadius: 5, marginBottom: 4 },
  stepLabel: { fontSize: 11, fontWeight: '600' },
  label: { fontSize: 13, fontWeight: '600', letterSpacing: 0.3, marginBottom: 2 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    borderWidth: 1,
  },
  chipText: { fontSize: 13, fontWeight: '500' },
  dtRow: { flexDirection: 'row', gap: 12, marginTop: 10, marginBottom: 8 },
  dtBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    gap: 8,
  },
  dtText: { fontSize: 14, fontWeight: '500' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5 },
});

export default BookingFlowScreen;
