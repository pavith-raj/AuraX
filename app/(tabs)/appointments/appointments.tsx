import React, { useContext, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import BottomNavBar from '../../../components/BottomNav';
import { fetchAppointments, cancelAppointment } from '../../../api/appointments';
import { AuthContext } from '../../../context/AuthContext';

const AppointmentsPage = () => {
  const { user } = useContext(AuthContext); 
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelingId, setCancelingId] = useState(null);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const data = await fetchAppointments(user._id); 
      setAppointments(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load appointments');
    }
    setLoading(false);
  };

useEffect(() => {
  if (user && user._id) {
    loadAppointments();
  }
}, [user]);

  const handleCancel = async (id) => {
    setCancelingId(id);
    try {
      await cancelAppointment(id);
      loadAppointments();
    } catch (error) {
      Alert.alert('Error', 'Failed to cancel appointment');
    }
    setCancelingId(null);
  };

  const renderItem = ({ item }) => (
    <View style={styles.appointmentCard}>
      <Text style={styles.salonName}>{item.salonName || item.salon || 'Salon'}</Text>
      <Text style={styles.serviceName}>{item.service}</Text>
      <Text style={styles.appointmentDetails}>{`${item.date}, ${item.time}`}</Text>
      <Text style={[styles.statusText, { color: item.status === 'Scheduled' ? '#2e7d32' : '#888' }]}>
        {item.status}
      </Text>
      {item.status === 'Scheduled' && (
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => handleCancel(item._id)}
          disabled={cancelingId === item._id}
        >
          <Text style={styles.cancelBtnText}>
            {cancelingId === item._id ? 'Cancelling...' : 'Cancel Appointment'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <>
      <View style={styles.container}>
        <Text style={styles.title}>Your Appointments</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#A65E5E" style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={appointments}
            renderItem={renderItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.appointmentList}
            ListEmptyComponent={
              <Text style={{ color: '#888', textAlign: 'center', marginTop: 40 }}>
                No appointments found.
              </Text>
            }
          />
        )}
      </View>
      <BottomNavBar activeTab="appointments" />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAD8D8',
    padding: 16,
    paddingTop: 60,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#3B3B3B',
    marginBottom: 16,
  },
  appointmentList: {
    paddingBottom: 100,
  },
  appointmentCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  salonName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#A65E5E',
    marginBottom: 4,
  },
  serviceName: {
    fontSize: 16,
    color: '#555',
    marginBottom: 4,
  },
  appointmentDetails: {
    fontSize: 14,
    color: '#777',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  cancelBtn: {
    backgroundColor: '#A65E5E',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default AppointmentsPage;