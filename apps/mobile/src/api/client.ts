/**
 * Cascadex API Client
 * Axios instance configured for the FastAPI backend.
 * Points to Render deployment or localhost for dev.
 */
import axios, { AxiosError } from 'axios';

// TODO: Update with actual Render URL after deployment
// Triggering mobile CI build
const BASE_URL = 'https://cascadex-api.onrender.com';

export const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 60000, // Increased to 60s to handle Render free-tier cold starts
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling and retries
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as any;
    
    // If we have a timeout or network error, retry once
    if (!config._retry && (!error.response || error.code === 'ECONNABORTED')) {
      config._retry = true;
      console.warn(`[Cascadex API] Network error or timeout. Retrying request to ${config.url}...`);
      return api(config);
    }

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
