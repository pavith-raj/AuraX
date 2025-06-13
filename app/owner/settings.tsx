import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

export default function OwnerSettings() {
  const router = useRouter();
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
        {/* Add more settings options here */}
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