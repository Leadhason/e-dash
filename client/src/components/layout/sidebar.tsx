import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSidebar } from "./dashboard-layout";
import {
  BarChart3,
  TrendingUp,
  Package,
  Tags,
  Warehouse,
  ShoppingCart,
  Users,
  Shield,
  Handshake,
  Headphones,
  Settings,
  X,
  ChevronLeft,
  PanelLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navigation = [
  {
    title: "Overview",
    items: [
      { name: "Dashboard", href: "/", icon: BarChart3 },
      { name: "Analytics", href: "/analytics", icon: TrendingUp },
    ],
  },
  {
    title: "Catalog",
    items: [
      { name: "Products", href: "/products", icon: Package },
      { name: "Categories", href: "/categories", icon: Tags },
      { name: "Inventory", href: "/inventory", icon: Warehouse },
    ],
  },
  {
    title: "Operations",
    items: [
      { name: "Orders", href: "/orders", icon: ShoppingCart },
      { name: "Customers", href: "/customers", icon: Users },
      { name: "Warranties", href: "/warranties", icon: Shield },
    ],
  },
  {
    title: "Management",
    items: [
      { name: "Vendors", href: "/vendors", icon: Handshake },
      { name: "Support", href: "/support", icon: Headphones },
      { name: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export function Sidebar() {
  const [location] = useLocation();
  const isMobile = useIsMobile();
  const { isOpen, setIsOpen, isCollapsed, toggleCollapsed } = useSidebar();

  const handleLinkClick = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  return (
    <>
      <aside className={cn(
        "min-h-screen bg-card border-r border-border transition-all duration-300 ease-in-out",
        isMobile ? [
          "w-64 fixed z-50 transform",
          isOpen ? "translate-x-0" : "-translate-x-full"
        ] : [
          "fixed z-10 h-screen", // Full viewport height for desktop
          isCollapsed ? "w-16" : "w-64"
        ]
      )}>
        <div className="flex flex-col h-full">
          {/* Mobile header with close button */}
          {isMobile && (
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center space-x-2">
                <i className="fas fa-tools text-primary text-lg"></i>
                <span className="font-bold text-base text-foreground">Tools & Power</span>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
          
          {/* Desktop header when collapsed - show just logo icon with expand button */}
          {!isMobile && isCollapsed && (
            <div className="flex flex-col items-center space-y-2 p-4 border-b border-border">
              <i className="fas fa-tools text-primary text-lg"></i>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={toggleCollapsed}
                className="h-8 w-8"
                title="Expand sidebar"
              >
                <PanelLeft className="h-4 w-4" />
              </Button>
            </div>
          )}
          
          {/* Desktop header when expanded - show full logo with collapse button */}
          {!isMobile && !isCollapsed && (
            <div className="flex items-center justify-between p-2 border-b border-border">
              <div className="flex items-center space-x-2">
                <i className="fas fa-tools text-primary text-lg"></i>
                <span className="font-bold text-base text-foreground">Tools & Power</span>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={toggleCollapsed}
                className="h-8 w-8"
                title="Collapse sidebar"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
          )}
          
          {/* Navigation content */}
          <div className={cn(
            "flex-1 overflow-y-auto mb-12",
            isCollapsed && !isMobile ? "px-2" : "p-4 md:p-6"
          )}>
            {navigation.map((section) => (
              <div key={section.title} className={cn(
                isCollapsed && !isMobile ? "mb-4" : "mb-6"
              )}>
                {/* Section title - hide when collapsed on desktop */}
                {!(isCollapsed && !isMobile) && (
                  <h3 className="font-semibold text-foreground mb-3 text-sm tracking-wide uppercase">
                    {section.title}
                  </h3>
                )}
                <nav className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = location === item.href;
                    const Icon = item.icon;
                    
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={handleLinkClick}
                        className={cn(
                          "flex items-center text-sm font-medium transition-all duration-200",
                          "min-h-[44px] touch-none select-none", // Touch-friendly sizing
                          isCollapsed && !isMobile
                            ? "justify-center rounded-full p-3 mx-1" // Compact centered icon for collapsed state
                            : "space-x-3 px-3 py-3", // Normal spacing for expanded state
                          isActive
                            ? "bg-accent rounded-full p-2 text-accent-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent/50 active:bg-accent/70"
                        )}
                        data-testid={`nav-${item.name.toLowerCase()}`}
                        title={isCollapsed && !isMobile ? item.name : undefined} // Tooltip for collapsed state
                      >
                        <Icon className="h-5 w-5 flex-shrink-0" />
                        {/* Hide text when collapsed on desktop */}
                        {!(isCollapsed && !isMobile) && (
                          <span className="truncate">{item.name}</span>
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>
          
          {/* Mobile footer space */}
          {isMobile && <div className="h-16" />}
        </div>
      </aside>
    </>
  );
}
