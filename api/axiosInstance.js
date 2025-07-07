import axios from 'axios';
import { getToken } from './storage';

const api = axios.create({
  baseURL: 'http://192.168.6.85:5000/api',
  timeout: 60000, // 60 seconds timeout
});

api.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
