import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// Production URL (Render)
const DEV_API_URL = 'https://facturacionelectronica-p0p6.onrender.com/api';

console.log('Using API URL:', DEV_API_URL);

const api = axios.create({
  baseURL: DEV_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request Interceptor: Inject Token
api.interceptors.request.use(request => {
    // Inject Token
    const token = useAuthStore.getState().token;
    if (token) {
        request.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`[API Request] ${request.method?.toUpperCase()} ${request.url}`);
    return request;
}, error => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
});

// Response Interceptor: Logging
api.interceptors.response.use(response => {
    console.log(`[API Response] ${response.status} ${response.config.url}`);
    return response;
}, error => {
    console.error('[API Response Error]', error.message);
    if (error.response) {
        console.error('Data:', error.response.data);
    }
    return Promise.reject(error);
});

export default api;
