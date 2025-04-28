import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import BottomNavBar from '../../../components/BottomNav';  // adjust the path if needed

const appointmentsData = [
  { id: '1', salon: 'Salon 1', service: 'Haircut', date: '2025-04-30', time: '10:00 AM', status: 'Scheduled' },
  { id: '2', salon: 'Salon 2', service: 'Facial', date: '2025-05-02', time: '2:00 PM', status: 'Completed' },
  { id: '3', salon: 'Salon 3', service: 'Manicure', date: '2025-05-05', time: '11:30 AM', status: 'Scheduled' },
];

const AppointmentsPage = () => {
  const renderItem = ({ item }) => (
    <View style={styles.appointmentCard}>
      <Text style={styles.salonName}>{item.salon}</Text>
      <Text style={styles.serviceName}>{item.service}</Text>
      <Text style={styles.appointmentDetails}>{`${item.date}, ${item.time}`}</Text>
      <Text style={[styles.statusText, { color: item.status === 'Scheduled' ? '#2e7d32' : '#888' }]}>
        {item.status}
      </Text>

      {item.status === 'Scheduled' && (
        <TouchableOpacity style={styles.cancelBtn}>
          <Text style={styles.cancelBtnText}>Cancel Appointment</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <>
    <View style={styles.container}>
      <Text style={styles.title}>Your Appointments</Text>
      <FlatList
        data={appointmentsData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.appointmentList}
      />
    </View>
        <BottomNavBar activeTab='appointments' />
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
