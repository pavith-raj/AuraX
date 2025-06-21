import api from './axiosInstance';

export const analyzeSkinImage = async (imageUri) => {
  const formData = new FormData();
  formData.append('image', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'skin_image.jpg',
  });

  try {
    const response = await api.post('/skin/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error analyzing skin image:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const getManualRecommendations = async (condition) => {
  try {
    const response = await api.get(`/skin/recommendations/${condition}`);
    return response.data;
  } catch (error) {
    console.error('Error getting manual recommendations:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const getRefinedRecommendations = async (keyword) => {
  try {
    const response = await api.get(`/skin/recommendations/refined/${keyword}`);
    return response.data;
  } catch (error) {
    console.error('Error getting refined recommendations:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const getProductRecommendations = async (condition) => {
  try {
    const response = await api.get(`/skin/recommendations/${condition}`);
    return response.data;
  } catch (error) {
    console.error('Get recommendations error:', error);
    throw error;
  }
};

export const getAvailableConditions = async () => {
  try {
    const response = await api.get('/skin/conditions');
    return response.data;
  } catch (error) {
    console.error('Get conditions error:', error);
    throw error;
  }
}; 