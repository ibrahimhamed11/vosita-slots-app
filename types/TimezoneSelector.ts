
export interface TimezoneSelectorProps {
  value: string;
  onValueChange: (timezone: string) => void;
  error?: string;
  touched?: boolean;
  label?: string;
  helperText?: string;
  required?: boolean;
  showCurrentTime?: boolean;
  containerStyle?: any;
  allowManualEntry?: boolean;
  manualDateTime?: string;
  onManualDateTimeChange?: (datetime: string) => void;
}