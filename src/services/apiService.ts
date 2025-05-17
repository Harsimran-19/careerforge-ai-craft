
import axios from 'axios';
import { ChatRequest } from '../pages/api/chat';

// Base API URL for internal API (proxied to Supabase Functions)
const API_BASE_URL = '/api'; // Using the proxy we set up in vite.config.ts

// Create API clients for different services
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Get the actual URLs from environment variables
const JOB_SEARCH_API_URL = import.meta.env.VITE_JOB_SEARCH_API_URL || 'http://localhost:8000';

// Use a proxy for the Sophie backend to avoid CORS issues
// Instead of directly accessing the external URL, we'll go through our local proxy
const RESUME_API_URL = '/sophie-api';  // This maps to the proxy we set up in vite.config.ts

// Log actual environment variables
console.log('API Service - Using URLs:', { JOB_SEARCH_API_URL, RESUME_API_URL });

// Job Search API client
const jobSearchApiClient = axios.create({
  baseURL: JOB_SEARCH_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Resume API client
const resumeApiClient = axios.create({
  baseURL: RESUME_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Resume API interfaces
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

export interface ResumeData {
  resume: any; // Allow any schema for flexibility
}

// Job search API interfaces
export interface Job {
  id?: string;
  location?: string;
  title?: string;
  company?: string;
  description?: string;
  jobProvider?: string;
  url?: string;
  rating?: number;
  rating_description?: string;
  company_rating?: number;
  company_rating_description?: string;
}

export interface JobResults {
  jobs?: Job[];
}

// API functions
export const optimizeResumeAPI = async (resumeFile: File, jobUrl?: string, jobText?: string): Promise<{ result: any }> => {
  try {
    // Create form data
    const formData = new FormData();
    formData.append('resume_file', resumeFile);

    // Append either job URL or job text, depending on what's provided
    if (jobUrl) {
      formData.append('job_url', jobUrl);
    } else if (jobText) {
      formData.append('job_text', jobText);
    }

    // Call the API with form data
    const response = await resumeApiClient.post('/optimize-resume', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('API Response:', response.data);
    
    // Return the data as is, without trying to parse it here
    // The calling function will handle whether it's a string or object
    return response.data;
  } catch (error: any) {
    console.error('Error optimizing resume:', error);
    throw error;
  }
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

  const response = await resumeApiClient.post('/generate-cover-letter', formData, {
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

export const sendChatRequestAPI = async (request: ChatRequest): Promise<{ content: string }> => {
  const response = await apiClient.post('/chat', request);
  return response.data;
};

export const searchJobsAPI = async (query: string): Promise<JobResults> => {
  // Use the job search API client to call the external job search API
  // For now, we're still using the internal API route until we get the actual URL
  const response = await jobSearchApiClient.post('/search', { query });
  return response.data;
};

/**
 * Configure the API URLs for external services
 * @param jobSearchApiUrl URL for the job search API
 * @param resumeApiUrl URL for the resume API
 */
export const configureApiUrls = (jobSearchApiUrl?: string, resumeApiUrl?: string) => {
  // Only update if the URLs are not example URLs and are actually valid
  const validJobSearchUrl = jobSearchApiUrl && !jobSearchApiUrl.includes('example.com') ? jobSearchApiUrl : JOB_SEARCH_API_URL;
  const validResumeUrl = resumeApiUrl && !resumeApiUrl.includes('example.com') ? resumeApiUrl : RESUME_API_URL;
  
  console.log('Configuring API URLs with:', { validJobSearchUrl, validResumeUrl });
  
  // Set the base URLs directly
  jobSearchApiClient.defaults.baseURL = validJobSearchUrl;
  resumeApiClient.defaults.baseURL = validResumeUrl;
};

/**
 * Convert resume data to PDF
 * @param data Resume data in JSON format
 * @returns PDF file as a blob
 */
export const convertResumeToPdfAPI = async (data: ResumeData): Promise<Blob> => {
  try {
    // Use the internal API route if the external API URL is not configured
    const response = await resumeApiClient.post('/convert/resume-to-pdf', data, {
      responseType: 'blob',
    });

    return response.data;
  } catch (error) {
    console.error("Error converting resume to PDF:", error);

    // Create a simple PDF blob with error message as fallback
    const errorPdfBlob = new Blob(
      [`Error converting resume to PDF. Please make sure the Resume API URL is configured correctly.`],
      { type: 'application/pdf' }
    );

    throw error;
  }
};

/**
 * Extract text from a PDF file using the sophie-api
 * @param pdfFile PDF file to extract text from
 * @returns Extracted text from the PDF
 */
export const extractPdfTextAPI = async (pdfFile: File): Promise<string> => {
  try {
    // Create form data
    const formData = new FormData();
    formData.append('file', pdfFile);

    // Call the API with form data
    const response = await resumeApiClient.post('/extract-pdf-text', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // Check if the response contains the extracted text
    if (response.data && response.data.extracted_text) {
      return response.data.extracted_text;
    } else {
      throw new Error('No text extracted from PDF');
    }
  } catch (error: any) {
    console.error('Error extracting PDF text:', error);
    throw error;
  }
};

export default {
  optimizeResumeAPI,
  generateCoverLetterAPI,
  parseJobUrlAPI,
  sendChatRequestAPI,
  searchJobsAPI,
  convertResumeToPdfAPI,
  configureApiUrls,
  extractPdfTextAPI,
};
