import AsyncStorage from '@react-native-async-storage/async-storage';

export const storeToken = async (token) => {
  try {
    await AsyncStorage.setItem('token', token);
  } catch (error) {
    console.log('Error storing token:', error);
  }
};

export const getToken = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    return token;
  } catch (error) {
    console.log('Error getting token:', error);
    return null;
  }
};

export const removeToken = async () => {
  try {
    await AsyncStorage.removeItem('token');
  } catch (error) {
    console.log('Error removing token:', error);
  }
};
