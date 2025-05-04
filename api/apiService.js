import api from './axiosInstance';

export const getUserProfile = async () => {
  try {
    const res = await api.get('/auth/profile'); // Get user profile data
    return res.data; // Return the data from the response
  } catch (error) {
    console.log(error.response?.data?.message || 'An error occurred');
    throw error; // Throw the error to handle it in the UI
  }
};
