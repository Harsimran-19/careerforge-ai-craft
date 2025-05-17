
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Building2, Briefcase, Calendar, CheckCircle, ChevronDown, Clock, FileText, Link2, MapPin, Edit, FileDown } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { fetchResumeById, fetchCoverLetterById, Resume, CoverLetter } from "@/services/documentService";
import ResumeTextEditor from "@/components/resume/ResumeTextEditor";
import CoverLetterEditor from "@/components/cover-letter/CoverLetterEditor";
import { supabase } from "@/integrations/supabase/client";

// Application type definition
interface Application {
  id: string;
  position: string;
  company: string;
  location: string;
  appliedDate: string;
  status: string;
  notes: string;
  nextStep: string;
  resumeId: string; // ID of the resume in the database
  coverLetterId: string; // ID of the cover letter in the database
  jobUrl: string;
  hasInterview: boolean;
  interviewDate: string | null;
  // logo: string;
}

const Applications = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedApp, setExpandedApp] = useState<string | null>(null);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [selectedCoverLetter, setSelectedCoverLetter] = useState<CoverLetter | null>(null);
  const [isResumeEditorOpen, setIsResumeEditorOpen] = useState(false);
  const [isCoverLetterEditorOpen, setIsCoverLetterEditorOpen] = useState(false);
  const [isLoadingResume, setIsLoadingResume] = useState(false);
  const [isLoadingCoverLetter, setIsLoadingCoverLetter] = useState(false);
  const [isLoadingApplications, setIsLoadingApplications] = useState(true);
  const { toast } = useToast();

  // Fetch applications from the database
  useEffect(() => {
    const fetchApplications = async () => {
      setIsLoadingApplications(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        const { data, error } = await supabase
          .from('applications')
          .select('*')
          .eq('user_id', user.id)
          .order('applied_date', { ascending: false });

        if (error) throw error;

        // Convert the data to our Application interface format
        const formattedApplications = data.map(app => ({
          id: app.id,
          position: app.position,
          company: app.company,
          location: app.location || "Unknown",
          appliedDate: app.applied_date || new Date().toISOString(),
          status: app.status || "Applied",
          notes: app.notes || "",
          nextStep: app.next_step || "",
          resumeId: app.resume_id || "",
          coverLetterId: app.cover_letter_id || "",
          jobUrl: app.job_url || "",
          hasInterview: app.has_interview || false,
          interviewDate: app.interview_date,
          // logo: app.logo || `https://ui-avatars.com/api/?name=${app.company.charAt(0)}&background=22c55e&color=fff`
        }));

        setApplications(formattedApplications);
      } catch (error: any) {
        console.error("Error fetching applications:", error);
        toast({
          title: "Error loading applications",
          description: error?.message || "Failed to load your applications",
          variant: "destructive",
        });
      } finally {
        setIsLoadingApplications(false);
      }
    };

    fetchApplications();
  }, [toast]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Applied": return "bg-blue-100 text-blue-600";
      case "Interview": return "bg-amber-100 text-amber-600";
      case "Offered": return "bg-green-100 text-green-600";
      case "Rejected": return "bg-red-100 text-red-600";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedApp(expandedApp === id ? null : id);
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      // Update in the database
      const { error } = await supabase
        .from('applications')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setApplications(applications.map(app =>
        app.id === id ? { ...app, status: newStatus } : app
      ));

      toast({
        title: "Status updated",
        description: `Application status changed to ${newStatus}`,
      });
    } catch (error: any) {
      console.error("Error updating status:", error);
      toast({
        title: "Error updating status",
        description: error?.message || "Failed to update application status",
        variant: "destructive",
      });
    }
  };

  const handleInterviewToggle = async (id: string, hasInterview: boolean) => {
    try {
      // Update in the database
      const { error } = await supabase
        .from('applications')
        .update({ has_interview: hasInterview })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setApplications(applications.map(app =>
        app.id === id ? { ...app, hasInterview } : app
      ));

      toast({
        description: hasInterview ?
          "Interview scheduled" :
          "Interview removed",
      });
    } catch (error: any) {
      console.error("Error updating interview status:", error);
      toast({
        title: "Error updating interview status",
        description: error?.message || "Failed to update interview status",
        variant: "destructive",
      });
    }
  };

  const handleDeleteApplication = async (id: string) => {
    if (!confirm("Are you sure you want to delete this application? This action cannot be undone.")) {
      return;
    }
    
    try {
      // Delete from the database
      const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update local state by removing the deleted application
      setApplications(applications.filter(app => app.id !== id));
      
      // Close the expanded view if it was open
      if (expandedApp === id) {
        setExpandedApp(null);
      }

      toast({
        title: "Application deleted",
        description: "The application has been successfully deleted",
      });
    } catch (error: any) {
      console.error("Error deleting application:", error);
      toast({
        title: "Error deleting application",
        description: error?.message || "Failed to delete application",
        variant: "destructive",
      });
    }
  };

  const handleUpdateNotes = async () => {
    if (!selectedApp) return;

    try {
      // Update in the database
      const { error } = await supabase
        .from('applications')
        .update({
          notes: selectedApp.notes,
          next_step: selectedApp.nextStep
        })
        .eq('id', selectedApp.id);

      if (error) throw error;

      // Update local state
      setApplications(applications.map(app =>
        app.id === selectedApp.id ? { ...app, notes: selectedApp.notes, nextStep: selectedApp.nextStep } : app
      ));

      toast({
        description: "Application notes updated",
      });

      setSelectedApp(null);
    } catch (error: any) {
      console.error("Error updating notes:", error);
      toast({
        title: "Error updating notes",
        description: error?.message || "Failed to update application notes",
        variant: "destructive",
      });
    }
  };

  const handleOpenResumeEditor = async (resumeId: string) => {
    if (!resumeId) {
      toast({
        title: "No resume found",
        description: "This application doesn't have a resume attached",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingResume(true);
    try {
      const resume = await fetchResumeById(resumeId);
      setSelectedResume(resume);
      setIsResumeEditorOpen(true);
    } catch (error: any) {
      toast({
        title: "Error loading resume",
        description: error?.message || "Failed to load resume",
        variant: "destructive",
      });
    } finally {
      setIsLoadingResume(false);
    }
  };

  const handleOpenCoverLetterEditor = async (coverLetterId: string) => {
    if (!coverLetterId) {
      toast({
        title: "No cover letter found",
        description: "This application doesn't have a cover letter attached",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingCoverLetter(true);
    try {
      const coverLetter = await fetchCoverLetterById(coverLetterId);
      setSelectedCoverLetter(coverLetter);
      setIsCoverLetterEditorOpen(true);
    } catch (error: any) {
      toast({
        title: "Error loading cover letter",
        description: error?.message || "Failed to load cover letter",
        variant: "destructive",
      });
    } finally {
      setIsLoadingCoverLetter(false);
    }
  };

  const handleResumeUpdate = (updatedResume: Resume) => {
    // Close the editor
    setIsResumeEditorOpen(false);
    setSelectedResume(null);

    toast({
      title: "Resume updated",
      description: "Your resume has been updated successfully",
    });
  };

  const handleCoverLetterUpdate = (updatedCoverLetter: CoverLetter) => {
    // Close the editor
    setIsCoverLetterEditorOpen(false);
    setSelectedCoverLetter(null);

    toast({
      title: "Cover letter updated",
      description: "Your cover letter has been updated successfully",
    });
  };

  // Filter applications based on status and search query
  const filteredApplications = applications.filter(app => {
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    const matchesSearch = app.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          app.company.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Job Applications</h1>
        <Button onClick={() => window.location.href = "/job-search"}>
          <Briefcase className="mr-2 h-4 w-4" />
          Find New Jobs
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="w-full max-w-xs">
          <Label htmlFor="status-filter" className="text-sm">Filter by Status</Label>
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger id="status-filter" className="mt-1">
              <SelectValue placeholder="All Applications" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Applications</SelectItem>
              <SelectItem value="Applied">Applied</SelectItem>
              <SelectItem value="Interview">Interview Scheduled</SelectItem>
              <SelectItem value="Offered">Offered</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1">
          <Label htmlFor="search-applications" className="text-sm">Search</Label>
          <Input
            id="search-applications"
            placeholder="Search by job title or company"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mt-1"
          />
        </div>
      </div>

      {/* Applications List */}
      {isLoadingApplications ? (
        <div className="flex items-center justify-center p-12">
          <div className="flex flex-col items-center space-y-4">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            <p className="text-sm text-muted-foreground">Loading applications...</p>
          </div>
        </div>
      ) : filteredApplications.length > 0 ? (
        <div className="space-y-4">
          {filteredApplications.map((app) => (
            <Card key={app.id} className="overflow-hidden">
              <div className="cursor-pointer" onClick={() => toggleExpand(app.id)}>
                <div className="flex items-center p-4 sm:p-6">
                  <img
                    src={`https://ui-avatars.com/api/?name=${app.company.charAt(0)}&background=22c55e&color=fff`}
                    alt={app.company}
                    className="w-12 h-12 rounded-md mr-4"
                  />
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1">
                      <h3 className="font-semibold">{app.position}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full inline-flex mt-2 sm:mt-0 w-fit ${getStatusColor(app.status)}`}>
                        {app.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Building2 className="h-3.5 w-3.5 mr-1" />
                        <span>{app.company}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-3.5 w-3.5 mr-1" />
                        <span>{app.location}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-3.5 w-3.5 mr-1" />
                        <span>Applied on {new Date(app.appliedDate).toLocaleDateString()}</span>
                      </div>
                      {app.hasInterview && app.interviewDate && (
                        <div className="flex items-center">
                          <Clock className="h-3.5 w-3.5 mr-1" />
                          <span>Interview: {new Date(app.interviewDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-muted-foreground transition-transform ${expandedApp === app.id ? 'rotate-180' : ''}`}
                  />
                </div>
              </div>

              {expandedApp === app.id && (
                <div className="px-4 sm:px-6 pb-6 pt-2 border-t space-y-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Application Status</h4>
                        <Select
                          value={app.status}
                          onValueChange={(value) => handleStatusChange(app.id, value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Applied">Applied</SelectItem>
                            <SelectItem value="Interview">Interview</SelectItem>
                            <SelectItem value="Offered">Offered</SelectItem>
                            <SelectItem value="Rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor={`interview-toggle-${app.id}`} className="font-medium">
                            Interview Scheduled
                          </Label>
                          <Switch
                            id={`interview-toggle-${app.id}`}
                            checked={app.hasInterview}
                            onCheckedChange={(checked) => handleInterviewToggle(app.id, checked)}
                          />
                        </div>
                        {app.hasInterview && (
                          <div className="mt-2">
                            <Label htmlFor={`interview-date-${app.id}`}>Interview Date</Label>
                            <Input
                              id={`interview-date-${app.id}`}
                              type="date"
                              value={app.interviewDate || ""}
                              onChange={async (e) => {
                                try {
                                  // Update in the database
                                  const { error } = await supabase
                                    .from('applications')
                                    .update({ interview_date: e.target.value })
                                    .eq('id', app.id);

                                  if (error) throw error;

                                  // Update local state
                                  setApplications(applications.map(a =>
                                    a.id === app.id ? { ...a, interviewDate: e.target.value } : a
                                  ));
                                } catch (error) {
                                  console.error("Error updating interview date:", error);
                                  toast({
                                    title: "Error updating interview date",
                                    description: "Failed to update interview date",
                                    variant: "destructive",
                                  });
                                }
                              }}
                              className="mt-1"
                            />
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-4 flex-wrap">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1"
                          onClick={() => handleOpenResumeEditor(app.resumeId)}
                          disabled={isLoadingResume}
                        >
                          {isLoadingResume ? (
                            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                          ) : (
                            <Edit className="h-4 w-4" />
                          )}
                          Edit Resume
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1"
                          onClick={() => handleOpenCoverLetterEditor(app.coverLetterId)}
                          disabled={isLoadingCoverLetter}
                        >
                          {isLoadingCoverLetter ? (
                            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                          ) : (
                            <Edit className="h-4 w-4" />
                          )}
                          Edit Cover Letter
                        </Button>
                        {app.jobUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1"
                            onClick={() => window.open(app.jobUrl, '_blank')}
                          >
                            <Link2 className="h-4 w-4" />
                            Job URL
                          </Button>
                        )}
                        <Button
                          variant="destructive"
                          size="sm"
                          className="gap-1 ml-auto"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent expanding/collapsing when clicking delete
                            handleDeleteApplication(app.id);
                          }}
                        >
                          Delete Application
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Notes</h4>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedApp(app)}
                            >
                              Edit Notes
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Application Notes</DialogTitle>
                              <DialogDescription>
                                Update your notes and next steps for this application
                              </DialogDescription>
                            </DialogHeader>
                            {selectedApp && (
                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <Label htmlFor="notes">Application Notes</Label>
                                  <Input
                                    id="notes"
                                    value={selectedApp.notes}
                                    onChange={(e) => setSelectedApp({
                                      ...selectedApp,
                                      notes: e.target.value
                                    })}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="next-step">Next Steps</Label>
                                  <Input
                                    id="next-step"
                                    value={selectedApp.nextStep}
                                    onChange={(e) => setSelectedApp({
                                      ...selectedApp,
                                      nextStep: e.target.value
                                    })}
                                  />
                                </div>
                              </div>
                            )}
                            <DialogFooter>
                              <Button onClick={handleUpdateNotes}>Save Changes</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                      <div className="text-sm rounded-md bg-muted p-3">
                        <p>{app.notes}</p>
                      </div>

                      <div>
                        <h4 className="font-medium mb-1">Next Step</h4>
                        <div className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
                          <span>{app.nextStep}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No applications found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              {statusFilter !== "all" ?
                `No applications with status "${statusFilter}"` :
                searchQuery ?
                  `No applications matching "${searchQuery}"` :
                  "You haven't applied to any jobs yet"
              }
            </p>
            <Button onClick={() => window.location.href = "/job-search"}>
              <Briefcase className="mr-2 h-4 w-4" />
              Find Jobs
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Resume Editor Dialog */}
      {selectedResume && (
        <ResumeTextEditor
          resume={selectedResume}
          onSave={handleResumeUpdate}
          onClose={() => {
            setIsResumeEditorOpen(false);
            setSelectedResume(null);
          }}
          open={isResumeEditorOpen}
        />
      )}

      {/* Cover Letter Editor Dialog */}
      {selectedCoverLetter && (
        <CoverLetterEditor
          coverLetter={selectedCoverLetter}
          onSave={handleCoverLetterUpdate}
          onClose={() => {
            setIsCoverLetterEditorOpen(false);
            setSelectedCoverLetter(null);
          }}
          open={isCoverLetterEditorOpen}
        />
      )}
    </div>
  );
};

export default Applications;
