import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface ResumeViewerProps {
  fileUrl: string;
  title: string;
  onClose: () => void;
}

const ResumeViewer = ({ fileUrl, title, onClose }: ResumeViewerProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if the URL is accessible
    const checkUrl = async () => {
      try {
        const response = await fetch(fileUrl, { method: 'HEAD' });
        if (!response.ok) {
          setError(`Failed to load the resume: ${response.status} ${response.statusText}`);
        }
      } catch (err) {
        setError('Failed to access the resume file. It may not be publicly accessible.');
      } finally {
        setLoading(false);
      }
    };

    checkUrl();
  }, [fileUrl]);

  const handleDownload = () => {
    // Create an anchor element and click it to download
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = `${title}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="w-full h-full flex flex-col">
      <div className="bg-muted p-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold">{title}</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-1" /> Download
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
      <CardContent className="flex-grow p-0">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="ml-2">Loading resume...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full p-8">
            <p className="text-destructive">{error}</p>
            <p className="mt-4">
              This could be due to storage permissions in Supabase. Please make sure the 'resumes' 
              storage bucket has public access enabled for viewing files.
            </p>
          </div>
        ) : (
          <iframe 
            src={`${fileUrl}#toolbar=0`}
            className="w-full h-full min-h-[70vh]"
            title={title}
            onLoad={() => setLoading(false)}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default ResumeViewer;
