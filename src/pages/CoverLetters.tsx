
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileText, Plus, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { 
  CoverLetter, 
  fetchCoverLetters, 
  createCoverLetter, 
  updateCoverLetter, 
  deleteCoverLetter 
} from "@/services/documentService";
import CoverLetterItem from "@/components/cover-letter/CoverLetterItem";
import CoverLetterForm from "@/components/cover-letter/CoverLetterForm";

const CoverLetters = () => {
  const [coverLetters, setCoverLetters] = useState<CoverLetter[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedCoverLetter, setSelectedCoverLetter] = useState<CoverLetter | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    loadCoverLetters();
  }, [user]);

  const loadCoverLetters = async () => {
    setIsLoading(true);
    try {
      const data = await fetchCoverLetters();
      setCoverLetters(data);
    } catch (error: any) {
      toast({
        title: "Error loading cover letters",
        description: error?.message || "There was a problem loading your cover letters",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenNewForm = () => {
    setSelectedCoverLetter(undefined);
    setFormOpen(true);
  };

  const handleEdit = (coverLetter: CoverLetter) => {
    setSelectedCoverLetter(coverLetter);
    setFormOpen(true);
  };

  const handleSave = async (data: { title: string; content: string }) => {
    try {
      if (selectedCoverLetter) {
        // Update existing cover letter
        const updated = await updateCoverLetter(selectedCoverLetter.id, data);
        setCoverLetters(coverLetters.map(cl => cl.id === updated.id ? updated : cl));
        toast({
          title: "Cover letter updated",
          description: "Your cover letter has been successfully updated",
        });
      } else {
        // Create new cover letter
        const created = await createCoverLetter(data.title, data.content);
        setCoverLetters([created, ...coverLetters]);
        toast({
          title: "Cover letter created",
          description: "Your new cover letter has been successfully created",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "There was a problem saving your cover letter",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCoverLetter(id);
      setCoverLetters(coverLetters.filter(cl => cl.id !== id));
      toast({
        title: "Cover letter deleted",
        description: "Your cover letter has been removed",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "There was a problem deleting your cover letter",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Cover Letters</h1>
        <Button onClick={handleOpenNewForm}>
          <Plus className="mr-2 h-4 w-4" />
          Create Cover Letter
        </Button>
      </div>

      <p className="text-muted-foreground">
        Create and manage your cover letters to use for job applications. You can easily view and copy them when applying for jobs.
      </p>

      {isLoading ? (
        <div className="py-16 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading your cover letters...</p>
        </div>
      ) : coverLetters.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {coverLetters.map((coverLetter) => (
            <CoverLetterItem
              key={coverLetter.id}
              coverLetter={coverLetter}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-1">No cover letters yet</h3>
          <p className="text-sm text-muted-foreground mb-4 text-center">
            Create your first cover letter to get started
          </p>
          <Button onClick={handleOpenNewForm}>
            <Upload className="mr-2 h-4 w-4" />
            Create Cover Letter
          </Button>
        </div>
      )}

      <CoverLetterForm
        open={formOpen}
        onOpenChange={setFormOpen}
        initialData={selectedCoverLetter}
        onSave={handleSave}
      />
    </div>
  );
};

export default CoverLetters;
