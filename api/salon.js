import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.45.81:5000/api';

export const getSalons = async () => {
    try {
        const response = await axios.get(`${API_URL}/salons`);
        return response.data;
    } catch (error) {
        console.error('Error fetching salons:', error.message);
        throw error;
    }
};