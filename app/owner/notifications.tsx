import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { fetchSalonAppointments } from '../../api/appointments';
import { useSalon } from '../../context/SalonContext';
import { SafeAreaView, StatusBar } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function OwnerNotifications() {
  const router = useRouter();
  const { salonId } = useSalon();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!salonId) return;
    setLoading(true);
    fetchSalonAppointments(salonId)
      .then(setAppointments)
      .catch(() => setAppointments([]))
      .finally(() => setLoading(false));
  }, [salonId]);

  // Sort by most recent
  const sortedAppointments = [...appointments].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const renderItem = ({ item }: any) => {
    let message = '';
    if (item.status === 'Scheduled') {
      message = `New booking for ${item.serviceName} on ${item.date} at ${item.time}`;
    } else if (item.status === 'Cancelled') {
      message = `Booking for ${item.serviceName} on ${item.date} at ${item.time} was cancelled.`;
    } else if (item.status === 'Completed') {
      message = `Booking for ${item.serviceName} on ${item.date} at ${item.time} was completed.`;
    }
    return (
      <View style={styles.notificationCard}>
        <Text style={styles.notificationText}>{message}</Text>
        <Text style={styles.timeText}>{new Date(item.createdAt).toLocaleString()}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#EAD8D8" barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Booking Notifications</Text>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#A65E5E" style={{ marginTop: 40 }} />
      ) : sortedAppointments.length === 0 ? (
        <Text style={{ textAlign: 'center', marginTop: 40, color: '#888' }}>No notifications yet.</Text>
      ) : (
        <FlatList
          data={sortedAppointments}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7E8E8',
  },
  header: {
    paddingTop: 32,
    paddingBottom: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
  },
  backButton: {
    marginRight: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#A65E5E',
  },
  notificationCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  notificationText: {
    fontSize: 16,
    color: '#6B2E2E',
    marginBottom: 6,
  },
  timeText: {
    fontSize: 13,
    color: '#888',
  },
}); 