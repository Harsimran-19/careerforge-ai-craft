
import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Trash2, Calendar, Eye } from "lucide-react";
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
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Resume } from "@/services/documentService";
import ResumeViewer from "./ResumeViewer";

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
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    onDelete(resume.id);
    setIsDeleteDialogOpen(false);
  };

  const handleView = () => {
    setIsViewDialogOpen(true);
  };

  const handleDownload = () => {
    // Create an anchor and trigger download
    if (resume.file_url) {
      const link = document.createElement('a');
      link.href = resume.file_url;
      link.download = `${resume.title}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
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
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleView}>
            <Eye className="h-4 w-4 mr-1" /> View
          </Button>
          {resume.file_url && (
            <Button variant="ghost" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4" />
            </Button>
          )}
        </div>
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

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <ResumeViewer 
            fileUrl={resume.file_url || ''} 
            title={resume.title} 
            onClose={() => setIsViewDialogOpen(false)} 
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ResumeItem;
