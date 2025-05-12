
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { Json } from '@/integrations/supabase/types';

// Define more specific types for the resume content structure
export interface ResumeContent {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
    linkedin: string;
    website: string;
  };
  summary: string;
  education: {
    id: string;
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startDate: string;
    endDate: string;
    description: string;
  }[];
  experience: {
    id: string;
    company: string;
    position: string;
    location: string;
    startDate: string;
    endDate: string;
    description: string;
    highlights: string[];
  }[];
  skills: string[];
  certifications: {
    id: string;
    name: string;
    issuer: string;
    date: string;
    description: string;
  }[];
  projects: {
    id: string;
    name: string;
    description: string;
    url: string;
    highlights: string[];
  }[];
}

// Types that match the Supabase database schema
export interface Resume {
  id: string;
  title: string;
  content: ResumeContent;
  created_at: string;
  updated_at: string;
  user_id: string;
  file_path?: string; // Optional field for file path
  file_url?: string; // Optional field for file URL
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
  
  // Ensure the content is properly structured
  return (data as any[]).map(resume => ({
    ...resume,
    content: typeof resume.content === 'string' 
      ? JSON.parse(resume.content) 
      : resume.content
  })) as Resume[];
};

// Add the missing uploadResume function that's being imported in Resumes.tsx
export const uploadResume = async (file: File, title: string): Promise<Resume> => {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error("User not authenticated");

  // Upload file to storage
  const filePath = `resumes/${user.id}/${uuidv4()}-${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  // Get the public URL for the uploaded file
  const { data: { publicUrl } } = supabase.storage
    .from('documents')
    .getPublicUrl(filePath);

  // Save resume metadata to database
  const { data, error } = await supabase
    .from('resumes')
    .insert({
      title,
      content: {} as any, // Empty JSON object for now
      user_id: user.id,
      file_path: filePath,
      file_url: publicUrl
    })
    .select()
    .single();

  if (error) {
    // If there was an error saving to database, clean up the uploaded file
    await supabase.storage.from('documents').remove([filePath]);
    throw error;
  }

  return data as Resume;
};

export const uploadResumeContent = async (title: string, content: ResumeContent): Promise<Resume> => {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error("User not authenticated");

  // Save resume to database
  const { data, error } = await supabase
    .from('resumes')
    .insert({
      title,
      content: content as unknown as Json,
      user_id: user.id
    })
    .select()
    .single();

  if (error) throw error;
  return data as Resume;
};

export const deleteResume = async (id: string): Promise<void> => {
  // Get the resume to find the file path
  const { data: resume, error: fetchError } = await supabase
    .from('resumes')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError) throw fetchError;

  // Delete the file from storage if file_path exists
  if (resume?.file_path) {
    const { error: deleteFileError } = await supabase.storage
      .from('documents')
      .remove([resume.file_path]);
    
    // Log but don't throw on file deletion error
    if (deleteFileError) {
      console.error("Error deleting file:", deleteFileError);
    }
  }

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
