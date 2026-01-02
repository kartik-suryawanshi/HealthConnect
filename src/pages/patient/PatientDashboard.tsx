import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { FileText, Users, Upload, Shield, ClipboardList, Activity } from "lucide-react";

const stats = [
  {
    title: "Total Records",
    value: 24,
    subtitle: "Health documents uploaded",
    icon: FileText,
    variant: "primary" as const,
    href: "/patient/records",
  },
  {
    title: "Active Access",
    value: 3,
    subtitle: "Doctors with permissions",
    icon: Users,
    variant: "accent" as const,
    href: "/patient/shared-access",
  },
  {
    title: "Recent Uploads",
    value: 5,
    subtitle: "In the last 30 days",
    icon: Upload,
    variant: "default" as const,
    href: "/patient/records",
  },
  {
    title: "Pending Requests",
    value: 2,
    subtitle: "Awaiting your approval",
    icon: Shield,
    variant: "primary" as const,
    href: "/patient/access-requests",
  },
];

const recentActivities = [
  {
    id: "1",
    type: "view" as const,
    description: "Blood Test Results viewed",
    actor: "Dr. Sarah Chen",
    timestamp: "2 hours ago",
  },
  {
    id: "2",
    type: "upload" as const,
    description: "X-Ray Report uploaded",
    actor: "You",
    timestamp: "Yesterday",
  },
  {
    id: "3",
    type: "access" as const,
    description: "Access granted to records",
    actor: "Dr. Michael Lee",
    timestamp: "2 days ago",
  },
  {
    id: "4",
    type: "view" as const,
    description: "Prescription viewed",
    actor: "Dr. Sarah Chen",
    timestamp: "3 days ago",
  },
];

const quickActions = [
  {
    icon: Upload,
    label: "Upload Document",
    description: "Add new health record",
    path: "/patient/records",
    variant: "primary" as const,
  },
  {
    icon: Shield,
    label: "Review Requests",
    description: "2 pending access requests",
    path: "/patient/access-requests",
    variant: "accent" as const,
  },
  {
    icon: Activity,
    label: "View Activity",
    description: "See all record access logs",
    path: "/patient/activity",
  },
];

export default function PatientDashboard() {
  return (
    <DashboardLayout
      userRole="patient"
      title="Welcome back, John"
      subtitle="Here's an overview of your health records"
    >
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RecentActivity activities={recentActivities} viewAllHref="/patient/activity" />
          </div>
          <div>
            <QuickActions actions={quickActions} />
          </div>
        </div>

        {/* Health Analytics Preview */}
        <div className="stat-card">
          <h3 className="section-title">Health Analytics</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">Blood Pressure</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">
                120/80
              </p>
              <p className="mt-1 text-xs text-success">Normal range</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">Heart Rate</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">
                72 bpm
              </p>
              <p className="mt-1 text-xs text-success">Healthy</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">Last Checkup</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">
                Dec 15
              </p>
              <p className="mt-1 text-xs text-muted-foreground">2 weeks ago</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
