import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Eye, FileDown, Loader2, Save, Download, RefreshCw } from 'lucide-react';
import { Resume, ResumeContent } from '@/services/documentService';
import { convertResumeToPdfAPI, ResumeData } from '@/services/apiService';
import { updateResumeContent } from '@/services/documentService';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import PdfViewer from '@/components/pdf/PdfViewer';

interface ResumeTextEditorProps {
  resume: Resume;
  onSave?: (updatedResume: Resume) => void;
  onClose: () => void;
  open: boolean;
}

const ResumeTextEditor: React.FC<ResumeTextEditorProps> = ({
  resume,
  onSave,
  onClose,
  open
}) => {
  const [resumeContent, setResumeContent] = useState<ResumeContent>(resume.content);
  const [isSaving, setIsSaving] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  // Remove the separate PDF viewer dialog state since we'll show it side by side
  const { toast } = useToast();

  const handleSave = async (showNotification = true) => {
    setIsSaving(true);
    try {
      const updatedResume = await updateResumeContent(resume.id, resumeContent);

      if (showNotification) {
        toast({
          title: "Resume saved",
          description: "Your resume has been updated successfully",
        });
      }

      if (onSave) {
        onSave(updatedResume);
      }

      return updatedResume;
    } catch (error: any) {
      console.error("Error saving resume:", error);
      toast({
        title: "Error saving resume",
        description: error?.message || "Failed to save resume",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const handleCompileToPdf = async () => {
    setIsCompiling(true);
    try {
      // Skip the automatic save which may be causing the dialog to close
      // Just use the current resumeContent directly without saving
      
      // Prepare the resume data in the format expected by the external API
      const resumeData: ResumeData = {
        resume: resumeContent
      };

      // Call the external API to convert to PDF
      // This uses the resumeApiClient in apiService.ts which points to the external API
      const pdfBlob = await convertResumeToPdfAPI(resumeData);

      // Check if we got a valid PDF blob
      if (!pdfBlob || pdfBlob.size === 0) {
        throw new Error("Received empty PDF data");
      }

      // Create a URL for the PDF blob
      const url = URL.createObjectURL(pdfBlob);
      setPdfUrl(url);

      toast({
        title: "PDF compiled",
        description: "Your resume has been compiled to PDF",
      });
    } catch (error: any) {
      console.error("Error compiling PDF:", error);

      // Show a more detailed error message
      let errorMessage = "Failed to compile resume to PDF.";

      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        errorMessage += ` Server responded with status ${error.response.status}.`;
        console.error("Response data:", error.response.data);
        console.error("Response headers:", error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage += " No response received from server.";
        console.error("Request:", error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        errorMessage += ` ${error.message}`;
      }

      errorMessage += " Make sure the Resume API URL is properly configured.";

      toast({
        title: "Error compiling PDF",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsCompiling(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!pdfUrl) return;

    // Create a download link for the PDF
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = `${resume.title}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    toast({
      title: "PDF downloaded",
      description: "Your resume PDF has been downloaded",
    });
  };

  // Clean up the PDF URL when the component unmounts
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle>Edit Resume: {resume.title}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col lg:flex-row gap-6 py-4">
          {/* Left side - JSON editor */}
          <div className="lg:w-1/2 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="resumeJson">Resume JSON</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Edit the resume JSON below. This will be used to generate your PDF resume.
              </p>
              <Textarea
                id="resumeJson"
                value={JSON.stringify(resumeContent, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    setResumeContent(parsed);
                  } catch (error) {
                    // If JSON is invalid, don't update the state
                  }
                }}
                className="font-mono text-sm h-[500px]"
              />
            </div>

            <div className="bg-muted/30 p-4 rounded-md">
              <h3 className="text-sm font-medium mb-2">Resume Structure Guide</h3>
              <p className="text-xs text-muted-foreground mb-2">
                Your resume should include the following sections:
              </p>
              <ul className="text-xs text-muted-foreground list-disc pl-5 space-y-1">
                <li><strong>personalInfo</strong>: name, email, phone, address, etc.</li>
                <li><strong>summary</strong>: A brief overview of your professional background</li>
                <li><strong>experience</strong>: Array of work experiences (company, position, dates, description)</li>
                <li><strong>education</strong>: Array of educational background (institution, degree, dates)</li>
                <li><strong>skills</strong>: Array of skills</li>
                <li><strong>certifications</strong> (optional): Array of certifications</li>
                <li><strong>projects</strong> (optional): Array of projects</li>
              </ul>
            </div>
          </div>

          {/* Right side - PDF preview */}
          <div className="lg:w-1/2 flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <Label>PDF Preview</Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCompileToPdf}
                  disabled={isCompiling}
                  className="h-8"
                >
                  {isCompiling ? (
                    <>
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                      Compiling...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-3 w-3" />
                      Compile PDF
                    </>
                  )}
                </Button>

                {pdfUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadPdf}
                    className="h-8"
                  >
                    <Download className="mr-2 h-3 w-3" />
                    Download
                  </Button>
                )}
              </div>
            </div>

            <div className={cn(
              "border rounded-md flex-1 min-h-[500px] flex items-center justify-center bg-muted/20",
              pdfUrl ? "p-0" : "p-6"
            )}>
              {pdfUrl ? (
                <iframe 
                  src={`${pdfUrl}#toolbar=0&navpanes=0`} 
                  className="w-full h-full border-0 rounded-md"
                  title="PDF Preview"
                />
              ) : (
                <div className="text-center text-muted-foreground">
                  <p>PDF preview will appear here after compiling.</p>
                  <p className="text-sm mt-2">Click "Compile PDF" to generate a preview.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4 gap-2">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleSave(true)}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ResumeTextEditor;
