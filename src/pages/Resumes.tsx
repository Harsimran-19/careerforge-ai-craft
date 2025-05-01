
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileText, Plus, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Resume, fetchResumes, createResume, updateResume, deleteResume } from "@/services/documentService";
import ResumeItem from "@/components/resume/ResumeItem";
import ResumeForm from "@/components/resume/ResumeForm";

const Resumes = () => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedResume, setSelectedResume] = useState<Resume | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
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

  const handleOpenNewResumeForm = () => {
    setSelectedResume(undefined);
    setFormOpen(true);
  };

  const handleEditResume = (resume: Resume) => {
    setSelectedResume(resume);
    setFormOpen(true);
  };

  const handleSaveResume = async (data: any) => {
    try {
      if (selectedResume) {
        // Update existing resume
        const updated = await updateResume(selectedResume.id, data);
        setResumes(resumes.map(r => r.id === updated.id ? updated : r));
        toast({
          title: "Resume updated",
          description: "Your resume has been successfully updated",
        });
      } else {
        // Create new resume
        const created = await createResume(data.title, data.content);
        setResumes([created, ...resumes]);
        toast({
          title: "Resume created",
          description: "Your new resume has been successfully created",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "There was a problem saving your resume",
        variant: "destructive",
      });
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
        <Button onClick={handleOpenNewResumeForm}>
          <Plus className="mr-2 h-4 w-4" />
          Create Resume
        </Button>
      </div>

      <p className="text-muted-foreground">
        Create and manage your resumes to use for job applications. CareerForge will help you build tailored resumes for specific jobs.
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
              onEdit={handleEditResume}
              onDelete={handleDeleteResume}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-1">No resumes yet</h3>
          <p className="text-sm text-muted-foreground mb-4 text-center">
            Create your first resume to get started
          </p>
          <Button onClick={handleOpenNewResumeForm}>
            <Upload className="mr-2 h-4 w-4" />
            Create Resume
          </Button>
        </div>
      )}

      <ResumeForm
        open={formOpen}
        onOpenChange={setFormOpen}
        initialData={selectedResume}
        onSave={handleSaveResume}
      />
    </div>
  );
};

export default Resumes;
