import axios from 'axios';
import { createClient } from '../supabase/client';

/**
 * Base API client for making HTTP requests to API endpoints
 * Uses axios with proper auth headers and error handling
 */
const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use(async (config) => {
  const supabase = createClient();
  const { data } = await supabase.auth.getSession();
  
  if (data.session?.access_token) {
    config.headers.Authorization = `Bearer ${data.session.access_token}`;
  }
  
  return config;
});

// Handle common error responses
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      // Handle specific error codes
      switch (error.response.status) {
        case 401:
          // Unauthorized - could trigger a redirect to login
          console.error('Authentication required:', error.response.data);
          break;
        case 403:
          // Forbidden
          console.error('Permission denied:', error.response.data);
          break;
        case 404:
          // Not Found
          console.error('Resource not found:', error.response.data);
          break;
        default:
          console.error('API error:', error.response.data);
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('No response received:', error.request);
    } else {
      // Error before request was made
      console.error('Request error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient; 