import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Briefcase, Building2, Clock, ExternalLink, FileText, MapPin, Search, Edit } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { parseJobUrl, Resume, fetchResumes, optimizeResume, generateCoverLetter, OptimizeResumeParams, GenerateCoverLetterParams, CoverLetter, fetchResumeById, fetchCoverLetterById } from "@/services/documentService";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { searchJobsAPI, Job as ApiJob } from "@/services/apiService";
import ResumeTextEditor from "@/components/resume/ResumeTextEditor";
import CoverLetterEditor from "@/components/cover-letter/CoverLetterEditor";
import { supabase } from "@/integrations/supabase/client";

// No sample data - we'll use real data from the API

// Job type interface for UI display
interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  postedAt: string;
  description: string;
  logo: string;
  url?: string;
  rating?: number;
  rating_description?: string;
  company_rating?: number;
  company_rating_description?: string;
  jobProvider?: string;
}

const JobSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [isParsingUrl, setIsParsingUrl] = useState(false);
  const [applicationDialogOpen, setApplicationDialogOpen] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [applicationOptions, setApplicationOptions] = useState({
    generateResume: true,
    generateCoverLetter: true
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [coverLetterDetails, setCoverLetterDetails] = useState({
    userName: "",
    company: "",
    manager: "",
    role: "",
    referral: ""
  });
  const [generatedResumeId, setGeneratedResumeId] = useState<string | null>(null);
  const [generatedCoverLetterId, setGeneratedCoverLetterId] = useState<string | null>(null);
  const [selectedResumeForEdit, setSelectedResumeForEdit] = useState<Resume | null>(null);
  const [selectedCoverLetterForEdit, setSelectedCoverLetterForEdit] = useState<CoverLetter | null>(null);
  const [isResumeEditorOpen, setIsResumeEditorOpen] = useState(false);
  const [isCoverLetterEditorOpen, setIsCoverLetterEditorOpen] = useState(false);
  const [isLoadingResumeForEdit, setIsLoadingResumeForEdit] = useState(false);
  const [isLoadingCoverLetterForEdit, setIsLoadingCoverLetterForEdit] = useState(false);

  // Manual entry tab state
  const [manualJobTitle, setManualJobTitle] = useState("");
  const [manualCompany, setManualCompany] = useState("");
  const [manualLocation, setManualLocation] = useState("");
  const [manualJobType, setManualJobType] = useState("Full-time");
  const [manualDescription, setManualDescription] = useState("");
  const [isAddingManualJob, setIsAddingManualJob] = useState(false);
  const { toast } = useToast();

  // Fetch user's resumes
  const { data: resumes = [] } = useQuery({
    queryKey: ['resumes'],
    queryFn: fetchResumes,
    meta: {
      onError: (error: any) => {
        toast({
          title: "Error loading resumes",
          description: error?.message || "Failed to load your resumes",
          variant: "destructive",
        });
      }
    }
  });

  const handleSearch = async () => {
    setIsSearching(true);

    try {
      // Call the job search API with the query
      const results = await searchJobsAPI(searchQuery);

      if (results.jobs && results.jobs.length > 0) {
        // Convert API jobs to UI job format
        const formattedJobs: Job[] = results.jobs.map(apiJob => ({
          id: apiJob.id || new Date().getTime().toString(),
          title: apiJob.title || "Unknown Title",
          company: apiJob.company || "Unknown Company",
          location: apiJob.location || "Unknown Location",
          type: "Full-time", // Default value as API doesn't provide job type
          postedAt: "Recently", // Default value as API doesn't provide posting date
          description: apiJob.description || "No description available",
          logo: `https://ui-avatars.com/api/?name=${apiJob.company?.charAt(0) || 'J'}&background=22c55e&color=fff`,
          url: apiJob.url,
          rating: apiJob.rating,
          rating_description: apiJob.rating_description,
          company_rating: apiJob.company_rating,
          company_rating_description: apiJob.company_rating_description,
          jobProvider: apiJob.jobProvider
        }));

        setSearchResults(formattedJobs);
      } else {
        // If no results or empty array, show empty state
        setSearchResults([]);
        toast({
          title: "No results found",
          description: "Try adjusting your search terms",
        });
      }
    } catch (error: any) {
      console.error("Job search error:", error);
      toast({
        title: "Search failed",
        description: error?.message || "There was an error performing your search",
        variant: "destructive",
      });
      // Clear results on error
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleUrlSearch = async () => {
    if (!jobUrl) {
      toast({
        title: "URL required",
        description: "Please enter a job listing URL",
        variant: "destructive",
      });
      return;
    }

    setIsParsingUrl(true);

    try {
      // Call our job parsing service
      const jobData = await parseJobUrl(jobUrl);

      setJobDescription(jobData.jobDescription);

      // Create a job object from the parsed data
      const parsedJob: Job = {
        id: new Date().getTime().toString(),
        title: jobData.jobTitle,
        company: jobData.company,
        location: "Unknown",
        type: "Full-time",
        postedAt: "Recently",
        description: jobData.jobDescription,
        logo: `https://ui-avatars.com/api/?name=${jobData.company.charAt(0)}&background=22c55e&color=fff`,
        url: jobUrl,
        jobProvider: "Manual URL"
      };

      setSelectedJob(parsedJob);

      toast({
        title: "Job parsed successfully",
        description: "The job listing has been analyzed",
      });
    } catch (error: any) {
      toast({
        title: "Processing failed",
        description: error?.message || "Unable to parse job from the provided URL",
        variant: "destructive",
      });
    } finally {
      setIsParsingUrl(false);
    }
  };

  const handleApplyToJob = (job: Job) => {
    setSelectedJob(job);
    setJobDescription(job.description);

    // Pre-fill the cover letter details
    setCoverLetterDetails({
      ...coverLetterDetails,
      company: job.company,
      role: job.title
    });

    // Open the application dialog
    setApplicationDialogOpen(true);
  };

  const handleManualJobAdd = () => {
    // Validate required fields
    if (!manualJobTitle || !manualCompany || !manualDescription) {
      toast({
        title: "Missing information",
        description: "Please fill in the job title, company, and description",
        variant: "destructive",
      });
      return;
    }

    setIsAddingManualJob(true);

    try {
      // Create a job object from the manual entry
      const manualJob: Job = {
        id: new Date().getTime().toString(),
        title: manualJobTitle,
        company: manualCompany,
        location: manualLocation || "Not specified",
        type: manualJobType,
        postedAt: "Recently",
        description: manualDescription,
        logo: `https://ui-avatars.com/api/?name=${manualCompany.charAt(0)}&background=22c55e&color=fff`,
        jobProvider: "Manual Entry"
      };

      // Set the selected job and job description
      setSelectedJob(manualJob);
      setJobDescription(manualDescription);

      // Pre-fill the cover letter details
      setCoverLetterDetails({
        ...coverLetterDetails,
        company: manualCompany,
        role: manualJobTitle
      });

      toast({
        title: "Job added successfully",
        description: "You can now generate application materials for this job",
      });

      // Clear the form
      setManualJobTitle("");
      setManualCompany("");
      setManualLocation("");
      setManualJobType("Full-time");
      setManualDescription("");

      // Open the application dialog
      setApplicationDialogOpen(true);
    } catch (error: any) {
      toast({
        title: "Error adding job",
        description: error?.message || "There was an error adding the job",
        variant: "destructive",
      });
    } finally {
      setIsAddingManualJob(false);
    }
  };

  const handleGenerateApplication = async () => {
    if (!selectedJob || !selectedResumeId) {
      toast({
        title: "Missing information",
        description: "Please select a resume before proceeding",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      let tailoredResume;
      let coverLetter;

      // Generate tailored resume if selected
      if (applicationOptions.generateResume) {
        const params: OptimizeResumeParams = {
          resumeId: selectedResumeId,
          jobText: jobDescription
        };

        if (jobUrl) {
          params.jobUrl = jobUrl;
        }

        // Generate a tailored resume using our service
        // This creates a new resume with content tailored to the job
        tailoredResume = await optimizeResume(params);
        setGeneratedResumeId(tailoredResume.id);

        // Pre-load the resume for editing to avoid errors
        setSelectedResumeForEdit(tailoredResume);

        console.log("Generated resume:", tailoredResume);
      }

      // Generate cover letter if selected
      if (applicationOptions.generateCoverLetter) {
        const params: GenerateCoverLetterParams = {
          resumeId: selectedResumeId,
          jobDescription: jobDescription,
          userName: coverLetterDetails.userName || "Your Name",
          company: coverLetterDetails.company || selectedJob.company,
          manager: coverLetterDetails.manager || "Hiring Manager",
          role: coverLetterDetails.role || selectedJob.title,
          referral: coverLetterDetails.referral
        };

        // Generate a cover letter using our service
        coverLetter = await generateCoverLetter(params);
        setGeneratedCoverLetterId(coverLetter.id);

        // Pre-load the cover letter for editing to avoid errors
        setSelectedCoverLetterForEdit(coverLetter);

        console.log("Generated cover letter:", coverLetter);
      }

      // Create an application entry in the database
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        // Create the application entry
        const { error: applicationError } = await supabase
          .from('applications')
          .insert({
            position: selectedJob.title,
            company: selectedJob.company,
            location: selectedJob.location || "Unknown",
            applied_date: new Date().toISOString(),
            status: "Applied",
            notes: "",
            next_step: "Follow up in one week",
            resume_id: applicationOptions.generateResume ? tailoredResume.id : selectedResumeId,
            cover_letter_id: applicationOptions.generateCoverLetter ? coverLetter.id : null,
            job_url: selectedJob.url || null,
            has_interview: false,
            interview_date: null,
            user_id: user.id
            // logo field removed as it doesn't exist in the database schema
          });

        if (applicationError) {
          console.error("Error creating application entry:", applicationError);
          toast({
            title: "Application entry not created",
            description: "Your materials were generated but we couldn't create an application entry. Please try again.",
            variant: "destructive",
          });
        } else {
          console.log("Application entry created successfully");
        }
      } catch (error) {
        console.error("Error creating application entry:", error);
        toast({
          title: "Application entry not created",
          description: "Your materials were generated but we couldn't create an application entry. Please try again.",
          variant: "destructive",
        });
      }

      // Close the dialog
      setApplicationDialogOpen(false);

      // Scroll to the materials section
      setTimeout(() => {
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: 'smooth'
        });
      }, 100);

      toast({
        title: "Application materials ready",
        description: `Successfully created ${applicationOptions.generateResume ? 'a tailored resume' : ''}${applicationOptions.generateResume && applicationOptions.generateCoverLetter ? ' and ' : ''}${applicationOptions.generateCoverLetter ? 'a cover letter' : ''}. You can now edit and compile them to PDF.`,
      });
    } catch (error: any) {
      console.error("Generation error:", error);
      toast({
        title: "Generation failed",
        description: error?.message || "Failed to create application materials",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpenResumeEditor = async () => {
    if (!generatedResumeId) {
      toast({
        title: "No resume generated",
        description: "Please generate a resume first",
        variant: "destructive",
      });
      return;
    }

    // If we already have the resume loaded, just open the editor
    if (selectedResumeForEdit && selectedResumeForEdit.id === generatedResumeId) {
      setIsResumeEditorOpen(true);
      return;
    }

    setIsLoadingResumeForEdit(true);
    try {
      const resume = await fetchResumeById(generatedResumeId);
      setSelectedResumeForEdit(resume);
      setIsResumeEditorOpen(true);
    } catch (error: any) {
      console.error("Error loading resume:", error);
      toast({
        title: "Error loading resume",
        description: error?.message || "Failed to load resume",
        variant: "destructive",
      });
    } finally {
      setIsLoadingResumeForEdit(false);
    }
  };

  const handleOpenCoverLetterEditor = async () => {
    if (!generatedCoverLetterId) {
      toast({
        title: "No cover letter generated",
        description: "Please generate a cover letter first",
        variant: "destructive",
      });
      return;
    }

    // If we already have the cover letter loaded, just open the editor
    if (selectedCoverLetterForEdit && selectedCoverLetterForEdit.id === generatedCoverLetterId) {
      setIsCoverLetterEditorOpen(true);
      return;
    }

    setIsLoadingCoverLetterForEdit(true);
    try {
      const coverLetter = await fetchCoverLetterById(generatedCoverLetterId);
      setSelectedCoverLetterForEdit(coverLetter);
      setIsCoverLetterEditorOpen(true);
    } catch (error: any) {
      console.error("Error loading cover letter:", error);
      toast({
        title: "Error loading cover letter",
        description: error?.message || "Failed to load cover letter",
        variant: "destructive",
      });
    } finally {
      setIsLoadingCoverLetterForEdit(false);
    }
  };

  const handleResumeUpdate = (updatedResume: Resume) => {
    // Close the editor
    setIsResumeEditorOpen(false);
    setSelectedResumeForEdit(null);

    toast({
      title: "Resume updated",
      description: "Your resume has been updated successfully",
    });
  };

  const handleCoverLetterUpdate = (updatedCoverLetter: CoverLetter) => {
    // Close the editor
    setIsCoverLetterEditorOpen(false);
    setSelectedCoverLetterForEdit(null);

    toast({
      title: "Cover letter updated",
      description: "Your cover letter has been updated successfully",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Find Jobs</h1>
        <p className="text-muted-foreground mt-1">Search for jobs or paste a job listing URL</p>
      </div>

      <Tabs defaultValue="search">
        <TabsList className="grid grid-cols-3 mb-6 w-[450px]">
          <TabsTrigger value="search">Job Search</TabsTrigger>
          <TabsTrigger value="url">Paste URL</TabsTrigger>
          <TabsTrigger value="manual">Manual Entry</TabsTrigger>
        </TabsList>

        <TabsContent value="search">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
            <div>
              <Label htmlFor="job-title">Job Title or Keywords</Label>
              <Input
                id="job-title"
                placeholder="e.g., Frontend Developer"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g., Remote, New York, NY"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="job-type">Job Type</Label>
              <Select value={jobType} onValueChange={setJobType}>
                <SelectTrigger id="job-type" className="mt-2">
                  <SelectValue placeholder="Select job type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full-time">Full-time</SelectItem>
                  <SelectItem value="part-time">Part-time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleSearch} disabled={isSearching}>
            {isSearching ? "Searching..." : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Search Jobs
              </>
            )}
          </Button>

          <div className="mt-8 grid lg:grid-cols-3 gap-6">
            <div className={`lg:col-span-2 space-y-4 ${selectedJob ? 'block' : 'lg:col-span-3'}`}>
              {searchResults.length > 0 ? (
                searchResults.map((job) => (
                  <Card key={job.id} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <img
                          src={job.logo}
                          alt={job.company}
                          className="w-12 h-12 rounded-md"
                        />
                        <div className="flex-1 space-y-1">
                          <h3 className="font-semibold">{job.title}</h3>
                          <div className="flex items-center text-muted-foreground text-sm">
                            <Building2 className="h-3.5 w-3.5 mr-1" />
                            <span>{job.company}</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                            <div className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              <span>{job.location}</span>
                            </div>
                            <div className="flex items-center">
                              <Briefcase className="h-3 w-3 mr-1" />
                              <span>{job.type}</span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              <span>Posted {job.postedAt}</span>
                            </div>
                            {job.jobProvider && (
                              <div className="flex items-center">
                                <ExternalLink className="h-3 w-3 mr-1" />
                                <span>Source: {job.jobProvider}</span>
                              </div>
                            )}
                          </div>
                          {job.rating && (
                            <div className="mt-2 text-sm">
                              <div className="flex items-center">
                                <span className="font-medium">Match Rating: {job.rating}/5</span>
                                {job.rating_description && (
                                  <span className="ml-2 text-xs text-muted-foreground">({job.rating_description})</span>
                                )}
                              </div>
                            </div>
                          )}
                          <p className="text-sm mt-2">{job.description}</p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="border-t px-6 py-3 bg-muted/30 flex justify-between">
                      <div className="flex gap-2">
                        {job.url && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(job.url, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            View Job
                          </Button>
                        )}
                        <Button
                          size="sm"
                          onClick={() => handleApplyToJob(job)}
                        >
                          Apply Now
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center p-12 border rounded-lg">
                  <Search className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No jobs found</h3>
                  <p className="text-sm text-muted-foreground text-center max-w-md mt-1 mb-4">
                    Try adjusting your search terms or filters to find more job opportunities
                  </p>
                </div>
              )}
            </div>

            {selectedJob && (
              <div>
                <Card className="sticky top-24">
                  <CardContent className="p-6 space-y-4">
                    <div className="text-center py-2">
                      <h3 className="font-semibold">Generate Application</h3>
                      <p className="text-sm text-muted-foreground">
                        Create tailored application materials for:
                      </p>
                    </div>

                    <div className="border rounded-md p-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={selectedJob.logo}
                          alt={selectedJob.company}
                          className="w-10 h-10 rounded-md"
                        />
                        <div>
                          <h4 className="font-medium">{selectedJob.title}</h4>
                          <p className="text-sm text-muted-foreground">{selectedJob.company}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        <span className="text-sm">Tailored Resume</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        <span className="text-sm">Cover Letter</span>
                      </div>
                    </div>

                    <Button
                      className="w-full"
                      onClick={() => setApplicationDialogOpen(true)}
                    >
                      Generate Application
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="url">
          <div className="space-y-4 max-w-2xl">
            <div>
              <Label htmlFor="job-url">Job Listing URL</Label>
              <div className="flex mt-2">
                <Input
                  id="job-url"
                  placeholder="https://example.com/job-listing"
                  value={jobUrl}
                  onChange={(e) => setJobUrl(e.target.value)}
                  className="rounded-r-none"
                />
                <Button
                  className="rounded-l-none"
                  disabled={isParsingUrl}
                  onClick={handleUrlSearch}
                >
                  {isParsingUrl ? "Processing..." : (
                    <>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Parse Job
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Paste a URL from LinkedIn, Indeed, Glassdoor, or other major job sites
              </p>
            </div>

            {selectedJob && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <img
                      src={selectedJob.logo}
                      alt={selectedJob.company}
                      className="w-12 h-12 rounded-md"
                    />
                    <div className="flex-1 space-y-2">
                      <h3 className="font-semibold">{selectedJob.title}</h3>
                      <div className="flex items-center text-muted-foreground text-sm">
                        <Building2 className="h-3.5 w-3.5 mr-1" />
                        <span>{selectedJob.company}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span>{selectedJob.location}</span>
                        </div>
                        <div className="flex items-center">
                          <Briefcase className="h-3 w-3 mr-1" />
                          <span>{selectedJob.type}</span>
                        </div>
                        {selectedJob.jobProvider && (
                          <div className="flex items-center">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            <span>Source: {selectedJob.jobProvider}</span>
                          </div>
                        )}
                      </div>
                      {selectedJob.rating && (
                        <div className="mt-2 text-sm">
                          <div className="flex items-center">
                            <span className="font-medium">Match Rating: {selectedJob.rating}/5</span>
                            {selectedJob.rating_description && (
                              <span className="ml-2 text-xs text-muted-foreground">({selectedJob.rating_description})</span>
                            )}
                          </div>
                        </div>
                      )}
                      <p className="text-sm mt-2">{selectedJob.description}</p>
                      <div className="mt-4 flex gap-2">
                        {selectedJob.url && (
                          <Button
                            variant="outline"
                            onClick={() => window.open(selectedJob.url, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            View Job
                          </Button>
                        )}
                        <Button onClick={() => setApplicationDialogOpen(true)}>
                          Generate Application
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="manual">
          <div className="space-y-6 max-w-2xl">
            <div>
              <h3 className="text-lg font-medium mb-2">Enter Job Details Manually</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Don't have a job URL? Enter the job details manually to generate application materials.
              </p>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="manual-job-title">Job Title</Label>
                    <Input
                      id="manual-job-title"
                      placeholder="e.g., Frontend Developer"
                      value={manualJobTitle}
                      onChange={(e) => setManualJobTitle(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="manual-company">Company</Label>
                    <Input
                      id="manual-company"
                      placeholder="e.g., Acme Inc."
                      value={manualCompany}
                      onChange={(e) => setManualCompany(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="manual-location">Location</Label>
                    <Input
                      id="manual-location"
                      placeholder="e.g., Remote, New York, NY"
                      value={manualLocation}
                      onChange={(e) => setManualLocation(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="manual-job-type">Job Type</Label>
                    <Select value={manualJobType} onValueChange={setManualJobType}>
                      <SelectTrigger id="manual-job-type" className="mt-1">
                        <SelectValue placeholder="Select job type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Full-time">Full-time</SelectItem>
                        <SelectItem value="Part-time">Part-time</SelectItem>
                        <SelectItem value="Contract">Contract</SelectItem>
                        <SelectItem value="Internship">Internship</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="manual-description">Job Description</Label>
                  <Textarea
                    id="manual-description"
                    placeholder="Enter the job description here..."
                    value={manualDescription}
                    onChange={(e) => setManualDescription(e.target.value)}
                    className="mt-1 min-h-32"
                  />
                </div>

                <Button
                  onClick={handleManualJobAdd}
                  disabled={isAddingManualJob}
                >
                  {isAddingManualJob ? "Adding..." : "Add Job & Generate Application"}
                </Button>
              </div>
            </div>

            {selectedJob && selectedJob.jobProvider === "Manual Entry" && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <img
                      src={selectedJob.logo}
                      alt={selectedJob.company}
                      className="w-12 h-12 rounded-md"
                    />
                    <div className="flex-1 space-y-2">
                      <h3 className="font-semibold">{selectedJob.title}</h3>
                      <div className="flex items-center text-muted-foreground text-sm">
                        <Building2 className="h-3.5 w-3.5 mr-1" />
                        <span>{selectedJob.company}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span>{selectedJob.location}</span>
                        </div>
                        <div className="flex items-center">
                          <Briefcase className="h-3 w-3 mr-1" />
                          <span>{selectedJob.type}</span>
                        </div>
                        <div className="flex items-center">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          <span>Source: Manual Entry</span>
                        </div>
                      </div>
                      <p className="text-sm mt-2">{selectedJob.description}</p>
                      <div className="mt-4">
                        <Button onClick={() => setApplicationDialogOpen(true)}>
                          Generate Application
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Application Dialog */}
      <Dialog open={applicationDialogOpen} onOpenChange={setApplicationDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Generate Application Materials</DialogTitle>
            <DialogDescription>
              Select options to create tailored application materials for {selectedJob?.title} at {selectedJob?.company}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Resume Selection */}
            <div>
              <Label htmlFor="resume-select" className="text-base font-medium">Select Resume</Label>
              {resumes.length > 0 ? (
                <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Choose a resume" />
                  </SelectTrigger>
                  <SelectContent>
                    {resumes.map(resume => (
                      <SelectItem key={resume.id} value={resume.id}>
                        {resume.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="bg-muted p-4 rounded-md mt-2">
                  <p className="text-sm text-muted-foreground">You don't have any resumes uploaded. Please upload a resume first.</p>
                </div>
              )}
            </div>

            {/* Job Description */}
            <div>
              <Label htmlFor="job-description" className="text-base font-medium">Job Description</Label>
              <Textarea
                id="job-description"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="min-h-32 mt-2"
                placeholder="Enter the job description here..."
              />
            </div>

            {/* Application Options */}
            <div>
              <h3 className="text-base font-medium mb-2">What would you like to generate?</h3>
              <div className="flex gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={applicationOptions.generateResume}
                    onChange={(e) => setApplicationOptions({...applicationOptions, generateResume: e.target.checked})}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span>Tailored Resume</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={applicationOptions.generateCoverLetter}
                    onChange={(e) => setApplicationOptions({...applicationOptions, generateCoverLetter: e.target.checked})}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span>Cover Letter</span>
                </label>
              </div>
            </div>

            {/* Cover Letter Details (only show if cover letter is selected) */}
            {applicationOptions.generateCoverLetter && (
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-base font-medium">Cover Letter Details</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="userName">Your Full Name</Label>
                    <Input
                      id="userName"
                      value={coverLetterDetails.userName}
                      onChange={(e) => setCoverLetterDetails({...coverLetterDetails, userName: e.target.value})}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="company">Company Name</Label>
                    <Input
                      id="company"
                      value={coverLetterDetails.company}
                      onChange={(e) => setCoverLetterDetails({...coverLetterDetails, company: e.target.value})}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="role">Position/Role</Label>
                    <Input
                      id="role"
                      value={coverLetterDetails.role}
                      onChange={(e) => setCoverLetterDetails({...coverLetterDetails, role: e.target.value})}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="manager">Hiring Manager (if known)</Label>
                    <Input
                      id="manager"
                      value={coverLetterDetails.manager}
                      onChange={(e) => setCoverLetterDetails({...coverLetterDetails, manager: e.target.value})}
                      className="mt-1"
                      placeholder="Optional"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="referral">Referral (if any)</Label>
                    <Input
                      id="referral"
                      value={coverLetterDetails.referral}
                      onChange={(e) => setCoverLetterDetails({...coverLetterDetails, referral: e.target.value})}
                      className="mt-1"
                      placeholder="Optional"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setApplicationDialogOpen(false)}
              disabled={isGenerating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerateApplication}
              disabled={!selectedResumeId || isGenerating}
            >
              {isGenerating ? "Generating..." : "Generate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Application Materials Editors */}
      {(generatedResumeId || generatedCoverLetterId) && (
        <div className="mt-6 p-6 border rounded-lg bg-muted/30">
          <h3 className="text-xl font-medium mb-2">Your Application Materials Are Ready!</h3>
          <p className="text-muted-foreground mb-4">
            Your application materials have been generated and are ready to be edited and compiled to PDF.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {generatedResumeId && (
              <div className="border rounded-lg p-4 bg-white">
                <h4 className="font-medium flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-primary" />
                  Tailored Resume
                </h4>
                <p className="text-sm text-muted-foreground mt-2 mb-4">
                  Your resume has been tailored to match the job description. Click "Edit Resume" to view and edit the JSON, then compile it to PDF using the external API.
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleOpenResumeEditor}
                    disabled={isLoadingResumeForEdit}
                    className="flex-1"
                  >
                    {isLoadingResumeForEdit ? (
                      <span className="inline-block h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                    ) : (
                      <Edit className="mr-2 h-4 w-4" />
                    )}
                    Edit Resume
                  </Button>
                </div>
              </div>
            )}

            {generatedCoverLetterId && (
              <div className="border rounded-lg p-4 bg-white">
                <h4 className="font-medium flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-primary" />
                  Cover Letter
                </h4>
                <p className="text-sm text-muted-foreground mt-2 mb-4">
                  A cover letter has been created based on your resume and the job details. Click "Edit Cover Letter" to view and edit the text content.
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleOpenCoverLetterEditor}
                    disabled={isLoadingCoverLetterForEdit}
                    className="flex-1"
                  >
                    {isLoadingCoverLetterForEdit ? (
                      <span className="inline-block h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                    ) : (
                      <Edit className="mr-2 h-4 w-4" />
                    )}
                    Edit Cover Letter
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              <strong>How it works:</strong>
            </p>
            <ol className="text-sm text-muted-foreground list-decimal pl-5 mt-2 space-y-1">
              <li>Edit your resume JSON in the editor</li>
              <li>Click "Preview as PDF" to compile the resume using the external API</li>
              <li>View and download the compiled PDF</li>
              <li>Edit your cover letter text as needed</li>
              <li>Save your changes when you're done</li>
            </ol>
          </div>
        </div>
      )}

      {/* Resume Editor Dialog */}
      {selectedResumeForEdit && (
        <ResumeTextEditor
          resume={selectedResumeForEdit}
          onSave={handleResumeUpdate}
          onClose={() => {
            setIsResumeEditorOpen(false);
            setSelectedResumeForEdit(null);
          }}
          open={isResumeEditorOpen}
        />
      )}

      {/* Cover Letter Editor Dialog */}
      {selectedCoverLetterForEdit && (
        <CoverLetterEditor
          coverLetter={selectedCoverLetterForEdit}
          onSave={handleCoverLetterUpdate}
          onClose={() => {
            setIsCoverLetterEditorOpen(false);
            setSelectedCoverLetterForEdit(null);
          }}
          open={isCoverLetterEditorOpen}
        />
      )}
    </div>
  );
};

export default JobSearch;
