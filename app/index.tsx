import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, ActivityIndicator } from 'react-native';

// Simple LoadingScreen component
function LoadingScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#0000ff" />
    </View>
  );
}

export default function Index() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuthStatus = async () => {
      // Check if a valid token exists in AsyncStorage
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        // If a token exists, set the logged-in state to true
        setIsLoggedIn(true);
      } else {
        // If no token, set logged-in state to false
        setIsLoggedIn(false);
      }
    };

    checkAuthStatus();
  }, []);

  if (isLoggedIn === null) {
    // Optionally, you can show a loading spinner while checking
    return <LoadingScreen />;
  }

  // Redirect to the appropriate screen based on login status
  return isLoggedIn ? <Redirect href="/user" /> : <Redirect href="/auth/login" />;
}
