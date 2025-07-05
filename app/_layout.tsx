
import React, { useState } from 'react';
import SplashScreen from '../screens/SplashScreen';
import RootLayout from '../navigation/root_layout';
import { PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { ThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useColorScheme } from 'react-native';

export default function AppLayout() {
  const [showSplash, setShowSplash] = useState(true);
  const colorScheme = useColorScheme();
  const paperTheme = colorScheme === 'dark' ? MD3DarkTheme : MD3LightTheme;
  const navigationTheme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  return (
    <PaperProvider theme={paperTheme}>
      <ThemeProvider value={navigationTheme}>
        {showSplash ? (
          <SplashScreen onFinish={handleSplashFinish} />
        ) : (
          <RootLayout />
        )}
      </ThemeProvider>
    </PaperProvider>
  );
}

