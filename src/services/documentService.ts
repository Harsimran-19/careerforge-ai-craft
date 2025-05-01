
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

// Resume Types
export interface Resume {
  id: string;
  title: string;
  content: any;
  created_at: string;
  updated_at: string;
}

// Cover Letter Types
export interface CoverLetter {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

// Resume Functions
export const fetchResumes = async () => {
  const { data, error } = await supabase
    .from('resumes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Resume[];
};

export const createResume = async (title: string, content: any) => {
  const { data, error } = await supabase
    .from('resumes')
    .insert([{ title, content }])
    .select()
    .single();

  if (error) throw error;
  return data as Resume;
};

export const updateResume = async (id: string, updates: Partial<Resume>) => {
  const { data, error } = await supabase
    .from('resumes')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Resume;
};

export const deleteResume = async (id: string) => {
  const { error } = await supabase
    .from('resumes')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// Generate a PDF from resume content and return URL
export const generateResumePDF = async (resume: Resume) => {
  try {
    // Convert resume content to HTML
    const html = resumeToHTML(resume);
    
    // Convert HTML to a Blob
    const blob = new Blob([html], { type: 'text/html' });
    const file = new File([blob], `${resume.title.replace(/\s+/g, '-').toLowerCase()}.html`, { 
      type: 'text/html' 
    });
    
    // Upload to Supabase Storage
    const filePath = `${uuidv4()}.html`;
    const { error: uploadError, data } = await supabase.storage
      .from('resumes')
      .upload(filePath, file);
      
    if (uploadError) throw uploadError;
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('resumes')
      .getPublicUrl(filePath);
      
    return publicUrl;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

// Helper to convert resume JSON to HTML
const resumeToHTML = (resume: Resume) => {
  // This is a simplified example, you would need to create a proper HTML structure based on your resume content
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${resume.title}</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1 { color: #333; }
        .section { margin-bottom: 20px; }
        .section-title { font-weight: bold; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
      </style>
    </head>
    <body>
      <h1>${resume.title}</h1>
      <div class="content">
        ${JSON.stringify(resume.content, null, 2)}
      </div>
    </body>
    </html>
  `;
};

// Cover Letter Functions
export const fetchCoverLetters = async () => {
  const { data, error } = await supabase
    .from('cover_letters')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as CoverLetter[];
};

export const createCoverLetter = async (title: string, content: string) => {
  const { data, error } = await supabase
    .from('cover_letters')
    .insert([{ title, content }])
    .select()
    .single();

  if (error) throw error;
  return data as CoverLetter;
};

export const updateCoverLetter = async (id: string, updates: Partial<CoverLetter>) => {
  const { data, error } = await supabase
    .from('cover_letters')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as CoverLetter;
};

export const deleteCoverLetter = async (id: string) => {
  const { error } = await supabase
    .from('cover_letters')
    .delete()
    .eq('id', id);

  if (error) throw error;
};
