import { Slot } from './slot';

export type FilterOption = 'all' | 'available' | 'unavailable';

export interface ManualTimeEntryProps {
  currentDateTime: string;
  onSave: (date: string, time: string) => void;
  onClear: () => void;
  timezone: string;
  onSetNow?: () => void;
}

export interface SlotListItemProps {
  slot: Slot;
  available: boolean;
  status: {
    text: string;
    color: string;
    icon: string;
  };
  isLargeScreen: boolean;
  formatSlotTime: (date: Date) => string;
  theme: any;
  onPress?: () => void;
}