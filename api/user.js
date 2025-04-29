// app/api/user.js
import axios from 'axios';  // Use axios or fetch to make API calls

const API_URL = 'http://192.168.1.72:5000/api'; // Replace with your backend URL

export const getUserProfile = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/user/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;  // Returns user profile data
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (token, userData) => {
  try {
    const response = await axios.put(`${API_URL}/user/profile`, userData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;  // Returns updated user data
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};
