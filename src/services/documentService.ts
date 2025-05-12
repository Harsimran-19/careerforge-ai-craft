
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { Json } from '@/integrations/supabase/types';

// Types that match the Supabase database schema
export interface Resume {
  id: string;
  title: string;
  content: Json; // JSON content from database
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface CoverLetter {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

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

export const uploadResumeContent = async (title: string, content: any): Promise<Resume> => {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error("User not authenticated");

  // Save resume to database
  const { data, error } = await supabase
    .from('resumes')
    .insert({
      title,
      content,
      user_id: user.id
    })
    .select()
    .single();

  if (error) throw error;
  return data as Resume;
};

export const deleteResume = async (id: string): Promise<void> => {
  // Delete from database
  const { error } = await supabase
    .from('resumes')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// API Service for resume optimization
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

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");
  
  const jobId = jobUrl ? jobUrl : 'manual-entry';
  const mockFilePath = `tailored_resumes/${user.id}/${uuidv4()}.pdf`;
  const mockFileUrl = `https://storage.example.com/${mockFilePath}`;
  
  // Create the tailored resume entry
  const { data, error } = await supabase
    .from('tailored_resumes')
    .insert({
      original_resume_id: resumeId,
      job_id: jobId,
      file_path: mockFilePath,
      file_url: mockFileUrl,
      user_id: user.id
    })
    .select()
    .single();
    
  if (error) throw error;
  return data as TailoredResume;
};

export const generateCoverLetter = async (params: GenerateCoverLetterParams): Promise<CoverLetter> => {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");
  
  const coverLetterTitle = `Cover Letter for ${params.role} at ${params.company}`;
  const coverLetterContent = `This is a placeholder for a cover letter for ${params.role} at ${params.company}`;
  
  const { data, error } = await supabase
    .from('cover_letters')
    .insert({
      title: coverLetterTitle,
      content: coverLetterContent,
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
