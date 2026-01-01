import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { Users, Clock, FileText, UserPlus, FolderOpen, ClipboardList } from "lucide-react";

const stats = [
  {
    title: "Authorized Patients",
    value: 12,
    subtitle: "Active patient access",
    icon: Users,
    variant: "primary" as const,
  },
  {
    title: "Pending Requests",
    value: 3,
    subtitle: "Awaiting patient approval",
    icon: Clock,
    variant: "accent" as const,
  },
  {
    title: "Records Reviewed",
    value: 47,
    subtitle: "This month",
    icon: FileText,
    variant: "default" as const,
  },
];

const recentActivities = [
  {
    id: "1",
    type: "view" as const,
    description: "Viewed John Smith's lab results",
    actor: "You",
    timestamp: "2 hours ago",
  },
  {
    id: "2",
    type: "access" as const,
    description: "Access granted by Mary Johnson",
    actor: "Patient Approval",
    timestamp: "5 hours ago",
  },
  {
    id: "3",
    type: "upload" as const,
    description: "Uploaded prescription for Robert Davis",
    actor: "You",
    timestamp: "Yesterday",
  },
  {
    id: "4",
    type: "view" as const,
    description: "Reviewed Emily Wilson's MRI scan",
    actor: "You",
    timestamp: "2 days ago",
  },
];

const quickActions = [
  {
    icon: UserPlus,
    label: "Request Patient Access",
    description: "Request access to patient records",
    path: "/doctor/request-access",
    variant: "primary" as const,
  },
  {
    icon: Users,
    label: "View Patients",
    description: "12 patients with active access",
    path: "/doctor/patients",
    variant: "accent" as const,
  },
  {
    icon: FolderOpen,
    label: "Patient Records",
    description: "View and manage patient documents",
    path: "/doctor/records",
  },
];

export default function DoctorDashboard() {
  return (
    <DashboardLayout
      userRole="doctor"
      title="Welcome, Dr. Chen"
      subtitle="Here's your practice overview"
    >
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RecentActivity activities={recentActivities} />
          </div>
          <div>
            <QuickActions actions={quickActions} />
          </div>
        </div>

        {/* Pending Requests Preview */}
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <h3 className="section-title">Pending Access Requests</h3>
            <a
              href="/doctor/request-access"
              className="text-sm font-medium text-primary hover:underline"
            >
              View All
            </a>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { name: "Jane Doe", status: "Pending", days: "2 days" },
              { name: "Michael Brown", status: "Pending", days: "3 days" },
              { name: "Sarah Miller", status: "Pending", days: "5 days" },
            ].map((request, index) => (
              <div
                key={request.name}
                className="rounded-lg border border-border bg-muted/30 p-4 animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <span className="text-sm font-medium text-primary">
                      {request.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{request.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Requested {request.days} ago
                    </p>
                  </div>
                </div>
                <span className="mt-3 inline-block badge-status badge-pending">
                  {request.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
