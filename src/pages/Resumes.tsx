
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Plus, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Resume, fetchResumes, uploadResume, deleteResume } from "@/services/documentService";
import ResumeItem from "@/components/resume/ResumeItem";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const Resumes = () => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    loadResumes();
  }, [user]);

  const loadResumes = async () => {
    setIsLoading(true);
    try {
      const resumesData = await fetchResumes();
      setResumes(resumesData);
    } catch (error: any) {
      toast({
        title: "Error loading resumes",
        description: error?.message || "There was a problem loading your resumes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadClick = () => {
    setTitle("");
    setUploadDialogOpen(true);
  };

  const handleFileSelection = () => {
    fileInputRef.current?.click();
  };

  const handleUploadResume = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fileInputRef.current?.files?.length) {
      toast({
        title: "No file selected",
        description: "Please select a PDF file to upload",
        variant: "destructive",
      });
      return;
    }

    const file = fileInputRef.current.files[0];
    
    if (!file.name.endsWith('.pdf')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file",
        variant: "destructive",
      });
      return;
    }
    
    if (!title) {
      toast({
        title: "Title required",
        description: "Please enter a title for your resume",
        variant: "destructive",
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      const uploadedResume = await uploadResume(file, title);
      setResumes([uploadedResume, ...resumes]);
      setUploadDialogOpen(false);
      toast({
        title: "Resume uploaded",
        description: "Your resume has been successfully uploaded",
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error?.message || "There was a problem uploading your resume",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteResume = async (id: string) => {
    try {
      await deleteResume(id);
      setResumes(resumes.filter(resume => resume.id !== id));
      toast({
        title: "Resume deleted",
        description: "Your resume has been removed",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "There was a problem deleting your resume",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Resumes</h1>
        <Button onClick={handleUploadClick}>
          <Upload className="mr-2 h-4 w-4" />
          Upload Resume
        </Button>
      </div>

      <p className="text-muted-foreground">
        Upload your resumes to use for job applications. CareerForge will help you tailor them for specific jobs.
      </p>

      {isLoading ? (
        <div className="py-16 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading your resumes...</p>
        </div>
      ) : resumes.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {resumes.map((resume) => (
            <ResumeItem
              key={resume.id}
              resume={resume}
              onDelete={handleDeleteResume}
              showEditButton={false}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-1">No resumes yet</h3>
          <p className="text-sm text-muted-foreground mb-4 text-center">
            Upload your first resume to get started
          </p>
          <Button onClick={handleUploadClick}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Resume
          </Button>
        </div>
      )}

      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Resume</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleUploadResume} className="space-y-4">
            <div>
              <Label htmlFor="title">Resume Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Software Engineer Resume"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="resume-file">Resume File (PDF only)</Label>
              <div 
                onClick={handleFileSelection}
                className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md cursor-pointer hover:border-primary/50 transition-colors"
              >
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                  <div className="flex text-sm text-muted-foreground">
                    <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80">
                      <span>Upload a file</span>
                      <input
                        ref={fileInputRef}
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        accept=".pdf"
                        onChange={() => {
                          const fileName = fileInputRef.current?.files?.[0]?.name;
                          if (fileName && !title) {
                            setTitle(fileName.replace(/\.[^/.]+$/, ""));
                          }
                        }}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    PDF up to 10MB
                  </p>
                  {fileInputRef.current?.files?.[0] && (
                    <p className="text-sm font-medium text-primary">
                      {fileInputRef.current.files[0].name}
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setUploadDialogOpen(false)}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isUploading}
              >
                {isUploading ? "Uploading..." : "Upload Resume"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Resumes;
