import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Bell, Search, Menu, Home, FileText, Shield, Users, Activity, UserPlus, FolderOpen, Heart, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { SettingsDialog, ThemeToggle } from "@/components/SettingsDialog";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface HeaderProps {
  title: string;
  subtitle?: string;
  userRole?: "patient" | "doctor";
}

interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
}

const initialNotifications: Notification[] = [
  {
    id: "1",
    title: "Access Request",
    description: "Dr. Emily Watson requested access to your records",
    time: "5 min ago",
    read: false,
  },
  {
    id: "2",
    title: "Record Viewed",
    description: "Dr. Sarah Chen viewed your blood test results",
    time: "1 hour ago",
    read: false,
  },
  {
    id: "3",
    title: "Upload Complete",
    description: "Your X-Ray report was uploaded successfully",
    time: "2 hours ago",
    read: true,
  },
];

const patientNavItems = [
  { icon: Home, label: "Dashboard", path: "/patient" },
  { icon: FileText, label: "Health Records", path: "/patient/records" },
  { icon: ShieldCheck, label: "Insurance Details", path: "/patient/insurance" },
  { icon: Shield, label: "Access Requests", path: "/patient/access-requests" },
  { icon: Users, label: "Shared Access", path: "/patient/shared-access" },
  { icon: Activity, label: "Activity Logs", path: "/patient/activity" },
];

const doctorNavItems = [
  { icon: Home, label: "Dashboard", path: "/doctor" },
  { icon: UserPlus, label: "Request Access", path: "/doctor/request-access" },
  { icon: Users, label: "Authorized Patients", path: "/doctor/patients" },
  { icon: FolderOpen, label: "Patient Records", path: "/doctor/records" },
];

export function Header({ title, subtitle, userRole = "patient" }: HeaderProps) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();

  const unreadCount = notifications.filter((n) => !n.read).length;
  const navItems = userRole === "patient" ? patientNavItems : doctorNavItems;

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast({
      title: "All Caught Up!",
      description: "All notifications marked as read.",
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      toast({
        title: "Searching...",
        description: `Searching for "${searchQuery}"`,
      });
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card/80 px-4 md:px-6 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        {/* Mobile menu trigger */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SheetHeader className="p-4 border-b">
              <SheetTitle>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                    <Heart className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div className="text-left">
                    <h1 className="text-base font-semibold text-foreground">Digital Health</h1>
                    <p className="text-xs text-muted-foreground">Records System</p>
                  </div>
                </div>
              </SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col space-y-1 p-4">
              <p className="mb-3 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {userRole === "patient" ? "Patient Portal" : "Doctor Portal"}
              </p>
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "nav-link",
                      isActive && "nav-link-active"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </SheetContent>
        </Sheet>

        <div className="hidden md:block">
          <h1 className="text-lg font-semibold text-foreground">{title}</h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <form onSubmit={handleSearch} className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search records..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-64 bg-muted/50 pl-9 text-sm"
          />
        </form>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                  {unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notifications</span>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 text-xs text-primary hover:bg-transparent"
                  onClick={handleMarkAllRead}
                >
                  Mark all read
                </Button>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className="flex flex-col items-start gap-1 p-3 cursor-pointer"
                  onClick={() => handleMarkAsRead(notification.id)}
                >
                  <div className="flex w-full items-start justify-between gap-2">
                    <span
                      className={`text-sm font-medium ${notification.read
                          ? "text-muted-foreground"
                          : "text-foreground"
                        }`}
                    >
                      {notification.title}
                    </span>
                    {!notification.read && (
                      <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1" />
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground line-clamp-2">
                    {notification.description}
                  </span>
                  <span className="text-xs text-muted-foreground/70">
                    {notification.time}
                  </span>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Settings */}
        <SettingsDialog />
      </div>
    </header>
  );
}
