import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function SalonDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); // This will capture salon ID when navigating

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Salon Details Page</Text>
      <Text style={styles.subtitle}>Salon ID: {id}</Text>

      {/* Example: Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center', backgroundColor: '#EAD8D8' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 18, marginBottom: 20 },
  backButton: { backgroundColor: '#A65E5E', padding: 10, borderRadius: 8 },
  backButtonText: { color: '#fff', fontWeight: 'bold' },
});
