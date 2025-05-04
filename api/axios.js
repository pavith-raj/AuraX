import axios from 'axios';

const API = axios.create({
    baseURL: 'http://192.168.1.72:5000/api',  // actual server IP and port
    timeout: 5000,  // Request timeout in milliseconds
});

export default API;
