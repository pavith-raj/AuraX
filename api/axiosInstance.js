import axios from 'axios';
import { getToken } from './storage';

const api = axios.create({
  baseURL: 'http://192.168.6.81:5000/api',
  timeout: 60000, // 60 seconds timeout
});

api.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    console.log('Axios Interceptor - Retrieved token:', token); // Debug log
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Axios Interceptor - Set Authorization header:', config.headers.Authorization); // Debug log
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
