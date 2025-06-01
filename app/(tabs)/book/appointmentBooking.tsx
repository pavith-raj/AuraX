import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AppointmentBooking() {
  const router = useRouter();

  const [service, setService] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [time, setTime] = useState('');
  const [stylist, setStylist] = useState('');
  const [notes, setNotes] = useState('');

  const handleBooking = () => {
    console.log({
      service,
      date: date.toDateString(),
      time,
      stylist,
      notes,
    });
    alert('Appointment booked!');
    router.push('/(tabs)/appointments');
  };

  return (
    <>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#EAD8D8' }}>

    
    {/* Back Button*/}
    <View style={styles.header}>
      <TouchableOpacity onPress={()=> router.back()} style={styles.backButton}>
        <MaterialIcons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>
    </View>
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Book Appointment</Text>

      {/* Salon Info */}
      <View style={styles.card}>
        <Text style={styles.label}>Salon:</Text>
        <Text style={styles.text}>Glamor Studio</Text>
        <Text style={styles.text}>📍 Mangalore | ⭐ 4.8</Text>
      </View>

      {/* Service Input */}
      <Text style={styles.label}>Select Service</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Haircut, Facial"
        value={service}
        onChangeText={setService}
      />

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
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) setDate(selectedDate);
          }}
        />
      )}

      {/* Time Input */}
      <Text style={styles.label}>Select Time</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 10:30 AM"
        value={time}
        onChangeText={setTime}
      />

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
    flex: 1 
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
