
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fetchResumes, Resume } from '@/services/documentService';
import { Loader2, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

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
    
    try {
      // Send to API
      const response = await axios.post('/api/chat', {
        messages: [...messages, { role: 'user', content: userMessage }],
        resumeContent: selectedResume.content,
        resumeTitle: selectedResume.title
      });
      
      // Add AI response to chat
      setMessages(prev => [
        ...prev, 
        { role: 'assistant', content: response.data.content }
      ]);
    } catch (error: any) {
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
