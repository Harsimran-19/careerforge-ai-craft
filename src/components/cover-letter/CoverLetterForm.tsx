
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { CoverLetter } from "@/services/documentService";

interface CoverLetterFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: CoverLetter;
  onSave: (data: { title: string; content: string }) => Promise<void>;
}

const CoverLetterForm = ({ open, onOpenChange, initialData, onSave }: CoverLetterFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState(initialData?.title || "");
  const [content, setContent] = useState(initialData?.content || "");

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onSave({
        title,
        content
      });
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Cover Letter" : "Create New Cover Letter"}</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Cover Letter Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Application for Software Engineer at TechCorp"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="content">Cover Letter Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your cover letter content here..."
              className="min-h-[500px]"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : initialData ? "Update Cover Letter" : "Create Cover Letter"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CoverLetterForm;
