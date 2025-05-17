import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';

interface PdfViewerProps {
  pdfUrl: string;
  title: string;
  open: boolean;
  onClose: () => void;
  onDownload: () => void;
}

const PdfViewer: React.FC<PdfViewerProps> = ({
  pdfUrl,
  title,
  open,
  onClose,
  onDownload
}) => {
  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex justify-between items-center">
          <DialogTitle>Resume Preview: {title}</DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="flex-1 min-h-[70vh] overflow-hidden">
          <iframe 
            src={`${pdfUrl}#toolbar=0&navpanes=0`} 
            className="w-full h-full border rounded-md"
            title="PDF Viewer"
          />
        </div>
        
        <DialogFooter className="mt-4">
          <Button onClick={onDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PdfViewer;
