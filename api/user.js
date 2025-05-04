// app/api/user.js
import axios from 'axios';  // Use axios or fetch to make API calls

const API_URL = 'http://192.168.1.72:5000/api';

export const getUserProfile = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/auth/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log('Full response:', response.data);
    return response.data.user;
  } catch (error) {
    console.error('Error fetching user profile:', error.message);
    throw error;
  }
};


export const updateUserProfile = async (token, userData) => {
  try {
    const response = await axios.put(`${API_URL}/auth/profile`, userData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log('Full response:', response.data);
    return response.data.user;

  } catch (error) {
    console.error('Error updating user profile:', error.message);
    throw error;
  }
};