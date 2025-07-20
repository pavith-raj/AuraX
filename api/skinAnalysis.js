import axiosInstance from './axiosInstance';

export const analyzeSkinImage = async (imageUri) => {
  try {
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg', 
      name: 'skin_image.jpg',
    });

    const response = await axiosInstance.post('/skin/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Skin analysis error:', error);
    throw error;
  }
};

export const analyzeAcneSeverity = async (imageUri) => {
  try {
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'acne_image.jpg',
    });

    const response = await axiosInstance.post('/skin/acne-grade', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Acne severity analysis error:', error);
    throw error;
  }
};

export const getManualRecommendations = async (condition) => {
  try {
    const response = await axiosInstance.get(`/products/${condition}`);
    return response.data;
  } catch (error) {
    console.error('Manual recommendations error:', error);
    throw error;
  }
};

export const getRefinedRecommendations = async (refinedCondition) => {
  try {
    const response = await axiosInstance.get(`/products/${refinedCondition}`);
    return response.data;
  } catch (error) {
    console.error('Refined recommendations error:', error);
    throw error;
  }
};

export const fetchProductsForCondition = async (condition) => {
  try {
    const response = await axiosInstance.get(`/products/${condition}`);
    return response.data;
  } catch (error) {
    console.error('Fetch products error:', error);
    throw error;
  }
};

export const getProductRecommendations = async (condition) => {
  try {
    const response = await axiosInstance.get(`/products/${condition}`);
    return response.data;
  } catch (error) {
    console.error('Get product recommendations error:', error);
    throw error;
  }
};

export const getAvailableConditions = async () => {
  try {
    const response = await axiosInstance.get('/skin/conditions');
    return response.data;
  } catch (error) {
    console.error('Get conditions error:', error);
    throw error;
  }
};