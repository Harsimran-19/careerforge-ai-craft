import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fetchResumes, Resume } from '@/services/documentService';
import { Loader2, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { OpenAI } from 'openai';
import axios from 'axios';
import { extractPdfTextAPI } from '@/services/apiService';

// Define message types
interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const ResumeBot = () => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your resume assistant. Please select a resume, and I can help analyze its strengths, weaknesses, and suggest improvements.'
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadResumes = async () => {
      try {
        const resumeData = await fetchResumes();
        setResumes(resumeData);
      } catch (error: any) {
        toast({
          title: 'Error loading resumes',
          description: error?.message || 'Failed to load your resumes',
          variant: 'destructive',
        });
      }
    };

    loadResumes();
  }, [toast]);

  useEffect(() => {
    if (selectedResumeId) {
      const resume = resumes.find(r => r.id === selectedResumeId);
      setSelectedResume(resume || null);

      if (resume) {
        setMessages([
          {
            role: 'assistant',
            content: `I've loaded your resume "${resume.title}". What would you like to know about it? I can analyze strengths, identify weaknesses, or suggest improvements.`
          }
        ]);
      }
    }
  }, [selectedResumeId, resumes]);

  const handleSendMessage = async () => {
    if (!input.trim() || !selectedResume) return;
    
    const userMessage = input.trim();
    setInput('');
    
    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    
    // Show loading indicator
    setIsLoading(true);
    console.log(selectedResume);
    try {
      // Get the PDF URL from either the resume object or content object
      // TypeScript fix: The file_url might be in the Resume object or in content
      const pdfUrl = selectedResume.file_url || 
                    (selectedResume.content as any)?.file_url || 
                    selectedResume.file_path || 
                    (selectedResume.content as any)?.file_path;
      
      if (!pdfUrl) {
        throw new Error('PDF URL not found in resume data');
      }
      
      console.log('Downloading and extracting text from PDF:', pdfUrl);
      
      // Function to extract text from a PDF using the API
      const extractTextFromPDF = async (pdfUrl: string): Promise<string> => {
        try {
          // Fetch the PDF file first
          const response = await axios.get(pdfUrl, {
            responseType: 'blob',
          });
          
          // Convert the blob response to a File object
          const pdfBlob = response.data;
          const pdfFile = new File([pdfBlob], 'resume.pdf', { type: 'application/pdf' });
          
          console.log('PDF downloaded, sending to extraction API...');
          
          // Use the new API to extract text
          const extractedText = await extractPdfTextAPI(pdfFile);
          return extractedText || 'No text content extracted from PDF.';
        } catch (error) {
          console.error('Error extracting text from PDF:', error);
          return `Error extracting text from PDF: ${error?.toString()}`;
        }
      };
      
      // Extract text from the PDF using the API
      const resumeText = await extractTextFromPDF(pdfUrl);
      console.log('Extracted resume text:', resumeText.substring(0, 200) + '...' + (resumeText.length > 200 ? '(truncated for logging)' : ''));
      
      // Create context with the actual resume content
      const resumeContext = `
Resume Title: ${selectedResume.title}

Resume Content:
${resumeText}

User Question: ${userMessage}
`;
      
      console.log('Sending actual resume content to Groq...');
      // Construct messages array with system prompt
      const messageHistory = [...messages, { role: 'user', content: userMessage }];
      const apiMessages = [
        {
          role: 'system',
          content: `You are an AI resume assistant. You're helping a user analyze and improve their resume. 
Here's the resume you're working with:

${resumeContext}

Provide thoughtful, specific feedback on the resume's strengths, weaknesses, and suggestions for improvement. 
Base your responses on best practices for resume writing and highlight specific areas of the resume that could be enhanced.
Keep your responses concise and actionable.`
        },
        ...messageHistory
      ];

      let aiResponseContent = '';

      // Use OpenAI client library with Groq's API
      const groqApiKey = import.meta.env.VITE_GROQ_API_KEY;
      
      if (!groqApiKey) {
        throw new Error('Groq API key not configured. Please add your Groq API key to the .env.local file as VITE_GROQ_API_KEY.');
      }
      
      try {
        console.log('Initializing OpenAI client with Groq configuration...');
        
        // Initialize OpenAI client with Groq's base URL and API key
        const openai = new OpenAI({
          apiKey: groqApiKey,
          baseURL: 'https://api.groq.com/openai/v1', // Groq's API endpoint
          dangerouslyAllowBrowser: true // Required for client-side usage
        });
        
        console.log('Sending request to Groq API via OpenAI client...');
        
        // Use OpenAI client to create a chat completion
        const groqResponse = await openai.chat.completions.create({
          model: 'llama-3.3-70b-versatile', // Using Llama3 8B model
          messages: apiMessages.map(msg => ({
            role: msg.role as 'user' | 'assistant' | 'system',
            content: msg.content
          })),
          temperature: 0.7,
          max_tokens: 1000
        });

        aiResponseContent = groqResponse.choices[0].message.content || 'No response content';
        console.log('Received response from Groq API via OpenAI client');
      } catch (error: any) {
        console.error('Error with Groq API via OpenAI client:', error);
        
        // Provide more detailed error information
        let errorMessage = 'Error connecting to Groq API.';
        
        if (error.status) {
          // Error with status code from OpenAI client
          errorMessage = `Groq API error (${error.status}): ${error.message || 'Unknown error'}`;
        } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
          // Network error
          errorMessage = 'No response received from Groq API. Please check your internet connection.';
        }
        
        throw new Error(errorMessage);
      }
      
      // Add AI response to chat
      setMessages(prev => [
        ...prev, 
        { role: 'assistant', content: aiResponseContent }
      ]);
    } catch (error: any) {
      console.error('Error in AI request:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Failed to get a response',
        variant: 'destructive',
      });
      
      // Add error message to chat
      setMessages(prev => [
        ...prev, 
        { 
          role: 'assistant', 
          content: 'Sorry, I encountered an error while processing your request. Please try again.' 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Resume Bot</h1>
      </div>
      
      <p className="text-muted-foreground">
        Chat with AI about your resume to get insights, identify strengths and weaknesses, or get improvement suggestions.
      </p>
      
      <div className="w-full max-w-sm">
        <Select
          value={selectedResumeId}
          onValueChange={setSelectedResumeId}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a resume" />
          </SelectTrigger>
          <SelectContent>
            {resumes.map((resume) => (
              <SelectItem key={resume.id} value={resume.id}>
                {resume.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {selectedResume && (
        <Card className="flex-1 flex flex-col">
          <CardHeader>
            <CardTitle>Chat with AI about: {selectedResume.title}</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-4">
              {messages.map((message, index) => (
                <div 
                  key={index}
                  className={`flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`p-3 rounded-lg max-w-[80%] ${
                      message.role === 'assistant'
                        ? 'bg-secondary text-secondary-foreground'
                        : 'bg-primary text-primary-foreground'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="p-3 rounded-lg bg-secondary text-secondary-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Textarea
                placeholder="Ask about strengths, weaknesses, or improvements..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="flex-1"
              />
              <Button 
                onClick={handleSendMessage}
                disabled={isLoading || !input.trim() || !selectedResume}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ResumeBot;
