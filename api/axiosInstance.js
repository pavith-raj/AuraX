import axios from 'axios';
import { getToken } from './storage';

const api = axios.create({
  baseURL: 'http://your_backend_ip:5000/api', // example: http://192.168.1.72:5000/api
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
