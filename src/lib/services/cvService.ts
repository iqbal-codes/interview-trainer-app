import apiClient from './apiClient';

export interface CVUpload {
  id: string;
  file_name: string;
  storage_path: string;
  mime_type: string;
  file_size_bytes: number;
  uploaded_at: string;
  is_current_cv: boolean;
}

export interface CVContent {
  text: string;
  extracted_skills: string[];
  extracted_experience: string[];
}

const cvService = {
  /**
   * Get all CV uploads for the current user
   */
  getCVUploads: async (): Promise<CVUpload[]> => {
    const response = await apiClient.get('/cv');
    return response.data;
  },
  
  /**
   * Get a specific CV upload
   */
  getCVUpload: async (cvId: string): Promise<CVUpload> => {
    const response = await apiClient.get(`/cv/${cvId}`);
    return response.data;
  },

  /**
   * Upload a new CV file
   * Returns the upload details and processed CV content
   */
  uploadCV: async (file: File): Promise<{ upload: CVUpload; content: CVContent }> => {
    // We need to use FormData for file uploads
    const formData = new FormData();
    formData.append('file', file);
    
    // Override the content-type header for multipart/form-data
    const response = await apiClient.post('/cv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },
  
  /**
   * Delete a CV upload
   */
  deleteCV: async (cvId: string): Promise<{ success: boolean }> => {
    const response = await apiClient.delete(`/cv/${cvId}`);
    return response.data;
  },
  
  /**
   * Set a specific CV as the current one
   */
  setCurrentCV: async (cvId: string): Promise<{ success: boolean }> => {
    const response = await apiClient.post(`/cv/${cvId}/set-current`);
    return response.data;
  },
  
  /**
   * Get the extracted content of a CV
   */
  getCVContent: async (cvId: string): Promise<CVContent> => {
    const response = await apiClient.get(`/cv/${cvId}/content`);
    return response.data;
  }
};

export default cvService; 