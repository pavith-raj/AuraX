import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { bookAppointment, fetchAvailableSlots } from '../../../api/appointments'; 
import { fetchServices } from '../../../api/apiService';
import { AuthContext } from '../../../context/AuthContext';

// Define a type for Service
interface Service {
  _id: string;
  name: string;
}

export default function AppointmentBooking() {
  const router = useRouter();
  const { user } = useContext(AuthContext);

  const { salonId, salonName, salonAddress, salonRating } = useLocalSearchParams();

  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);

  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [time, setTime] = useState('');
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [stylist, setStylist] = useState('');
  const [notes, setNotes] = useState('');

  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    const loadServices = async () => {
      try {
        const services = await fetchServices(salonId);
        setAvailableServices(services);
      } catch (error) {
        console.error('Failed to fetch services:', error);
      }
    };

    if (salonId) {
      loadServices();
    }
  }, [salonId]);

  // Fetch available slots when date or salonId changes
  useEffect(() => {
    const fetchSlots = async () => {
      if (!salonId || !date) return;
      setLoadingSlots(true);
      try {
        const slots = await fetchAvailableSlots(date.toISOString().split('T')[0], salonId);
        setAvailableSlots(slots);
      } catch (error) {
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };
    fetchSlots();
  }, [date, salonId]);

  const handleBooking = async () => {
    if (!selectedServices.length || !time) {
      alert('Please select at least one service and time');
      return;
    }
    if (!availableSlots.includes(time)) {
      alert('Selected time slot is not available. Please choose another.');
      return;
    }
    const appointmentData = {
      userId: user?._id,
      salonId,
      service: selectedServices[0]?._id,
      serviceName: selectedServices[0]?.name,
      date: date.toISOString().split('T')[0],
      time,
      stylist,
      notes,
    };
    try {
      await bookAppointment(appointmentData);
      alert('Appointment booked!');
      router.push('/(tabs)/appointments/appointments');
    } catch (error: any) {
      if (error?.response?.status === 409) {
        alert('Slot not available. Please select another time.');
        // Refresh available slots
        const slots = await fetchAvailableSlots(date.toISOString().split('T')[0], salonId);
        setAvailableSlots(slots);
        setTime('');
      } else {
        alert(error?.response?.data?.message || 'Failed to book appointment');
      }
    }
  };

  return (
    <>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#A65E5E' }}>

    
    {/* Back Button*/}
    <View style={styles.header}>
      <TouchableOpacity onPress={()=> router.replace('/user/salons/salonslist?fromBooking=1')} style={styles.backButton}>
        <MaterialIcons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>
    </View>
    <ScrollView style={styles.container}contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.title}>Book Appointment</Text>

      {/* Salon Info */}
      <View style={styles.card}>
        <Text style={styles.label}>Salon:</Text>
        <Text style={styles.text}>{salonName}</Text>
        <Text style={styles.text}>📍 {salonAddress} | ⭐ {salonRating}</Text>
      </View>

      {/* Service Input */}
        <Text style={styles.label}>Select Service(s)</Text>
        {availableServices.length === 0 ? (
          <Text style={{ color: '#888', marginBottom: 10 }}>No services available</Text>
        ) : (
          availableServices.map((service) => (
  <TouchableOpacity
    key={service._id}
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    }}
    onPress={() => {
      setSelectedServices(prev =>
        prev.some(s => s._id === service._id)
          ? prev.filter(s => s._id !== service._id)
          : [...prev, service]
      );
    }}
  >
    <View
      style={{
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#A65E5E',
        backgroundColor: selectedServices.some(s => s._id === service._id) ? '#A65E5E' : '#fff',
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {selectedServices.some(s => s._id === service._id) && (
        <MaterialIcons name="check" size={16} color="#fff" />
      )}
    </View>
    <Text style={{ fontSize: 16 }}>{service.name}</Text>
  </TouchableOpacity>
))
        )}

      {/* Date Picker */}
      <Text style={styles.label}>Select Date</Text>
      <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
        <Text>{date.toDateString()}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          minimumDate={new Date()}
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) setDate(selectedDate);
          }}
        />
      )}

      {/* Time Input */}
      <Text style={styles.label}>Select Time</Text>
      {loadingSlots ? (
        <Text style={{ color: '#888' }}>Loading available slots...</Text>
      ) : availableSlots.length === 0 ? (
        <Text style={{ color: 'red' }}>No slots available for this date.</Text>
      ) : (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 }}>
          {availableSlots.map(slot => (
            <TouchableOpacity
              key={slot}
              style={{
                backgroundColor: time === slot ? '#A65E5E' : '#fff',
                borderColor: '#A65E5E',
                borderWidth: 1,
                borderRadius: 6,
                padding: 8,
                margin: 4,
              }}
              onPress={() => setTime(slot)}
            >
              <Text style={{ color: time === slot ? '#fff' : '#A65E5E' }}>{slot}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Stylist Input */}
      <Text style={styles.label}>Preferred Stylist (Optional)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Priya"
        value={stylist}
        onChangeText={setStylist}
      />

      {/* Notes */}
      <Text style={styles.label}>Notes (Optional)</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        placeholder="Any specific instructions?"
        value={notes}
        onChangeText={setNotes}
        multiline
      />

      {/* Submit Button */}
      <TouchableOpacity style={styles.button} onPress={handleBooking}>
        <Text style={styles.buttonText}>Book Appointment</Text>
      </TouchableOpacity>
    </ScrollView>
    </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  container: { 
    padding: 20, 
    backgroundColor: '#F7E8E8', 
  },
  title: { 
    fontSize: 26, 
    fontWeight: 'bold', 
    marginBottom: 20, 
    textAlign: 'center' 
  },
  card: { 
    backgroundColor: '#fff', 
    padding: 16, 
    borderRadius: 10, 
    marginBottom: 20 
  },
  label: { fontSize: 16, 
    fontWeight: '600', 
    marginBottom: 6 
  },
  text: { 
    fontSize: 14, 
    color: '#444' 
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  button: {
    backgroundColor: '#000',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
});
