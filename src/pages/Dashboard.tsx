
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, FileText, Plus, Sparkles, Upload } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchResumes } from "@/services/documentService";
import { supabase } from "@/integrations/supabase/client";

// Application type definition
interface RecentApplication {
  id: string;
  company: string;
  position: string;
  status: string;
  date: string;
  logo: string;
}

// Full application type definition
interface Application {
  id: string;
  position: string;
  company: string;
  status: string;
  applied_date: string;
  resume_id: string;
  cover_letter_id: string;
  has_interview: boolean;
  interview_date: string | null;
}

const Dashboard = () => {
  const [applicationCount, setApplicationCount] = useState(0);
  const [recentApplications, setRecentApplications] = useState<RecentApplication[]>([]);
  const [responseRate, setResponseRate] = useState(0);
  const [interviewSuccess, setInterviewSuccess] = useState(0);
  const [isApplicationsLoading, setIsApplicationsLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch resumes using React Query
  const {
    data: resumes = [],
    isLoading: isResumesLoading
  } = useQuery({
    queryKey: ['resumes'],
    queryFn: fetchResumes
  });

  // Calculate resume count from the fetched data
  const resumeCount = resumes.length;

  // Fetch applications data from Supabase
  useEffect(() => {
    const fetchApplications = async () => {
      setIsApplicationsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('applications')
          .select('*')
          .eq('user_id', user.id)
          .order('applied_date', { ascending: false });

        if (error) throw error;

        // Set application count
        setApplicationCount(data.length);

        // Calculate response rate (applications that have status other than 'Applied')
        if (data.length > 0) {
          const responsesReceived = data.filter(app => 
            app.status && app.status !== 'Applied').length;
          setResponseRate(Math.round((responsesReceived / data.length) * 100));
          
          // Calculate interview success rate
          const interviewsScheduled = data.filter(app => app.has_interview).length;
          const offersReceived = data.filter(app => 
            app.status && app.status === 'Offered').length;
          
          if (interviewsScheduled > 0) {
            setInterviewSuccess(Math.round((offersReceived / interviewsScheduled) * 100));
          }
        }

        // Format recent applications for display (max 5)
        const recentApps = data.slice(0, 5).map(app => ({
          id: app.id,
          company: app.company || 'Unknown Company',
          position: app.position || 'Unknown Position',
          status: app.status || 'Applied',
          date: app.applied_date || new Date().toISOString(),
          logo: `https://ui-avatars.com/api/?name=${app.company?.charAt(0) || 'C'}&background=22c55e&color=fff`
        }));

        setRecentApplications(recentApps);
      } catch (error) {
        console.error('Error fetching applications:', error);
      } finally {
        setIsApplicationsLoading(false);
      }
    };

    fetchApplications();
  }, []);

  // Set loading state based on all data fetching operations
  const isLoading = isResumesLoading || isApplicationsLoading;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Applied': return 'bg-blue-100 text-blue-600';
      case 'Interview': return 'bg-amber-100 text-amber-600';
      case 'Offered': return 'bg-green-100 text-green-600';
      case 'Rejected': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Welcome to Your Dashboard</h1>
        <Button onClick={() => navigate("/job-search")}>
          <Sparkles className="mr-2 h-4 w-4" />
          Find New Jobs
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Uploaded Resumes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-bold">{resumeCount}</div>
              <Button variant="outline" size="sm" onClick={() => navigate("/resumes")}>
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{applicationCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Response Rate
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-3xl font-bold">{responseRate}%</div>
            <Progress value={responseRate} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Interview Success
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-3xl font-bold">{interviewSuccess}%</div>
            <Progress value={interviewSuccess} className="h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-gradient-to-br from-careerforge-700 to-careerforge-900 text-white">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-2">Upload Your Resume</h3>
              <p className="text-careerforge-100 mb-4">Start by uploading your existing resume or create a new one</p>
              <Button variant="secondary" size="sm" onClick={() => navigate("/resumes")}>
                <Upload className="mr-2 h-4 w-4" />
                Upload Resume
              </Button>
            </div>
            <FileText className="h-20 w-20 opacity-20" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-careerforge-600 to-careerforge-500 text-white">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-2">Apply to Jobs</h3>
              <p className="text-careerforge-50 mb-4">Search for jobs and create tailored applications</p>
              <Button variant="secondary" size="sm" onClick={() => navigate("/job-search")}>
                <Briefcase className="mr-2 h-4 w-4" />
                Find Jobs
              </Button>
            </div>
            <Briefcase className="h-20 w-20 opacity-20" />
          </CardContent>
        </Card>
      </div>

      {/* Recent Applications */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Applications</CardTitle>
              <CardDescription>Your most recent job applications</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate("/applications")}>
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentApplications.length > 0 ? (
            <div className="space-y-4">
              {recentApplications.map((app) => (
                <div key={app.id} className="flex items-center gap-4 p-3 rounded-md border hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => navigate(`/applications/${app.id}`)}>
                  <img src={app.logo} alt={app.company} className="w-10 h-10 rounded-md" />
                  <div className="flex-1">
                    <h4 className="font-medium">{app.position}</h4>
                    <p className="text-sm text-muted-foreground">{app.company}</p>
                  </div>
                  <div>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(app.status)}`}>
                      {app.status}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(app.date).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No applications yet</p>
              <Button variant="outline" className="mt-4" onClick={() => navigate("/job-search")}>
                Search for Jobs
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
