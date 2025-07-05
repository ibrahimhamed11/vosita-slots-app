
import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import moment from 'moment-timezone';
import { generateSlots, getSlotGenerationStats } from '../utils/slotGenerator';
import { saveSlotConfig, saveGeneratedSlots, loadSlotConfig } from '../utils/storage';
import { SlotConfig, DEFAULT_SLOT_CONFIG } from '../types/slot';

export function useSlotsGenerationLogic() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [initialValues, setInitialValues] = useState({
    ...DEFAULT_SLOT_CONFIG,
    timeZone: moment.tz.guess(),
  });

  useEffect(() => {
    loadSavedConfiguration();
  }, []);

  const loadSavedConfiguration = async () => {
    try {
      setIsLoadingConfig(true);
      const savedConfig = await loadSlotConfig();
      if (savedConfig) {
        setInitialValues(savedConfig);
        showSnackbar('✅ Saved configuration loaded successfully');
      } else {
        setInitialValues({
          ...DEFAULT_SLOT_CONFIG,
          timeZone: moment.tz.guess(),
        });
        showSnackbar('ℹ️ Using default configuration');
      }
    } catch (error) {
      setInitialValues({
        ...DEFAULT_SLOT_CONFIG,
        timeZone: moment.tz.guess(),
      });
      showSnackbar('⚠️ Failed to load saved settings, using defaults');
    } finally {
      setIsLoadingConfig(false);
    }
  };

  const saveConfiguration = async (values: SlotConfig) => {
    try {
      await saveSlotConfig(values);
    } catch {}
  };

  const handleGenerateSlots = async (
    values: SlotConfig,
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
  ) => {
    try {
      setIsGenerating(true);
      setSubmitting(true);
      await saveConfiguration(values);
      const generatedSlots = await generateSlots(values);
      if (generatedSlots.length === 0) {
        throw new Error('No slots were generated. Please check your configuration.');
      }
      await saveGeneratedSlots(generatedSlots);
      const stats = getSlotGenerationStats(values);
      const successMessage = `🎉 Successfully generated ${generatedSlots.length} slots across ${stats.totalDays} days!`;
      showSnackbar(successMessage);
      Alert.alert(
        'Slots Generated Successfully! 🎉',
        `Generated ${generatedSlots.length} appointment slots.\n\n` +
        `📅 Date Range: ${values.startDate} to ${values.endDate}\n` +
        `🕐 Time Range: ${values.startTime} - ${values.endTime}\n` +
        `⏱️ Slot Duration: ${values.slotDuration} minutes\n` +
        `🌍 Timezone: ${values.timeZone}\n\n` +
        `Visit the "Slots View" tab to see your available slots!`,
        [{ text: 'Great!', style: 'default' }]
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      showSnackbar(`❌ Generation failed: ${errorMessage}`);
      Alert.alert(
        'Slot Generation Failed',
        `Failed to generate slots: ${errorMessage}\n\nPlease check your configuration and try again.`,
        [{ text: 'OK', style: 'default' }]
      );
    } finally {
      setIsGenerating(false);
      setSubmitting(false);
    }
  };

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const handleFormChange = (values: SlotConfig) => {
    const timeoutId = setTimeout(() => {
      saveConfiguration(values);
    }, 1000);
    return () => clearTimeout(timeoutId);
  };

  return {
    isGenerating,
    isLoadingConfig,
    snackbarVisible,
    snackbarMessage,
    setSnackbarVisible,
    initialValues,
    handleGenerateSlots,
    handleFormChange,
  };
}