import React, { useContext, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import BottomNavBar from '../../../components/BottomNav';
import { fetchAppointments, cancelAppointment } from '../../../api/appointments';
import { AuthContext } from '../../../context/AuthContext';
import { getQueue, getMyQueueStatus } from '../../../api/apiService';
import { useRouter } from 'expo-router';

const AppointmentsPage = () => {
  const { user } = useContext(AuthContext); 
  const router = useRouter();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelingId, setCancelingId] = useState(null);
  const [queueStatus, setQueueStatus] = useState<any>(null);
  const [queueLoading, setQueueLoading] = useState(false);
  const [queuePosition, setQueuePosition] = useState<number | null>(null);
  const [queueWait, setQueueWait] = useState<number | null>(null);

  useEffect(() => {
    console.log('User from AuthContext:', user);
  }, [user]);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      console.log('Fetching appointments for user:', user?._id);
      const data = await fetchAppointments(user._id); 
      console.log('Fetched appointments:', data);
      
      // Sort appointments by date and time (earliest first)
      const sortedAppointments = data.sort((a: any, b: any) => {
        // First compare by date
        const dateComparison = new Date(a.date).getTime() - new Date(b.date).getTime();
        if (dateComparison !== 0) {
          return dateComparison;
        }
        
        // If dates are the same, compare by time
        const timeA = a.time.toLowerCase();
        const timeB = b.time.toLowerCase();
        return timeA.localeCompare(timeB);
      });
      
      setAppointments(sortedAppointments);
    } catch (error) {
      console.log('Error fetching appointments:', error);
      Alert.alert('Error', 'Failed to load appointments');
    }
    setLoading(false);
  };

useEffect(() => {
  if (user && user._id) {
    loadAppointments();
    fetchQueueStatus();
  }
}, [user]);

  const fetchQueueStatus = async () => {
    setQueueLoading(true);
    try {
      const entries = await getMyQueueStatus();
      if (entries && entries.length > 0) {
        const entry = entries.find((e: any) => e.userId === user._id);
        if (entry) {
          setQueueStatus(entry);
          // Fetch the full queue for this salon to get position and wait time
          const fullQueue = await getQueue(entry.salonId);
          const myIdx = fullQueue.findIndex((qe: any) => qe.userId === user._id);
          setQueuePosition(myIdx >= 0 ? myIdx + 1 : null);
          setQueueWait(myIdx >= 0 ? myIdx * 10 : null);
        } else {
          setQueueStatus(null);
          setQueuePosition(null);
          setQueueWait(null);
        }
      } else {
        setQueueStatus(null);
        setQueuePosition(null);
        setQueueWait(null);
      }
    } catch (e) {
      setQueueStatus(null);
      setQueuePosition(null);
      setQueueWait(null);
    }
    setQueueLoading(false);
  };

  const handleCancel = async (id: any) => {
    setCancelingId(id);
    try {
      await cancelAppointment(id);
      loadAppointments();
    } catch (error) {
      Alert.alert('Error', 'Failed to cancel appointment');
    }
    setCancelingId(null);
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.appointmentCard}>
      <Text style={styles.salonName}>{item.salonName || item.salon || 'Salon'}</Text>
      <Text style={styles.serviceName}>Service: {item.serviceName || item.service}</Text>
      <Text style={styles.appointmentDetails}>Appointment ID: {item._id}</Text>
      <Text style={styles.appointmentDetails}>Date: {item.date}, Time: {item.time}</Text>
      <Text style={styles.appointmentDetails}>Stylist: {item.stylist || 'N/A'}</Text>
      <Text style={styles.appointmentDetails}>Notes: {item.notes || 'None'}</Text>
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
        {/* My Queue Button at the top */}
        <TouchableOpacity
          style={{
            backgroundColor: '#fff',
            borderColor: '#A65E5E',
            borderWidth: 1,
            borderRadius: 8,
            paddingVertical: 10,
            paddingHorizontal: 18,
            alignItems: 'center',
            marginBottom: 18,
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
          onPress={() => {
            if (queueStatus && queueStatus.salonId) {
              // Navigate to queue screen with correct params
              router.push({
                pathname: '/(tabs)/queue/queue',
                params: {
                  salonId: queueStatus.salonId,
                  salonName: queueStatus.salonName || 'Salon',
                },
              });
            } else {
              Alert.alert('Queue', 'You are not currently in any walk-in queue.');
            }
          }}
        >
          <Text style={{ color: '#A65E5E', fontWeight: 'bold', fontSize: 15 }}>
            My Queue
          </Text>
          {queueLoading ? (
            <ActivityIndicator size="small" color="#A65E5E" style={{ marginLeft: 10 }} />
          ) : queueStatus && queuePosition !== null && queueWait !== null ? (
            <Text style={{ color: '#A65E5E', marginLeft: 10 }}>
              Position: #{queuePosition} • {queueWait} min
            </Text>
          ) : (
            <Text style={{ color: '#888', marginLeft: 10 }}>
              Not in queue
            </Text>
          )}
        </TouchableOpacity>
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
});export default AppointmentsPage;

