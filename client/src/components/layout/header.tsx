import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { authAPI } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, Settings, Plus } from "lucide-react";

export default function Header() {
  const [location, navigate] = useLocation();
  const isAuthenticated = authAPI.isAuthenticated();
  const isAdmin = authAPI.isAdmin();

  const { data: user } = useQuery({
    queryKey: ["/api/auth/me"],
    enabled: isAuthenticated,
  });

  const handleLogout = () => {
    authAPI.logout();
    navigate("/");
    window.location.reload();
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/">
              <h1 className="text-2xl font-bold text-gray-900 cursor-pointer">
                Event <span className="text-primary">Hive</span>
              </h1>
            </Link>
          </div>

          <nav className="hidden md:flex space-x-8">
            <Link href="/">
              <span className={`font-medium transition-colors duration-200 cursor-pointer ${
                location === "/" ? "text-primary" : "text-gray-700 hover:text-primary"
              }`}>
                Home
              </span>
            </Link>
            
            {isAdmin && (
              <>
                <Link href="/admin/dashboard">
                  <span className={`font-medium transition-colors duration-200 cursor-pointer ${
                    location === "/admin/dashboard" ? "text-primary" : "text-gray-700 hover:text-primary"
                  }`}>
                    Dashboard
                  </span>
                </Link>
                <Link href="/admin/create-event">
                  <span className={`font-medium transition-colors duration-200 cursor-pointer ${
                    location === "/admin/create-event" ? "text-primary" : "text-gray-700 hover:text-primary"
                  }`}>
                    Create Event
                  </span>
                </Link>
              </>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <Link href="/admin/create-event">
                    <Button size="sm" className="hidden md:flex">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Event
                    </Button>
                  </Link>
                )}
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span className="hidden md:block">{user?.user?.name || "User"}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/signin">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm">
                    Sign Up
                  </Button>
                </Link>
                <Link href="/admin/register">
                  <Button variant="outline" size="sm">
                    Admin
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
