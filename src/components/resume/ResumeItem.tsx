
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileText, Eye, Download, Pencil, Trash2 } from "lucide-react";
import { Resume, generateResumePDF } from "@/services/documentService";
import { useToast } from "@/hooks/use-toast";

interface ResumeItemProps {
  resume: Resume;
  onEdit: (resume: Resume) => void;
  onDelete: (id: string) => void;
}

const ResumeItem = ({ resume, onEdit, onDelete }: ResumeItemProps) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  const handlePreview = () => {
    setIsPreviewOpen(true);
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const pdfUrl = await generateResumePDF(resume);
      
      // Open the generated PDF in a new tab
      window.open(pdfUrl, '_blank');
      
      toast({
        title: "Download ready",
        description: "Your resume has been prepared for download",
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "There was an error generating your resume download",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const formattedDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <>
      <Card key={resume.id} className="overflow-hidden">
        <div className="bg-muted p-4 flex items-center justify-center">
          <FileText className="h-16 w-16 text-primary/50" />
        </div>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold">{resume.title}</h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => onDelete(resume.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Created: {formattedDate(resume.created_at)}</p>
            <p>Last updated: {formattedDate(resume.updated_at)}</p>
          </div>
          <div className="mt-4 flex gap-2">
            <Button variant="outline" size="sm" className="flex-1" onClick={() => onEdit(resume)}>
              <Pencil className="h-3.5 w-3.5 mr-1" />
              Edit
            </Button>
            <Button variant="outline" size="sm" className="flex-1" onClick={handlePreview}>
              <Eye className="h-3.5 w-3.5 mr-1" />
              Preview
            </Button>
            <Button variant="default" size="sm" className="flex-1" onClick={handleDownload} disabled={isDownloading}>
              <Download className="h-3.5 w-3.5 mr-1" />
              {isDownloading ? "..." : "Download"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{resume.title}</DialogTitle>
          </DialogHeader>
          <div className="bg-white border rounded-md p-6 mt-4">
            {/* This is a placeholder for the actual resume content rendering */}
            <div className="prose max-w-none">
              <h1>{resume.content.name || 'Your Name'}</h1>
              {resume.content.contact && (
                <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                  {resume.content.contact.email && <span>{resume.content.contact.email}</span>}
                  {resume.content.contact.phone && <span>• {resume.content.contact.phone}</span>}
                  {resume.content.contact.location && <span>• {resume.content.contact.location}</span>}
                </div>
              )}
              
              {resume.content.summary && (
                <div className="mt-4">
                  <h2 className="text-lg font-semibold border-b pb-1">Professional Summary</h2>
                  <p>{resume.content.summary}</p>
                </div>
              )}
              
              {resume.content.experience && resume.content.experience.length > 0 && (
                <div className="mt-4">
                  <h2 className="text-lg font-semibold border-b pb-1">Experience</h2>
                  {resume.content.experience.map((exp: any, index: number) => (
                    <div key={index} className="mt-3">
                      <div className="flex justify-between">
                        <h3 className="font-medium">{exp.title}</h3>
                        <p className="text-sm">{exp.dates}</p>
                      </div>
                      <p className="italic">{exp.company}</p>
                      <ul className="list-disc pl-5 mt-1">
                        {exp.bullets && exp.bullets.map((bullet: string, i: number) => (
                          <li key={i}>{bullet}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
              
              {resume.content.education && resume.content.education.length > 0 && (
                <div className="mt-4">
                  <h2 className="text-lg font-semibold border-b pb-1">Education</h2>
                  {resume.content.education.map((edu: any, index: number) => (
                    <div key={index} className="mt-2">
                      <div className="flex justify-between">
                        <h3 className="font-medium">{edu.degree}</h3>
                        <p className="text-sm">{edu.dates}</p>
                      </div>
                      <p>{edu.institution}</p>
                    </div>
                  ))}
                </div>
              )}
              
              {resume.content.skills && resume.content.skills.length > 0 && (
                <div className="mt-4">
                  <h2 className="text-lg font-semibold border-b pb-1">Skills</h2>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {resume.content.skills.map((skill: string, index: number) => (
                      <span key={index} className="bg-gray-100 px-2 py-1 rounded text-sm">{skill}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ResumeItem;
