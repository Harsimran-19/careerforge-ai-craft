
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { useState, useEffect } from "react";
import { configureApiUrls } from "@/services/apiService";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Resumes from "./pages/Resumes";
import JobSearch from "./pages/JobSearch";
import Applications from "./pages/Applications";
import Companies from "./pages/Companies";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import ResumeBot from "./pages/ResumeBot";

// Components
import AppLayout from "./components/AppLayout";

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

// Import useAuth within App function to avoid circular dependency
import { useAuth } from "./contexts/AuthContext";

// Routes wrapper with auth provider
const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Index />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />

      {/* Onboarding - semi-protected */}
      <Route path="/onboarding" element={
        user ? <Onboarding /> : <Navigate to="/login" />
      } />

      {/* Protected Routes - AppLayout */}
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/resumes" element={<Resumes />} />
        <Route path="/job-search" element={<JobSearch />} />
        <Route path="/applications" element={<Applications />} />
        <Route path="/companies" element={<Companies />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/resume-bot" element={<ResumeBot />} />
      </Route>

      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  // Create a new QueryClient instance inside the component
  const [queryClient] = useState(() => new QueryClient());

  // Configure API URLs when the app starts
  useEffect(() => {
    // Log all environment variables for debugging
    console.log("All env variables:", import.meta.env);
    
    // Configure the external API URLs from environment variables
    const JOB_SEARCH_API_URL = import.meta.env.VITE_JOB_SEARCH_API_URL;
    const RESUME_API_URL = import.meta.env.VITE_RESUME_API_URL || '/api';

    console.log("Raw env values:", { 
      JOB_SEARCH_API_URL_ENV: import.meta.env.VITE_JOB_SEARCH_API_URL,
      RESUME_API_URL_ENV: import.meta.env.VITE_RESUME_API_URL 
    });
    
    console.log("Configuring API URLs:", { JOB_SEARCH_API_URL, RESUME_API_URL });

    // Only configure if the values are actual URLs and not undefined
    if (JOB_SEARCH_API_URL && RESUME_API_URL) {
      configureApiUrls(JOB_SEARCH_API_URL, RESUME_API_URL);
    } else {
      console.error("Environment variables not properly loaded. Check your .env file and restart the dev server.");
    }
  }, []);

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default App;
