import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react'; // Import useCallback
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';


// Prevent the splash screen from auto-hiding BEFORE asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({ // Get both loaded status and error
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  
  const [isLoggedIn, setIsLoggedIn] = useState(false); // fake login status

  useEffect(() => {
    async function hideSplash() {

      if (fontsLoaded || fontError) {
        await SplashScreen.hideAsync();
      }
    }

    hideSplash();
  }, [fontsLoaded, fontError]); // Depend on both loaded status and error

  // Render null if fonts are still loading AND there's no error
  if (!fontsLoaded && !fontError) {
    return null; // Keep showing the native splash
  }

  // If fonts are loaded or there was an error, render the main app
  return (
    <SafeAreaProvider>
    <ThemeProvider value={ DefaultTheme }>
        <Stack initialRouteName={isLoggedIn ? '(tabs)' : 'auth/login'} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="auth/login" options={{ headerShown: false }} />
        <Stack.Screen name="auth/signup" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
    </SafeAreaProvider>
    
  );
}