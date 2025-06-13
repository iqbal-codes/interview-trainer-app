import apiClient from './apiClient';

export interface ProfileData {
  full_name?: string;
  years_of_experience?: number;
  primary_roles_pursued?: string[];
  key_skills?: string[];
  industries_of_interest?: string[];
}

const authService = {
  /**
   * Update or create user profile information
   */
  updateProfile: async (profileData: ProfileData) => {
    const response = await apiClient.post('/auth/profile', profileData);
    return response.data;
  },
  
  /**
   * Get current user profile information
   */
  getProfile: async () => {
    const response = await apiClient.get('/auth/profile');
    return response.data;
  },
  
  /**
   * Verify email with token
   */
  verifyEmail: async (token: string) => {
    const response = await apiClient.post('/auth/verify', { token });
    return response.data;
  },
  
  /**
   * Request password reset
   */
  requestPasswordReset: async (email: string) => {
    const response = await apiClient.post('/auth/reset-password', { email });
    return response.data;
  },
  
  /**
   * Complete password reset with token
   */
  resetPassword: async (token: string, password: string) => {
    const response = await apiClient.post('/auth/reset-password/confirm', { token, password });
    return response.data;
  }
};

export default authService; 