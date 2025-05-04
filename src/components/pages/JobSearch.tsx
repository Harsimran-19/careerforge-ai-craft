'use client';
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Briefcase, Search, ExternalLink, Building2, Clock, MapPin } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Resume, fetchResumes, optimizeResume, OptimizeResumeParams, parseJobUrl } from "@/services/documentService";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useQuery } from "@tanstack/react-query";
import { toast as toastSonner } from "sonner";
import { Job } from "@/types";

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
    generateCoverLetter: false
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  // Fetch user's resumes
  const { data: resumes = [] } = useQuery({
    queryKey: ['resumes'],
    queryFn: fetchResumes
  });

  const handleSearch = async () => {
    setIsSearching(true);
    
    try {
      // In a real implementation, this would call a jobs search API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Return empty array
      setSearchResults([]);
      
      toast({
        title: "No results found",
        description: "Try adjusting your search terms",
      });
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
      // Call job parsing service
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
      // Generate tailored resume if selected
      if (applicationOptions.generateResume) {
        const params: OptimizeResumeParams = {
          resumeId: selectedResumeId,
          jobText: jobDescription
        };
        
        if (jobUrl) {
          params.jobUrl = jobUrl;
        }
        
        const tailoredResumeContent = await optimizeResume(params);
        toastSonner.success("Tailored resume generated successfully");
      }
      
      // Close the dialog
      setApplicationDialogOpen(false);
      
      // Show success toast
      toast({
        title: "Application materials ready",
        description: `Successfully created a tailored resume for this job application`,
      });
      
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
          
          <div className="mt-8">
            {searchResults.length > 0 ? (
              <div className="grid lg:grid-cols-3 gap-6">
                <div className={`lg:col-span-2 space-y-4 ${selectedJob ? 'block' : 'lg:col-span-3'}`}>
                  {searchResults.map((job) => (
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
                  ))}
                </div>
              </div>
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
              Select options to create tailored application materials
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
                    {resumes.map((resume: Resume) => (
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
              </div>
            </div>
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
