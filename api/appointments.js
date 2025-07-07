import api from './axiosInstance';

// Fetch all appointments for a user
export const fetchAppointments = async (userId) => {
  const res = await api.get(`/appointments/user/${userId}`);
  return res.data;
};

// Book a new appointment
export const bookAppointment = async (appointmentData) => {
  const res = await api.post('/appointments', appointmentData);
  return res.data;
};

// Cancel an appointment
export const cancelAppointment = async (appointmentId) => {
  const res = await api.put(`/appointments/${appointmentId}/cancel`);
  return res.data;
};

// Fetch available slots for a date and salon
export const fetchAvailableSlots = async (date, salonId) => {
  const res = await api.get(`/appointments/available-slots`, { params: { date, salonId } });
  return res.data.available;
};

// Fetch all appointments for a salon (owner)
export const fetchSalonAppointments = async (salonId) => {
  const res = await api.get(`/appointments/salon/${salonId}`);
  return res.data;
};

// Update appointment status
export const updateAppointmentStatus = async (appointmentId, status) => {
  const res = await api.put(`/appointments/${appointmentId}/status`, { status });
  return res.data;
};

// Fetch today's bookings count for a salon
export const fetchTodayBookingCount = async (salonId) => {
  const res = await api.get(`/appointments/salon/${salonId}/today-count`);
  return res.data.count;
};

// Fetch bookings count per date for a salon (for calendar)
export const fetchDateBookingCounts = async (salonId) => {
  const res = await api.get(`/appointments/salon/${salonId}/date-counts`);
  return res.data.dateCounts;
};