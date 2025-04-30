
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Briefcase, Building2, Clock, ExternalLink, FileText, Link, MapPin, Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Sample job data
const sampleJobs = [
  {
    id: "1",
    title: "Senior Frontend Developer",
    company: "Acme Inc",
    location: "San Francisco, CA",
    type: "Full-time",
    postedAt: "2 days ago",
    description: "We are looking for an experienced Frontend Developer to join our team...",
    skills: ["React", "TypeScript", "Tailwind", "Next.js"],
    salary: "$120,000 - $150,000",
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
    skills: ["Product Strategy", "Agile", "User Research", "Analytics"],
    salary: "$130,000 - $160,000",
    logo: "https://ui-avatars.com/api/?name=T&background=06b6d4&color=fff"
  },
  {
    id: "3",
    title: "UX/UI Designer",
    company: "Startup.io",
    location: "New York, NY",
    type: "Full-time",
    postedAt: "3 days ago",
    description: "We're seeking a talented UX/UI Designer to create amazing user experiences...",
    skills: ["Figma", "User Testing", "Interaction Design", "Prototyping"],
    salary: "$110,000 - $140,000",
    logo: "https://ui-avatars.com/api/?name=S&background=22c55e&color=fff"
  }
];

const JobSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState(sampleJobs);
  const [selectedJob, setSelectedJob] = useState<(typeof sampleJobs)[0] | null>(null);
  const { toast } = useToast();

  const handleSearch = async () => {
    setIsSearching(true);
    
    try {
      // Simulate search delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // This would be replaced with actual API call to Serper or similar
      // For now, just filter the sample data
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
    } catch (error) {
      toast({
        title: "Search failed",
        description: "There was an error performing your search",
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
    
    setIsSearching(true);
    
    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // This would be replaced with actual URL scraping and parsing
      toast({
        title: "Job parsed successfully",
        description: "The job listing has been analyzed",
      });
      
      // Show a random job from our sample as the "parsed" job
      const randomJob = sampleJobs[Math.floor(Math.random() * sampleJobs.length)];
      setSelectedJob(randomJob);
    } catch (error) {
      toast({
        title: "Processing failed",
        description: "Unable to parse job from the provided URL",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleApplyToJob = (job: (typeof sampleJobs)[0]) => {
    setSelectedJob(job);
    toast({
      title: "Job selected",
      description: "Ready to create your application",
    });
  };

  const handleGenerateApplication = async () => {
    if (!selectedJob) return;
    
    try {
      toast({
        title: "Generating application",
        description: "Creating tailored resume and cover letter...",
      });
      
      // Simulate generation delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Application ready",
        description: "Your tailored resume and cover letter have been generated",
      });
      
      // Here you would navigate to the application review page
    } catch (error) {
      toast({
        title: "Generation failed",
        description: "Unable to create application materials",
        variant: "destructive",
      });
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
                          <div className="flex flex-wrap gap-1 mt-3">
                            {job.skills.map((skill, i) => (
                              <span 
                                key={i} 
                                className="px-2 py-0.5 bg-secondary text-secondary-foreground rounded-full text-xs"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="border-t px-6 py-3 bg-muted/30 flex justify-between">
                      <span className="text-sm font-medium">{job.salary}</span>
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
                      <div className="flex items-center gap-2">
                        <Link className="h-4 w-4 text-primary" />
                        <span className="text-sm">Application Tracking</span>
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full" 
                      onClick={handleGenerateApplication}
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
                  disabled={isSearching}
                  onClick={handleUrlSearch}
                >
                  {isSearching ? "Processing..." : (
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
                      <div className="flex flex-wrap gap-1 mt-3">
                        {selectedJob.skills.map((skill, i) => (
                          <span 
                            key={i} 
                            className="px-2 py-0.5 bg-secondary text-secondary-foreground rounded-full text-xs"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                      <div className="mt-4">
                        <Button onClick={handleGenerateApplication}>
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
    </div>
  );
};

export default JobSearch;
