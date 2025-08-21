import axios from 'axios';

const api = axios.create({
  baseURL: 'https://vegetables.walstarmedia.com/api/',
  headers: {
    'Content-Type': 'application/json',  
  },
});

api.interceptors.request.use(
  async config => {
    try {
      const AsyncStorage = await import('@react-native-async-storage/async-storage');
      const token = await AsyncStorage.default.getItem('token'); 
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('Failed to get token from AsyncStorage:', error);
      // Continue without token if AsyncStorage fails
    }
    return config;
  },
  error => Promise.reject(error)
);

export default api;
