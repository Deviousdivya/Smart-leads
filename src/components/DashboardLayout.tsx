import { ReactNode } from "react";
import { useAuthStore } from "../hooks/useAuthStore";
import { Button } from "../components/ui/button";
import { 
  BarChart3, 
  Users, 
  Settings, 
  LogOut, 
  LayoutDashboard,
  Search,
  Plus,
  Moon,
  Sun,
  Menu,
  X
} from "lucide-react";
import { useState, useEffect } from "react";
import { NavLink, Link } from "react-router-dom";
import { toast } from "sonner";
import TeamStatusDialog from "./TeamStatusDialog";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuthStore();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { name: "Analytics", icon: BarChart3, path: "/analytics" },
    { name: "Settings", icon: Settings, path: "/settings" },
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 transform border-r bg-white transition-all duration-300 ease-in-out dark:border-gray-800 dark:bg-gray-900 md:static md:block md:translate-x-0 ${
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      } ${isSidebarCollapsed ? "w-20" : "w-64"}`}>
        <div className="flex h-full flex-col">
          <div className={`flex h-16 items-center border-b px-6 dark:border-gray-800 ${isSidebarCollapsed ? "justify-center" : "justify-between"}`}>
            <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className={isSidebarCollapsed ? "hidden lg:block w-0 h-0 overflow-hidden" : ""}>
              {!isSidebarCollapsed && <span className="text-xl font-bold text-primary">SmartLeads</span>}
            </Link>
            {isSidebarCollapsed && <span className="text-xl font-bold text-primary">SL</span>}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X size={20} />
            </Button>
          </div>
          <nav className="flex-1 space-y-1 py-4 px-3 overflow-y-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                title={isSidebarCollapsed ? item.name : ""}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                  } ${isSidebarCollapsed ? "justify-center px-2" : ""}`
                }
              >
                <item.icon size={20} className="shrink-0" />
                {!isSidebarCollapsed && <span>{item.name}</span>}
              </NavLink>
            ))}
          </nav>
          <div className="border-t p-4 dark:border-gray-800">
            <div className={`flex items-center gap-3 ${isSidebarCollapsed ? "flex-col" : ""}`}>
              <div className="h-8 w-8 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                {user?.name.charAt(0)}
              </div>
              {!isSidebarCollapsed && (
                <div className="flex-1 overflow-hidden">
                  <p className="truncate text-sm font-medium dark:text-white">{user?.name}</p>
                  <p className="truncate text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role.toLowerCase()}</p>
                </div>
              )}
              <Button variant="ghost" size="icon" onClick={logout} title="Logout">
                <LogOut size={18} />
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Navbar */}
        <header className="flex h-16 items-center justify-between border-b bg-white px-4 md:px-8 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => {
                if (window.innerWidth < 768) {
                  setIsMobileMenuOpen(true);
                } else {
                  setIsSidebarCollapsed(!isSidebarCollapsed);
                }
              }}
              title="Toggle Sidebar"
            >
              <Menu size={20} />
            </Button>
            <h1 className="text-lg font-semibold dark:text-white">Leads Overview</h1>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative" 
              title="Team Status"
              onClick={() => setIsTeamDialogOpen(true)}
            >
              <div className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
              <Users size={20} />
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleDarkMode} title="Toggle Dark Mode">
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </Button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-8">
          {children}
        </div>
        <TeamStatusDialog 
          open={isTeamDialogOpen} 
          onOpenChange={setIsTeamDialogOpen} 
        />
      </main>
    </div>
  );
}
