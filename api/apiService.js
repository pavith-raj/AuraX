import api from './axiosInstance';

export const fetchServices = async (salonId) => {
  if (!salonId) throw new Error('No salonId provided to fetchServices');
  const res = await api.get(`/salons/${salonId}`);
  return res.data.services || [];
};

export const addService = async (salonId, name) => {
  if (!salonId) throw new Error('No salonId provided to addService');
  // Get the response from the API call
  const res = await api.post(`/salons/${salonId}/services`, { name });
  // Return the data from the response
  return res.data;
};

export const editService = async (salonId, serviceId, name) => {
  if (!salonId) throw new Error('No salonId provided to editService');
  const res = await api.put(`/salons/${salonId}/services/${serviceId}`, { name });
  return res.data;
};

export const deleteService = async (salonId, serviceId) => {
  if (!salonId) throw new Error('No salonId provided to deleteService');
  const res = await api.delete(`/salons/${salonId}/services/${serviceId}`);
  return res.data; // Often delete returns a confirmation message or the deleted object ID
};

// Walk-in Queue API
export const getQueue = async (salonId) => {
  const res = await api.get(`/queue/${salonId}`);
  return res.data.queue;
};

export const joinQueue = async (salonId) => {
  const res = await api.post(`/queue/${salonId}/join`);
  return res.data.entry;
};

export const leaveQueue = async (salonId) => {
  const res = await api.post(`/queue/${salonId}/leave`);
  return res.data;
};

export const getMyQueueStatus = async () => {
  const res = await api.get('/queue/my');
  return res.data.entries;
};

export const addOfflineWalkIn = async (salonId, name) => {
  const res = await api.post(`/queue/${salonId}/add-offline`, { name });
  return res.data.entry;
};

export const removeQueueEntry = async (salonId, entryId) => {
  const res = await api.delete(`/queue/${salonId}/${entryId}`);
  return res.data;
};

export const getQueueCount = async (salonId) => {
  const res = await api.get(`/queue/${salonId}/count`);
  return res.data.count;
};