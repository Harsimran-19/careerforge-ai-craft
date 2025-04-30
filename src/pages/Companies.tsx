
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Building2, ChevronDown, ExternalLink, SearchCheck } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

// Sample company data
const sampleCompanies = [
  {
    id: "1",
    name: "Acme Inc",
    industry: "Technology",
    size: "1,000-5,000 employees",
    location: "San Francisco, CA",
    description: "Acme Inc. is a leading technology company specializing in cloud infrastructure and services.",
    website: "https://example.com/acme",
    logo: "https://ui-avatars.com/api/?name=A&background=6366f1&color=fff",
    swot: {
      strengths: [
        "Market leader in cloud infrastructure",
        "Strong financial position with $2B in annual revenue",
        "Innovative product portfolio with recent ML advancements",
        "Excellent company culture and employee benefits"
      ],
      weaknesses: [
        "High employee turnover in engineering departments",
        "Limited presence in international markets",
        "Growing competition from smaller, more agile startups",
        "Recent product launch delays"
      ],
      opportunities: [
        "Expanding into emerging markets in Asia",
        "Strategic acquisitions of AI startups",
        "Growing enterprise demand for cloud solutions",
        "Partnerships with major hardware manufacturers"
      ],
      threats: [
        "Increased regulation in data privacy",
        "Rising cloud infrastructure costs",
        "Competition from major tech companies",
        "Economic downturn affecting B2B spending"
      ]
    }
  },
  {
    id: "2",
    name: "TechCorp",
    industry: "Software",
    size: "5,000-10,000 employees",
    location: "New York, NY",
    description: "TechCorp is an enterprise software company creating solutions for finance, healthcare and retail industries.",
    website: "https://example.com/techcorp",
    logo: "https://ui-avatars.com/api/?name=T&background=06b6d4&color=fff",
    swot: {
      strengths: [
        "Diversified product portfolio across multiple industries",
        "Strong brand recognition in enterprise software",
        "Stable recurring revenue from SaaS model",
        "Robust partner ecosystem"
      ],
      weaknesses: [
        "Aging legacy products requiring modernization",
        "Complex organizational structure slowing decision-making",
        "Technical debt in core products",
        "Higher cost structure than newer competitors"
      ],
      opportunities: [
        "Migration of products to cloud-native architecture",
        "Expansion of AI capabilities across product suite",
        "Growing healthcare IT spending",
        "Consolidation opportunities in fragmented markets"
      ],
      threats: [
        "Disruption from cloud-native competitors",
        "Rapid technological change",
        "Customer budget constraints in economic uncertainty",
        "Talent acquisition challenges in competitive markets"
      ]
    }
  },
  {
    id: "3",
    name: "Startup.io",
    industry: "FinTech",
    size: "100-500 employees",
    location: "Remote",
    description: "Startup.io is a fast-growing fintech company revolutionizing payment processing for small businesses.",
    website: "https://example.com/startupio",
    logo: "https://ui-avatars.com/api/?name=S&background=22c55e&color=fff",
    swot: {
      strengths: [
        "Innovative payment processing technology",
        "Low-cost structure with remote-first approach",
        "Strong growth trajectory with 200% YoY revenue increase",
        "Agile development practices enabling rapid feature releases"
      ],
      weaknesses: [
        "Limited brand recognition compared to established players",
        "Smaller customer support team causing longer response times",
        "Heavy reliance on third-party payment infrastructure",
        "Limited capital reserves for market downturns"
      ],
      opportunities: [
        "Growing small business market seeking digital payment solutions",
        "International expansion into underserved markets",
        "Strategic partnerships with e-commerce platforms",
        "Additional revenue streams through value-added services"
      ],
      threats: [
        "Regulatory changes in fintech industry",
        "Established financial institutions entering the market",
        "Cybersecurity and fraud risks",
        "Customer acquisition costs increasing due to competition"
      ]
    }
  }
];

const Companies = () => {
  const [companies, setCompanies] = useState(sampleCompanies);
  const [searchQuery, setSearchQuery] = useState("");
  const [companyUrl, setCompanyUrl] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [expandedCompany, setExpandedCompany] = useState<string | null>("1"); // Default expanded to first company
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
      
      // This would be replaced with actual API call
      // For now, just filter the sample data
      const filtered = sampleCompanies.filter(company => 
        company.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      if (filtered.length === 0) {
        toast({
          title: "No results found",
          description: "No companies found matching your search",
        });
      } else {
        setCompanies(filtered);
        setExpandedCompany(filtered[0].id);
      }
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
      
      // This would be replaced with actual URL analysis
      toast({
        title: "Company found",
        description: "Company information has been analyzed",
      });
      
      // Return a random company as the "found" company
      const randomCompany = sampleCompanies[Math.floor(Math.random() * sampleCompanies.length)];
      setCompanies([randomCompany]);
      setExpandedCompany(randomCompany.id);
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
    
    // For this demo, we already have the analyses
    setExpandedCompany(companyId);
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

      {/* Company List */}
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
    </div>
  );
};

export default Companies;
