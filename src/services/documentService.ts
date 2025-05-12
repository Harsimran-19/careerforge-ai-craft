
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

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
  job_title: string;
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
export const fetchResumes = async (): Promise<Resume[]> => {
  const { data, error } = await supabase
    .from('resumes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Resume[];
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

  // Save resume metadata to database
  const { data, error } = await supabase
    .from('resumes')
    .insert({
      title,
      file_path: filePath,
      file_url: publicUrl,
      user_id: user.id
    })
    .select()
    .single();

  if (error) throw error;
  return data as Resume;
};

export const deleteResume = async (id: string): Promise<void> => {
  // First get the resume to get the file path
  const { data: resume, error: fetchError } = await supabase
    .from('resumes')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError) throw fetchError;

  // Delete from storage
  if (resume.file_path) {
    const { error: storageError } = await supabase.storage
      .from('resumes')
      .remove([resume.file_path]);
      
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

export const optimizeResume = async (params: OptimizeResumeParams): Promise<TailoredResume> => {
  // This would make an API call to the resume optimization endpoint
  // For now, we'll create a mock implementation that simulates the process
  
  const { resumeId, jobUrl, jobText } = params;
  
  // Get the original resume
  const { data: resume, error: fetchError } = await supabase
    .from('resumes')
    .select('*')
    .eq('id', resumeId)
    .single();
    
  if (fetchError) throw fetchError;

  // In a real implementation, you'd call your API here with the resume file and job details
  // For now, we'll just create a placeholder entry in the database
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");
  
  const { data, error } = await supabase
    .from('tailored_resumes')
    .insert({
      original_resume_id: resumeId,
      job_id: jobUrl ? jobUrl : 'manual-entry',
      file_path: resume.file_path,  // In reality, this would be a new file path
      file_url: resume.file_url,    // In reality, this would be a new URL
      user_id: user.id
    })
    .select()
    .single();
    
  if (error) throw error;
  return data as TailoredResume;
};

export const generateCoverLetter = async (params: GenerateCoverLetterParams): Promise<CoverLetter> => {
  // This would make an API call to the cover letter generation endpoint
  // For now, we'll create a mock implementation
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");
  
  const { data, error } = await supabase
    .from('cover_letters')
    .insert({
      content: `This is a placeholder for a cover letter for ${params.role} at ${params.company}`,
      job_title: params.role,
      company: params.company,
      user_id: user.id
    })
    .select()
    .single();
    
  if (error) throw error;
  return data as CoverLetter;
};

// Job parsing service
export const parseJobUrl = async (jobUrl: string): Promise<{
  jobTitle: string;
  company: string;
  jobDescription: string;
}> => {
  // In a real implementation, this would call an API that crawls the job URL
  // For now, we'll return a placeholder
  return {
    jobTitle: "Software Engineer",
    company: "Example Corp",
    jobDescription: "This is a placeholder job description extracted from the URL"
  };
};
