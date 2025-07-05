import React, { useState, useEffect } from 'react';
import { Platform, View, StyleSheet } from 'react-native';
import {
  Modal,
  Portal,
  Button,
  Text,
  Surface,
  useTheme,
  IconButton,
} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';

interface DatePickerModalProps {
  visible: boolean;
  onDismiss: () => void;
  onConfirm: (date: Date) => void;
  value: Date;
  mode: 'date' | 'time' | 'datetime';
  title: string;
  minimumDate?: Date;
  maximumDate?: Date;
  error?: string;
  helperText?: string;
  testID?: string;
}

export const DatePickerModal: React.FC<DatePickerModalProps> = ({
  visible,
  onDismiss,
  onConfirm,
  value,
  mode,
  title,
  minimumDate,
  maximumDate,
  error,
  helperText,
  testID,
}) => {
  const theme = useTheme();
  const [selectedDate, setSelectedDate] = useState<Date>(value);
  const [currentMode, setCurrentMode] = useState<'date' | 'time'>(
    mode === 'datetime' ? 'date' : mode
  );
  const [isTimeStep, setIsTimeStep] = useState(false);
  const [showAndroidPicker, setShowAndroidPicker] = useState(false);

  useEffect(() => {
    if (visible) {
      setSelectedDate(value);
      setCurrentMode(mode === 'datetime' ? 'date' : mode);
      setIsTimeStep(false);
      
      if (Platform.OS === 'android') {
        setShowAndroidPicker(true);
      }
    } else {
      setShowAndroidPicker(false);
    }
  }, [visible, value, mode]);

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowAndroidPicker(false);
      
      if (event.type === 'dismissed') {
        handleDismiss();
        return;
      }

      if (date) {
        setSelectedDate(date);
        
        if (mode === 'datetime' && !isTimeStep) {
          setCurrentMode('time');
          setIsTimeStep(true);
          setShowAndroidPicker(true);
        } else {
          onConfirm(date);
          handleDismiss();
        }
      }
    } else {
      if (date) {
        setSelectedDate(date);
      }
    }
  };

  const handleConfirm = () => {
    if (mode === 'datetime' && !isTimeStep) {
      setCurrentMode('time');
      setIsTimeStep(true);
    } else {
      onConfirm(selectedDate);
      handleDismiss();
    }
  };

  const handleDismiss = () => {
    setSelectedDate(value);
    setCurrentMode(mode === 'datetime' ? 'date' : mode);
    setIsTimeStep(false);
    setShowAndroidPicker(false);
    onDismiss();
  };

  const handleBack = () => {
    setCurrentMode('date');
    setIsTimeStep(false);
  };

  const getDisplayValue = () => {
    if (mode === 'date') {
      return moment(selectedDate).format('MMMM DD, YYYY');
    } else if (mode === 'time') {
      return moment(selectedDate).format('HH:mm');
    } else {
      return isTimeStep
        ? `${moment(selectedDate).format('MMMM DD, YYYY')} at ${moment(selectedDate).format('HH:mm')}`
        : moment(selectedDate).format('MMMM DD, YYYY');
    }
  };

  const getCurrentTitle = () => {
    if (mode === 'datetime') {
      return isTimeStep ? `Select Time - ${title}` : `Select Date - ${title}`;
    }
    return title;
  };

  if (Platform.OS === 'android') {
    return showAndroidPicker ? (
      <DateTimePicker
        value={selectedDate}
        mode={currentMode}
        display="default"
        onChange={handleDateChange}
        minimumDate={minimumDate}
        maximumDate={maximumDate}
      />
    ) : null;
  }

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={handleDismiss}
        contentContainerStyle={[
          styles.modalContainer,
          { backgroundColor: theme.colors.surface }
        ]}
      >
        <Surface testID={testID} style={[styles.surface, { backgroundColor: theme.colors.surface }]} elevation={4}>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              {mode === 'datetime' && isTimeStep && (
                <IconButton
                  icon="arrow-left"
                  size={24}
                  onPress={handleBack}
                  accessibilityLabel="Go back to date selection"
                />
              )}
              
              <Text 
                variant="headlineSmall" 
                style={[styles.title, { color: theme.colors.onSurface }]}
              >
                {getCurrentTitle()}
              </Text>
              
              <IconButton
                icon="close"
                size={24}
                onPress={handleDismiss}
                accessibilityLabel="Close date picker"
              />
            </View>
          </View>

          <View style={styles.selectionDisplay}>
            <Text 
              variant="bodyLarge" 
              style={[styles.selectionText, { color: theme.colors.onSurface }]}
            >
              Selected: {getDisplayValue()}
            </Text>
          </View>

          <View style={styles.pickerContainer}>
            <DateTimePicker
              value={selectedDate}
              mode={currentMode}
              display="spinner"
              onChange={handleDateChange}
              minimumDate={minimumDate}
              maximumDate={maximumDate}
              accessibilityLabel={`${currentMode} picker`}
              style={styles.picker}
            />
          </View>

          {(helperText || error) && (
            <View style={styles.messageContainer}>
              <Text 
                variant="bodySmall" 
                style={[
                  styles.messageText,
                  { color: error ? theme.colors.error : theme.colors.onSurfaceVariant }
                ]}
              >
                {error || helperText}
              </Text>
            </View>
          )}

          <View style={styles.actions}>
            <Button
              mode="outlined"
              onPress={handleDismiss}
              style={styles.button}
              accessibilityLabel="Cancel date selection"
            >
              Cancel
            </Button>
            
            <Button
              mode="contained"
              onPress={handleConfirm}
              style={styles.button}
              accessibilityLabel={
                mode === 'datetime' && !isTimeStep 
                  ? "Continue to time selection" 
                  : "Confirm date selection"
              }
            >
              {mode === 'datetime' && !isTimeStep ? 'Next' : 'Confirm'}
            </Button>
          </View>
        </Surface>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    margin: 20,
    borderRadius: 12,
    maxHeight: '80%',
  },
  surface: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.12)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '600',
  },
  selectionDisplay: {
    padding: 16,
    alignItems: 'center',
  },
  selectionText: {
    fontWeight: '500',
  },
  pickerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
  },
  picker: {
    width: '100%',
    height: 200,
  },
  messageContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  messageText: {
    textAlign: 'center',
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    gap: 12,
  },
  button: {
    flex: 1,
    minHeight: 40,
  },
});