import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, View, Text, ScrollView } from 'react-native';

export default function DocumentationModal() {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.header}>Technical Documentation - Vosita Slots Management Application</Text>

        <Text style={styles.sectionHeader}>Table of Contents</Text>
        {[
          '1. Architecture Overview',
          '2. Component Architecture',
          '3. Type System',
          '4. Utility Functions',
          '5. State Management',
          '6. Navigation Structure',
          '7. Performance Considerations',
          '8. Security Considerations',
          '9. Error Handling',
          '10. Testing Strategy',
          '11. Deep Linking Usage'
        ].map((item, index) => (
          <Text key={index} style={styles.tocItem}>{item}</Text>
        ))}

        {/* 1. Architecture Overview */}
        <Text style={styles.sectionHeader}>1. Architecture Overview</Text>
        <Text style={styles.subsectionHeader}>Application Structure</Text>
        <Text style={styles.paragraph}>
          The Vosita Slots Management Application follows a modular architecture pattern designed for scalability and maintainability. The application is built using React Native with Expo, leveraging TypeScript for type safety and modern development practices.
        </Text>
        <Text style={styles.subsectionHeader}>Core Architecture Principles</Text>
        <Text style={styles.bulletPoint}>• Separation of Concerns: Business logic, UI components, and data management are separated into distinct layers for maintainability and testability.</Text>
        <Text style={styles.bulletPoint}>• Type Safety: TypeScript provides compile-time type checking, reducing runtime errors.</Text>
        <Text style={styles.bulletPoint}>• Functional Programming: Pure functions and minimal side effects for predictability and testability.</Text>
        <Text style={styles.bulletPoint}>• Component Composition: Composable, reusable React components following single responsibility principle.</Text>
        <Text style={styles.subsectionHeader}>Technology Stack Deep Dive</Text>
        <Text style={styles.bulletPoint}>• React Native 0.79.4: Cross-platform mobile foundation.</Text>
        <Text style={styles.bulletPoint}>• Expo SDK 53: Tools and services for React Native, including OTA updates and native APIs.</Text>
        <Text style={styles.bulletPoint}>• TypeScript 5.8.3: Static type checking and improved IDE support.</Text>
        <Text style={styles.bulletPoint}>• Expo Router 5.1.2: File-based routing for navigation.</Text>
        <Text style={styles.bulletPoint}>• Moment.js with Timezone: Date/time operations and timezone handling.</Text>

        {/* 2. Component Architecture */}
        <Text style={styles.sectionHeader}>2. Component Architecture</Text>
        <Text style={styles.subsectionHeader}>Screen Components</Text>
        <Text style={styles.bulletPoint}>• <Text style={{fontWeight: 'bold'}}>SlotsGenerationScreen</Text> (<Text style={styles.codeInline}>app/(tabs)/index.tsx</Text>): Main interface for configuring slot parameters. Uses <Text style={styles.codeInline}>useState</Text> for form state, validation, and pickers. Real-time validation and error handling. Integrates native DateTimePicker and handles platform-specific UI.</Text>
        <Text style={styles.bulletPoint}>• <Text style={{fontWeight: 'bold'}}>SlotsViewScreen</Text> (<Text style={styles.codeInline}>app/(tabs)/two.tsx</Text>): Displays available slots with timezone conversion and filtering. Uses functional programming for filtering, advanced timezone handling, efficient FlatList rendering, and pull-to-refresh.</Text>
        <Text style={styles.subsectionHeader}>Utility Components</Text>
        <Text style={styles.bulletPoint}>• Custom Date/Time Pickers: Consistent cross-platform wrappers.</Text>
        <Text style={styles.bulletPoint}>• Reusable Form Components: Built-in validation and accessibility support.</Text>

        {/* 3. Type System */}
        <Text style={styles.sectionHeader}>3. Type System</Text>
        <Text style={styles.subsectionHeader}>Core Interfaces</Text>
        <Text style={styles.bulletPoint}>• <Text style={styles.codeInline}>SlotConfig</Text>:</Text>
        <Text style={styles.codeBlock}>
{`export interface SlotConfig {
  startDate: string; // YYYY-MM-DD format
  endDate: string; // YYYY-MM-DD format
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  timeZone: string; // timezone identifier
  breakDuration: number; // minutes
  slotDuration: number; // minutes
  bufferDuration: number; // minutes
}`}
        </Text>
        <Text style={styles.bulletPoint}>• <Text style={styles.codeInline}>Slot</Text>:</Text>
        <Text style={styles.codeBlock}>
{`export interface Slot {
  id: string;
  startTime: Date;
  endTime: Date;
  timeZone: string;
  isAvailable: boolean;
}`}
        </Text>
        <Text style={styles.bulletPoint}>• <Text style={styles.codeInline}>ValidationError</Text>:</Text>
        <Text style={styles.codeBlock}>
{`export interface ValidationError {
  field: string;
  message: string;
}`}
        </Text>
        <Text style={styles.subsectionHeader}>Type Guards and Utilities</Text>
        <Text style={styles.bulletPoint}>• Timezone validation against Moment.js database.</Text>
        <Text style={styles.bulletPoint}>• Strict date/time format validation.</Text>

        {/* 4. Utility Functions */}
        <Text style={styles.sectionHeader}>4. Utility Functions</Text>
        <Text style={styles.subsectionHeader}>Slot Generation (<Text style={styles.codeInline}>utils/slotGenerator.ts</Text>)</Text>
        <Text style={styles.bulletPoint}>• <Text style={styles.codeInline}>validateSlotConfig(config: SlotConfig): ValidationError[]</Text>: Validates config for date/time format, ranges, durations, and timezone.</Text>
        <Text style={styles.bulletPoint}>• <Text style={styles.codeInline}>generateSlots(config: SlotConfig): Slot[]</Text>: Iterates date range, calculates daily slots, applies timezone, and generates unique IDs. Handles DST, leap years, and edge cases.</Text>
        <Text style={styles.bulletPoint}>• <Text style={styles.codeInline}>getAvailableSlots(slots, currentTime, bufferDuration, selectedTimeZone?): Slot[]</Text>: Filters slots by current time, buffer, timezone, and booking status.</Text>
        <Text style={styles.subsectionHeader}>Date/Time Utilities</Text>
        <Text style={styles.bulletPoint}>• Formatting, timezone conversion, and relative time calculation helpers.</Text>

        {/* 5. State Management */}
        <Text style={styles.sectionHeader}>5. State Management</Text>
        <Text style={styles.subsectionHeader}>Local State Strategy</Text>
        <Text style={styles.bulletPoint}>• Uses React <Text style={styles.codeInline}>useState</Text> and <Text style={styles.codeInline}>useEffect</Text> for local state.</Text>
        <Text style={styles.bulletPoint}>• Derived state via <Text style={styles.codeInline}>useMemo</Text> and <Text style={styles.codeInline}>useEffect</Text> for efficiency.</Text>
        <Text style={styles.bulletPoint}>• No persistence yet; consider AsyncStorage or secure storage for production.</Text>
        <Text style={styles.subsectionHeader}>Future Considerations</Text>
        <Text style={styles.bulletPoint}>• Redux Toolkit, Zustand, React Query, or Recoil for larger apps.</Text>

        {/* 6. Navigation Structure */}
        <Text style={styles.sectionHeader}>6. Navigation Structure</Text>
        <Text style={styles.subsectionHeader}>Expo Router Implementation</Text>
        <Text style={styles.codeBlock}>
{`app/
├── _layout.tsx
├── (tabs)/
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── SlotsViewScreen.tsx
`}
        </Text>

        {/* 7-10. Placeholders */}
        <Text style={styles.sectionHeader}>7. Performance Considerations</Text>
        <Text style={styles.paragraph}>Optimized list rendering, memoization, and minimal re-renders.</Text>
        <Text style={styles.sectionHeader}>8. Security Considerations</Text>
        <Text style={styles.paragraph}>No sensitive data stored; consider secure storage for production.</Text>
        <Text style={styles.sectionHeader}>9. Error Handling</Text>
        <Text style={styles.paragraph}>Comprehensive validation and user-friendly error messages.</Text>
        <Text style={styles.sectionHeader}>10. Testing Strategy</Text>
        <Text style={styles.paragraph}>Unit tests for utilities and validation; integration tests for screens.</Text>

        {/* 11. Deep Linking Usage */}
        <Text style={styles.sectionHeader}>11. Deep Linking Usage</Text>
        <Text style={styles.paragraph}>
          The Vosita Slots Management Application supports deep linking to navigate directly to the Slots View screen with a pre-selected time zone. This works on both native (iOS/Android) and web platforms.
        </Text>
        <Text style={styles.bulletPoint}>• Deep linking logic is handled in <Text style={styles.codeInline}>useSlotsViewLogic</Text> (<Text style={styles.codeInline}>hooks/useSlotsViewLogic.ts</Text>).</Text>
        <Text style={styles.bulletPoint}>• The <Text style={styles.codeInline}>timezone</Text> query parameter is extracted and used as <Text style={styles.codeInline}>initialTimezone</Text>.</Text>
        <Text style={styles.subsectionHeader}>Deep Linking Configuration</Text>
        <Text style={styles.bulletPoint}>• <Text style={styles.codeInline}>scheme</Text> in <Text style={styles.codeInline}>app.json</Text> is <Text style={styles.codeInline}>vositaslotsapp</Text>.</Text>
        <Text style={styles.codeBlock}>
{`{
  "expo": {
    "scheme": "vositaslotsapp",
    "deepLinks": [
      {
        "path": "slots-view",
        "queryParams": {
          "timezone": "string"
        }
      }
    ]
  }
}`}
        </Text>
        <Text style={styles.subsectionHeader}>Deep Link Format</Text>
        <Text style={styles.codeBlock}>
vositaslotsapp://slots-view?timezone=America/New_York
        </Text>

        <Text style={styles.subsectionHeader}>Testing Deep Linking</Text>
        <Text style={styles.bulletPoint}>• Web: <Text style={styles.codeInline}>http://localhost:8081/slots-view?timezone=America/Chicago</Text></Text>
        <Text style={styles.bulletPoint}>• iOS Simulator: <Text style={styles.codeInline}>xcrun simctl openurl booted vositaslotsapp://slots-view?timezone=America/Chicago</Text></Text>
        <Text style={styles.bulletPoint}>• Android Emulator: <Text style={styles.codeInline}>adb shell am start -a android.intent.action.VIEW -d "vositaslotsapp://slots-view?timezone=America/Chicago"</Text></Text>
        <Text style={styles.paragraph}>
          Update <Text style={styles.codeInline}>scheme</Text> in <Text style={styles.codeInline}>app.json</Text> if needed and test on all platforms.
        </Text>

        <View style={styles.footerSpace} />
      </ScrollView>
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  subheader: {
    fontSize: 18,
    color: '#7f8c8d',
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
    marginTop: 24,
    marginBottom: 12,
  },
  subsectionHeader: {
    fontSize: 17,
    fontWeight: '500',
    color: '#34495e',
    marginTop: 16,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
    color: '#34495e',
    marginBottom: 12,
  },
  bulletPoint: {
    fontSize: 15,
    lineHeight: 22,
    color: '#34495e',
    marginLeft: 15,
    marginBottom: 4,
  },
  tocItem: {
    fontSize: 15,
    lineHeight: 22,
    color: '#3498db',
    marginBottom: 6,
  },
  codeBlock: {
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    backgroundColor: '#eaeaea',
    padding: 10,
    borderRadius: 5,
    marginVertical: 8,
    fontSize: 13,
  },
  codeInline: {
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    backgroundColor: '#eaeaea',
    borderRadius: 3,
    paddingHorizontal: 3,
    fontSize: 13,
  },
  separator: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 16,
  },
  footerSpace: {
    height: 50,
  },
});