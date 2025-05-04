
export interface Application {
  id: string;
  position: string;
  company: string;
  location: string;
  status: string;
  appliedDate: string;
  logo: string;
  hasInterview: boolean;
  interviewDate?: string;
  notes: string;
  nextStep: string;
}

export interface Company {
  id: string;
  name: string;
  industry: string;
  size: string;
  location: string;
  description: string;
  website: string;
  logo: string;
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  postedAt: string;
  description: string;
  logo: string;
}
