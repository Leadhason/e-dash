import { Search, Bell, User, Menu, X } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSidebar } from "./dashboard-layout";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";

export function DashboardHeader() {
  const { user, logout } = useAuth();
  const isMobile = useIsMobile();
  const { toggle } = useSidebar();
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatRole = (role: string) => {
    return role.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="flex h-16 items-center px-4 md:px-6">
        {/* Left section */}
        <div className="flex items-center space-x-3 md:space-x-4">
          {/* Mobile menu button */}
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggle}
              className="h-9 w-9"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <i className="fas fa-tools text-primary text-lg md:text-xl"></i>
            <span className="font-bold text-base md:text-lg text-foreground truncate">
              {isMobile ? "Tools & Power" : "Tools & Power Tech"}
            </span>
          </div>
          
          {/* Desktop breadcrumb */}
          {!isMobile && (
            <>
              <div className="h-6 w-px bg-border"></div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Dashboard</span>
              </div>
            </>
          )}
        </div>
        
        {/* Right section */}
        <div className="ml-auto flex items-center space-x-2 md:space-x-4">
          {/* Mobile search toggle */}
          {isMobile && !showMobileSearch && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowMobileSearch(true)}
              className="h-9 w-9"
            >
              <Search className="h-4 w-4" />
            </Button>
          )}
          
          {/* Desktop search or Mobile expanded search */}
          {(!isMobile || showMobileSearch) && (
            <div className={`flex items-center space-x-2 ${isMobile ? 'flex-1 mx-2' : ''}`}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder={isMobile ? "Search..." : "Search products, orders..."}
                  className={`pl-10 ${isMobile ? 'w-full' : 'w-64'}`}
                  data-testid="header-search-input"
                />
                {isMobile && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowMobileSearch(false)}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          )}
          
          {/* Hide other buttons when mobile search is open */}
          {!showMobileSearch && (
            <>
              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative h-9 w-9" data-testid="notifications-button">
                <Bell className="h-4 w-4 md:h-5 md:w-5" />
                <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 md:h-5 md:w-5 flex items-center justify-center text-xs p-0">
                  3
                </Badge>
              </Button>
              
              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild data-testid="user-menu-trigger">
                  <Button variant="ghost" className="flex items-center space-x-2 md:space-x-3 h-9 px-2 md:px-3">
                    {/* Desktop: show name and role */}
                    {!isMobile && (
                      <div className="text-right">
                        <div className="text-sm font-medium text-foreground">
                          {user?.firstName} {user?.lastName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {user?.role && formatRole(user.role)}
                        </div>
                      </div>
                    )}
                    <Avatar className="h-7 w-7 md:h-8 md:w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs md:text-sm">
                        {user && getInitials(user.firstName, user.lastName)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div>
                      <div className="font-medium">
                        {user?.firstName} {user?.lastName}
                      </div>
                      <div className="text-sm text-muted-foreground font-normal">
                        {user?.role && formatRole(user.role)}
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem data-testid="profile-menu-item">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} data-testid="logout-menu-item">
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
