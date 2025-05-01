
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload } from 'lucide-react';
import { Resume } from '@/services/documentService';

interface ResumeFormProps {
  onSave: (formData: FormData) => Promise<void>;
  initialData?: Resume;
  buttonText?: string;
}

const ResumeForm: React.FC<ResumeFormProps> = ({ 
  onSave, 
  initialData, 
  buttonText = "Upload Resume" 
}) => {
  const [title, setTitle] = useState(initialData?.title || "");
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title) {
      toast({
        title: "Title required",
        description: "Please enter a title for your resume",
        variant: "destructive",
      });
      return;
    }
    
    if (!file && !initialData) {
      toast({
        title: "File required",
        description: "Please upload a PDF file",
        variant: "destructive",
      });
      return;
    }
    
    if (file && !file.name.endsWith('.pdf')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append("title", title);
      
      if (file) {
        formData.append("file", file);
      }
      
      if (initialData) {
        formData.append("id", initialData.id);
      }
      
      await onSave(formData);
      
    } catch (error) {
      // Error handling is managed by the parent component
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Resume Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Software Engineer Resume"
          className="mt-1"
          disabled={isLoading}
        />
      </div>
      
      <div>
        <Label htmlFor="file">Resume File (PDF only)</Label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md">
          <div className="space-y-1 text-center">
            <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
            <div className="flex text-sm text-muted-foreground">
              <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80">
                <span>Upload a file</span>
                <Input
                  id="file-upload"
                  name="file"
                  type="file"
                  accept=".pdf"
                  className="sr-only"
                  disabled={isLoading}
                  onChange={(e) => {
                    const selectedFile = e.target.files?.[0];
                    if (selectedFile) {
                      setFile(selectedFile);
                      if (!title && selectedFile.name) {
                        // Set title to file name without extension
                        setTitle(selectedFile.name.replace(/\.[^/.]+$/, ""));
                      }
                    }
                  }}
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-muted-foreground">
              PDF up to 10MB
            </p>
            {file && (
              <p className="text-sm font-medium text-primary">{file.name}</p>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Processing..." : buttonText}
        </Button>
      </div>
    </form>
  );
};

export default ResumeForm;
