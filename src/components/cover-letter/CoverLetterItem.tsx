
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileText, Eye, Copy, Pencil, Trash2, Check } from "lucide-react";
import { CoverLetter } from "@/services/documentService";
import { useToast } from "@/hooks/use-toast";

interface CoverLetterItemProps {
  coverLetter: CoverLetter;
  onEdit: (coverLetter: CoverLetter) => void;
  onDelete: (id: string) => void;
}

const CoverLetterItem = ({ coverLetter, onEdit, onDelete }: CoverLetterItemProps) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handlePreview = () => {
    setIsPreviewOpen(true);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(coverLetter.content);
    setCopied(true);
    
    toast({
      title: "Copied to clipboard",
      description: "Cover letter content has been copied to clipboard",
    });
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const formattedDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Generate a snippet of the cover letter content
  const contentSnippet = () => {
    if (coverLetter.content.length <= 100) {
      return coverLetter.content;
    }
    return coverLetter.content.substring(0, 100) + "...";
  };

  return (
    <>
      <Card key={coverLetter.id} className="overflow-hidden">
        <div className="bg-muted p-4 flex items-center justify-center">
          <FileText className="h-16 w-16 text-primary/50" />
        </div>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold">{coverLetter.title}</h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => onDelete(coverLetter.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
            {contentSnippet()}
          </p>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Created: {formattedDate(coverLetter.created_at)}</p>
            <p>Last updated: {formattedDate(coverLetter.updated_at)}</p>
          </div>
          <div className="mt-4 flex gap-2">
            <Button variant="outline" size="sm" className="flex-1" onClick={() => onEdit(coverLetter)}>
              <Pencil className="h-3.5 w-3.5 mr-1" />
              Edit
            </Button>
            <Button variant="outline" size="sm" className="flex-1" onClick={handlePreview}>
              <Eye className="h-3.5 w-3.5 mr-1" />
              View
            </Button>
            <Button variant="default" size="sm" className="flex-1" onClick={handleCopy}>
              {copied ? <Check className="h-3.5 w-3.5 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{coverLetter.title}</DialogTitle>
          </DialogHeader>
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              className="absolute top-0 right-0"
              onClick={handleCopy}
            >
              {copied ? <Check className="h-3.5 w-3.5 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
              {copied ? "Copied" : "Copy text"}
            </Button>
            <div className="bg-white border rounded-md p-6 mt-4 prose max-w-none whitespace-pre-wrap">
              {coverLetter.content}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CoverLetterItem;
