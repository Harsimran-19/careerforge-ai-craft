
import axios from 'axios';
import { ResumeContent } from '../documentService';

interface ChatMessage {
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

    // We'll use a mock response for now since we don't have GROQ API key setup yet
    // This would be replaced with actual API call in a real implementation
    return {
      content: "I've analyzed your resume and can see several strengths. Your experience at your previous companies shows progressive responsibility. However, I'd suggest making your achievements more quantifiable by adding metrics where possible. For example, if you increased efficiency or sales, include the percentage. This would make your impact more concrete for potential employers."
    };

    // The code below would be used in a real implementation with a Groq API key
    /*
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions', 
      {
        model: 'llama3-8b-8192',
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      content: response.data.choices[0].message.content
    };
    */
  } catch (error) {
    console.error('Error in chat API:', error);
    throw new Error('Failed to get AI response');
  }
};
