import axios from 'axios';
import toast from 'react-hot-toast';
import { supabase } from './supabaseClient';
import { loaderService } from './utils/loaderService';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});

api.interceptors.request.use(async (config) => {
  loaderService.show();
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    return config;
  } catch (error) {
    loaderService.hide();
    throw error;
  }
}, (error) => {
    loaderService.hide();
    return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => {
    loaderService.hide();
    return response;
  },
  (error: any) => {
    loaderService.hide();
    if (error.response && error.response.status === 403) {
      // Check if it's our "No tenant" error
      if (error.response.data?.error?.includes('Access Denied')) {
        toast.error(
          "¡Cuenta no activada!\nContacta a ventas para adquirir tu licencia:\nventas@tufacturard.com",
          { duration: 6000, icon: '🔒' }
        );
      }
    }
    return Promise.reject(error);
  }
);

export default api;
