
import axios from 'axios';
import { ResumeContent } from '../../services/documentService';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  resumeContent: ResumeContent;
  resumeTitle: string;
}

export const sendChatRequest = async (request: ChatRequest): Promise<{ content: string }> => {
  try {
    // Prepare the system prompt with resume content
    const resumeContext = `
Resume Title: ${request.resumeTitle}
Personal Info: ${request.resumeContent.personalInfo.name}, ${request.resumeContent.personalInfo.email}, ${request.resumeContent.personalInfo.phone}
Summary: ${request.resumeContent.summary}
Education: ${request.resumeContent.education.map(edu => 
  `${edu.degree} in ${edu.fieldOfStudy} at ${edu.institution} (${edu.startDate} - ${edu.endDate})`
).join('; ')}
Experience: ${request.resumeContent.experience.map(exp => 
  `${exp.position} at ${exp.company} (${exp.startDate} - ${exp.endDate}): ${exp.description}`
).join('; ')}
Skills: ${request.resumeContent.skills.join(', ')}
`;

    // Construct messages array with system prompt
    const messages = [
      {
        role: 'system',
        content: `You are an AI resume assistant. You're helping a user analyze and improve their resume. 
Here's the resume you're working with:

${resumeContext}

Provide thoughtful, specific feedback on the resume's strengths, weaknesses, and suggestions for improvement. 
Base your responses on best practices for resume writing and highlight specific areas of the resume that could be enhanced.
Keep your responses concise and actionable.`
      },
      ...request.messages
    ];

    // First try using the Groq API
    try {
      const groqApiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY || process.env.GROQ_API_KEY;
      
      if (!groqApiKey) {
        throw new Error('Groq API key not configured');
      }
      
      const groqResponse = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions', 
        {
          model: 'llama3-8b-8192',  // Using Llama3 8B model
          messages: messages,
          temperature: 0.7,
          max_tokens: 1000
        },
        {
          headers: {
            'Authorization': `Bearer ${groqApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        content: groqResponse.data.choices[0].message.content
      };
    } catch (groqError) {
      console.warn('Error with Groq API, falling back to OpenAI:', groqError);
      
      // Fall back to OpenAI if Groq fails
      const openaiApiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
      
      if (!openaiApiKey) {
        throw new Error('OpenAI API key not configured and Groq API failed');
      }
      
      const openaiResponse = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',  // Using a cost-effective model for the fallback
          messages: messages,
          temperature: 0.7,
          max_tokens: 1000
        },
        {
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return {
        content: openaiResponse.data.choices[0].message.content
      };
    }
    
  } catch (error) {
    console.error('Error in chat API:', error);
    throw new Error('Failed to get AI response from both Groq and OpenAI');
  }
};
