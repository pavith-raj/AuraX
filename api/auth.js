import API from './axios';

// Register a new user or salon owner
export const registerUser = async (userData) => {
    if (userData.role === 'owner') {
        return await API.post('/auth/register-salon', userData);
    } else {
        // Normal user registration
        return await API.post('/auth/register', userData);
    }
    
};

// Log in a user
export const loginUser = async (userData) => {
    return await API.post('/auth/login', userData);
};
