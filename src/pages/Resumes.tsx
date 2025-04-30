
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Plus, Trash2, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Sample data for demonstration
const sampleResumes = [
  {
    id: "1",
    name: "Software Developer Resume",
    createdAt: "2025-04-10",
    lastUpdated: "2025-04-20",
  },
  {
    id: "2",
    name: "Product Manager Resume",
    createdAt: "2025-03-15",
    lastUpdated: "2025-04-18",
  },
];

const Resumes = () => {
  const [resumes, setResumes] = useState(sampleResumes);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [resumeName, setResumeName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      // Auto-fill name based on file name if not already set
      if (!resumeName && file.name) {
        const fileName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
        setResumeName(fileName);
      }
    }
  };

  const handleUploadResume = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }

    if (!resumeName.trim()) {
      toast({
        title: "Name required",
        description: "Please provide a name for your resume",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Simulate upload delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // This would be replaced with actual Supabase storage upload
      const newResume = {
        id: Date.now().toString(),
        name: resumeName,
        createdAt: new Date().toISOString().split("T")[0],
        lastUpdated: new Date().toISOString().split("T")[0],
      };

      setResumes([newResume, ...resumes]);
      setDialogOpen(false);
      setSelectedFile(null);
      setResumeName("");

      toast({
        title: "Resume uploaded",
        description: "Your resume has been successfully uploaded",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "There was an error uploading your resume",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteResume = (id: string) => {
    setResumes(resumes.filter((resume) => resume.id !== id));
    toast({
      title: "Resume deleted",
      description: "Your resume has been removed",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Resumes</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Upload Resume
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload New Resume</DialogTitle>
              <DialogDescription>
                Upload a PDF or DOCX file of your resume
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="resume-name">Resume Name</Label>
                <Input
                  id="resume-name"
                  placeholder="e.g., Software Engineer Resume"
                  value={resumeName}
                  onChange={(e) => setResumeName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="resume-file">Resume File</Label>
                <div 
                  className="border-2 border-dashed rounded-md p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => document.getElementById("resume-file")?.click()}
                >
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm font-medium">
                    {selectedFile ? selectedFile.name : "Click to upload PDF or DOCX"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {selectedFile ? 
                      `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB` : 
                      "Supports: PDF, DOCX (Max 5MB)"
                    }
                  </p>
                  <Input
                    id="resume-file"
                    type="file"
                    className="hidden"
                    accept=".pdf,.docx"
                    onChange={handleFileChange}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUploadResume} disabled={isUploading}>
                {isUploading ? "Uploading..." : "Upload Resume"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <p className="text-muted-foreground">
        Upload your resumes to use for job applications. CareerForge will analyze each resume to help you create tailored applications.
      </p>

      {resumes.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {resumes.map((resume) => (
            <Card key={resume.id} className="overflow-hidden">
              <div className="bg-muted p-4 flex items-center justify-center">
                <FileText className="h-16 w-16 text-primary/50" />
              </div>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold">{resume.name}</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleDeleteResume(resume.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Created: {resume.createdAt}</p>
                  <p>Last updated: {resume.lastUpdated}</p>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Edit
                  </Button>
                  <Button variant="default" size="sm" className="flex-1">
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-1">No resumes uploaded yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Start by uploading your first resume
          </p>
          <Button onClick={() => setDialogOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Resume
          </Button>
        </div>
      )}
    </div>
  );
};

export default Resumes;
