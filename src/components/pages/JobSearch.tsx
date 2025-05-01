'use client';
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Briefcase, Building2, Clock, ExternalLink, FileText, MapPin, Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Resume, fetchResumes, optimizeResume, generateCoverLetter, OptimizeResumeParams, GenerateCoverLetterParams, parseJobUrl } from "@/services/documentService";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useQuery } from "@tanstack/react-query";
import { toast as toastSonner } from "sonner";

// Sample job data for initial UI rendering
const sampleJobs = [
  {
    id: "1",
    title: "Senior Frontend Developer",
    company: "Acme Inc",
    location: "San Francisco, CA",
    type: "Full-time",
    postedAt: "2 days ago",
    description: "We are looking for an experienced Frontend Developer to join our team...",
    logo: "https://ui-avatars.com/api/?name=A&background=6366f1&color=fff"
  },
  {
    id: "2",
    title: "Product Manager",
    company: "TechCorp",
    location: "Remote",
    type: "Full-time",
    postedAt: "1 week ago",
    description: "As a Product Manager, you will be responsible for the product roadmap...",
    logo: "https://ui-avatars.com/api/?name=T&background=06b6d4&color=fff"
  }
];

// Job type interface
interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  postedAt: string;
  description: string;
  logo: string;
}

const JobSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Job[]>(sampleJobs);
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
  const { toast } = useToast();

  // Fetch user's resumes
  const { data: resumes = [], error: resumeError } = useQuery({
    queryKey: ['resumes'],
    queryFn: fetchResumes
  });
  
  // Handle any errors from fetching resumes (using useEffect to avoid infinite renders)
  useEffect(() => {
    if (resumeError) {
      toast({
        title: "Error loading resumes",
        description: (resumeError as any)?.message || "Failed to load your resumes",
        variant: "destructive",
      });
    }
  }, [resumeError, toast]);

  const handleSearch = async () => {
    setIsSearching(true);
    
    try {
      // In a real implementation, this would call a jobs search API
      // For now, we're just simulating with sample data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const filtered = sampleJobs.filter(job => 
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        job.company.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      setSearchResults(filtered);
      
      if (filtered.length === 0) {
        toast({
          title: "No results found",
          description: "Try adjusting your search terms",
        });
      }
    } catch (error: any) {
      toast({
        title: "Search failed",
        description: error?.message || "There was an error performing your search",
        variant: "destructive",
      });
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
        logo: `https://ui-avatars.com/api/?name=${jobData.company.charAt(0)}&background=22c55e&color=fff`
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
      let tailoredResumeContent: string | undefined;
      let coverLetterContent: string | undefined;
      
      // Generate tailored resume if selected
      if (applicationOptions.generateResume) {
        const params: OptimizeResumeParams = {
          resumeId: selectedResumeId,
          jobText: jobDescription
        };
        
        if (jobUrl) {
          params.jobUrl = jobUrl;
        }
        
        tailoredResumeContent = await optimizeResume(params);
        toastSonner.success("Tailored resume generated successfully");
      }
      
      // Generate cover letter if selected
      if (applicationOptions.generateCoverLetter) {
        const params: GenerateCoverLetterParams = {
          resumeId: selectedResumeId,
          jobDescription: jobDescription,
          userName: coverLetterDetails.userName,
          company: coverLetterDetails.company || selectedJob.company,
          manager: coverLetterDetails.manager,
          role: coverLetterDetails.role || selectedJob.title,
          referral: coverLetterDetails.referral
        };
        
        const response = await generateCoverLetter(params);
        if (response.variations && response.variations.length > 0) {
          coverLetterContent = response.variations[0].content;
          toastSonner.success("Cover letter generated successfully");
        }
      }
      
      // Close the dialog
      setApplicationDialogOpen(false);
      
      // Show success toast
      toast({
        title: "Application materials ready",
        description: `Successfully created ${applicationOptions.generateResume ? 'a tailored resume' : ''}${applicationOptions.generateResume && applicationOptions.generateCoverLetter ? ' and ' : ''}${applicationOptions.generateCoverLetter ? 'a cover letter' : ''}`,
      });
      
      // Here you would navigate to a page showing the generated materials
      // For now, we'll just display some success toasts with the content
      if (tailoredResumeContent) {
        toastSonner("Tailored Resume Preview", {
          description: tailoredResumeContent.substring(0, 100) + "...",
          duration: 5000,
        });
      }
      
      if (coverLetterContent) {
        toastSonner("Cover Letter Preview", {
          description: coverLetterContent.substring(0, 100) + "...",
          duration: 5000,
        });
      }
    } catch (error: any) {
      toast({
        title: "Generation failed",
        description: error?.message || "Failed to create application materials",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Find Jobs</h1>
        <p className="text-muted-foreground mt-1">Search for jobs or paste a job listing URL</p>
      </div>

      <Tabs defaultValue="search">
        <TabsList className="grid grid-cols-2 mb-6 w-[300px]">
          <TabsTrigger value="search">Job Search</TabsTrigger>
          <TabsTrigger value="url">Paste URL</TabsTrigger>
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
                          </div>
                          <p className="text-sm mt-2">{job.description}</p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="border-t px-6 py-3 bg-muted/30 flex justify-between">
                      <Button 
                        size="sm" 
                        onClick={() => handleApplyToJob(job)}
                      >
                        Apply Now
                      </Button>
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
              {resumes && resumes.length > 0 ? (
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
    </div>
  );
};

export default JobSearch;
