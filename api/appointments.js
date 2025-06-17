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