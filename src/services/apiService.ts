
import axios from 'axios';

const API_BASE_URL = '/api'; // Using the proxy we set up in vite.config.ts

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface OptimizeResumeResponse {
  result: string;
}

export interface CoverLetterVariation {
  content: string;
  metadata: Record<string, any>;
}

export interface CoverLetterResponse {
  variations: CoverLetterVariation[];
}

// API functions
export const optimizeResumeAPI = async (
  resumeFile: File, 
  jobUrl?: string, 
  jobText?: string
): Promise<OptimizeResumeResponse> => {
  const formData = new FormData();
  formData.append('resume_file', resumeFile);
  
  if (jobUrl) {
    formData.append('job_url', jobUrl);
  }
  
  if (jobText) {
    formData.append('job_text', jobText);
  }
  
  formData.append('return_latex', 'false');
  
  const response = await apiClient.post('/optimize-resume', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

export const generateCoverLetterAPI = async (
  resumeFile: File,
  jobDescription: string,
  userName: string,
  company: string,
  manager: string,
  role: string,
  referral?: string
): Promise<CoverLetterResponse> => {
  const formData = new FormData();
  formData.append('file', resumeFile);
  formData.append('job_description', jobDescription);
  formData.append('user_name', userName);
  formData.append('company', company);
  formData.append('manager', manager);
  formData.append('role', role);
  
  if (referral) {
    formData.append('referral', referral);
  }
  
  const response = await apiClient.post('/generate-cover-letter', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

export const parseJobUrlAPI = async (url: string): Promise<{
  title: string;
  company: string;
  description: string;
}> => {
  const response = await apiClient.post('/parse-job-url', { url });
  return response.data;
};

export default {
  optimizeResumeAPI,
  generateCoverLetterAPI,
  parseJobUrlAPI,
};
