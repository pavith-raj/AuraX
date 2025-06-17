import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function OwnerSettings() {
  const router = useRouter();

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