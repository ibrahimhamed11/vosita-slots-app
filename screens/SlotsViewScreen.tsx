import React, { useState } from 'react';
import { 
  ScrollView, 
  View, 
  StyleSheet, 
  RefreshControl, 
  useWindowDimensions,
  FlatList,
  Alert,
} from 'react-native';
import {
  Card,
  Button,
  Chip,
  Surface,
  ActivityIndicator,
  Snackbar,
  useTheme,
  Divider,
  Badge,
  SegmentedButtons,
  Text,
  IconButton,
} from 'react-native-paper';
import { TimezoneSelector } from '../components/TimezoneSelector';
import { ManualTimeEntry } from '../components/ManualTimeEntry';
import { SlotListItem } from '../components/SlotListItem';
import moment from 'moment-timezone';

// Import utilities and types
import { Slot } from '../types/slot';
import { FilterOption } from '../types/slotsView';
import { useSlotsViewLogic } from '../hooks/useSlotsViewLogic';
import { getResponsiveSpacing, getResponsiveFontSize, fontSizes } from '../utils/responsive';

// Accept initialTimezone as a prop
type SlotsViewScreenProps = {
  initialTimezone?: string;
};

const SlotsViewScreen: React.FC<SlotsViewScreenProps> = ({ initialTimezone }) => {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;
  const {
    slots,
    filteredSlots,
    isLoading,
    isRefreshing,
    filterOption,
    snackbarVisible,
    snackbarMessage,
    currentTime,
    selectedTimezone,
    manualDateTime,
    showSnackbar,
    handleRefresh,
    handleTimezoneChange,
    handleFilterChange,
    setSnackbarVisible,
    confirmClearSlots,
    setManualDateTime,
  } = useSlotsViewLogic(initialTimezone); // pass initialTimezone here

  // State for expanded/collapsed days
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({});
  const [showManualTimeEntryState, setShowManualTimeEntryState] = useState(false);

  const navigateToGeneration = () => {
    Alert.alert(
      'Generate Slots',
      'Go to the "Slots Generation" tab to create your first set of slots.',
      [{ text: 'Got it!', style: 'default' }]
    );
  };

  const formatSlotTime = (date: Date): string => {
    return moment(date).tz(selectedTimezone).format('HH:mm');
  };

  const formatSlotDate = (date: Date): string => {
    return moment(date).tz(selectedTimezone).format('MMMM DD, YYYY');
  };

  const isSlotAvailable = (slot: Slot) => {
    const now = manualDateTime 
      ? moment(manualDateTime).tz(selectedTimezone)
      : moment(currentTime).tz(selectedTimezone);
    const slotStart = moment(slot.startTime).tz(selectedTimezone);
    return slotStart.diff(now, 'minutes') >= 45;
  };


  const displayTime = manualDateTime 
    ? moment(manualDateTime).tz(selectedTimezone)
    : moment(currentTime).tz(selectedTimezone);

  const handleManualDateTimeSave = (date: string, time: string) => {
    const datetime = `${date}T${time}:00`;
    if (moment(datetime).isValid()) {
      setManualDateTime(datetime);
      showSnackbar('Manual time set successfully');
      setShowManualTimeEntryState(false);
    } else {
      showSnackbar('Invalid date/time format');
    }
  };

  const handleSetManualToNow = () => {
    const now = moment();
    setManualDateTime(now.format());
    showSnackbar('Manual time set to current device time');
    setShowManualTimeEntryState(false);
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.onBackground }]}>
          Loading available slots...
        </Text>
      </View>
    );
  }

  if (slots.length === 0) {
    return (
      <ScrollView 
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.emptyContainer}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        <Surface style={[styles.emptyStateSurface, { 
          backgroundColor: theme.colors.surface,
          width: isLargeScreen ? '70%' : '90%',
          padding: isLargeScreen ? getResponsiveSpacing(40) : getResponsiveSpacing(32)
        }]} elevation={4}>
          <Text variant="titleLarge" style={[styles.emptyStateTitle, { color: theme.colors.onSurface }]}>
            No Slots Generated Yet
          </Text>
          <Text style={[styles.emptyStateText, { color: theme.colors.onSurfaceVariant }]}>
            Go to the "Slots Generation" tab to create your first set of appointment slots.
          </Text>
          <Button
            mode="contained"
            onPress={navigateToGeneration}
            style={styles.emptyStateButton}
          >
            Generate Slots
          </Button>
        </Surface>
        
        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
        >
          {snackbarMessage}
        </Snackbar>
      </ScrollView>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={[styles.contentContainer, { 
        paddingBottom: getResponsiveSpacing(40) 
      }]}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header Section */}
      <Surface style={[styles.headerSurface, { 
        backgroundColor: theme.colors.secondary,
        padding: getResponsiveSpacing(40),
        marginHorizontal: isLargeScreen ? getResponsiveSpacing(32) : 0
      }]} elevation={4}>
        <Text variant="titleLarge" style={[styles.headerTitle, { 
          color: theme.colors.onSecondary,
          fontSize: fontSizes(18),
        }]}>
          Available Appointment Slots
        </Text>
        <Text style={[styles.headerSubtitle, { color: theme.colors.onSecondary }]}>
          {slots.length} slots available
        </Text>
      </Surface>

      {/* Current Time Display */}
      <Card style={[styles.timeCard, { 
        marginHorizontal: isLargeScreen ? getResponsiveSpacing(32) : getResponsiveSpacing(18),
        marginBottom: isLargeScreen ? getResponsiveSpacing(32) : getResponsiveSpacing(18)
      }]} elevation={2}>
        <Card.Content>
          <View style={styles.timeContainer}>
            <View style={styles.timeInfo}>
              <Text style={[styles.timeLabel, { color: theme.colors.onSurfaceVariant }]}>
                {manualDateTime ? 'Manual Date & Time' : 'Current Date & Time'}
              </Text>
              <Text variant="titleMedium" style={[styles.timeValue, { 
                color: theme.colors.onSurface,
                fontSize: isLargeScreen ? fontSizes(20) : fontSizes(18)
              }]}>
                {displayTime.format('MMMM DD, YYYY HH:mm')}
              </Text>
              <Text style={[styles.timezoneLabel, { color: theme.colors.onSurfaceVariant }]}>
                {selectedTimezone}
              </Text>
            </View>
            <Badge style={styles.timeBadge}>
              {manualDateTime ? 'Manual' : 'Live'}
            </Badge>
          </View>
          <Button 
            mode="text" 
            onPress={() => setShowManualTimeEntryState(v => !v)}
            icon={showManualTimeEntryState ? 'eye-off' : 'clock-edit-outline'}
            style={styles.toggleManualButton}
          >
            {showManualTimeEntryState ? 'Hide Editor' : 'Set Manual Time'}
          </Button>
          {showManualTimeEntryState && (
            <ManualTimeEntry
              currentDateTime={manualDateTime || displayTime.format()}
              onSave={handleManualDateTimeSave}
              onClear={() => {
                setManualDateTime(null);
                showSnackbar('Using current time again');
                setShowManualTimeEntryState(false);
              }}
              timezone={selectedTimezone}
              onSetNow={handleSetManualToNow}
            />
          )}
        </Card.Content>
      </Card>

      {/* Controls Section */}
      <Card style={[styles.controlsCard, { 
        marginHorizontal: isLargeScreen ? getResponsiveSpacing(32) : getResponsiveSpacing(18), 
        marginBottom: isLargeScreen ? getResponsiveSpacing(32) : getResponsiveSpacing(18)
      }]} elevation={2}>
        <Card.Content>
          <Text variant="titleMedium" style={[styles.controlsTitle, { 
            color: theme.colors.onSurface,
            fontSize: isLargeScreen ? fontSizes(20) : fontSizes(18)
          }]}>
            View Options
          </Text>
          
          <Divider style={styles.divider} />
          
          {/* Timezone Selector */}
          <View style={styles.controlSection}>
            <Text style={[styles.controlLabel, { color: theme.colors.onSurface }]}>
              View in Timezone
            </Text>
            <TimezoneSelector
              value={selectedTimezone}
              onValueChange={(tz) => {
                handleTimezoneChange(tz);
              }}
              label="Select Timezone..."
              showCurrentTime={false}
            />
          </View>
          
          {/* Filter Buttons */}
          <View style={styles.controlSection}>
            <Text style={[styles.controlLabel, { color: theme.colors.onSurface }]}>
              Filter Slots
            </Text>
            <SegmentedButtons
              value={filterOption}
              onValueChange={(value) => handleFilterChange(value as FilterOption)}
              buttons={[
                { value: 'all', label: 'All', icon: 'calendar-multiple' },
                { value: 'available', label: 'Available', icon: 'check-circle' },
                { value: 'unavailable', label: 'Unavailable', icon: 'clock' },
              ]}
              style={styles.segmentedButtons}
            />
          </View>
          
          {/* Clear Slots Button */}
          <View style={styles.controlSection}>
            <Text style={[styles.controlLabel, { color: theme.colors.onSurface }]}>
              Slot Management
            </Text>
            <Button
              mode="outlined"
              icon="delete"
              textColor={theme.colors.error}
              style={styles.clearButton}
              onPress={confirmClearSlots}
            >
              Clear All Slots
            </Button>
          </View>
          
          {/* Statistics */}
          <View style={[styles.statsContainer, {
            flexDirection: isLargeScreen ? 'row' : 'column',
            gap: isLargeScreen ? getResponsiveSpacing(8) : getResponsiveSpacing(4)
          }]}>
            <Chip icon="calendar-multiple" style={styles.statChip}>
              Total: {slots.length}
            </Chip>
            <Chip icon="check-circle" style={styles.statChip}>
              Available: {slots.filter(s => isSlotAvailable(s)).length}
            </Chip>
            <Chip icon="clock" style={styles.statChip}>
              Showing: {filteredSlots.length}
            </Chip>
          </View>
        </Card.Content>
      </Card>

      {/* Slots List */}
      {filteredSlots.length > 0 ? (
        <Card style={[styles.slotsCard, { 
          marginHorizontal: isLargeScreen ? getResponsiveSpacing(32) : getResponsiveSpacing(18),
          marginBottom: isLargeScreen ? getResponsiveSpacing(32) : getResponsiveSpacing(18)
        }]} elevation={2}>
          <Card.Content>
            <Text variant="titleMedium" style={[styles.slotsTitle, { 
              color: theme.colors.onSurface,
              fontSize: isLargeScreen ? fontSizes(20) : fontSizes(18)
            }]}>
              Appointment Slots
            </Text>
            
            <Divider style={styles.divider} />
            
            {/* Group slots by date */}
            {(() => {
              const slotsByDate = filteredSlots.reduce((groups, slot) => {
                const date = formatSlotDate(slot.startTime);
                if (!groups[date]) {
                  groups[date] = [];
                }
                groups[date].push(slot);
                return groups;
              }, {} as Record<string, Slot[]>);

              return Object.entries(slotsByDate).map(([date, dateSlots]) => {
                const isExpanded = expandedDays[date] ?? true;

                // Apply filter at display level
                let displaySlots = dateSlots;
                if (filterOption === 'available') {
                  displaySlots = dateSlots.filter(isSlotAvailable);
                } else if (filterOption === 'unavailable') {
                  displaySlots = dateSlots.filter(slot => !isSlotAvailable(slot));
                }

                if (displaySlots.length === 0) return null;

                return (
                  <View key={date} style={styles.dateGroup}>
                    <View style={styles.dateHeaderRow}>
                      <Text style={[styles.dateHeader, { 
                        color: theme.colors.primary,
                        fontSize: isLargeScreen ? fontSizes(18) : fontSizes(16)
                      }]}>
                        {date}
                      </Text>
                      <IconButton
                        icon={isExpanded ? "chevron-up" : "chevron-down"}
                        size={22}
                        onPress={() => setExpandedDays(prev => ({
                          ...prev,
                          [date]: !isExpanded
                        }))}
                        accessibilityLabel={isExpanded ? "Collapse slots" : "Expand slots"}
                      />
                    </View>
                    {isExpanded && (
                      <FlatList
                        data={displaySlots}
                        keyExtractor={slot => slot.id}
                        renderItem={({ item: slot }) => {
                          const available = isSlotAvailable(slot);
                          const status = available
                            ? { text: 'Available', color: theme.colors.primary, icon: 'check-circle' }
                            : { text: 'Not Available', color: theme.colors.error, icon: 'close-circle' };
                          return (
                            <SlotListItem
                              slot={slot}
                              available={available}
                              status={status}
                              isLargeScreen={isLargeScreen}
                              formatSlotTime={formatSlotTime}
                              theme={theme}
                            />
                          );
                        }}
                        scrollEnabled={false}
                        removeClippedSubviews
                        initialNumToRender={10}
                        maxToRenderPerBatch={20}
                        windowSize={5}
                      />
                    )}
                  </View>
                );
              });
            })()}
          </Card.Content>
        </Card>
      ) : (
        <Card style={[styles.noResultsCard, { 
          marginHorizontal: isLargeScreen ? getResponsiveSpacing(32) : getResponsiveSpacing(18),
          marginBottom: isLargeScreen ? getResponsiveSpacing(32) : getResponsiveSpacing(18)
        }]} elevation={2}>
          <Card.Content>
            <Text variant="titleMedium" style={[styles.noResultsTitle, { 
              color: theme.colors.onSurface,
              fontSize: isLargeScreen ? fontSizes(20) : fontSizes(18)
            }]}>
              No Slots Match Current Filter
            </Text>
            <Text style={[styles.noResultsText, { color: theme.colors.onSurfaceVariant }]}>
              Try changing the filter or timezone settings to see more slots.
            </Text>
            <Button
              mode="outlined"
              onPress={() => handleFilterChange('all')}
              style={styles.showAllButton}
            >
              Show All Slots
            </Button>
          </Card.Content>
        </Card>
      )}

      {/* Refresh Instructions */}
      <Card style={[styles.instructionsCard, { 
        marginHorizontal: isLargeScreen ? getResponsiveSpacing(32) : getResponsiveSpacing(18),
        marginBottom: isLargeScreen ? getResponsiveSpacing(32) : getResponsiveSpacing(18)
      }]} elevation={1}>
        <Card.Content>
          <Text style={[styles.instructionsText, { 
            color: theme.colors.onSurfaceVariant,
            fontSize: isLargeScreen ? fontSizes(14) : fontSizes(12)
          }]}>
            Pull down to refresh slots data
          </Text>
        </Card.Content>
      </Card>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={styles.snackbar}
      >
        {snackbarMessage}
      </Snackbar>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: getResponsiveSpacing(40),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: getResponsiveSpacing(32),
  },
  loadingText: {
    marginTop: getResponsiveSpacing(16),
    textAlign: 'center',
    fontSize: fontSizes(16),
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: getResponsiveSpacing(16),
  },
  emptyStateSurface: {
    borderRadius: 16,
    alignItems: 'center',
  },
  emptyStateTitle: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: getResponsiveSpacing(16),
    fontSize: fontSizes(18),
  },
  emptyStateText: {
    textAlign: 'center',
    marginBottom: getResponsiveSpacing(18),
    lineHeight: getResponsiveFontSize(18),
    fontSize: fontSizes(16),
  },
  emptyStateButton: {
    paddingHorizontal: getResponsiveSpacing(18),
  },
  headerSurface: {
    marginBottom: getResponsiveSpacing(16),
  },
  headerTitle: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: getResponsiveSpacing(8),
    fontSize: fontSizes(18),
  },
  headerSubtitle: {
    textAlign: 'center',
    opacity: 0.9,
    fontSize: fontSizes(16),
  },
  timeCard: {
    borderRadius: 12,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeInfo: {
    flex: 1,
  },
  timeLabel: {
    fontSize: fontSizes(12),
    marginBottom: getResponsiveSpacing(4),
  },
  timeValue: {
    fontWeight: '600',
    marginBottom: getResponsiveSpacing(4),
    fontSize: fontSizes(18),
  },
  timezoneLabel: {
    fontSize: fontSizes(12),
  },
  timeBadge: {
    marginLeft: getResponsiveSpacing(16),
  },
  toggleManualButton: {
    marginTop: getResponsiveSpacing(8),
    alignSelf: 'flex-start',
  },
  manualEntryContainer: {
    marginTop: getResponsiveSpacing(16),
  },
  manualEntryTitle: {
    fontSize: fontSizes(14),
    fontWeight: '500',
    marginBottom: getResponsiveSpacing(16),
  },
  manualInput: {
    marginBottom: getResponsiveSpacing(16),
  },
  manualButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: getResponsiveSpacing(8),
  },
  manualButton: {
    flex: 1,
    marginHorizontal: getResponsiveSpacing(4),
  },
  manualTimezoneNote: {
    fontSize: fontSizes(12),
    marginTop: getResponsiveSpacing(8),
    fontStyle: 'italic',
  },
  controlsCard: {
    borderRadius: 12,
  },
  controlsTitle: {
    fontWeight: '600',
    marginBottom: getResponsiveSpacing(8),
  },
  divider: {
    marginBottom: getResponsiveSpacing(16),
  },
  controlSection: {
    marginBottom: getResponsiveSpacing(16),
  },
  controlLabel: {
    fontWeight: '500',
    marginBottom: getResponsiveSpacing(8),
  },
  segmentedButtons: {
    marginTop: getResponsiveSpacing(8),
  },
  statsContainer: {
    justifyContent: 'space-between',
    marginTop: getResponsiveSpacing(16),
  },
  statChip: {
    marginBottom: getResponsiveSpacing(8),
  },
  clearButton: {
    marginTop: getResponsiveSpacing(8),
    borderColor: '#ff4444',
  },
  slotsCard: {
    borderRadius: 12,
  },
  slotsTitle: {
    fontWeight: '600',
    marginBottom: getResponsiveSpacing(8),
  },
  dateGroup: {
    marginBottom: getResponsiveSpacing(16),
  },
  dateHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: getResponsiveSpacing(8),
    marginBottom: getResponsiveSpacing(4),
  },
  dateHeader: {
    fontWeight: '600',
    marginBottom: getResponsiveSpacing(8),
    marginLeft: getResponsiveSpacing(16),
  },
  slotItem: {
    borderRadius: 8,
    paddingVertical: getResponsiveSpacing(4),
  },
  noResultsCard: {
    borderRadius: 12,
  },
  noResultsTitle: {
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: getResponsiveSpacing(8),
  },
  noResultsText: {
    textAlign: 'center',
    marginBottom: getResponsiveSpacing(16),
  },
  showAllButton: {
    alignSelf: 'center',
  },
  instructionsCard: {
    borderRadius: 12,
  },
  instructionsText: {
    textAlign: 'center',
    fontStyle: 'italic',
  },
  snackbar: {
    marginBottom: getResponsiveSpacing(16),
  },
});

export default SlotsViewScreen;