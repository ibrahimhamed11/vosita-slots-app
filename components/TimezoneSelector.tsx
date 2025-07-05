import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Platform, FlatList } from 'react-native';
import {
  useTheme,
  Divider,
  Button,
  Portal,
  Modal,
  List,
  Searchbar,
  Surface,
  IconButton,

  Text,
} from 'react-native-paper';
import moment from 'moment-timezone';
import { ALL_TIMEZONE_OPTIONS, TimezoneOption } from '../types/slot';
import { TimezoneSelectorProps } from '../types/TimezoneSelector';
import { getResponsiveSpacing, getResponsiveFontSize } from '../utils/responsive';

export const TimezoneSelector: React.FC<TimezoneSelectorProps> = ({
  value,
  onValueChange,
  error,
  touched,
  showCurrentTime = true,
  manualDateTime = '',
}) => {
  const theme = useTheme();
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTimezones, setFilteredTimezones] = useState<TimezoneOption[]>(ALL_TIMEZONE_OPTIONS);
  const [deviceTimezone, setDeviceTimezone] = useState<string>('');


  const hasError = !!(touched && error);

  useEffect(() => {
    const detectedTimezone = moment.tz.guess();
    setDeviceTimezone(detectedTimezone);
    
    if (!value) {
      onValueChange(detectedTimezone);
    }


  }, [onValueChange, value, manualDateTime]);

  useEffect(() => {
    if (value && showCurrentTime) {
      updateCurrentTime();
      const interval = setInterval(updateCurrentTime, 1000);
      return () => clearInterval(interval);
    }
  }, [value, showCurrentTime]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredTimezones(ALL_TIMEZONE_OPTIONS);
    } else {
      const filtered = ALL_TIMEZONE_OPTIONS.filter(timezone =>
        timezone.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        timezone.value.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTimezones(filtered);
    }
  }, [searchQuery]);

  const updateCurrentTime = () => {
    if (value) {
      const time = moment().tz(value).format('MMM DD, YYYY - hh:mm:ss A');
    }
  };

  const handleTimezoneSelect = (timezone: string) => {
    onValueChange(timezone);
    setIsModalVisible(false);
    setSearchQuery('');
  };

  const getSelectedTimezoneLabel = () => {
    const selected = ALL_TIMEZONE_OPTIONS.find(tz => tz.value === value);
    return selected ? selected.label : value || 'Select timezone';
  };

  const isDeviceTimezone = (timezone: string) => {
    return timezone === deviceTimezone;
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSearchQuery('');
  };



  return (
    <>
      <View style={styles.container}>
        <Button
          mode="contained-tonal"
          onPress={() => setIsModalVisible(true)}
          style={[
            styles.selectorButton,
            hasError && { borderColor: theme.colors.error, backgroundColor: theme.colors.errorContainer }
          ]}
          contentStyle={styles.selectorButtonContent}
          labelStyle={[
            styles.selectorButtonLabel,
            { color: value ? theme.colors.onSurface : theme.colors.onSurfaceVariant }
          ]}
          icon="chevron-down"
        >
          {getSelectedTimezoneLabel()}
        </Button>

        

      </View>

      <Portal>
        <Modal
          visible={isModalVisible}
          onDismiss={handleCloseModal}
          contentContainerStyle={[
            styles.modalContainer,
            { backgroundColor: theme.colors.surface }
          ]}
        >
          <Surface style={styles.modalSurface} elevation={4}>
            <View style={styles.modalHeader}>
              <Text variant="titleLarge" style={[styles.modalTitle, { color: theme.colors.primary }]}>
                Select Timezone
              </Text>
              <IconButton
                icon="close"
                size={26}
                onPress={handleCloseModal}
                style={{ marginRight: 4 }}
              />
            </View>
            
            <Divider />
            
            <Searchbar
              placeholder="Search timezones..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchBar}
              inputStyle={{ fontSize: 12 }}
              iconColor={theme.colors.primary}
            />
            
            {/* Add device timezone at the top */}
            <List.Item
              title="Device Timezone"
              description={deviceTimezone}
              left={() => <List.Icon icon="cellphone" color={theme.colors.primary} />}
              right={() => (
                value === deviceTimezone ? (
                  <List.Icon icon="check-circle" color={theme.colors.primary} />
                ) : null
              )}
              onPress={() => handleTimezoneSelect(deviceTimezone)}
              style={[
                styles.deviceTimezoneItem,
                value === deviceTimezone && {
                  backgroundColor: theme.colors.primaryContainer,
                  borderLeftWidth: 4,
                  borderLeftColor: theme.colors.primary
                }
              ]}
              titleStyle={[
                styles.timezoneItemTitle,
                value === deviceTimezone && {
                  color: theme.colors.onPrimaryContainer,
                  fontWeight: '700'
                }
              ]}
              descriptionStyle={[
                styles.timezoneItemDescription,
                value === deviceTimezone && {
                  color: theme.colors.onPrimaryContainer
                }
              ]}
            />

            <FlatList
              data={filteredTimezones}
              keyExtractor={item => item.value}
              style={styles.timezoneList}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item: timezone }) => (
                <List.Item
                  title={timezone.label}
                  description={timezone.value}
                  left={() => (
                    <List.Icon 
                      icon={isDeviceTimezone(timezone.value) ? "cellphone" : "earth"} 
                      color={isDeviceTimezone(timezone.value) ? theme.colors.primary : theme.colors.outline}
                    />
                  )}
                  right={() => (
                    value === timezone.value ? (
                      <List.Icon icon="check-circle" color={theme.colors.primary} />
                    ) : null
                  )}
                  onPress={() => handleTimezoneSelect(timezone.value)}
                  style={[
                    styles.timezoneItem,
                    value === timezone.value && {
                      backgroundColor: theme.colors.primaryContainer,
                      borderLeftWidth: 4,
                      borderLeftColor: theme.colors.primary
                    }
                  ]}
                  titleStyle={[
                    styles.timezoneItemTitle,
                    value === timezone.value && {
                      color: theme.colors.onPrimaryContainer,
                      fontWeight: '700'
                    }
                  ]}
                  descriptionStyle={[
                    styles.timezoneItemDescription,
                    value === timezone.value && {
                      color: theme.colors.onPrimaryContainer
                    }
                  ]}
                />
              )}
              ListEmptyComponent={
                <View style={styles.noResultsContainer}>
                  <IconButton icon="magnify-close" size={32} iconColor={theme.colors.outline} />
                  <Text variant="bodyMedium" style={[styles.noResultsText, { color: theme.colors.onSurfaceVariant }]}>
                    No timezones found matching "{searchQuery}"
                  </Text>
                </View>
              }
              initialNumToRender={16}
              maxToRenderPerBatch={24}
              windowSize={10}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 12 }}
            />
          </Surface>
        </Modal>
      </Portal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: getResponsiveSpacing(4),
    backgroundColor: '#fff',
    marginBottom: getResponsiveSpacing(8),
  },
  helperText: {
    fontSize: getResponsiveFontSize(11),
    marginBottom: getResponsiveSpacing(4),
    fontStyle: 'italic',
    letterSpacing: 0.05,
  },
  divider: {
    marginBottom: getResponsiveSpacing(8),
    marginTop: getResponsiveSpacing(2),
  },
  selectorButton: {
    marginBottom: getResponsiveSpacing(4),
    borderRadius: getResponsiveSpacing(4),
    minHeight: getResponsiveSpacing(28),
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: '#f6f8fa',
    shadowOpacity: 0.02,
  },
  selectorButtonContent: {
    paddingVertical: 6,
    justifyContent: 'space-between',
  },
  selectorButtonLabel: {
    fontSize: getResponsiveFontSize(12),
    textAlign: 'left',
    flex: 1,
    fontWeight: '600',
    letterSpacing: 0.05,
  },

  modalContainer: {
    margin: Platform.OS === 'ios' ? getResponsiveSpacing(8) : getResponsiveSpacing(6),
    borderRadius: getResponsiveSpacing(8),
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  modalSurface: {
    borderRadius: getResponsiveSpacing(8),
    overflow: 'hidden',
    paddingBottom: 0,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: getResponsiveSpacing(8),
    paddingRight: getResponsiveSpacing(2),
    paddingVertical: getResponsiveSpacing(6),
    backgroundColor: '#f6f8fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: getResponsiveFontSize(13),
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  searchBar: {
    margin: getResponsiveSpacing(6),
    marginTop: getResponsiveSpacing(2),
    borderRadius: getResponsiveSpacing(4),
    backgroundColor: '#f2f4f7',
    elevation: 0,
    minHeight: 32,
  },
  timezoneList: {
    maxHeight: 220,
    paddingBottom: getResponsiveSpacing(6),
  },
  deviceTimezoneItem: {
    backgroundColor: 'rgba(0, 122, 255, 0.07)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.07)',
    borderRadius: getResponsiveSpacing(4),
    marginHorizontal: getResponsiveSpacing(2),
    marginTop: getResponsiveSpacing(2),
    marginBottom: getResponsiveSpacing(2),
    minHeight: getResponsiveSpacing(28),
  },
  timezoneItem: {
    paddingHorizontal: getResponsiveSpacing(6),
    paddingVertical: getResponsiveSpacing(4),
    minHeight: getResponsiveSpacing(28),
    borderRadius: getResponsiveSpacing(4),
    marginHorizontal: getResponsiveSpacing(2),
    marginVertical: getResponsiveSpacing(2),
  },
  timezoneItemTitle: {
    fontSize: getResponsiveFontSize(12),
    fontWeight: '600',
    letterSpacing: 0.05,
  },
  timezoneItemDescription: {
    fontSize: getResponsiveFontSize(10),
    marginTop: getResponsiveSpacing(2),
    color: '#6b7280',
  },
  noResultsContainer: {
    padding: getResponsiveSpacing(12),
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.8,
  },
  noResultsText: {
    fontSize: getResponsiveFontSize(12),
    textAlign: 'center',
    marginTop: getResponsiveSpacing(4),
    fontStyle: 'italic',
  },
  manualMenuContent: {
    padding: getResponsiveSpacing(6),
    width: 220,
    borderRadius: getResponsiveSpacing(8),
    backgroundColor: '#f8fafc',
  },
  manualEntryContainer: {
    padding: getResponsiveSpacing(2),
  },
  manualInput: {
    marginBottom: getResponsiveSpacing(4),
    backgroundColor: 'transparent',
    borderRadius: getResponsiveSpacing(2),
    fontSize: getResponsiveFontSize(11),
  },
  saveManualButton: {
    marginTop: getResponsiveSpacing(4),
    borderRadius: getResponsiveSpacing(2),
    paddingVertical: getResponsiveSpacing(2),
  },
  manualTimeDisplay: {
    marginTop: getResponsiveSpacing(4),
    fontSize: getResponsiveFontSize(10),
    fontStyle: 'italic',
    color: '#4b5563',
    letterSpacing: 0.05,
  },
  manualButton: {
    borderRadius: getResponsiveSpacing(2),
    marginTop: getResponsiveSpacing(2),
    marginBottom: getResponsiveSpacing(2),
    backgroundColor: '#f6f8fa',
  },
});