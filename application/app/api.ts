import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router'; // Ajoute cette ligne si tu utilises expo-router

export const IP = 'http://192.168.50.187:8000';
export const W = 'ws://192.168.50.187:8000';
const BASE_URL = `${IP}/app`; 


// Single axios instance with interceptors
const api = axios.create({
  baseURL: BASE_URL,
});

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token from storage:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for token refresh
api.interceptors.response.use(
  response => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Only attempt refresh on 401 errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = await AsyncStorage.getItem('refresh_token');
        if (!refreshToken) throw new Error('No refresh token available jjjj');
        
        const response = await axios.post(`${BASE_URL}/token/refresh/`, {
          refresh: refreshToken
        });
        
        const newAccessToken = response.data.access;
        await AsyncStorage.setItem('access_token', newAccessToken);
        
        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed hhh:', refreshError);
        // await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
        // Redirige vers la page de login
        router.replace('/auth/login'); // <-- Ajoute cette ligne
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
