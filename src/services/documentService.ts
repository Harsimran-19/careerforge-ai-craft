
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { optimizeResumeAPI, generateCoverLetterAPI, CoverLetterResponse, parseJobUrlAPI } from './apiService';

// Resume Types
export interface Resume {
  id: string;
  title: string;
  file_path: string;
  file_url: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

// Cover Letter Types
export interface CoverLetter {
  id: string;
  content: string;
  title: string; // Changed from job_title to title to match database schema
  company: string;
  created_at: string;
  user_id: string;
}

// Tailored Resume Types
export interface TailoredResume {
  id: string;
  original_resume_id: string;
  job_id: string;
  file_path: string;
  file_url: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

// Resume Functions
// Define a type that represents JSON data from Supabase
type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

// Define a type that matches what actually comes from the database
interface DbResume {
  id: string;
  title: string;
  content: {
    file_path: string;
    file_url: string;
    [key: string]: any;
  };
  created_at: string;
  updated_at: string;
  user_id: string;
}

export const fetchResumes = async (): Promise<Resume[]> => {
  const { data, error } = await supabase
    .from('resumes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  // Transform database response to match the Resume interface
  return (data as DbResume[]).map(item => {
    // Extract file information from the content field
    const content = item.content as { file_path?: string, file_url?: string } || {};
    
    return {
      id: item.id,
      title: item.title,
      file_path: content.file_path || '',
      file_url: content.file_url || '',
      created_at: item.created_at,
      updated_at: item.updated_at,
      user_id: item.user_id
    };
  });
};

export const uploadResume = async (file: File, title: string): Promise<Resume> => {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error("User not authenticated");

  // Upload file to storage
  const filePath = `resumes/${user.id}/${uuidv4()}-${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from('resumes')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  // Get the public URL
  const { data: { publicUrl } } = supabase.storage
    .from('resumes')
    .getPublicUrl(filePath);

  // Store file information in the content field as JSON
  const { data, error } = await supabase
    .from('resumes')
    .insert({
      title,
      content: {
        file_path: filePath,
        file_url: publicUrl
      },
      user_id: user.id
    })
    .select()
    .single();

  if (error) throw error;

  // Ensure content exists and has expected properties
  const content = data.content as { file_path: string, file_url: string };
  if (!content) {
    throw new Error('Resume content is missing');
  }
  
  // Transform database response to match the Resume interface
  return {
    id: data.id,
    title: data.title,
    file_path: content.file_path,
    file_url: content.file_url,
    created_at: data.created_at,
    updated_at: data.updated_at,
    user_id: data.user_id
  };
};

export const deleteResume = async (id: string): Promise<void> => {
  // First get the resume to get the file path
  const { data: resume, error: fetchError } = await supabase
    .from('resumes')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError) throw fetchError;

  // Extract file path from content field
  const content = resume.content as { file_path?: string } || {};
  const filePath = content.file_path;

  // Delete from storage
  if (filePath) {
    const { error: storageError } = await supabase.storage
      .from('resumes')
      .remove([filePath]);
      
    if (storageError) throw storageError;
  }

  // Delete from database
  const { error } = await supabase
    .from('resumes')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// API Service for resume optimization and cover letter generation
export interface OptimizeResumeParams {
  resumeId: string;
  jobUrl?: string;
  jobText?: string;
}

export interface GenerateCoverLetterParams {
  resumeId: string;
  jobDescription: string;
  userName: string;
  company: string;
  manager: string;
  role: string;
  referral?: string;
}

export const optimizeResume = async (params: OptimizeResumeParams): Promise<string> => {
  const { resumeId, jobUrl, jobText } = params;
  
  // Get the original resume file
  const { data: resume, error: fetchError } = await supabase
    .from('resumes')
    .select('*')
    .eq('id', resumeId)
    .single();
    
  if (fetchError) throw fetchError;
// Extract content with type assertion
const content = resume.content as { file_path: string, file_url: string } || {};
  // Download the resume file from storage
  const { data: fileData, error: downloadError } = await supabase.storage
    .from('resumes')
    .download(content.file_path);
    
  if (downloadError) throw downloadError;

  // Convert to File object
  const resumeFile = new File([fileData], content.file_path.split('/').pop() || 'resume.pdf', { 
    type: 'application/pdf' 
  });

  // Call the API service
  const result = await optimizeResumeAPI(resumeFile, jobUrl, jobText);
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");
  
  // Upload the result as a new tailored resume
  // In a real implementation, we would create a new PDF from the result and upload it
  const { data: tailoredResume, error } = await supabase
    .from('tailored_resumes')
    .insert({
      original_resume_id: resumeId,
      job_id: jobUrl || 'manual-entry',
      file_path: content.file_path,
      file_url: content.file_url,
      user_id: user.id
    })
    .select()
    .single();
  
  if (error) throw error;
  
  return result.result;
};

export const generateCoverLetter = async (params: GenerateCoverLetterParams): Promise<CoverLetterResponse> => {
  const { resumeId, jobDescription, userName, company, manager, role, referral } = params;
  
  // Get the original resume file
  const { data: resume, error: fetchError } = await supabase
    .from('resumes')
    .select('*')
    .eq('id', resumeId)
    .single();
    
  if (fetchError) throw fetchError;
  // Extract content with type assertion
  const content = resume.content as { file_path: string, file_url: string } || {};
  // Download the resume file from storage
  const { data: fileData, error: downloadError } = await supabase.storage
    .from('resumes')
    .download(content.file_path);
    
  if (downloadError) throw downloadError;

  // Convert to File object
  const resumeFile = new File([fileData], content.file_path.split('/').pop() || 'resume.pdf', { 
    type: 'application/pdf' 
  });

  // Call the API service
  const result = await generateCoverLetterAPI(
    resumeFile, 
    jobDescription,
    userName,
    company,
    manager,
    role,
    referral
  );
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  // Save to database
  if (result.variations && result.variations.length > 0) {
    const { error } = await supabase
  .from('cover_letters')
  .insert({
    content: result.variations[0].content,
    title: role,  // Change from job_title to title
    company: company,
    user_id: user.id
  });
    if (error) throw error;
  }
  
  return result;
};

// Job parsing service
export const parseJobUrl = async (jobUrl: string): Promise<{
  jobTitle: string;
  company: string;
  jobDescription: string;
}> => {
  // Call the API to parse the job URL
  const result = await parseJobUrlAPI(jobUrl);
  
  return {
    jobTitle: result.title,
    company: result.company,
    jobDescription: result.description
  };
};
