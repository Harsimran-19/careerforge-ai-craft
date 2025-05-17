import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { CoverLetter, updateCoverLetter } from '@/services/documentService';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, FileDown, Eye } from 'lucide-react';
import PdfViewer from '@/components/pdf/PdfViewer';

interface CoverLetterEditorProps {
  coverLetter: CoverLetter;
  onSave?: (updatedCoverLetter: CoverLetter) => void;
  onClose: () => void;
  open: boolean;
}

const CoverLetterEditor: React.FC<CoverLetterEditorProps> = ({
  coverLetter,
  onSave,
  onClose,
  open
}) => {
  const [title, setTitle] = useState(coverLetter.title);
  const [content, setContent] = useState(coverLetter.content);
  const [isSaving, setIsSaving] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isPdfViewerOpen, setIsPdfViewerOpen] = useState(false);
  const { toast } = useToast();

  const handleSave = async (showNotification = true) => {
    setIsSaving(true);
    try {
      const updatedCoverLetter = await updateCoverLetter(coverLetter.id, title, content);

      if (showNotification) {
        toast({
          title: "Cover letter saved",
          description: "Your cover letter has been updated successfully",
        });
      }

      if (onSave) {
        onSave(updatedCoverLetter);
      }

      return updatedCoverLetter;
    } catch (error: any) {
      console.error("Error saving cover letter:", error);
      toast({
        title: "Error saving cover letter",
        description: error?.message || "Failed to save cover letter",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreviewPdf = async () => {
    setIsCompiling(true);
    try {
      // First save any changes to the cover letter
      await handleSave(false);

      // For cover letters, we'll use a simple HTML preview since we don't have a specific
      // external API endpoint for cover letter PDF conversion

      // Create a simple HTML document with the cover letter content
      // This preserves line breaks and formatting
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${title}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              margin: 2cm;
              white-space: pre-wrap;
            }
          </style>
        </head>
        <body>
          ${content}
        </body>
        </html>
      `;

      // Convert HTML to a Blob
      const blob = new Blob([htmlContent], { type: 'text/html' });

      // Create a URL for the blob
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);

      // Open the PDF viewer
      setIsPdfViewerOpen(true);

      toast({
        title: "Preview ready",
        description: "Your cover letter preview is ready to view",
      });
    } catch (error: any) {
      console.error("Error creating preview:", error);
      toast({
        title: "Error creating preview",
        description: error?.message || "Failed to create cover letter preview",
        variant: "destructive",
      });
    } finally {
      setIsCompiling(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!pdfUrl) return;

    // Create a download link for the HTML
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = `${title}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    toast({
      title: "Cover letter downloaded",
      description: "Your cover letter has been downloaded as HTML",
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
    <>
      <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Cover Letter</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[400px]"
              />
            </div>
          </div>

          <DialogFooter className="flex justify-between">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handlePreviewPdf}
                disabled={isCompiling}
              >
                {isCompiling ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Preview...
                  </>
                ) : (
                  <>
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </>
                )}
              </Button>

              {pdfUrl && (
                <Button
                  variant="outline"
                  onClick={handleDownloadPdf}
                >
                  <FileDown className="mr-2 h-4 w-4" />
                  Download
                </Button>
              )}
            </div>

            <div>
              <Button
                variant="outline"
                onClick={onClose}
                className="mr-2"
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
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PDF Viewer Dialog */}
      {pdfUrl && (
        <PdfViewer
          pdfUrl={pdfUrl}
          title={title}
          open={isPdfViewerOpen}
          onClose={() => setIsPdfViewerOpen(false)}
          onDownload={handleDownloadPdf}
        />
      )}
    </>
  );
};

export default CoverLetterEditor;
