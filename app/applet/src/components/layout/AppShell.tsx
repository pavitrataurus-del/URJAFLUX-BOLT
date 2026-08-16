import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Folder, 
  Settings, 
  ShieldAlert, 
  Menu, 
  Bell,
  Search,
  User,
  Moon,
  Sun,
  Monitor
} from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { cn } from "../../lib/utils";
import { CommandPalette } from "../CommandPalette";

export const AppShell = () => {
  const { 
    theme, 
    setTheme, 
    sidebarOpen, 
    setSidebarOpen,
    commandPaletteOpen,
    setCommandPaletteOpen,
    compactMode,
    setCompactMode
  } = useAppStore();
  const location = useLocation();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  React.useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark", "compact");
    root.classList.add(theme);
    if (compactMode) {
      root.classList.add("compact");
    }
  }, [theme, compactMode]);

  const navItems = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Projects", path: "/projects", icon: Folder },
    { name: "Workspace", path: "/workspace", icon: Monitor },
    { name: "Admin", path: "/admin", icon: ShieldAlert },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background text-foreground transition-colors">
      {/* Top Navigation Bar */}
      <header className="h-14 border-b border-border bg-surface flex items-center justify-between px-4 shrink-0 z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 -ml-2 rounded-md hover:bg-elevated transition-colors text-foreground-secondary hover:text-foreground"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="font-semibold text-lg flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-brand flex items-center justify-center text-white text-xs">U</div>
            URJAFLUX
          </div>
          
          {/* Breadcrumbs Placeholder */}
          <div className="hidden md:flex items-center text-sm text-foreground-muted ml-4">
            <span className="hover:text-foreground cursor-pointer transition-colors">Projects</span>
            <span className="mx-2">/</span>
            <span className="text-foreground font-medium cursor-pointer">Alpha Tower</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Global Search Button */}
          <button 
            onClick={() => setCommandPaletteOpen(true)}
            className="hidden md:flex items-center gap-2 text-sm text-foreground-muted bg-elevated border border-border rounded-md px-3 py-1.5 hover:bg-border transition-colors w-64"
          >
            <Search className="w-4 h-4" />
            <span className="flex-1 text-left">Search...</span>
            <span className="text-xs border border-border rounded px-1.5 bg-surface">Ctrl+Shift+P</span>
          </button>
          
          <button className="p-2 rounded-md hover:bg-elevated transition-colors text-foreground-secondary relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-brand rounded-full"></span>
          </button>
          <button onClick={toggleTheme} className="p-2 rounded-md hover:bg-elevated transition-colors text-foreground-secondary">
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button className="p-2 rounded-md hover:bg-elevated transition-colors text-foreground-secondary ml-2">
            <div className="w-8 h-8 rounded-full bg-elevated border border-border flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Navigation Sidebar */}
        <aside 
          className={cn(
            "bg-surface border-r border-border transition-all duration-300 ease-in-out flex flex-col z-10",
            sidebarOpen ? "w-64" : "w-0 overflow-hidden md:w-16"
          )}
        >
          <nav className="flex-1 py-4 flex flex-col gap-1 px-3 overflow-hidden">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || (item.path !== "/" && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md transition-colors whitespace-nowrap",
                    isActive 
                      ? "bg-brand/10 text-brand" 
                      : "text-foreground-secondary hover:bg-elevated hover:text-foreground"
                  )}
                  title={!sidebarOpen ? item.name : undefined}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  <span className={cn("transition-opacity duration-200", sidebarOpen ? "opacity-100" : "opacity-0 md:hidden")}>
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Central Workspace Container */}
        <main className="flex-1 flex flex-col overflow-hidden bg-background relative">
          <Outlet />
        </main>
      </div>

      {/* Bottom Status Bar */}
      <footer className="h-7 border-t border-border bg-surface flex items-center justify-between px-4 text-xs text-foreground-muted shrink-0 z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-success"></span>
            Connected
          </div>
          <div className="hidden md:block">Workspace: Alpha Tower</div>
        </div>
        <div className="flex items-center gap-4">
          <span>Role: Admin</span>
          <span>v1.0 (BUILD-026A)</span>
        </div>
      </footer>
      
      <CommandPalette open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen} />
    </div>
  );
};
