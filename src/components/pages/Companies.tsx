import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Building2, ChevronDown, ExternalLink, SearchCheck } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

// Empty company data
const emptyCompanies = [];

const Companies = () => {
  const [companies, setCompanies] = useState(emptyCompanies);
  const [searchQuery, setSearchQuery] = useState("");
  const [companyUrl, setCompanyUrl] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [expandedCompany, setExpandedCompany] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Search query required",
        description: "Please enter a company name to search",
        variant: "destructive",
      });
      return;
    }
    
    setIsSearching(true);
    
    try {
      // Simulate search delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "No results found",
        description: "No companies found matching your search",
      });
      
    } catch (error) {
      toast({
        title: "Search failed",
        description: "An error occurred while searching",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleUrlSearch = async () => {
    if (!companyUrl.trim()) {
      toast({
        title: "URL required",
        description: "Please enter a company website URL",
        variant: "destructive",
      });
      return;
    }
    
    setIsSearching(true);
    
    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "No company found",
        description: "Unable to find company information from this URL",
      });
      
    } catch (error) {
      toast({
        title: "Analysis failed",
        description: "Unable to analyze company from the provided URL",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const toggleExpandCompany = (id: string) => {
    setExpandedCompany(expandedCompany === id ? null : id);
  };
  
  const handleGenerateAnalysis = async (companyId: string) => {
    toast({
      title: "Generating analysis",
      description: "Creating SWOT analysis for the company...",
    });
    
    // Simulate generation delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: "Analysis complete",
      description: "SWOT analysis has been generated",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Company Analysis</h1>
        <p className="text-muted-foreground mt-1">Research companies and generate SWOT analyses</p>
      </div>

      <Tabs defaultValue="search">
        <TabsList className="w-[300px] mb-6">
          <TabsTrigger value="search" className="flex-1">Company Name</TabsTrigger>
          <TabsTrigger value="url" className="flex-1">Website URL</TabsTrigger>
        </TabsList>
        
        <TabsContent value="search" className="space-y-6">
          <div className="flex gap-2 max-w-lg">
            <Input
              placeholder="Enter company name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={isSearching}>
              {isSearching ? "Searching..." : "Search"}
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="url" className="space-y-6">
          <div className="flex gap-2 max-w-lg">
            <Input
              placeholder="Enter company website URL"
              value={companyUrl}
              onChange={(e) => setCompanyUrl(e.target.value)}
              className="flex-1"
              onKeyDown={(e) => e.key === "Enter" && handleUrlSearch()}
            />
            <Button onClick={handleUrlSearch} disabled={isSearching} className="whitespace-nowrap">
              {isSearching ? "Analyzing..." : "Analyze Company"}
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {companies.length > 0 ? (
        <div className="space-y-4">
          {companies.map((company) => (
            <Card key={company.id} className="overflow-hidden">
              <div className="cursor-pointer p-4 sm:p-6 flex items-center" onClick={() => toggleExpandCompany(company.id)}>
                <img
                  src={company.logo}
                  alt={company.name}
                  className="w-12 h-12 rounded-md mr-4"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{company.name}</h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
                    <span>{company.industry}</span>
                    <span>•</span>
                    <span>{company.size}</span>
                    <span>•</span>
                    <span>{company.location}</span>
                  </div>
                </div>
                <ChevronDown 
                  className={`h-5 w-5 text-muted-foreground transition-transform ${expandedCompany === company.id ? 'rotate-180' : ''}`} 
                />
              </div>
            
              {expandedCompany === company.id && (
                <div className="px-4 sm:px-6 pb-6 pt-2 border-t">
                  <div className="flex flex-col-reverse lg:flex-row gap-6">
                    <div className="lg:w-2/3">
                      <h4 className="font-medium mb-2">SWOT Analysis</h4>
                    
                      <Accordion type="single" collapsible defaultValue="strengths" className="w-full">
                        <AccordionItem value="strengths">
                          <AccordionTrigger>
                            <span className="font-medium text-green-600">Strengths</span>
                          </AccordionTrigger>
                          <AccordionContent>
                            <ul className="list-disc pl-5 space-y-1">
                              {company.swot.strengths.map((item, i) => (
                                <li key={i}>{item}</li>
                              ))}
                            </ul>
                          </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="weaknesses">
                          <AccordionTrigger>
                            <span className="font-medium text-red-600">Weaknesses</span>
                          </AccordionTrigger>
                          <AccordionContent>
                            <ul className="list-disc pl-5 space-y-1">
                              {company.swot.weaknesses.map((item, i) => (
                                <li key={i}>{item}</li>
                              ))}
                            </ul>
                          </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="opportunities">
                          <AccordionTrigger>
                            <span className="font-medium text-blue-600">Opportunities</span>
                          </AccordionTrigger>
                          <AccordionContent>
                            <ul className="list-disc pl-5 space-y-1">
                              {company.swot.opportunities.map((item, i) => (
                                <li key={i}>{item}</li>
                              ))}
                            </ul>
                          </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="threats">
                          <AccordionTrigger>
                            <span className="font-medium text-amber-600">Threats</span>
                          </AccordionTrigger>
                          <AccordionContent>
                            <ul className="list-disc pl-5 space-y-1">
                              {company.swot.threats.map((item, i) => (
                                <li key={i}>{item}</li>
                              ))}
                            </ul>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>
                  
                    <div className="lg:w-1/3">
                      <Card className="bg-muted/50">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-4">
                            <Building2 className="h-5 w-5 text-primary" />
                            <h4 className="font-medium">Company Info</h4>
                          </div>
                        
                          <div className="text-sm space-y-3">
                            <p>{company.description}</p>
                          
                            <div>
                              <span className="text-muted-foreground">Industry:</span>
                              <span className="ml-2">{company.industry}</span>
                            </div>
                          
                            <div>
                              <span className="text-muted-foreground">Size:</span>
                              <span className="ml-2">{company.size}</span>
                            </div>
                          
                            <div>
                              <span className="text-muted-foreground">Location:</span>
                              <span className="ml-2">{company.location}</span>
                            </div>
                          
                            <div>
                              <span className="text-muted-foreground">Website:</span>
                              <a 
                                href={company.website}
                                className="ml-2 text-primary hover:underline inline-flex items-center"
                                target="_blank" 
                                rel="noopener noreferrer"
                              >
                                Visit website
                                <ExternalLink className="h-3 w-3 ml-1" />
                              </a>
                            </div>
                          
                            <Button className="w-full mt-2" onClick={() => handleGenerateAnalysis(company.id)}>
                              <SearchCheck className="mr-2 h-4 w-4" />
                              Refresh Analysis
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
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
            <CardTitle>No companies found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Search for companies by name or website URL to analyze them
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Companies;
