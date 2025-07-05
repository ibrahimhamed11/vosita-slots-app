import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { TextInput, HelperText, useTheme } from 'react-native-paper';
import { useField } from 'formik';
import moment from 'moment';
import { DatePickerModal } from './DatePickerModal';

interface DateTimeInputProps {
  name: string;
  label: string;
  mode: 'date' | 'time' | 'datetime';
  placeholder?: string;
  helperText?: string;
  minimumDate?: Date;
  maximumDate?: Date;
  required?: boolean;
  disabled?: boolean;
  displayFormat?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export const DateTimeInput: React.FC<DateTimeInputProps> = ({
  name,
  label,
  mode,
  placeholder,
  helperText,
  minimumDate,
  maximumDate,
  required = false,
  disabled = false,
  displayFormat,
  accessibilityLabel,
  accessibilityHint,
}) => {
  const theme = useTheme();
  const [field, meta, helpers] = useField(name);
  const [modalVisible, setModalVisible] = useState(false);

  const getDefaultFormat = (): string => {
    switch (mode) {
      case 'date':
        return 'YYYY-MM-DD';
      case 'time':
        return 'HH:mm';
      case 'datetime':
        return 'YYYY-MM-DD HH:mm';
      default:
        return 'YYYY-MM-DD';
    }
  };

  const getDisplayValue = (): string => {
    if (!field.value) return '';
    const format = displayFormat || getDefaultFormat();
    if (typeof field.value === 'string') {
      if (mode === 'time') {
        const time = moment(field.value, 'HH:mm');
        return time.isValid() ? time.format(format) : field.value;
      }
      const date = moment(field.value);
      return date.isValid() ? date.format(format) : field.value;
    } else if (field.value instanceof Date) {
      return moment(field.value).format(format);
    }
    return '';
  };

  const getPickerValue = (): Date => {
    if (!field.value) {
      return new Date();
    }
    if (typeof field.value === 'string') {
      if (mode === 'time') {
        const time = moment(field.value, 'HH:mm');
        if (time.isValid()) {
          const today = moment().startOf('day');
          return today.hour(time.hour()).minute(time.minute()).toDate();
        }
      } else {
        const date = moment(field.value);
        if (date.isValid()) {
          return date.toDate();
        }
      }
    } else if (field.value instanceof Date) {
      return field.value;
    }
    return new Date();
  };

  const handlePress = () => {
    if (!disabled) {
      setModalVisible(true);
    }
  };

  const handleDateSelect = (selectedDate: Date) => {
    let formattedValue: string;
    if (mode === 'date') {
      formattedValue = moment(selectedDate).format('YYYY-MM-DD');
    } else if (mode === 'time') {
      formattedValue = moment(selectedDate).format('HH:mm');
    } else {
      formattedValue = moment(selectedDate).format('YYYY-MM-DD HH:mm');
    }
    helpers.setValue(formattedValue);
    helpers.setTouched(true);
    setModalVisible(false);
  };

  const handleModalDismiss = () => {
    setModalVisible(false);
  };

  const hasError = meta.touched && !!meta.error;
  const errorMessage = hasError ? meta.error : undefined;

  const getIcon = () => {
    switch (mode) {
      case 'date':
        return 'calendar';
      case 'time':
        return 'clock-outline';
      case 'datetime':
        return 'calendar-clock';
      default:
        return 'calendar';
    }
  };

  const getModalTitle = () => {
    const modeText = mode === 'datetime' ? 'Date & Time' : 
                    mode === 'date' ? 'Date' : 'Time';
    return `Select ${modeText} - ${label}`;
  };

  return (
    <View style={styles.container}>
      <Pressable
        onPress={handlePress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || `${label} input`}
        accessibilityHint={accessibilityHint || `Tap to select ${mode}`}
        accessibilityState={{ disabled }}
      >
        <TextInput
          label={required ? `${label} *` : label}
          value={getDisplayValue()}
          placeholder={placeholder}
          editable={false}
          pointerEvents="none"
          mode="outlined"
          right={
            <TextInput.Icon 
              icon={getIcon()} 
              disabled={disabled}
              onPress={handlePress}
            />
          }
          error={hasError}
          disabled={disabled}
          style={[
            styles.textInput,
            disabled && styles.disabledInput
          ]}
          contentStyle={[
            styles.textInputContent,
            { color: disabled ? theme.colors.onSurfaceDisabled : theme.colors.onSurface }
          ]}
          importantForAccessibility="no"
        />
      </Pressable>
      <HelperText 
        type={hasError ? "error" : "info"} 
        visible={!!(helperText || errorMessage)}
        style={styles.helperText}
      >
        {errorMessage || helperText}
      </HelperText>
      <DatePickerModal
        visible={modalVisible}
        onDismiss={handleModalDismiss}
        onConfirm={handleDateSelect}
        value={getPickerValue()}
        mode={mode}
        title={getModalTitle()}
        minimumDate={minimumDate}
        maximumDate={maximumDate}
        error={errorMessage}
        helperText={helperText}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  textInput: {
    backgroundColor: 'transparent',
  },
  textInputContent: {
    paddingRight: 48,
  },
  disabledInput: {
    opacity: 0.6,
  },
  helperText: {
    marginTop: 4,
    marginHorizontal: 12,
  },
});

