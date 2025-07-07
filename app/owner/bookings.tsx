import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, FlatList, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { fetchSalonAppointments, updateAppointmentStatus } from '../../api/appointments';
import { useSalon } from '../../context/SalonContext';
import { SafeAreaView, StatusBar } from 'react-native';

export default function BookingsPage() {
  const router = useRouter();
  const { salonId } = useSalon();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!salonId) return;
    setLoading(true);
    fetchSalonAppointments(salonId)
      .then(setAppointments)
      .catch(() => Alert.alert('Error', 'Failed to fetch appointments'))
      .finally(() => setLoading(false));
  }, [salonId]);

  const handleStatusChange = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      await updateAppointmentStatus(id, status);
      setAppointments((prev) => prev.map(a => a._id === id ? { ...a, status } : a));
    } catch {
      Alert.alert('Error', 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <Text style={styles.service}>{item.serviceName}</Text>
      <Text style={styles.info}>Date: {item.date} | Time: {item.time}</Text>
      <Text style={styles.info}>Customer: {item.userId}</Text>
      <Text style={styles.status}>Status: {item.status}</Text>
      <View style={styles.actions}>
        {item.status !== 'Completed' && (
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => handleStatusChange(item._id, 'Completed')}
            disabled={updatingId === item._id}
          >
            <Text style={styles.actionText}>Mark Complete</Text>
          </TouchableOpacity>
        )}
        {item.status !== 'Cancelled' && (
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: '#e57373' }]}
            onPress={() => handleStatusChange(item._id, 'Cancelled')}
            disabled={updatingId === item._id}
          >
            <Text style={styles.actionText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#EAD8D8" barStyle="dark-content" />
      <View style={{ height: 32 }} />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Manage Bookings</Text>
        </View>
        {loading ? (
          <ActivityIndicator size="large" color="#A65E5E" style={{ marginTop: 40 }} />
        ) : appointments.length === 0 ? (
          <Text style={{ textAlign: 'center', marginTop: 40, color: '#888' }}>No bookings found.</Text>
        ) : (
          <FlatList
            data={appointments}
            keyExtractor={item => item._id}
            renderItem={renderItem}
            contentContainerStyle={{ padding: 16 }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

  safeArea: {
    flex: 1,
    backgroundColor: '#F7E8E8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  service: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#A65E5E',
    marginBottom: 4,
  },
  info: {
    fontSize: 15,
    color: '#555',
    marginBottom: 2,
  },
  status: {
    fontSize: 15,
    color: '#888',
    marginBottom: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    backgroundColor: '#A65E5E',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginRight: 10,
  },
  actionText: {
    color: '#fff',
    fontWeight: 'bold',
  },
}); 