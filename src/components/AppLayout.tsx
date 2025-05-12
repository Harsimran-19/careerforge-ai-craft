
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Briefcase, FileText, Home, Layout, LogOut, Menu, Search, Settings, User2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const AppLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { signOut } = useAuth();

  const isActiveRoute = (route: string) => {
    return pathname === route;
  };

  const NavItem = ({ icon: Icon, label, route }: { icon: any; label: string; route: string }) => (
    <Button
      variant={isActiveRoute(route) ? "secondary" : "ghost"}
      className={`w-full justify-start gap-2 ${isActiveRoute(route) ? 'bg-secondary' : ''}`}
      onClick={() => navigate(route)}
    >
      <Icon size={18} />
      {isSidebarOpen && <span>{label}</span>}
    </Button>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={`bg-card border-r border-border flex flex-col transition-all duration-300 ${
          isSidebarOpen ? "w-64" : "w-[70px]"
        }`}
      >
        <div className="p-4 flex items-center justify-between border-b border-border h-16">
          {isSidebarOpen ? (
            <h1 className="font-bold text-xl gradient-text">CareerForge Pro</h1>
          ) : (
            <div className="w-full flex justify-center">
              <div className="h-8 w-8 bg-gradient-to-r from-careerforge-600 to-careerforge-400 rounded-md"></div>
            </div>
          )}
          <Button variant="ghost" size="icon" className="ml-auto" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <Menu size={18} />
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          <NavItem icon={Home} label="Dashboard" route="/dashboard" />
          <NavItem icon={FileText} label="My Resumes" route="/resumes" />
          <NavItem icon={Briefcase} label="Job Applications" route="/applications" />
          <NavItem icon={Search} label="Job Search" route="/job-search" />
          <NavItem icon={Layout} label="Company Analysis" route="/companies" />
        </div>
        
        <div className="border-t border-border p-2 space-y-1">
          <NavItem icon={User2} label="Profile" route="/profile" />
          <NavItem icon={Settings} label="Settings" route="/settings" />
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={signOut}
          >
            <LogOut size={18} />
            {isSidebarOpen && <span>Logout</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
