import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { customLightTheme, customDarkTheme } from '../styles/constants/theme';

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  const colorScheme = useColorScheme();
  const navigationTheme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;
  const paperTheme = colorScheme === 'dark' ? customDarkTheme : customLightTheme;

  useEffect(() => {
    const hideSplashScreen = async () => {
      if (fontError) {
        console.error('Font loading error:', fontError);
      }
      if (fontsLoaded || fontError) {
        await SplashScreen.hideAsync();
      }
    };

    hideSplashScreen();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <PaperProvider theme={paperTheme}>
      <ThemeProvider value={navigationTheme}>
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: paperTheme.colors.surface,
            },
            headerTintColor: paperTheme.colors.onSurface,
            headerTitleStyle: {
              fontWeight: 'bold',
            },
            gestureEnabled: true,
            headerShadowVisible: true,
            animation: 'slide_from_right',
          }}
        >
          
          <Stack.Screen 
            name="(tabs)" 
            options={{ 
              headerShown: false,
              title: 'Vosita Slots'
            }} 
          />
          
         
        </Stack>
      </ThemeProvider>
    </PaperProvider>
  );
}