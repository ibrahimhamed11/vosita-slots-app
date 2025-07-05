/**
 * Storage Utility Functions for Data Persistence
 * 
 * This module provides a unified interface for data persistence across different platforms.
 * It uses AsyncStorage for React Native and localStorage for web platforms,
 * ensuring consistent data management throughout the application.
 * 
 * Features:
 * - Cross-platform storage abstraction
 * - Type-safe storage operations
 * - Error handling and logging
 * - Data validation and serialization
 * - Automatic fallback mechanisms
 * 
 * @author Vosita Development Team
 * @version 2.1.0
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { SlotConfig, Slot, STORAGE_KEYS } from '../types/slot';

/**
 * Generic storage interface for type-safe operations
 * 
 * This interface ensures consistent storage operations across different data types
 * while maintaining type safety and error handling.
 */
interface StorageOperations {
  /** Store data with automatic serialization */
  setItem<T>(key: string, value: T): Promise<void>;
  
  /** Retrieve and deserialize data */
  getItem<T>(key: string): Promise<T | null>;
  
  /** Remove data from storage */
  removeItem(key: string): Promise<void>;
  
  /** Clear all application data */
  clear(): Promise<void>;
}

/**
 * Storage implementation using AsyncStorage
 * 
 * Provides a consistent interface for data persistence with automatic
 * JSON serialization/deserialization and comprehensive error handling.
 */
class StorageManager implements StorageOperations {
  /**
   * Store data in AsyncStorage with automatic JSON serialization
   * 
   * @param key - Storage key identifier
   * @param value - Data to store (will be JSON serialized)
   * @throws Error if storage operation fails
   */
  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, serializedValue);
      
      // Log successful storage operation for debugging
      //console.log(`✅ Storage: Successfully saved data for key: ${key}`);
    } catch (error) {
      console.error(`❌ Storage Error: Failed to save data for key: ${key}`, error);
      throw new Error(`Failed to save data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Retrieve data from AsyncStorage with automatic JSON deserialization
   * 
   * @param key - Storage key identifier
   * @returns Deserialized data or null if not found
   * @throws Error if storage operation fails
   */
  async getItem<T>(key: string): Promise<T | null> {
    try {
      const serializedValue = await AsyncStorage.getItem(key);
      
      if (serializedValue === null) {
        // //console.log(`ℹ️ Storage: No data found for key: ${key}`);
        return null;
      }

      const deserializedValue = JSON.parse(serializedValue) as T;
      // //console.log(`✅ Storage: Successfully retrieved data for key: ${key}`);
      return deserializedValue;
    } catch (error) {
      console.error(`❌ Storage Error: Failed to retrieve data for key: ${key}`, error);
      
      // Return null for parsing errors to allow graceful degradation
      if (error instanceof SyntaxError) {
        console.warn(`⚠️ Storage: Invalid JSON data for key: ${key}, returning null`);
        return null;
      }
      
      throw new Error(`Failed to retrieve data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Remove data from AsyncStorage
   * 
   * @param key - Storage key identifier
   * @throws Error if storage operation fails
   */
  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
      // //console.log(`✅ Storage: Successfully removed data for key: ${key}`);
    } catch (error) {
      console.error(`❌ Storage Error: Failed to remove data for key: ${key}`, error);
      throw new Error(`Failed to remove data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Clear all application data from AsyncStorage
   * 
   * This removes all data stored by the application.
   * Use with caution as this operation cannot be undone.
   * 
   * @throws Error if storage operation fails
   */
  async clear(): Promise<void> {
    try {
      // Get all keys that belong to this application
      const allKeys = await AsyncStorage.getAllKeys();
      const appKeys = allKeys.filter(key => key.startsWith('@vosita_slots_app_v2:'));
      
      if (appKeys.length > 0) {
        await AsyncStorage.multiRemove(appKeys);
        //console.log(`✅ Storage: Successfully cleared ${appKeys.length} application keys`);
      } else {
        //console.log(`ℹ️ Storage: No application data found to clear`);
      }
    } catch (error) {
      console.error(`❌ Storage Error: Failed to clear application data`, error);
      throw new Error(`Failed to clear data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Create singleton instance for consistent usage throughout the app
const storage = new StorageManager();

/**
 * Slot Configuration Storage Functions
 * 
 * Specialized functions for managing slot configuration data with
 * validation and type safety.
 */

/**
 * Save slot configuration to storage
 * 
 * Validates the configuration object before saving to ensure data integrity.
 * 
 * @param config - Slot configuration object to save
 * @throws Error if validation fails or storage operation fails
 */
export const saveSlotConfig = async (config: SlotConfig): Promise<void> => {
  try {
    // Validate required fields before saving
    if (!config.startDate || !config.endDate || !config.timeZone) {
      throw new Error('Invalid slot configuration: missing required fields');
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(config.startDate) || !dateRegex.test(config.endDate)) {
      throw new Error('Invalid date format: dates must be in YYYY-MM-DD format');
    }

    // Validate time format
    const timeRegex = /^\d{2}:\d{2}$/;
    if (!timeRegex.test(config.startTime) || !timeRegex.test(config.endTime)) {
      throw new Error('Invalid time format: times must be in HH:mm format');
    }

    // Validate numeric fields
    if (config.slotDuration <= 0 || config.breakDuration < 0 || config.bufferDuration < 0) {
      throw new Error('Invalid duration values: durations must be non-negative numbers');
    }

    await storage.setItem(STORAGE_KEYS.SLOT_CONFIG, config);
    // //console.log('📅 Slot configuration saved successfully');
  } catch (error) {
    console.error('Failed to save slot configuration:', error);
    throw error;
  }
};

/**
 * Load slot configuration from storage
 * 
 * Returns the saved configuration or null if no configuration exists.
 * Includes validation to ensure data integrity.
 * 
 * @returns Slot configuration object or null if not found
 * @throws Error if storage operation fails
 */
export const loadSlotConfig = async (): Promise<SlotConfig | null> => {
  try {
    const config = await storage.getItem<SlotConfig>(STORAGE_KEYS.SLOT_CONFIG);
    
    if (config) {
      // Validate loaded configuration
      if (!config.startDate || !config.endDate || !config.timeZone) {
        console.warn('⚠️ Loaded slot configuration is invalid, returning null');
        return null;
      }
      
      // //console.log('📅 Slot configuration loaded successfully');
    }
    
    return config;
  } catch (error) {
    console.error('Failed to load slot configuration:', error);
    throw error;
  }
};

/**
 * Generated Slots Storage Functions
 * 
 * Specialized functions for managing generated slots data with
 * validation and type safety.
 */

/**
 * Save generated slots to storage
 * 
 * Validates the slots array before saving and handles serialization
 * of Date objects to ensure proper storage and retrieval.
 * 
 * @param slots - Array of generated slots to save
 * @throws Error if validation fails or storage operation fails
 */
export const saveGeneratedSlots = async (slots: Slot[]): Promise<void> => {
  try {
    // Validate slots array
    if (!Array.isArray(slots)) {
      throw new Error('Invalid slots data: must be an array');
    }

    // Validate each slot object
    for (const slot of slots) {
      if (!slot.id || !slot.startTime || !slot.endTime) {
        throw new Error('Invalid slot object: missing required fields');
      }
      
      // Ensure dates are properly formatted for storage
      if (!(slot.startTime instanceof Date) || !(slot.endTime instanceof Date)) {
        throw new Error('Invalid slot object: startTime and endTime must be Date objects');
      }
    }

    // Convert Date objects to ISO strings for storage
    const serializedSlots = slots.map(slot => ({
      ...slot,
      startTime: slot.startTime.toISOString(),
      endTime: slot.endTime.toISOString(),
    }));

    await storage.setItem(STORAGE_KEYS.GENERATED_SLOTS, serializedSlots);
    //console.log(`🎯 Generated ${slots.length} slots saved successfully`);
  } catch (error) {
    console.error('Failed to save generated slots:', error);
    throw error;
  }
};

/**
 * Load generated slots from storage
 * 
 * Returns the saved slots array with proper Date object reconstruction.
 * Includes validation to ensure data integrity.
 * 
 * @returns Array of generated slots or empty array if not found
 * @throws Error if storage operation fails
 */
export const loadGeneratedSlots = async (): Promise<Slot[]> => {
  try {
    const serializedSlots = await storage.getItem<any[]>(STORAGE_KEYS.GENERATED_SLOTS);
    
    if (!serializedSlots || !Array.isArray(serializedSlots)) {
      //console.log('ℹ️ No generated slots found in storage');
      return [];
    }

    // Convert ISO strings back to Date objects
    const slots: Slot[] = serializedSlots.map(slot => ({
      ...slot,
      startTime: new Date(slot.startTime),
      endTime: new Date(slot.endTime),
    }));

    // Validate reconstructed slots
    const validSlots = slots.filter(slot => {
      const isValid = slot.id && 
                     slot.startTime instanceof Date && 
                     slot.endTime instanceof Date &&
                     !isNaN(slot.startTime.getTime()) &&
                     !isNaN(slot.endTime.getTime());
      
      if (!isValid) {
        console.warn('⚠️ Skipping invalid slot during load:', slot);
      }
      
      return isValid;
    });

    //console.log(`🎯 Loaded ${validSlots.length} valid slots from storage`);
    return validSlots;
  } catch (error) {
    console.error('Failed to load generated slots:', error);
    // Return empty array for graceful degradation
    return [];
  }
};

/**
 * Utility Functions
 * 
 * Additional helper functions for storage management and data operations.
 */

/**
 * Clear all application data
 * 
 * Removes both slot configuration and generated slots from storage.
 * Use with caution as this operation cannot be undone.
 * 
 * @throws Error if storage operation fails
 */
export const clearAllData = async (): Promise<void> => {
  try {
    await storage.clear();
    //console.log('🗑️ All application data cleared successfully');
  } catch (error) {
    console.error('Failed to clear application data:', error);
    throw error;
  }
};

/**
 * Get storage usage statistics
 * 
 * Returns information about the current storage usage for debugging
 * and monitoring purposes.
 * 
 * @returns Object containing storage statistics
 */
export const getStorageStats = async (): Promise<{
  hasConfig: boolean;
  slotsCount: number;
  totalKeys: number;
}> => {
  try {
    const config = await storage.getItem(STORAGE_KEYS.SLOT_CONFIG);
    const slots = await storage.getItem(STORAGE_KEYS.GENERATED_SLOTS);
    
    // Get all application keys for total count
    const allKeys = await AsyncStorage.getAllKeys();
    const appKeys = allKeys.filter(key => key.startsWith('@vosita_slots_app_v2:'));

    const stats = {
      hasConfig: config !== null,
      slotsCount: Array.isArray(slots) ? slots.length : 0,
      totalKeys: appKeys.length,
    };

    //console.log('📊 Storage statistics:', stats);
    return stats;
  } catch (error) {
    console.error('Failed to get storage statistics:', error);
    return {
      hasConfig: false,
      slotsCount: 0,
      totalKeys: 0,
    };
  }
};

/**
 * Clears all slots and configuration from storage
 * @returns Promise that resolves when clearing is complete
 */
export const clearAllSlots = async (): Promise<void> => {
  try {
    await Promise.all([
      storage.removeItem(STORAGE_KEYS.GENERATED_SLOTS),
      storage.removeItem(STORAGE_KEYS.SLOT_CONFIG)
    ]);
    //console.log('🗑️ All slots and configuration cleared successfully');
  } catch (error) {
    console.error('Failed to clear slots:', error);
    throw new Error(`Failed to clear slots: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Export storage instance for direct access if needed
 * 
 * This allows for custom storage operations while maintaining
 * the same error handling and logging patterns.
 */
export { storage };