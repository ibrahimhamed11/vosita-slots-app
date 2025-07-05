import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs, useRouter } from 'expo-router';
import { Pressable, useColorScheme } from 'react-native';
import { useTheme } from 'react-native-paper';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return (
    <FontAwesome 
      size={24} 
      style={{ marginBottom: -3 }} 
      {...props} 
      accessibilityElementsHidden={true}
      importantForAccessibility="no"
    />
  );
}

function HeaderRight() {
  const theme = useTheme();
  
  return (
    <Link href="/modal" asChild>
      <Pressable
        style={{
          marginRight: 15,
          padding: 8,
        }}
        accessibilityLabel="App information"
        accessibilityHint="Opens app information and help screen"
        accessibilityRole="button"
      >
        {({ pressed }) => (
          <FontAwesome
            name="info-circle"
            size={20}
            color={theme.colors.onSurface}
            style={{ 
              opacity: pressed ? 0.5 : 1,
            }}
          />
        )}
      </Pressable>
    </Link>
  );
}

function OpenSlotsViewModalButton() {
  const router = useRouter();
  const theme = useTheme();

  return (
    <Pressable
      style={{
        marginRight: 15,
        padding: 8,
      }}
      accessibilityLabel="Open Slots View Modal"
      accessibilityHint="Opens the Slots View screen as a modal with a preset timezone"
      accessibilityRole="button"
      onPress={() => {
        router.push({
          pathname: '/slots-view',
          params: { timezone: 'America/New_York', modal: 'true' }
        });
      }}
    >
      {({ pressed }) => (
        <FontAwesome
          name="calendar-check-o"
          size={20}
          color={theme.colors.onSurface}
          style={{
            opacity: pressed ? 0.5 : 1,
          }}
        />
      )}
    </Pressable>
  );
}

export default function TabLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outline,
          borderTopWidth: 1,
          elevation: 8,
          shadowColor: theme.colors.shadow,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginBottom: 4,
        },
        headerStyle: {
          backgroundColor: theme.colors.surface,
          elevation: 4,
          shadowColor: theme.colors.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        headerTintColor: theme.colors.onSurface,
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Slots Generation',
          tabBarAccessibilityLabel: 'Slots Generation Tab',
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="calendar-plus-o" color={color} />
          ),
          headerRight: () => (
            <>
              <OpenSlotsViewModalButton />
              <HeaderRight />
            </>
          ),
          headerTitle: 'Generate Slots',
          headerTitleAlign: 'left',
        }}
      />
      <Tabs.Screen
        name="SlotsViewScreen"
        options={{
          title: 'Slots View',
          tabBarAccessibilityLabel: 'Slots View Tab',
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="calendar-check-o" color={color} />
          ),
          headerRight: () => <HeaderRight />,
          headerTitle: 'Available Slots',
          headerTitleAlign: 'left',
        }}
      />
    </Tabs>
  );
}

