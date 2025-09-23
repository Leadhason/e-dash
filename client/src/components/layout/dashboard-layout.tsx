import { ReactNode, useEffect, useState, createContext, useContext } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useIsMobile } from "@/hooks/use-mobile";
import { DashboardHeader } from "./header";
import { Sidebar } from "./sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
}

interface SidebarContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  toggle: () => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  toggleCollapsed: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a DashboardLayout");
  }
  return context;
};

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Close sidebar when switching to mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/login");
    }
  }, [isAuthenticated, isLoading, setLocation]);

  const sidebarContextValue: SidebarContextType = {
    isOpen: sidebarOpen,
    setIsOpen: setSidebarOpen,
    toggle: () => setSidebarOpen(!sidebarOpen),
    isCollapsed: sidebarCollapsed,
    setIsCollapsed: setSidebarCollapsed,
    toggleCollapsed: () => setSidebarCollapsed(!sidebarCollapsed),
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <SidebarContext.Provider value={sidebarContextValue}>
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <div className="flex">
          <Sidebar />
          {/* Mobile backdrop */}
          {isMobile && sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
          <main className={`
            flex-1 min-h-[calc(100vh-4rem)]
            ${
              isMobile 
                ? 'ml-0' 
                : sidebarCollapsed 
                  ? 'ml-16' 
                  : 'ml-64'
            }
            transition-all duration-300 ease-in-out
            p-4 md:p-6
          `}>
            <div className="max-w-full overflow-hidden">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarContext.Provider>
  );
}
