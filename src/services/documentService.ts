
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
  resume_id?: string; // ID of the actual resume containing the content
}

// Resume Functions
export const fetchResumes = async (): Promise<Resume[]> => {
  const { data, error } = await supabase
    .from('resumes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Ensure the content is properly structured
  return (data || []).map(resume => ({
    ...resume,
    content: typeof resume.content === 'string'
      ? JSON.parse(resume.content)
      : (resume.content as unknown as ResumeContent)
  })) as Resume[];
};

// Add the missing uploadResume function that's being imported in Resumes.tsx
export const uploadResume = async (file: File, title: string): Promise<Resume> => {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("User not authenticated");

  // Upload file to storage
  // Use 'resumes' bucket instead of 'documents' - this matches the bucket name in Supabase
  const filePath = `resumes/${user.id}/${uuidv4()}-${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from('resumes')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  // Get the public URL for the uploaded file
  const { data: { publicUrl } } = supabase.storage
    .from('resumes')
    .getPublicUrl(filePath);

  // Save resume metadata to database with file info in the content
  const resumeContent = {
    personalInfo: {
      name: "",
      email: "",
      phone: "",
      address: "",
      linkedin: "",
      website: ""
    },
    summary: "",
    education: [],
    experience: [],
    skills: [],
    certifications: [],
    projects: [],
    // Store file information in the content object since there are no separate columns
    file_path: filePath,
    file_url: publicUrl
  };

  const { data, error } = await supabase
    .from('resumes')
    .insert({
      title,
      content: resumeContent as Json,
      user_id: user.id
    })
    .select()
    .single();

  if (error) {
    // If there was an error saving to database, clean up the uploaded file
    await supabase.storage.from('resumes').remove([filePath]);
    throw error;
  }

  // Cast to the proper Resume type including the file_path property
  return {
    ...data,
    content: data.content as unknown as ResumeContent
  } as Resume;
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

  return {
    ...data,
    content: data.content as unknown as ResumeContent
  } as Resume;
};

export const deleteResume = async (id: string): Promise<void> => {
  try {
    // Get the resume to find the file path
    const { data: resume, error: fetchError } = await supabase
      .from('resumes')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    // Check if this resume is referenced in applications table
    const { data: applications, error: appError } = await supabase
      .from('applications')
      .select('id')
      .eq('resume_id', id);

    if (appError) throw appError;
      
    // Check if this resume is referenced in tailored_resumes table
    const { data: tailoredResumes, error: tailoredError } = await supabase
      .from('tailored_resumes')
      .select('id')
      .eq('original_resume_id', id);
      
    if (tailoredError) throw tailoredError;
    
    // First delete references in applications table if they exist
    if (applications && applications.length > 0) {
      // Option 1: Delete the applications that reference this resume
      const { error: deleteAppError } = await supabase
        .from('applications')
        .delete()
        .eq('resume_id', id);
        
      if (deleteAppError) throw deleteAppError;
      
      // Option 2 (alternative): Set resume_id to null in applications
      // const { error: updateAppError } = await supabase
      //   .from('applications')
      //   .update({ resume_id: null })
      //   .eq('resume_id', id);
      //   
      // if (updateAppError) throw updateAppError;
    }
    
    // Delete references in tailored_resumes table if they exist
    if (tailoredResumes && tailoredResumes.length > 0) {
      const { error: deleteTailoredError } = await supabase
        .from('tailored_resumes')
        .delete()
        .eq('original_resume_id', id);
        
      if (deleteTailoredError) throw deleteTailoredError;
    }

    // Delete the file from storage if file_path exists in the content
    if (resume && resume.content && typeof resume.content === 'object') {
      const content = resume.content as any;
      if (content.file_path) {
        const { error: deleteFileError } = await supabase.storage
          .from('resumes')
          .remove([content.file_path]);

        // Log but don't throw on file deletion error
        if (deleteFileError) {
          console.error("Error deleting file:", deleteFileError);
        }
      }
    }

    // Delete from database
    const { error } = await supabase
      .from('resumes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error("Error in deleteResume:", error);
    throw error;
  }
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

export const optimizeResume = async (params: OptimizeResumeParams): Promise<Resume> => {
  // This function now makes a real API call to the resume optimization endpoint
  const { resumeId, jobUrl, jobText } = params;

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  try {
    // First, fetch the resume to get the file path or content
    const originalResume = await fetchResumeById(resumeId);

    // Check if the resume has a file_path or file_url
    const filePath = originalResume.file_path ||
                    (originalResume.content as any)?.file_path;

    if (!filePath) {
      throw new Error("Resume file not found. Please upload a resume file first.");
    }

    // Download the file from Supabase storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('resumes')
      .download(filePath);

    if (downloadError || !fileData) {
      throw new Error(`Error downloading resume file: ${downloadError?.message || "Unknown error"}`);
    }

    // Convert the downloaded data to a File object
    const resumeFile = new File([fileData], filePath.split('/').pop() || 'resume.pdf', {
      type: 'application/pdf'
    });

    // Import the API function
    const { optimizeResumeAPI } = await import('@/services/apiService');

    // Call the API with the file and job details
    const optimizedResult = await optimizeResumeAPI(resumeFile, jobUrl, jobText);

    // Create a new resume with the optimized content
    const tailoredResumeTitle = `Tailored Resume for ${jobUrl ? 'Job URL' : 'Manual Entry'} - ${new Date().toLocaleDateString()}`;

    // Parse the optimized result into a proper resume content structure
    // The API might return an object or a JSON string, so we need to handle both cases
    let tailoredContent;
    
    try {
      if (optimizedResult.result) {
        // Check if result is already an object
        if (typeof optimizedResult.result === 'object') {
          tailoredContent = optimizedResult.result;
        } else {
          // If it's a string, try to parse it as JSON
          tailoredContent = JSON.parse(optimizedResult.result);
        }
      } else {
        // Fallback if no result was returned
        tailoredContent = {
          personalInfo: {
            name: "Your Name",
            email: "your.email@example.com",
            phone: "123-456-7890",
            address: "Your Address",
            linkedin: "https://linkedin.com/in/yourprofile",
            website: ""
          },
          summary: "Your professional summary tailored to the job.",
          education: [],
          experience: [],
          skills: [],
          certifications: [],
          projects: []
        };
      }
    } catch (parseError) {
      console.error("Error parsing API response:", parseError);
      // Use a default fallback structure if parsing fails
      tailoredContent = {
        personalInfo: {
          name: "Your Name",
          email: "your.email@example.com",
          phone: "123-456-7890",
          address: "Your Address",
          linkedin: "https://linkedin.com/in/yourprofile",
          website: ""
        },
        summary: "Your professional summary tailored to the job.",
        education: [],
        experience: [],
        skills: [],
        certifications: [],
        projects: []
      };
    }
    
    // Save the tailored resume to the database
    const { data: tailoredResume, error: tailoredResumeError } = await supabase
      .from('resumes')
      .insert({
        title: tailoredResumeTitle,
        content: tailoredContent as unknown as Json,
        user_id: user.id
      })
      .select()
      .single();

    if (tailoredResumeError) throw tailoredResumeError;

    // Create an entry in the tailored_resumes table to track the relationship
    const tailoredFilePath = `tailored_resumes/${user.id}/${uuidv4()}.pdf`;

    await supabase
      .from('tailored_resumes')
      .insert({
        original_resume_id: resumeId,
        job_id: jobUrl ? jobUrl : 'manual-entry',
        file_path: tailoredFilePath,
        file_url: null, // Will be updated when the PDF is generated
        user_id: user.id,
        resume_id: tailoredResume.id // Link to the new resume
      });

    // Return the new resume with properly structured content
    return {
      ...tailoredResume,
      content: typeof tailoredResume.content === 'string'
        ? JSON.parse(tailoredResume.content)
        : tailoredContent
    } as Resume;
  } catch (error) {
    console.error("Error optimizing resume:", error);
    throw error;
  }
};

export const generateCoverLetter = async (params: GenerateCoverLetterParams): Promise<CoverLetter> => {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  try {
    // First, fetch the original resume to get its file
    const originalResume = await fetchResumeById(params.resumeId);

    // Check if the resume has a file_path or file_url
    const filePath = originalResume.file_path ||
                    (originalResume.content as any)?.file_path;

    if (!filePath) {
      throw new Error("Resume file not found. Please upload a resume file first.");
    }

    // Download the file from Supabase storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('resumes')
      .download(filePath);

    if (downloadError || !fileData) {
      throw new Error(`Error downloading resume file: ${downloadError?.message || "Unknown error"}`);
    }

    // Convert the downloaded data to a File object
    const resumeFile = new File([fileData], filePath.split('/').pop() || 'resume.pdf', {
      type: 'application/pdf'
    });

    // Import the API function
    const { generateCoverLetterAPI } = await import('@/services/apiService');

    // Call the API with the file and job details
    const coverLetterResponse = await generateCoverLetterAPI(
      resumeFile,
      params.jobDescription,
      params.userName,
      params.company,
      params.manager,
      params.role,
      params.referral
    );

    // Create a title for the cover letter
    const coverLetterTitle = `Cover Letter for ${params.role} at ${params.company}`;

    // Get the content from the API response
    // If there are multiple variations, use the first one
    let coverLetterContent = "";
    if (coverLetterResponse.variations && coverLetterResponse.variations.length > 0) {
      coverLetterContent = coverLetterResponse.variations[0].content;
    } else {
      // Fallback content if the API doesn't return any variations
      const today = new Date().toLocaleDateString();
      coverLetterContent = `${today}\n\n${params.userName}\n\nDear ${params.manager || "Hiring Manager"},\n\nI am writing to express my interest in the ${params.role} position at ${params.company}.\n\n[Cover letter content will appear here when the API is properly configured.]\n\nSincerely,\n\n${params.userName}`;
    }

    // Save the cover letter to the database
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
  } catch (error) {
    console.error("Error generating cover letter:", error);
    throw error;
  }
};

// Function to update resume content
export const updateResumeContent = async (resumeId: string, content: ResumeContent): Promise<Resume> => {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  // Update resume in database
  const { data, error } = await supabase
    .from('resumes')
    .update({
      content: content as unknown as Json,
      updated_at: new Date().toISOString()
    })
    .eq('id', resumeId)
    .eq('user_id', user.id) // Ensure the user owns this resume
    .select()
    .single();

  if (error) throw error;

  return {
    ...data,
    content: data.content as unknown as ResumeContent
  } as Resume;
};

// Function to update cover letter
export const updateCoverLetter = async (coverLetterId: string, title: string, content: string): Promise<CoverLetter> => {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  // Update cover letter in database
  const { data, error } = await supabase
    .from('cover_letters')
    .update({
      title,
      content,
      updated_at: new Date().toISOString()
    })
    .eq('id', coverLetterId)
    .eq('user_id', user.id) // Ensure the user owns this cover letter
    .select()
    .single();

  if (error) throw error;

  return data as CoverLetter;
};

// Function to fetch a single resume by ID
export const fetchResumeById = async (resumeId: string): Promise<Resume> => {
  const { data, error } = await supabase
    .from('resumes')
    .select('*')
    .eq('id', resumeId)
    .single();

  if (error) throw error;

  return {
    ...data,
    content: typeof data.content === 'string'
      ? JSON.parse(data.content)
      : (data.content as unknown as ResumeContent)
  } as Resume;
};

// Function to fetch a single cover letter by ID
export const fetchCoverLetterById = async (coverLetterId: string): Promise<CoverLetter> => {
  const { data, error } = await supabase
    .from('cover_letters')
    .select('*')
    .eq('id', coverLetterId)
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
  try {
    // Import the API function
    const { parseJobUrlAPI } = await import('@/services/apiService');

    // Call the API with the job URL
    const jobData = await parseJobUrlAPI(jobUrl);

    // Return the parsed job data
    return {
      jobTitle: jobData.title,
      company: jobData.company,
      jobDescription: jobData.description
    };
  } catch (error) {
    console.error("Error parsing job URL:", error);

    // Provide a fallback response if the API call fails
    // This helps with graceful degradation
    const isAmazon = jobUrl.toLowerCase().includes('amazon');
    const isGoogle = jobUrl.toLowerCase().includes('google');
    const isMicrosoft = jobUrl.toLowerCase().includes('microsoft');

    let company = "Example Corp";
    let jobTitle = "Software Engineer";

    if (isAmazon) {
      company = "Amazon";
      jobTitle = "Software Development Engineer";
    } else if (isGoogle) {
      company = "Google";
      jobTitle = "Software Engineer";
    } else if (isMicrosoft) {
      company = "Microsoft";
      jobTitle = "Software Engineer";
    }

    return {
      jobTitle,
      company,
      jobDescription: `[API Error: Could not parse job description. Please check the URL and try again.] This is a placeholder for a ${jobTitle} position at ${company}.`
    };
  }
};
