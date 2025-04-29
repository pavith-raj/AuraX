import API from './axios';

// Register a new user
export const registerUser = async (userData) => {
    return await API.post('/auth/register', userData);
};

// Log in a user
export const loginUser = async (userData) => {
    return await API.post('/auth/login', userData);
};
