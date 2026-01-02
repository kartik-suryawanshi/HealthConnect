import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Home,
  FileText,
  Shield,
  Users,
  ClipboardList,
  UserPlus,
  FolderOpen,
  Activity,
  LogOut,
  Heart,
} from "lucide-react";

interface SidebarProps {
  userRole: "patient" | "doctor";
}

const patientNavItems = [
  { icon: Home, label: "Dashboard", path: "/patient" },
  { icon: FileText, label: "Health Records", path: "/patient/records" },
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

export function Sidebar({ userRole }: SidebarProps) {
  const location = useLocation();
  const navItems = userRole === "patient" ? patientNavItems : doctorNavItems;

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-sidebar-border bg-sidebar">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <Link to="/" className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6 transition-colors hover:bg-muted/50">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Heart className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-foreground">Digital Health</h1>
            <p className="text-xs text-muted-foreground">Records System</p>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
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

        {/* User section */}
        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <span className="text-sm font-medium text-primary">
                {userRole === "patient" ? "JS" : "DR"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {userRole === "patient" ? "John Smith" : "Dr. Sarah Chen"}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {userRole === "patient" ? "Patient ID: P-12345" : "Cardiology"}
              </p>
            </div>
          </div>
          <Link
            to="/"
            className="mt-3 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            <span>Switch Role</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
