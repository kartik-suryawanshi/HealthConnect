import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RequestAccessForm } from "@/components/dashboard/RequestAccessForm";
import { Users, Clock, FileText, UserPlus, FolderOpen, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/services/api";
import { formatDistanceToNow } from "date-fns";

interface DashboardStats {
  authorizedPatients: number;
  pendingRequests: number;
  recordsReviewed: number;
}

interface ActivityLog {
  _id: string;
  action: string;
  description: string;
  actor: string;
  createdAt: string;
}

interface PendingRequest {
  _id: string;
  patient: {
    name: string;
    email: string;
  };
  status: string;
  createdAt: string;
}

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    authorizedPatients: 0,
    pendingRequests: 0,
    recordsReviewed: 0,
  });
  const [activities, setActivities] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch stats
      const statsResponse = await api.getDashboardStats();
      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data as DashboardStats);
      }

      // Fetch recent activities
      const activitiesResponse = await api.getActivityLogs({ limit: 4 });
      if (activitiesResponse.success && activitiesResponse.data) {
        const activitiesData = activitiesResponse.data as ActivityLog[];
        const formattedActivities = activitiesData.map((log: ActivityLog) => {
          let type: "view" | "upload" | "access" | "revoke" = "view";
          if (log.action === "upload") type = "upload";
          else if (log.action === "approve" || log.action === "access") type = "access";
          else if (log.action === "view" || log.action === "download") type = "view";

          return {
            id: log._id,
            type,
            description: log.description,
            actor: log.actor,
            timestamp: formatDistanceToNow(new Date(log.createdAt), { addSuffix: true }),
          };
        });
        setActivities(formattedActivities);
      }

      // Fetch pending requests
      const requestsResponse = await api.getAccessRequests("pending");
      if (requestsResponse.success && requestsResponse.data) {
        const requestsData = requestsResponse.data as PendingRequest[];
        setPendingRequests(requestsData.slice(0, 3));
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Authorized Patients",
      value: stats.authorizedPatients,
      subtitle: "Active patient access",
      icon: Users,
      variant: "primary" as const,
      href: "/doctor/patients",
    },
    {
      title: "Pending Requests",
      value: stats.pendingRequests,
      subtitle: "Awaiting patient approval",
      icon: Clock,
      variant: "accent" as const,
      href: "/doctor/request-access",
    },
    {
      title: "Records Reviewed",
      value: stats.recordsReviewed,
      subtitle: "This month",
      icon: FileText,
      variant: "default" as const,
      href: "/doctor/records",
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
      description: `${stats.authorizedPatients} patients with active access`,
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

  if (loading) {
    return (
      <DashboardLayout
        userRole="doctor"
        title="Welcome"
        subtitle="Loading your dashboard..."
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      userRole="doctor"
      title={`Welcome, ${user?.name || 'Doctor'}`}
      subtitle="Here's your practice overview"
    >
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {statCards.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RecentActivity
              activities={activities.length > 0 ? activities : []}
            />
          </div>
          <div className="space-y-6">
            <QuickActions actions={quickActions} />
            <div className="stat-card">
              <h3 className="section-title mb-4">Request Patient Access</h3>
              <RequestAccessForm onSuccess={fetchDashboardData} />
            </div>
          </div>
        </div>

        {/* Pending Requests Preview */}
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <h3 className="section-title">Pending Access Requests</h3>
            <Link
              to="/doctor/request-access"
              className="text-sm font-medium text-primary hover:underline"
            >
              View All
            </Link>
          </div>
          {pendingRequests.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-3 mt-4">
              {pendingRequests.map((request, index) => (
                <Link
                  key={request._id}
                  to="/doctor/request-access"
                  className="rounded-lg border border-border bg-muted/30 p-4 animate-fade-in transition-all hover:border-primary/30 hover:shadow-md"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <span className="text-sm font-medium text-primary">
                        {request.patient.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {request.patient.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Requested {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <span className="mt-3 inline-block badge-status badge-pending">
                    Pending
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">No pending access requests.</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
