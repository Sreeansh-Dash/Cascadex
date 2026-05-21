/**
 * Cascadex API Client
 * Axios instance configured for the FastAPI backend.
 * Points to Render deployment or localhost for dev.
 */
import axios, { AxiosError } from 'axios';

// TODO: Update with actual Render URL after deployment
const BASE_URL = 'https://cascadex-api.onrender.com';

export const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      console.error(
        `[Cascadex API] ${error.response.status}: ${error.config?.url}`,
        error.response.data
      );
    } else if (error.request) {
      console.error('[Cascadex API] No response received:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
