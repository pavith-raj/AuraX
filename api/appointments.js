import axios from 'axios'; // or use fetch

const handleBooking = async () => {
  try {
    await axios.post('http://192.168.45.81:5000/api/appointments', {
      salonId,
      service,
      date,
      time,
      stylist,
      notes,
    });
    alert('Appointment booked!');
    router.push('/(tabs)/appointments');
  } catch (error) {
    alert('Failed to book appointment');
  }
};