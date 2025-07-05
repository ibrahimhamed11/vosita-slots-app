import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import moment from 'moment-timezone';
import { loadGeneratedSlots, loadSlotConfig, clearAllSlots } from '../utils/storage';
import { Slot, SlotConfig } from '../types/slot';
import { FilterOption } from '../types/slotsView';

// Accept initialTimezone as a parameter
export const useSlotsViewLogic = (initialTimezone?: string) => {
  const deviceTimezone = moment.tz.guess();

  const [slots, setSlots] = useState<Slot[]>([]);
  const [filteredSlots, setFilteredSlots] = useState<Slot[]>([]);
  const [slotConfig, setSlotConfig] = useState<SlotConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  // Use initialTimezone if provided, else fallback to config/device
  const [selectedTimezone, setSelectedTimezone] = useState(
    initialTimezone || deviceTimezone
  );
  const [filterOption, setFilterOption] = useState<FilterOption>('all');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [manualDateTime, setManualDateTime] = useState<string | null>(null);

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const handleClearSlots = async () => {
    try {
      await clearAllSlots();
      setSlots([]);
      setFilteredSlots([]);
      setSlotConfig(null);
      showSnackbar('All slots cleared successfully');
    } catch (error) {
      console.error('Failed to clear slots:', error);
      showSnackbar('Failed to clear slots');
    }
  };

  const confirmClearSlots = () => {
    Alert.alert(
      'Clear All Slots',
      'Are you sure you want to delete all appointment slots? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear All', style: 'destructive', onPress: handleClearSlots },
      ]
    );
  };

  const loadSlotsData = async () => {
    try {
      setIsLoading(true);
      const [loadedSlots, loadedConfig] = await Promise.all([
        loadGeneratedSlots(),
        loadSlotConfig(),
      ]);
      let tz = loadedConfig?.timeZone || deviceTimezone;
      // If initialTimezone is provided, prefer it
      setSelectedTimezone(initialTimezone || tz);
      setSlots(loadedSlots);
      setSlotConfig(loadedConfig);
    } catch (error) {
      console.error('Failed to load slots data:', error);
      showSnackbar('Failed to load slots data');
      setSlots([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadSlotsData();
    setIsRefreshing(false);
    showSnackbar('Slots data refreshed');
  }, []);

  useEffect(() => {
    if (slots.length === 0) {
      setFilteredSlots([]);
      return;
    }
    setFilteredSlots(slots);
  }, [slots]);

  useEffect(() => {
    loadSlotsData();
    const timer = setInterval(() => {
      if (!manualDateTime) {
        setCurrentTime(new Date());
      }
    }, 60000);
    return () => clearInterval(timer);
    // eslint-disable-next-line
  }, []);

  return {
    slots,
    filteredSlots,
    slotConfig,
    isLoading,
    isRefreshing,
    selectedTimezone,
    filterOption,
    snackbarVisible,
    snackbarMessage,
    currentTime,
    manualDateTime,
    showSnackbar,
    loadSlotsData,
    handleRefresh,
    handleTimezoneChange: (timezone: string) => {
      if (timezone && timezone !== selectedTimezone) {
        setSelectedTimezone(timezone);
      }
    },
    handleFilterChange: (filter: FilterOption) => {
      setFilterOption(filter);
    },
    setSnackbarVisible,
    confirmClearSlots,
    setManualDateTime,
  };
};