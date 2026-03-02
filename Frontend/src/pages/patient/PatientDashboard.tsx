import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { HealthTrendsChart } from "@/components/dashboard/HealthTrendsChart";
import { FileText, Users, Upload, Shield, Activity, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/services/api";
import { formatDistanceToNow } from "date-fns";

interface DashboardStats {
  totalRecords: number;
  sharedRecords: number;
  pendingRequests: number;
  activeAccess: number;
  recentUploads: number;
}

interface ActivityLog {
  _id: string;
  action: string;
  description: string;
  actor: string;
  createdAt: string;
  targetUser?: {
    name: string;
  };
}

export default function PatientDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalRecords: 0,
    sharedRecords: 0,
    pendingRequests: 0,
    activeAccess: 0,
    recentUploads: 0,
  });
  const [activities, setActivities] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
    if (user?._id) {
      fetchMetrics();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch stats
      const statsResponse = await api.getDashboardStats();
      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data as any);
      }

      // Fetch recent activities
      const activitiesResponse = await api.getActivityLogs({ limit: 4 });
      if (activitiesResponse.success && activitiesResponse.data) {
        const formattedActivities = (activitiesResponse.data as any[]).map((log: ActivityLog) => {
          let type: "view" | "upload" | "access" | "revoke" = "view";
          if (log.action === "upload") type = "upload";
          else if (log.action === "approve" || log.action === "access" || log.action === "share") type = "access";
          else if (log.action === "view" || log.action === "download") type = "view";
          else if (log.action === "delete" || log.action === "reject" || log.action === "revoke") type = "revoke";

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
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetrics = async () => {
    try {
      if (!user?._id) return;
      const response = await api.getHealthMetrics(user._id, 'all');
      if (response.success && response.data) {
        setMetrics(response.data as any);
      }
    } catch (error) {
      console.error("Error fetching metrics:", error);
    }
  };

  const statCards = [
    {
      title: "Total Records",
      value: stats.totalRecords,
      subtitle: "Health documents uploaded",
      icon: FileText,
      variant: "primary" as const,
      href: "/patient/records",
    },
    {
      title: "Active Access",
      value: stats.activeAccess,
      subtitle: "Doctors with permissions",
      icon: Users,
      variant: "accent" as const,
      href: "/patient/shared-access",
    },
    {
      title: "Recent Uploads",
      value: stats.recentUploads,
      subtitle: "In the last 30 days",
      icon: Upload,
      variant: "default" as const,
      href: "/patient/records",
    },
    {
      title: "Pending Requests",
      value: stats.pendingRequests,
      subtitle: "Awaiting your approval",
      icon: Shield,
      variant: "primary" as const,
      href: "/patient/access-requests",
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
      description: `${stats.pendingRequests} pending access request${stats.pendingRequests !== 1 ? 's' : ''}`,
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

  if (loading) {
    return (
      <DashboardLayout
        userRole="patient"
        title="Welcome back"
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
      userRole="patient"
      title={`Welcome back${user?.name ? `, ${user.name.split(' ')[0]}` : ''}`}
      subtitle={user?.patientId ? `Patient ID: ${user.patientId} • Here's your health records overview` : "Here's an overview of your health records"}
    >
      <div className="space-y-6">
        {/* Patient ID Card */}
        {user?.patientId && (
          <div className="stat-card bg-gradient-to-r from-primary/10 to-accent/10 border-2 border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Your Patient ID</p>
                <p className="text-3xl font-bold text-foreground font-mono">{user.patientId}</p>
                <p className="text-xs text-muted-foreground mt-2">Share this ID with doctors to allow them to request access to your records</p>
              </div>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
                <Users className="h-8 w-8 text-primary" />
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <HealthTrendsChart metrics={metrics} />
            <div className="mt-6">
              <RecentActivity
                activities={activities.length > 0 ? activities : []}
                viewAllHref="/patient/activity"
              />
            </div>
          </div>
          <div>
            <QuickActions actions={quickActions} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
