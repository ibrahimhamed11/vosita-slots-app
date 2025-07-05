/**
 * Type definitions for the Vosita Slots Management Application
 * 
 * This file contains all TypeScript interfaces and types used throughout the application
 * for type safety and better developer experience.
 * 
 * @author Vosita Development Team
 * @version 2.0.0
 */

/**
 * Configuration interface for slot generation
 * 
 * This interface defines all the parameters needed to generate appointment slots.
 * All fields are required and must be validated before slot generation.
 */
export interface SlotConfig {
  /** Start date for slot generation in YYYY-MM-DD format */
  startDate: string;
  
  /** End date for slot generation in YYYY-MM-DD format */
  endDate: string;
  
  /** Daily start time for slots in HH:mm format (24-hour) */
  startTime: string;
  
  /** Daily end time for slots in HH:mm format (24-hour) */
  endTime: string;
  
  /** IANA timezone identifier (e.g., 'America/New_York') */
  timeZone: string;
  
  /** Duration of each individual slot in minutes */
  slotDuration: number;
  
  /** Break time between consecutive slots in minutes */
  breakDuration: number;
  
  /** Buffer time before slot becomes available for booking in minutes */
  bufferDuration: number;
}

/**
 * Individual slot representation
 * 
 * Represents a single appointment slot with its time boundaries and availability status.
 */
export interface Slot {
  /** Unique identifier for the slot */
  id: string;
  
  /** Start time of the slot as a Date object */
  startTime: Date;
  
  /** End time of the slot as a Date object */
  endTime: Date;
  
  /** Whether the slot is currently available for booking */
  isAvailable: boolean;
}

/**
 * Form validation error structure
 * 
 * Used by Yup validation to provide detailed error information for form fields.
 */
export interface ValidationError {
  /** The form field that has the error */
  field: string;
  
  /** Human-readable error message to display to the user */
  message: string;
}

/**
 * Timezone option for dropdown selection
 * 
 * Structure used in React Native Paper Select components for timezone selection.
 */


/**
 * Form field names used throughout the application
 * 
 * Centralized field names to ensure consistency across Formik forms and validation.
 */
export const FORM_FIELDS = {
  START_DATE: 'startDate',
  END_DATE: 'endDate',
  START_TIME: 'startTime',
  END_TIME: 'endTime',
  TIMEZONE: 'timeZone',
  SLOT_DURATION: 'slotDuration',
  BREAK_DURATION: 'breakDuration',
  BUFFER_DURATION: 'bufferDuration',
} as const;

/**
 * Default values for slot configuration
 * 
 * These defaults provide a good starting point for new users and ensure
 * the form is always in a valid state.
 */
export const DEFAULT_SLOT_CONFIG: SlotConfig = {
  startDate: new Date().toISOString().split('T')[0], // Today's date
  endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days from now
  startTime: '10:00',
  endTime: '18:00',
  timeZone: 'America/New_York',
  slotDuration: 30,
  breakDuration: 15,
  bufferDuration: 45,
};

/**
 * Storage keys for AsyncStorage/localStorage
 * 
 * Namespaced keys to prevent conflicts with other applications.
 */
export const STORAGE_KEYS = {
  SLOT_CONFIG: '@vosita_slots_app_v2:slot_config',
  GENERATED_SLOTS: '@vosita_slots_app_v2:generated_slots',
} as const;





import moment from 'moment-timezone';

export interface TimezoneOption {
  value: string;
  label: string;
  offset: string;
}

/**
 * Generates a comprehensive list of timezone options with proper formatting
 */
export const generateTimezoneOptions = (): TimezoneOption[] => {
  const timezones = moment.tz.names();
  const deviceTimezone = moment.tz.guess();
  
  return timezones.map(tz => {
    const offset = moment.tz(tz).format('Z');
    const label = `(GMT${offset}) ${tz.replace(/_/g, ' ')}`;
    
    // Move device timezone to top of the list
    if (tz === deviceTimezone) {
      return {
        value: tz,
        label: `${label} (Your Timezone)`,
        offset
      };
    }
    
    return {
      value: tz,
      label,
      offset
    };
  }).sort((a, b) => {
    // Sort by offset first
    if (a.offset < b.offset) return -1;
    if (a.offset > b.offset) return 1;
    
    // Then alphabetically
    return a.label.localeCompare(b.label);
  });
};

// Generate once and export as constant
export const ALL_TIMEZONE_OPTIONS = generateTimezoneOptions();
