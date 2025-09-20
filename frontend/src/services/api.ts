import axios from 'axios';
import CryptoJS from 'crypto-js';
import { LoginRequest, RegisterRequest, AuthResponse, User } from '../types/auth';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Encryption utilities
const SECRET_KEY = process.env.REACT_APP_ENCRYPTION_KEY || 'default-secret-key';

export const encryptData = (data: string): string => {
  return CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
};

export const decryptData = (encryptedData: string): string => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};

export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    // Temporarily disable encryption for debugging
    // const encryptedPassword = encryptData(password);
    const response = await api.post('/auth/login/', {
      email,
      password: password, // Send password as-is for now
    });
    return response.data;
  },

  register: async (email: string, username: string, password: string): Promise<AuthResponse> => {
    // Temporarily disable encryption for debugging
    // const encryptedPassword = encryptData(password);
    const response = await api.post('/auth/register/', {
      email,
      username,
      password: password, // Send password as-is for now
    });
    return response.data;
  },

  verifyToken: async (): Promise<User> => {
    const response = await api.get('/auth/verify/');
    return response.data;
  },
};

export const workoutApi = {
  getUserProfile: async (): Promise<any> => {
    const response = await api.get('/user-profile/');
    return response.data;
  },

  updateUserProfile: async (data: any): Promise<any> => {
    const response = await api.patch('/user-profile/', data);
    return response.data;
  },

  getWorkoutPlans: async (): Promise<any[]> => {
    const response = await api.get('/workout-plans/');
    return response.data;
  },

  createWorkoutPlan: async (data: any): Promise<any> => {
    const response = await api.post('/workout-plans/', data);
    return response.data;
  },

  updateWorkoutSession: async (sessionId: number, status: string): Promise<any> => {
    const response = await api.post(`/workout-sessions/${sessionId}/update_status/`, {
      status,
    });
    return response.data;
  },

  getWorkoutSessions: async (): Promise<any[]> => {
    const response = await api.get('/workout-sessions/');
    return response.data;
  },
};

export const calendarApi = {
  syncWithGoogle: async (): Promise<any> => {
    const response = await api.post('/calendar/sync/');
    return response.data;
  },

  getCalendarEvents: async (): Promise<any[]> => {
    const response = await api.get('/calendar/events/');
    return response.data;
  },
};

export default api;
