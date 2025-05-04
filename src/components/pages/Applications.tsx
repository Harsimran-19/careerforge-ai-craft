import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Building2, Briefcase, Calendar, CheckCircle, ChevronDown, Clock, FileText, Link2, MapPin } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Application } from "@/types";

// Define empty applications array with the correct type
const emptyApplications: Application[] = [];

const Applications = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedApp, setExpandedApp] = useState<string | null>(null);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const { toast } = useToast();

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

  const handleStatusChange = (id: string, newStatus: string) => {
    setApplications(applications.map(app => 
      app.id === id ? { ...app, status: newStatus } : app
    ));
    
    toast({
      title: "Status updated",
      description: `Application status changed to ${newStatus}`,
    });
  };
  
  const handleInterviewToggle = (id: string, hasInterview: boolean) => {
    setApplications(applications.map(app => 
      app.id === id ? { ...app, hasInterview } : app
    ));
    
    toast({
      description: hasInterview ? 
        "Interview scheduled" : 
        "Interview removed",
    });
  };
  
  const handleUpdateNotes = () => {
    if (!selectedApp) return;
    
    setApplications(applications.map(app => 
      app.id === selectedApp.id ? { ...app, notes: selectedApp.notes, nextStep: selectedApp.nextStep } : app
    ));
    
    toast({
      description: "Application notes updated",
    });
    
    setSelectedApp(null);
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
      {filteredApplications.length > 0 ? (
        <div className="space-y-4">
          {filteredApplications.map((app) => (
            <Card key={app.id} className="overflow-hidden">
              <div className="cursor-pointer" onClick={() => toggleExpand(app.id)}>
                <div className="flex items-center p-4 sm:p-6">
                  <img
                    src={app.logo}
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
                              onChange={(e) => {
                                setApplications(applications.map(a => 
                                  a.id === app.id ? { ...a, interviewDate: e.target.value } : a
                                ));
                              }}
                              className="mt-1"
                            />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <Button variant="outline" size="sm" className="gap-1">
                          <FileText className="h-4 w-4" />
                          Resume
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1">
                          <FileText className="h-4 w-4" />
                          Cover Letter
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1">
                          <Link2 className="h-4 w-4" />
                          Job URL
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
    </div>
  );
};

export default Applications;
