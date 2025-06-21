import api from './axiosInstance';

export const getSalons = async () => {
    try {
        const response = await api.get('/salons');
        return response.data;
    } catch (error) {
        console.error('Failed to fetch salons:', error);
        throw error;
    }
};

export const getSalonDetails = async (id) => {
    try {
        const response = await api.get(`/salons/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch salon details for id ${id}:`, error);
        throw error;
    }
};