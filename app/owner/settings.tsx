import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert, Animated, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function OwnerSettings() {
  const router = useRouter();

  // Bottom nav setup
  const bottomNavItems = [
    { icon: 'home', label: 'Home', route: '/owner/profile' },
    { icon: 'notifications', label: 'Notifications', route: '/owner/notifications' },
    { icon: 'settings', label: 'Settings', route: '/owner/settings' },
  ];
  const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
  const bottomNavScaleValues = React.useRef(bottomNavItems.map(() => new Animated.Value(1))).current;
  const createPressHandlers = (index) => ({
    onPressIn: () => Animated.spring(bottomNavScaleValues[index], { toValue: 0.95, useNativeDriver: true }).start(),
    onPressOut: () => Animated.spring(bottomNavScaleValues[index], { toValue: 1, friction: 3, tension: 40, useNativeDriver: true }).start(),
  });

  const handleLogout = async () => {
    // Clear token/session (adjust as per your auth logic)
    await AsyncStorage.removeItem('token');
    // Optionally clear other user data here
    Alert.alert('Logged out', 'You have been logged out.');
    router.replace('auth/login'); // Adjust path to your login screen
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={{ height: 32 }} />
        <Text style={styles.title}>Settings</Text>
        <TouchableOpacity
          style={styles.option}
          onPress={() => router.push('/owner/edit-profile')}
        >
          <MaterialIcons name="edit" size={22} color="#A65E5E" style={{ marginRight: 12 }} />
          <Text style={styles.optionText}>Edit Profile</Text>
        </TouchableOpacity>
         <TouchableOpacity
          style={styles.option}
          onPress={handleLogout}
        >
          <MaterialIcons name="logout" size={22} color="#A65E5E" style={{ marginRight: 12 }} />
          <Text style={styles.optionText}>Logout</Text>
        </TouchableOpacity>
      </View>
      <View style={{ height: 60 }} />
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee', flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 8 }}>
        {bottomNavItems.map((item, index) => {
          const { onPressIn, onPressOut } = createPressHandlers(index);
          return (
            <AnimatedPressable
              key={item.label}
              style={{ alignItems: 'center', flex: 1, transform: [{ scale: bottomNavScaleValues[index] }] }}
              onPress={() => router.push(item.route)}
              onPressIn={onPressIn}
              onPressOut={onPressOut}
            >
              <MaterialIcons name={item.icon} size={26} color={item.label === 'Settings' ? '#A65E5E' : '#777'} />
              <Text style={{ color: item.label === 'Settings' ? '#A65E5E' : '#777', fontSize: 12 }}>{item.label}</Text>
            </AnimatedPressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff8f8',
  },
  container: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#6B2E2E',
    marginBottom: 24,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0dede',
  },
  optionText: {
    fontSize: 18,
    color: '#6B2E2E',
    fontWeight: '500',
  },
}); 