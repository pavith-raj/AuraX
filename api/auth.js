import api from './axiosInstance';

// Register a new user or salon owner
export const registerUser = async (userData) => {
    if (userData.role === 'owner') {
        return await api.post('/auth/register-salon', userData);
    } else {
        // Normal user registration
        return await api.post('/auth/register', userData);
    }
    
};

// Log in a user
export const loginUser = async (userData) => {
    return await api.post('/auth/login', userData);
};
