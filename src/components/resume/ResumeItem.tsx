
import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Trash2, Calendar } from "lucide-react";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Resume } from "@/services/documentService";

interface ResumeItemProps {
  resume: Resume;
  onDelete: (id: string) => void;
  showEditButton?: boolean;
  onEdit?: (resume: Resume) => void;
}

const ResumeItem = ({
  resume,
  onDelete,
  showEditButton = false,
  onEdit
}: ResumeItemProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    onDelete(resume.id);
    setIsDeleteDialogOpen(false);
  };

  const handleDownload = () => {
    // Open the resume URL in a new tab
    window.open(resume.file_url, '_blank');
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="bg-muted rounded-lg p-2 flex-shrink-0">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h3 className="font-medium truncate">{resume.title}</h3>
            <p className="text-sm text-muted-foreground flex items-center mt-1">
              <Calendar className="h-3.5 w-3.5 mr-1" />
              {format(new Date(resume.created_at), "MMM d, yyyy")}
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-muted/50 px-6 py-3 flex justify-between">
        <Button variant="outline" size="sm" onClick={handleDownload}>
          <Download className="h-4 w-4 mr-1" /> View
        </Button>
        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleDelete}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this resume. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default ResumeItem;
