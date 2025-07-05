/**
 * Slot Generation Utility Functions
 * 
 * This module provides comprehensive functionality for generating appointment slots
 * based on configurable parameters. It handles timezone conversions, availability
 * calculations, and slot scheduling with proper validation and error handling.
 * 
 * Features:
 * - Multi-day slot generation across date ranges
 * - Timezone-aware slot creation and conversion
 * - Buffer duration handling for booking restrictions
 * - Availability calculation based on current time
 * - Comprehensive validation and error handling
 * - Optimized performance for large date ranges
 * 
 * @author Vosita Development Team
 * @version 2.0.0
 */

import moment from 'moment-timezone';
import { SlotConfig, Slot } from '../types/slot';

/**
 * Generate appointment slots based on configuration parameters
 * 
 * This function creates a comprehensive list of appointment slots across the specified
 * date range, taking into account working hours, slot duration, break duration,
 * and timezone settings.
 * 
 * @param config - Slot configuration object containing all parameters
 * @returns Promise resolving to array of generated slots
 * @throws Error if configuration is invalid or generation fails
 */
export const generateSlots = async (config: SlotConfig): Promise<Slot[]> => {
  try {
    // //console.log('🚀 Starting slot generation with config:', config);
    
    // Validate configuration before processing
    validateSlotConfig(config);
    
    const slots: Slot[] = [];
    let slotIdCounter = 1;
    
    // Parse date range
    const startDate = moment.tz(config.startDate, config.timeZone).startOf('day');
    const endDate = moment.tz(config.endDate, config.timeZone).startOf('day');
    
    // Validate date range
    if (endDate.isBefore(startDate)) {
      throw new Error('End date must be same as or after start date');
    }
    
    // //console.log(`📅 Generating slots from ${startDate.format('YYYY-MM-DD')} to ${endDate.format('YYYY-MM-DD')} in ${config.timeZone}`);
    
    // Iterate through each day in the date range
    const currentDate = startDate.clone();
    while (currentDate.isSameOrBefore(endDate, 'day')) {
      const dailySlots = generateDailySlots(currentDate, config, slotIdCounter);
      slots.push(...dailySlots);
      slotIdCounter += dailySlots.length;
      
      // Move to next day
      currentDate.add(1, 'day');
    }
    
    //console.log(`✅ Successfully generated ${slots.length} slots`);
    return slots;
    
  } catch (error) {
    console.error('❌ Slot generation failed:', error);
    throw new Error(`Slot generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Generate slots for a single day
 * 
 * Creates all appointment slots for a specific day based on the working hours
 * and slot configuration parameters.
 * 
 * @param date - The date to generate slots for (moment object)
 * @param config - Slot configuration object
 * @param startingId - Starting ID number for slot generation
 * @returns Array of slots for the specified day
 */
const generateDailySlots = (
  date: moment.Moment, 
  config: SlotConfig, 
  startingId: number
): Slot[] => {
  const dailySlots: Slot[] = [];
  let currentId = startingId;
  
  // Parse working hours for the day
  const [startHour, startMinute] = config.startTime.split(':').map(Number);
  const [endHour, endMinute] = config.endTime.split(':').map(Number);
  
  // Create start and end times for the working day
  const workingStart = date.clone()
    .hour(startHour)
    .minute(startMinute)
    .second(0)
    .millisecond(0);
    
  const workingEnd = date.clone()
    .hour(endHour)
    .minute(endMinute)
    .second(0)
    .millisecond(0);
  
  // Validate working hours
  if (workingEnd.isSameOrBefore(workingStart)) {
    console.warn(`⚠️ Invalid working hours for ${date.format('YYYY-MM-DD')}: end time is not after start time`);
    return dailySlots;
  }
  
  // Generate slots within working hours
  const currentSlotStart = workingStart.clone();
  
  while (currentSlotStart.clone().add(config.slotDuration, 'minutes').isSameOrBefore(workingEnd)) {
    const slotEnd = currentSlotStart.clone().add(config.slotDuration, 'minutes');
    
    // Create slot object
    const slot: Slot = {
      id: `slot_${currentId.toString().padStart(4, '0')}`,
      startTime: currentSlotStart.toDate(),
      endTime: slotEnd.toDate(),
      isAvailable: true, // Will be calculated later based on buffer duration
    };
    
    dailySlots.push(slot);
    currentId++;
    
    // Move to next slot start time (slot duration + break duration)
    currentSlotStart.add(config.slotDuration + config.breakDuration, 'minutes');
  }
  
  //console.log(`📅 Generated ${dailySlots.length} slots for ${date.format('YYYY-MM-DD')}`);
  return dailySlots;
};

/**
 * Calculate slot availability based on current time and buffer duration
 * 
 * Updates the availability status of slots based on the current time and
 * the configured buffer duration. Slots become available only after the
 * buffer period has passed.
 * 
 * @param slots - Array of slots to update
 * @param bufferDuration - Buffer duration in minutes
 * @param currentTime - Current time for availability calculation (defaults to now)
 * @param timezone - Timezone for calculations (defaults to local timezone)
 * @returns Updated array of slots with availability status
 */
export const calculateSlotAvailability = (
  slots: Slot[],
  bufferDuration: number,
  currentTime?: Date,
  timezone?: string
): Slot[] => {
  try {
    const now = currentTime ? moment(currentTime) : moment();
    const currentMoment = timezone ? now.tz(timezone) : now;
    
    //console.log(`🕐 Calculating availability for ${slots.length} slots with ${bufferDuration}min buffer at ${currentMoment.format('YYYY-MM-DD HH:mm:ss')}`);
    
    const updatedSlots = slots.map(slot => {
      const slotStart = timezone ? 
        moment(slot.startTime).tz(timezone) : 
        moment(slot.startTime);
      
      // Calculate the time when this slot becomes available for booking
      const availableTime = slotStart.clone().subtract(bufferDuration, 'minutes');
      
      // Slot is available if current time is past the available time
      const isAvailable = currentMoment.isSameOrAfter(availableTime);
      
      return {
        ...slot,
        isAvailable,
      };
    });
    
    const availableCount = updatedSlots.filter(slot => slot.isAvailable).length;
    //console.log(`✅ ${availableCount} of ${slots.length} slots are currently available`);
    
    return updatedSlots;
    
  } catch (error) {
    console.error('❌ Failed to calculate slot availability:', error);
    // Return original slots with availability set to false for safety
    return slots.map(slot => ({ ...slot, isAvailable: false }));
  }
};

/**
 * Filter slots by availability status
 * 
 * Returns only the slots that are currently available for booking.
 * 
 * @param slots - Array of slots to filter
 * @returns Array containing only available slots
 */
export const getAvailableSlots = (slots: Slot[]): Slot[] => {
  const availableSlots = slots.filter(slot => slot.isAvailable);
  //console.log(`🎯 Found ${availableSlots.length} available slots out of ${slots.length} total`);
  return availableSlots;
};

/**
 * Filter slots by date range
 * 
 * Returns slots that fall within the specified date range.
 * 
 * @param slots - Array of slots to filter
 * @param startDate - Start date for filtering (inclusive)
 * @param endDate - End date for filtering (inclusive)
 * @param timezone - Timezone for date comparisons
 * @returns Array of slots within the date range
 */
export const getSlotsByDateRange = (
  slots: Slot[],
  startDate: string,
  endDate: string,
  timezone?: string
): Slot[] => {
  try {
    const start = timezone ? 
      moment.tz(startDate, timezone).startOf('day') : 
      moment(startDate).startOf('day');
      
    const end = timezone ? 
      moment.tz(endDate, timezone).endOf('day') : 
      moment(endDate).endOf('day');
    
    const filteredSlots = slots.filter(slot => {
      const slotDate = timezone ? 
        moment(slot.startTime).tz(timezone) : 
        moment(slot.startTime);
      
      return slotDate.isBetween(start, end, null, '[]');
    });
    
    //console.log(`📅 Found ${filteredSlots.length} slots between ${startDate} and ${endDate}`);
    return filteredSlots;
    
  } catch (error) {
    console.error('❌ Failed to filter slots by date range:', error);
    return [];
  }
};

/**
 * Convert slots to a different timezone
 * 
 * Converts all slot times to the specified timezone while maintaining
 * the same absolute time values.
 * 
 * @param slots - Array of slots to convert
 * @param targetTimezone - Target timezone for conversion
 * @returns Array of slots with times converted to target timezone
 */
export const convertSlotsToTimezone = (
  slots: Slot[],
  targetTimezone: string
): Slot[] => {
  try {
    const convertedSlots = slots.map(slot => ({
      ...slot,
      startTime: moment(slot.startTime).tz(targetTimezone).toDate(),
      endTime: moment(slot.endTime).tz(targetTimezone).toDate(),
    }));
    
    //console.log(`🌍 Converted ${slots.length} slots to ${targetTimezone} timezone`);
    return convertedSlots;
    
  } catch (error) {
    console.error('❌ Failed to convert slots to timezone:', error);
    return slots; // Return original slots if conversion fails
  }
};

/**
 * Validate slot configuration parameters
 * 
 * Performs comprehensive validation of the slot configuration to ensure
 * all parameters are valid and consistent.
 * 
 * @param config - Slot configuration to validate
 * @throws Error if validation fails
 */
const validateSlotConfig = (config: SlotConfig): void => {
  // Validate required fields
  if (!config.startDate || !config.endDate) {
    throw new Error('Start date and end date are required');
  }
  
  if (!config.startTime || !config.endTime) {
    throw new Error('Start time and end time are required');
  }
  
  if (!config.timeZone) {
    throw new Error('Timezone is required');
  }
  
  // Validate date format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(config.startDate) || !dateRegex.test(config.endDate)) {
    throw new Error('Dates must be in YYYY-MM-DD format');
  }
  
  // Validate time format
  const timeRegex = /^\d{2}:\d{2}$/;
  if (!timeRegex.test(config.startTime) || !timeRegex.test(config.endTime)) {
    throw new Error('Times must be in HH:mm format');
  }
  
  // Validate numeric fields
  if (config.slotDuration <= 0) {
    throw new Error('Slot duration must be greater than 0');
  }
  
  if (config.breakDuration < 0) {
    throw new Error('Break duration cannot be negative');
  }
  
  if (config.bufferDuration < 0) {
    throw new Error('Buffer duration cannot be negative');
  }
  
  // Validate timezone
  if (!moment.tz.zone(config.timeZone)) {
    throw new Error(`Invalid timezone: ${config.timeZone}`);
  }
  
  // Validate time range
  const [startHour, startMinute] = config.startTime.split(':').map(Number);
  const [endHour, endMinute] = config.endTime.split(':').map(Number);
  
  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;
  
  if (endMinutes <= startMinutes) {
    throw new Error('End time must be after start time');
  }
  
  // Validate that time range allows for at least one slot
  const workingMinutes = endMinutes - startMinutes;
  if (workingMinutes < config.slotDuration) {
    throw new Error('Time range must allow for at least one slot');
  }
  
  //console.log('✅ Slot configuration validation passed');
};

/**
 * Get slot generation statistics
 * 
 * Calculates and returns statistics about the slot generation process
 * for monitoring and debugging purposes.
 * 
 * @param config - Slot configuration
 * @returns Object containing generation statistics
 */
export const getSlotGenerationStats = (config: SlotConfig): {
  totalDays: number;
  workingHoursPerDay: number;
  slotsPerDay: number;
  estimatedTotalSlots: number;
} => {
  try {
    // Calculate total days
    const startDate = moment(config.startDate);
    const endDate = moment(config.endDate);
    const totalDays = endDate.diff(startDate, 'days') + 1;
    
    // Calculate working hours per day
    const [startHour, startMinute] = config.startTime.split(':').map(Number);
    const [endHour, endMinute] = config.endTime.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    const workingMinutes = endMinutes - startMinutes;
    const workingHoursPerDay = workingMinutes / 60;
    
    // Calculate slots per day
    const slotWithBreak = config.slotDuration + config.breakDuration;
    const slotsPerDay = Math.floor(workingMinutes / slotWithBreak);
    
    // Estimate total slots
    const estimatedTotalSlots = totalDays * slotsPerDay;
    
    const stats = {
      totalDays,
      workingHoursPerDay: Math.round(workingHoursPerDay * 100) / 100,
      slotsPerDay,
      estimatedTotalSlots,
    };
    
    //console.log('📊 Slot generation statistics:', stats);
    return stats;
    
  } catch (error) {
    console.error('❌ Failed to calculate slot generation statistics:', error);
    return {
      totalDays: 0,
      workingHoursPerDay: 0,
      slotsPerDay: 0,
      estimatedTotalSlots: 0,
    };
  }
};

