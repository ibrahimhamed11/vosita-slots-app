import React from 'react';
import { ScrollView, View, StyleSheet, Alert, Vibration } from 'react-native';
import {
  Card,
  Text,
  Button,
  TextInput,
  HelperText,
  Chip,
  Surface,
  ActivityIndicator,
  Snackbar,
  useTheme,
  Divider,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Formik, FormikProps } from 'formik';
import { DateTimeInput } from './components/DateTimeInput';
import { TimezoneSelector } from '../components/TimezoneSelector';
import { slotConfigValidationSchema } from '../utils/validation';
import { getSlotGenerationStats } from '../utils/slotGenerator';
import { FORM_FIELDS } from '../types/slot';
import { useSlotsGenerationLogic } from '../hooks/useSlotsGenerationLogic';

export default function SlotsGenerationScreen() {
  const theme = useTheme();
  const {
    isLoadingConfig,
    initialValues,
    snackbarVisible,
    snackbarMessage,
    setSnackbarVisible,
    handleGenerateSlots,
    handleFormChange,
    isGenerating,
  } = useSlotsGenerationLogic();
  const [validationError, setValidationError] = React.useState<string | null>(null);

  if (isLoadingConfig) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.onBackground }]}>
          Loading saved configuration...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      accessibilityLabel="Slots generation form"
    >
      <Surface style={[styles.headerSurface, { backgroundColor: theme.colors.primary }]} elevation={4}>
        <View style={styles.headerOverflowWrapper}>
          <Text variant="headlineMedium" style={[styles.headerTitle, { color: theme.colors.onPrimary }]}>
            Generate Appointment Slots
          </Text>
          <Text variant="bodyMedium" style={[styles.headerSubtitle, { color: theme.colors.onPrimary }]}>
            Configure your slot parameters below. All settings are automatically saved.
          </Text>
        </View>
      </Surface>
      <Formik
        initialValues={initialValues}
        validationSchema={slotConfigValidationSchema}
        onSubmit={handleGenerateSlots}
        enableReinitialize={true}
        validateOnChange={true}
        validateOnBlur={true}
      >
        {(formikProps: FormikProps<any>) => {
          const { values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting, validateForm } = formikProps;
          React.useEffect(() => {
            const cleanup = handleFormChange(values);
            return cleanup;
          }, [values]);

          const handleGeneratePress = async () => {
            const validation = await validateForm();
            const hasError = Object.keys(validation).length > 0;
            if (hasError) {
              Vibration.vibrate(200);
              setValidationError('Please fix the highlighted errors before generating slots.');
            } else {
              setValidationError(null);
              handleSubmit();
            }
          };

          return (
            <View style={styles.formContainer}>
              <Card style={styles.sectionCard} elevation={2}>
                <Card.Content>
                  <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface, flexDirection: 'row', alignItems: 'center' }]}>
                    <MaterialCommunityIcons name="calendar-range" size={20} color={theme.colors.onSurface} style={{ marginRight: 6 }} />
                    Date Range
                  </Text>
                  <Text variant="bodySmall" style={[styles.sectionDescription, { color: theme.colors.onSurfaceVariant }]}>
                    Select the date range for slot generation
                  </Text>
                  <Divider style={styles.divider} />
                  <DateTimeInput
                    name={FORM_FIELDS.START_DATE}
                    label="Start Date"
                    mode="date"
                    placeholder="Select start date"
                    helperText="First day to generate slots"
                    required={true}
                    minimumDate={new Date()}
                    accessibilityLabel="Start date for slot generation"
                    accessibilityHint="Tap to select the first date for generating slots"
                  />
                  <DateTimeInput
                    name={FORM_FIELDS.END_DATE}
                    label="End Date"
                    mode="date"
                    placeholder="Select end date"
                    helperText="Last day to generate slots"
                    required={true}
                    minimumDate={new Date(values.startDate || new Date())}
                    accessibilityLabel="End date for slot generation"
                    accessibilityHint="Tap to select the last date for generating slots"
                  />
                </Card.Content>
              </Card>
              <Card style={styles.sectionCard} elevation={2}>
                <Card.Content>
                  <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface, flexDirection: 'row', alignItems: 'center' }]}>
                    <MaterialCommunityIcons name="clock-time-four-outline" size={20} color={theme.colors.onSurface} style={{ marginRight: 6 }} />
                    Working Hours
                  </Text>
                  <Text variant="bodySmall" style={[styles.sectionDescription, { color: theme.colors.onSurfaceVariant }]}>
                    Define daily working hours for slot availability
                  </Text>
                  <Divider style={styles.divider} />
                  <DateTimeInput
                    name={FORM_FIELDS.START_TIME}
                    label="Start Time"
                    mode="time"
                    placeholder="Select start time"
                    helperText="Daily opening time"
                    required={true}
                    accessibilityLabel="Daily start time"
                    accessibilityHint="Tap to select when slots should start each day"
                  />
                  <DateTimeInput
                    name={FORM_FIELDS.END_TIME}
                    label="End Time"
                    mode="time"
                    placeholder="Select end time"
                    helperText="Daily closing time"
                    required={true}
                    accessibilityLabel="Daily end time"
                    accessibilityHint="Tap to select when slots should end each day"
                  />
                </Card.Content>
              </Card>
              <TimezoneSelector
                value={values.timeZone}
                onValueChange={handleChange(FORM_FIELDS.TIMEZONE)}
                touched={!!touched.timeZone}
                label="Timezone"
                helperText="Select the timezone for slot scheduling"
                required={true}
                showCurrentTime={true}
              />
              <Card style={styles.sectionCard} elevation={2}>
                <Card.Content>
                  <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface, flexDirection: 'row', alignItems: 'center' }]}>
                    <MaterialCommunityIcons name="timer-outline" size={20} color={theme.colors.onSurface} style={{ marginRight: 6 }} />
                    Duration Settings
                  </Text>
                  <Text variant="bodySmall" style={[styles.sectionDescription, { color: theme.colors.onSurfaceVariant }]}>
                    Configure slot durations and timing (in minutes)
                  </Text>
                  <Divider style={styles.divider} />
                  <TextInput
                    label="Slot Duration *"
                    value={values.slotDuration?.toString() ?? ''}
                    onChangeText={(text) => {
                      const numValue = Number(text);
                      handleChange(FORM_FIELDS.SLOT_DURATION)(
                        !isNaN(numValue) && numValue >= 0 ? numValue.toString() : ''
                      );
                    }}
                    onBlur={handleBlur(FORM_FIELDS.SLOT_DURATION)}
                    mode="outlined"
                    keyboardType="numeric"
                    right={<TextInput.Affix text="min" />}
                    error={!!(touched.slotDuration && errors.slotDuration)}
                    style={styles.textInput}
                    accessibilityLabel="Slot duration in minutes"
                    accessibilityHint="Enter how long each appointment slot should be"
                  />
                  <HelperText 
                    type={touched.slotDuration && errors.slotDuration ? "error" : "info"}
                    visible={!!(touched.slotDuration || errors.slotDuration)}
                  >
                    {touched.slotDuration && errors.slotDuration
                      ? String(errors.slotDuration)
                      : "Duration of each appointment slot"}
                  </HelperText>
                  <TextInput
                    label="Break Duration *"
                    value={values.breakDuration?.toString() ?? ''}
                    onChangeText={(text) => {
                      const numValue = Number(text);
                      handleChange(FORM_FIELDS.BREAK_DURATION)(
                        !isNaN(numValue) && numValue >= 0 ? numValue.toString() : ''
                      );
                    }}
                    onBlur={handleBlur(FORM_FIELDS.BREAK_DURATION)}
                    mode="outlined"
                    keyboardType="numeric"
                    right={<TextInput.Affix text="min" />}
                    error={!!(touched.breakDuration && errors.breakDuration)}
                    style={styles.textInput}
                    accessibilityLabel="Break duration in minutes"
                    accessibilityHint="Enter break time between consecutive slots"
                  />
                  <HelperText 
                    type={touched.breakDuration && errors.breakDuration ? "error" : "info"}
                    visible={!!(touched.breakDuration || errors.breakDuration)}
                  >
                    {touched.breakDuration && errors.breakDuration
                      ? String(errors.breakDuration)
                      : "Break time between consecutive slots"}
                  </HelperText>
                  <TextInput
                    label="Buffer Duration *"
                    value={values.bufferDuration?.toString() ?? ''}
                    onChangeText={(text) => {
                      const numValue = Number(text);
                      handleChange(FORM_FIELDS.BUFFER_DURATION)(
                        !isNaN(numValue) && numValue >= 0 ? numValue.toString() : ''
                      );
                    }}
                    onBlur={handleBlur(FORM_FIELDS.BUFFER_DURATION)}
                    mode="outlined"
                    keyboardType="numeric"
                    right={<TextInput.Affix text="min" />}
                    error={!!(touched.bufferDuration && errors.bufferDuration)}
                    style={styles.textInput}
                    accessibilityLabel="Buffer duration in minutes"
                    accessibilityHint="Enter how far in advance slots become available"
                  />
                  <HelperText 
                    type={touched.bufferDuration && errors.bufferDuration ? "error" : "info"}
                    visible={!!(touched.bufferDuration || errors.bufferDuration)}
                  >
                    {touched.bufferDuration && errors.bufferDuration
                      ? String(errors.bufferDuration)
                      : "Time before slot becomes available for booking"}
                  </HelperText>
                </Card.Content>
              </Card>
              {values.startDate && values.endDate && values.startTime && values.endTime && (
                <Card style={styles.sectionCard} elevation={2}>
                  <Card.Content>
                    <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface, flexDirection: 'row', alignItems: 'center' }]}>
                      <MaterialCommunityIcons name="chart-bar" size={20} color={theme.colors.onSurface} style={{ marginRight: 6 }} />
                      Generation Preview
                    </Text>
                    <Divider style={styles.divider} />
                    {(() => {
                      try {
                        const stats = getSlotGenerationStats(values);
                        return (
                          <View style={styles.statsContainer}>
                            <View style={styles.statRow}>
                              <Chip
                                icon={({ size, color }) => (
                                  <MaterialCommunityIcons name="calendar" size={size} color={color} />
                                )}
                                style={styles.statChip}
                              >
                                {stats.totalDays} days
                              </Chip>
                              <Chip
                                icon={({ size, color }) => (
                                  <MaterialCommunityIcons name="clock-outline" size={size} color={color} />
                                )}
                                style={styles.statChip}
                              >
                                {stats.workingHoursPerDay}h/day
                              </Chip>
                            </View>
                            <View style={styles.statRow}>
                              <Chip
                                icon={({ size, color }) => (
                                  <MaterialCommunityIcons name="calendar-check" size={size} color={color} />
                                )}
                                style={styles.statChip}
                              >
                                {stats.slotsPerDay} slots/day
                              </Chip>
                              <Chip
                                icon={({ size, color }) => (
                                  <MaterialCommunityIcons name="calendar-multiple" size={size} color={color} />
                                )}
                                style={styles.statChip}
                              >
                                ~{stats.estimatedTotalSlots} total slots
                              </Chip>
                            </View>
                          </View>
                        );
                      } catch (error) {
                        return (
                          <Text style={{ color: theme.colors.error }}>
                            Unable to calculate preview with current settings
                          </Text>
                        );
                      }
                    })()}
                  </Card.Content>
                </Card>
              )}
              <Card style={styles.actionCard} elevation={4}>
                <Card.Content>
                  <Button
                    mode="contained"
                    onPress={handleGeneratePress}
                    loading={isGenerating || isSubmitting}
                    disabled={isGenerating || isSubmitting}
                    style={styles.generateButton}
                    contentStyle={styles.generateButtonContent}
                    labelStyle={styles.generateButtonLabel}
                    accessibilityLabel="Generate and save slots"
                    accessibilityHint="Tap to generate appointment slots based on your configuration"
                  >
                    Generate & Save Slots
                  </Button>
                  <HelperText type="info" visible={true} style={styles.buttonHelper}>
                    Generated slots will be saved automatically and available in the Slots View tab
                  </HelperText>
                </Card.Content>
              </Card>
              <Snackbar
                visible={!!validationError}
                onDismiss={() => setValidationError(null)}
                duration={3000}
                style={styles.snackbar}
                accessibilityLabel="Validation error"
              >
                {validationError}
              </Snackbar>
            </View>
          );
        }}
      </Formik>
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={4000}
        style={styles.snackbar}
        accessibilityLabel="Status message"
      >
        {snackbarMessage}
      </Snackbar>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    textAlign: 'center',
  },
  headerSurface: {
    padding: 24,
    marginBottom: 16,
    borderRadius: 12, 
  },
  headerOverflowWrapper: {
    overflow: 'hidden',
    borderRadius: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.9,
  },
  formContainer: {
    paddingHorizontal: 16,
  },
  sectionCard: {
    marginBottom: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 16,
  },
  divider: {
    marginBottom: 16,
  },
  textInput: {
    marginBottom: 8,
    backgroundColor: 'transparent',
  },
  pickerContainer: {
    marginBottom: 16,
  },
  statsContainer: {
    gap: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  statChip: {
    flex: 1,
  },
  actionCard: {
    marginTop: 8,
    borderRadius: 12,
  },
  generateButton: {
    paddingVertical: 8,
    borderRadius: 8,
  },
  generateButtonContent: {
    paddingVertical: 12,
  },
  generateButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonHelper: {
    textAlign: 'center',
    marginTop: 8,
  },
  snackbar: {
    marginBottom: 16,
  },
});

