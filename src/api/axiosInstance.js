import axios from 'axios';

const api = axios.create({
  baseURL: 'https://kisancart.in/api/',
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

// Response interceptor to handle token expiration
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      // Token expired or invalid, clear authentication
      try {
        const AsyncStorage = await import('@react-native-async-storage/async-storage');
        await AsyncStorage.default.removeItem('token');
        await AsyncStorage.default.removeItem('user');
        
        // You can also dispatch a Redux action here if you have access to the store
        // For now, we'll just clear the storage
      } catch (clearError) {
        // Handle error silently
      }
    }
    return Promise.reject(error);
  }
);

export default api;
