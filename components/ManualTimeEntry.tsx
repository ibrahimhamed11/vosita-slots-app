import React, { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Text, Button, useTheme, Surface, Divider, Card, Icon, TouchableRipple } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment-timezone';
import { ManualTimeEntryProps } from '../types/slotsView';
import { getResponsiveSpacing, getResponsiveFontSize } from '../utils/responsive';

export const ManualTimeEntry: React.FC<ManualTimeEntryProps> = ({
  currentDateTime,
  onSave,
  onClear,
  timezone,
  onSetNow,
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date(currentDateTime));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const theme = useTheme();

  const getCurrentFormattedTime = () => {
    return moment().tz(timezone).format('MMM DD, YYYY - HH:mm:ss');
  };

  const getPreviewDateTime = () => {
    return moment(selectedDate).tz(timezone).format('MMMM DD, YYYY at h:mm A');
  };

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'ios') {
      if (event.type === 'set' && date) {
        setSelectedDate(date);
      }
      // Close picker on any action (set or dismissed)
      setShowDatePicker(false);
    } else {
      setShowDatePicker(false);
      if (date) {
        setSelectedDate(date);
      }
    }
  };

  const handleTimeChange = (event: any, time?: Date) => {
    if (Platform.OS === 'ios') {
      if (event.type === 'set' && time) {
        const newDateTime = new Date(selectedDate);
        newDateTime.setHours(time.getHours());
        newDateTime.setMinutes(time.getMinutes());
        setSelectedDate(newDateTime);
      }
      // Close picker on any action (set or dismissed)
      setShowTimePicker(false);
    } else {
      setShowTimePicker(false);
      if (time) {
        const newDateTime = new Date(selectedDate);
        newDateTime.setHours(time.getHours());
        newDateTime.setMinutes(time.getMinutes());
        setSelectedDate(newDateTime);
      }
    }
  };

  const handleSave = () => {
    const dateStr = moment(selectedDate).format('YYYY-MM-DD');
    const timeStr = moment(selectedDate).format('HH:mm');
    onSave(dateStr, timeStr);
  };

  return (
    <Card style={[styles.container, { backgroundColor: theme.colors.surface }]} elevation={2}>
      <View style={{ overflow: 'hidden', borderRadius: getResponsiveSpacing(16) }}>
        <Card.Content style={styles.cardContent}>
          {/* Header Section */}
          <View style={styles.headerSection}>
            <View style={styles.titleContainer}>
              <Icon source="clock-edit-outline" size={24} color={theme.colors.primary} />
              <Text variant="titleMedium" style={[styles.title, { color: theme.colors.primary }]}>
                Manual Date & Time
              </Text>
            </View>
            <Text variant="bodySmall" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
              Override automatic time detection
            </Text>
          </View>

          <Divider style={styles.divider} />

          {/* Current Time Display */}
          <Surface style={[styles.currentTimeCard, { backgroundColor: theme.colors.primaryContainer }]} elevation={1}>
            <View style={{ overflow: 'hidden', borderRadius: getResponsiveSpacing(8) }}>
              <View style={styles.currentTimeHeader}>
                <Icon source="clock-outline" size={20} color={theme.colors.onPrimaryContainer} />
                <Text variant="labelMedium" style={[styles.currentTimeLabel, { color: theme.colors.onPrimaryContainer }]}>
                  Current Time in {timezone}
                </Text>
              </View>
              <Text variant="bodyLarge" style={[styles.currentTimeValue, { color: theme.colors.onPrimaryContainer }]}>
                {getCurrentFormattedTime()}
              </Text>
            </View>
          </Surface>

          {/* Input Section */}
          <View style={styles.inputSection}>
            <Text variant="titleSmall" style={[styles.inputSectionTitle, { color: theme.colors.onSurface }]}>
              Set Custom Time
            </Text>
            
            <View style={styles.pickerRow}>
              <TouchableRipple
                onPress={() => setShowDatePicker((prev) => !prev)}
                style={[styles.pickerButton, { backgroundColor: theme.colors.surfaceVariant, flex: 1.2 }]}
                borderless
              >
                <View style={styles.pickerContent}>
                  <Icon source="calendar" size={20} color={theme.colors.primary} />
                  <View style={styles.pickerTextContainer}>
                    <Text variant="labelSmall" style={[styles.pickerLabel, { color: theme.colors.onSurfaceVariant }]}>
                      Date
                    </Text>
                    <Text variant="bodyMedium" style={[styles.pickerValue, { color: theme.colors.onSurface }]}>
                      {moment(selectedDate).format('MMM DD, YYYY')}
                    </Text>
                  </View>
                  <Icon source="chevron-down" size={16} color={theme.colors.onSurfaceVariant} />
                </View>
              </TouchableRipple>

              <TouchableRipple
                onPress={() => setShowTimePicker((prev) => !prev)}
                style={[styles.pickerButton, { backgroundColor: theme.colors.surfaceVariant, flex: 1 }]}
                borderless
              >
                <View style={styles.pickerContent}>
                  <Icon source="clock-outline" size={20} color={theme.colors.primary} />
                  <View style={styles.pickerTextContainer}>
                    <Text variant="labelSmall" style={[styles.pickerLabel, { color: theme.colors.onSurfaceVariant }]}>
                      Time
                    </Text>
                    <Text variant="bodyMedium" style={[styles.pickerValue, { color: theme.colors.onSurface }]}>
                      {moment(selectedDate).format('h:mm A')}
                    </Text>
                  </View>
                  <Icon source="chevron-down" size={16} color={theme.colors.onSurfaceVariant} />
                </View>
              </TouchableRipple>
            </View>

            {/* Date Time Pickers */}
            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
              />
            )}

            {showTimePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleTimeChange}
                is24Hour={true}
              />
            )}

            {/* Preview Section */}
            <Surface 
              style={[styles.previewCard, { backgroundColor: theme.colors.secondaryContainer }]} 
              elevation={1}
            >
              <View style={{ overflow: 'hidden', borderRadius: getResponsiveSpacing(8) }}>
                <View style={styles.previewHeader}>
                  <Icon source="eye-outline" size={18} color={theme.colors.onSecondaryContainer} />
                  <Text 
                    variant="labelMedium" 
                    style={[styles.previewLabel, { color: theme.colors.onSecondaryContainer }]}
                  >
                    Preview
                  </Text>
                </View>
                <Text 
                  variant="bodyMedium" 
                  style={[styles.previewValue, { color: theme.colors.onSecondaryContainer }]}
                >
                  {getPreviewDateTime()}
                </Text>
              </View>
            </Surface>
          </View>

          <Divider style={styles.divider} />

          {/* Action Buttons */}
          <View style={styles.buttonSection}>
            <View style={styles.primaryButtons}>
              <Button 
                mode="contained" 
                onPress={handleSave}
                style={[styles.primaryButton, { backgroundColor: theme.colors.primary }]}
                icon="check"
                contentStyle={styles.buttonContent}
              >
                Apply Time
              </Button>
            </View>
            
            <View style={styles.secondaryButtons}>
              <Button 
                mode="outlined"
                onPress={onSetNow}
                style={styles.secondaryButton}
                icon="clock-fast"
                contentStyle={styles.buttonContent}
              >
                Set to Now
              </Button>
              <Button 
                mode="text" 
                onPress={onClear}
                style={styles.secondaryButton}
                icon="restore"
                contentStyle={styles.buttonContent}
              >
                Reset
              </Button>
            </View>
          </View>

          {/* Timezone Info */}
          <Surface style={[styles.timezoneInfo, { backgroundColor: theme.colors.surfaceVariant }]} elevation={0}>
            <View style={{ overflow: 'hidden', borderRadius: getResponsiveSpacing(8) }}>
              <Icon source="earth" size={16} color={theme.colors.onSurfaceVariant} />
              <Text variant="bodySmall" style={[styles.timezoneText, { color: theme.colors.onSurfaceVariant }]}>
                All times are interpreted in <Text style={{ fontWeight: '600' }}>{timezone}</Text> timezone
              </Text>
            </View>
          </Surface>
        </Card.Content>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: getResponsiveSpacing(16),
    borderRadius: getResponsiveSpacing(16),
    // Removed overflow: 'hidden' here!
  },
  cardContent: {
    padding: getResponsiveSpacing(18),
  },
  headerSection: {
    marginBottom: getResponsiveSpacing(16),
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getResponsiveSpacing(4),
    marginBottom: getResponsiveSpacing(4),
  },
  title: {
    fontSize: getResponsiveFontSize(15),
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: getResponsiveFontSize(13),
    fontStyle: 'italic',
    letterSpacing: 0.1,
  },
  divider: {
    marginVertical: getResponsiveSpacing(16),
  },
  currentTimeCard: {
    padding: getResponsiveSpacing(8),
    borderRadius: getResponsiveSpacing(8),
    marginBottom: getResponsiveSpacing(24),
  },
  currentTimeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getResponsiveSpacing(4),
    marginBottom: getResponsiveSpacing(4),
  },
  currentTimeLabel: {
    fontSize: getResponsiveFontSize(10),
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  currentTimeValue: {
    fontSize: getResponsiveFontSize(14),
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  inputSection: {
    marginBottom: getResponsiveSpacing(16),
  },
  inputSectionTitle: {
    fontSize: getResponsiveFontSize(13),
    fontWeight: '600',
    marginBottom: getResponsiveSpacing(8),
    letterSpacing: 0.1,
  },
  pickerRow: {
    flexDirection: 'column',
    gap: getResponsiveSpacing(8),
    marginBottom: getResponsiveSpacing(16),
  },
  pickerButton: {
    borderRadius: getResponsiveSpacing(8),
    padding: getResponsiveSpacing(16),
    minHeight: getResponsiveSpacing(40),
  },
  pickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getResponsiveSpacing(16),
  },
  pickerTextContainer: {
    flex: 1,
  },
  pickerLabel: {
    fontSize: getResponsiveFontSize(13),
    fontWeight: '400',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: getResponsiveSpacing(4),
  },
  pickerValue: {
    fontSize: getResponsiveFontSize(13),
    fontWeight: '400',
    letterSpacing: 0.1,
  },
  previewCard: {
    padding: getResponsiveSpacing(8),
    borderRadius: getResponsiveSpacing(8),
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getResponsiveSpacing(4),
    marginBottom: getResponsiveSpacing(4),
  },
  previewLabel: {
    fontSize: getResponsiveFontSize(12),
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  previewValue: {
    fontSize: getResponsiveFontSize(14),
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  buttonSection: {
    gap: getResponsiveSpacing(8),
  },
  primaryButtons: {
    marginBottom: getResponsiveSpacing(4),
  },
  primaryButton: {
    borderRadius: getResponsiveSpacing(8),
    paddingVertical: getResponsiveSpacing(4),
  },
  secondaryButtons: {
    flexDirection: 'row',
    gap: getResponsiveSpacing(4),
  },
  secondaryButton: {
    flex: 1,
    borderRadius: getResponsiveSpacing(8),
  },
  buttonContent: {
    paddingVertical: getResponsiveSpacing(8),
  },
  timezoneInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getResponsiveSpacing(4),
    padding: getResponsiveSpacing(8),
    borderRadius: getResponsiveSpacing(8),
    marginTop: getResponsiveSpacing(16),
  },
  timezoneText: {
    fontSize: getResponsiveFontSize(12),
    letterSpacing: 0.1,
    flex: 1,
  },
});