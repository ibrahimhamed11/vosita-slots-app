/**
 * Enhanced Slot Filtering Utility
 * 
 * This module provides advanced filtering capabilities for appointment slots
 * with comprehensive timezone support, real-time availability calculations,
 * and intelligent filtering based on current time and buffer duration.
 * 
 * Features:
 * - Timezone-aware slot filtering
 * - Real-time availability calculation
 * - Buffer duration handling
 * - Cross-timezone slot conversion
 * - Current time-based filtering
 * - Date and time range filtering
 * 
 * @author Vosita Development Team
 * @version 2.0.0
 */

import moment from 'moment-timezone';
import { Slot, SlotConfig } from '../types/slot';

/**
 * Interface for slot filtering options
 */
export interface SlotFilterOptions {
  /** Current time for availability calculation (defaults to now) */
  currentTime?: Date;
  
  /** Timezone for filtering calculations */
  timezone?: string;
  
  /** Buffer duration in minutes */
  bufferDuration?: number;
  
  /** Start date filter (YYYY-MM-DD) */
  startDate?: string;
  
  /** End date filter (YYYY-MM-DD) */
  endDate?: string;
  
  /** Start time filter (HH:mm) */
  startTime?: string;
  
  /** End time filter (HH:mm) */
  endTime?: string;
  
  /** Whether to include only available slots */
  availableOnly?: boolean;
  
  /** Maximum number of slots to return */
  limit?: number;
}

/**
 * Get filtered and timezone-aware slots
 * 
 * This is the main filtering function that applies all filtering criteria
 * and returns slots adjusted for the specified timezone with proper
 * availability calculation.
 * 
 * @param slots - Array of slots to filter
 * @param options - Filtering options
 * @returns Filtered and timezone-adjusted slots
 */
export const getFilteredSlots = (
  slots: Slot[],
  options: SlotFilterOptions = {}
): Slot[] => {
  try {
    const {
      currentTime = new Date(),
      timezone = moment.tz.guess(),
      bufferDuration = 45,
      startDate,
      endDate,
      startTime,
      endTime,
      availableOnly = false,
      limit
    } = options;

    console.log(`🔍 Filtering ${slots.length} slots with options:`, {
      timezone,
      bufferDuration,
      availableOnly,
      dateRange: startDate && endDate ? `${startDate} to ${endDate}` : 'all',
      timeRange: startTime && endTime ? `${startTime} to ${endTime}` : 'all'
    });

    let filteredSlots = [...slots];

    // Step 1: Convert slots to target timezone
    filteredSlots = convertSlotsToTimezone(filteredSlots, timezone);

    // Step 2: Calculate availability based on current time and buffer
    filteredSlots = calculateTimezoneAwareAvailability(
      filteredSlots,
      currentTime,
      timezone,
      bufferDuration
    );

    // Step 3: Apply date range filter
    if (startDate && endDate) {
      filteredSlots = filterSlotsByDateRange(filteredSlots, startDate, endDate, timezone);
    }

    // Step 4: Apply time range filter
    if (startTime && endTime) {
      filteredSlots = filterSlotsByTimeRange(filteredSlots, startTime, endTime, timezone);
    }

    // Step 5: Filter by availability if requested
    if (availableOnly) {
      filteredSlots = filteredSlots.filter(slot => slot.isAvailable);
    }

    // Step 6: Apply limit if specified
    if (limit && limit > 0) {
      filteredSlots = filteredSlots.slice(0, limit);
    }

    // Step 7: Sort by start time
    filteredSlots.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

    const availableCount = filteredSlots.filter(slot => slot.isAvailable).length;
    console.log(`✅ Filtered to ${filteredSlots.length} slots (${availableCount} available) in ${timezone}`);

    return filteredSlots;

  } catch (error) {
    console.error('❌ Slot filtering failed:', error);
    return [];
  }
};

/**
 * Get slots available for booking right now
 * 
 * Returns slots that are currently available for booking based on
 * the current time, buffer duration, and timezone.
 * 
 * @param slots - Array of slots to filter
 * @param timezone - Target timezone
 * @param bufferDuration - Buffer duration in minutes
 * @param currentTime - Current time (defaults to now)
 * @returns Available slots for immediate booking
 */
export const getCurrentlyAvailableSlots = (
  slots: Slot[],
  timezone: string = moment.tz.guess(),
  bufferDuration: number = 45,
  currentTime: Date = new Date()
): Slot[] => {
  return getFilteredSlots(slots, {
    currentTime,
    timezone,
    bufferDuration,
    availableOnly: true
  });
};

/**
 * Get slots for a specific date in a timezone
 * 
 * Returns all slots for a specific date, converted to the target timezone
 * with availability calculated based on current time.
 * 
 * @param slots - Array of slots to filter
 * @param date - Date to filter by (YYYY-MM-DD)
 * @param timezone - Target timezone
 * @param bufferDuration - Buffer duration in minutes
 * @param currentTime - Current time for availability calculation
 * @returns Slots for the specified date
 */
export const getSlotsForDate = (
  slots: Slot[],
  date: string,
  timezone: string = moment.tz.guess(),
  bufferDuration: number = 45,
  currentTime: Date = new Date()
): Slot[] => {
  return getFilteredSlots(slots, {
    currentTime,
    timezone,
    bufferDuration,
    startDate: date,
    endDate: date
  });
};

/**
 * Get next available slots
 * 
 * Returns the next N available slots starting from the current time,
 * useful for showing upcoming availability.
 * 
 * @param slots - Array of slots to filter
 * @param count - Number of slots to return
 * @param timezone - Target timezone
 * @param bufferDuration - Buffer duration in minutes
 * @param currentTime - Current time for filtering
 * @returns Next available slots
 */
export const getNextAvailableSlots = (
  slots: Slot[],
  count: number = 10,
  timezone: string = moment.tz.guess(),
  bufferDuration: number = 45,
  currentTime: Date = new Date()
): Slot[] => {
  return getFilteredSlots(slots, {
    currentTime,
    timezone,
    bufferDuration,
    availableOnly: true,
    limit: count
  });
};

/**
 * Convert slots to target timezone
 * 
 * Converts all slot times to the specified timezone while maintaining
 * the same absolute time values.
 * 
 * @param slots - Array of slots to convert
 * @param targetTimezone - Target timezone
 * @returns Converted slots
 */
const convertSlotsToTimezone = (
  slots: Slot[],
  targetTimezone: string
): Slot[] => {
  try {
    return slots.map(slot => ({
      ...slot,
      startTime: moment(slot.startTime).tz(targetTimezone).toDate(),
      endTime: moment(slot.endTime).tz(targetTimezone).toDate(),
    }));
  } catch (error) {
    console.error('❌ Failed to convert slots to timezone:', error);
    return slots;
  }
};

/**
 * Calculate timezone-aware slot availability
 * 
 * Updates slot availability based on current time, buffer duration,
 * and timezone considerations.
 * 
 * @param slots - Array of slots to update
 * @param currentTime - Current time
 * @param timezone - Target timezone
 * @param bufferDuration - Buffer duration in minutes
 * @returns Slots with updated availability
 */
const calculateTimezoneAwareAvailability = (
  slots: Slot[],
  currentTime: Date,
  timezone: string,
  bufferDuration: number
): Slot[] => {
  try {
    const now = moment(currentTime).tz(timezone);
    
    return slots.map(slot => {
      const slotStart = moment(slot.startTime).tz(timezone);
      const availableTime = slotStart.clone().subtract(bufferDuration, 'minutes');
      
      const isAvailable = now.isSameOrAfter(availableTime) && slotStart.isAfter(now);
      
      return {
        ...slot,
        isAvailable
      };
    });
  } catch (error) {
    console.error('❌ Failed to calculate timezone-aware availability:', error);
    return slots.map(slot => ({ ...slot, isAvailable: false }));
  }
};

/**
 * Filter slots by date range
 * 
 * @param slots - Array of slots to filter
 * @param startDate - Start date (YYYY-MM-DD)
 * @param endDate - End date (YYYY-MM-DD)
 * @param timezone - Timezone for date comparison
 * @returns Filtered slots
 */
const filterSlotsByDateRange = (
  slots: Slot[],
  startDate: string,
  endDate: string,
  timezone: string
): Slot[] => {
  try {
    const start = moment.tz(startDate, timezone).startOf('day');
    const end = moment.tz(endDate, timezone).endOf('day');
    
    return slots.filter(slot => {
      const slotMoment = moment(slot.startTime).tz(timezone);
      return slotMoment.isBetween(start, end, null, '[]');
    });
  } catch (error) {
    console.error('❌ Failed to filter slots by date range:', error);
    return [];
  }
};

/**
 * Filter slots by time range
 * 
 * @param slots - Array of slots to filter
 * @param startTime - Start time (HH:mm)
 * @param endTime - End time (HH:mm)
 * @param timezone - Timezone for time comparison
 * @returns Filtered slots
 */
const filterSlotsByTimeRange = (
  slots: Slot[],
  startTime: string,
  endTime: string,
  timezone: string
): Slot[] => {
  try {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    return slots.filter(slot => {
      const slotMoment = moment(slot.startTime).tz(timezone);
      const slotHour = slotMoment.hour();
      const slotMinute = slotMoment.minute();
      
      const slotMinutes = slotHour * 60 + slotMinute;
      const startMinutes = startHour * 60 + startMinute;
      const endMinutes = endHour * 60 + endMinute;
      
      return slotMinutes >= startMinutes && slotMinutes < endMinutes;
    });
  } catch (error) {
    console.error('❌ Failed to filter slots by time range:', error);
    return [];
  }
};

/**
 * Get slot statistics for a timezone
 * 
 * Provides detailed statistics about slots in a specific timezone.
 * 
 * @param slots - Array of slots to analyze
 * @param timezone - Target timezone
 * @param bufferDuration - Buffer duration for availability calculation
 * @param currentTime - Current time for calculations
 * @returns Slot statistics object
 */
export const getSlotStatistics = (
  slots: Slot[],
  timezone: string = moment.tz.guess(),
  bufferDuration: number = 45,
  currentTime: Date = new Date()
) => {
  try {
    const filteredSlots = getFilteredSlots(slots, {
      currentTime,
      timezone,
      bufferDuration
    });

    const totalSlots = filteredSlots.length;
    const availableSlots = filteredSlots.filter(slot => slot.isAvailable).length;
    const unavailableSlots = totalSlots - availableSlots;

    // Group by date
    const slotsByDate = new Map<string, Slot[]>();
    filteredSlots.forEach(slot => {
      const dateKey = moment(slot.startTime).tz(timezone).format('YYYY-MM-DD');
      if (!slotsByDate.has(dateKey)) {
        slotsByDate.set(dateKey, []);
      }
      slotsByDate.get(dateKey)!.push(slot);
    });

    const dateRange = {
      start: filteredSlots.length > 0 ? 
        moment(filteredSlots[0].startTime).tz(timezone).format('YYYY-MM-DD') : null,
      end: filteredSlots.length > 0 ? 
        moment(filteredSlots[filteredSlots.length - 1].startTime).tz(timezone).format('YYYY-MM-DD') : null
    };

    return {
      timezone,
      totalSlots,
      availableSlots,
      unavailableSlots,
      availabilityRate: totalSlots > 0 ? Math.round((availableSlots / totalSlots) * 100) : 0,
      dateRange,
      daysWithSlots: slotsByDate.size,
      averageSlotsPerDay: slotsByDate.size > 0 ? Math.round(totalSlots / slotsByDate.size) : 0
    };
  } catch (error) {
    console.error('❌ Failed to calculate slot statistics:', error);
    return {
      timezone,
      totalSlots: 0,
      availableSlots: 0,
      unavailableSlots: 0,
      availabilityRate: 0,
      dateRange: { start: null, end: null },
      daysWithSlots: 0,
      averageSlotsPerDay: 0
    };
  }
};

/**
 * Format slot for display in a specific timezone
 * 
 * Returns a formatted representation of a slot for display purposes.
 * 
 * @param slot - Slot to format
 * @param timezone - Target timezone
 * @param format - Date/time format string
 * @returns Formatted slot information
 */
export const formatSlotForTimezone = (
  slot: Slot,
  timezone: string = moment.tz.guess(),
  format: string = 'MMM DD, YYYY - hh:mm A'
) => {
  try {
    const startMoment = moment(slot.startTime).tz(timezone);
    const endMoment = moment(slot.endTime).tz(timezone);
    
    return {
      id: slot.id,
      startTime: startMoment.format(format),
      endTime: endMoment.format(format),
      date: startMoment.format('YYYY-MM-DD'),
      time: `${startMoment.format('HH:mm')} - ${endMoment.format('HH:mm')}`,
      isAvailable: slot.isAvailable,
      timezone: timezone,
      duration: endMoment.diff(startMoment, 'minutes')
    };
  } catch (error) {
    console.error('❌ Failed to format slot for timezone:', error);
    return {
      id: slot.id,
      startTime: 'Invalid',
      endTime: 'Invalid',
      date: 'Invalid',
      time: 'Invalid',
      isAvailable: false,
      timezone: timezone,
      duration: 0
    };
  }
};

