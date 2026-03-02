import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Eye, Download, Upload, Shield, Clock, User, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/services/api";
import { format, formatDistanceToNow } from "date-fns";

interface ActivityLog {
  _id: string;
  action: string;
  description: string;
  actor: string;
  createdAt: string;
  targetUser?: {
    name: string;
  };
  metadata?: {
    recordType?: string;
    fileName?: string;
  };
}

const actionIcons: Record<string, any> = {
  view: Eye,
  download: Download,
  upload: Upload,
  approve: Shield,
  reject: Shield,
  access: Shield,
  delete: Shield,
};

const actionLabels: Record<string, string> = {
  view: "Viewed",
  download: "Downloaded",
  upload: "Uploaded",
  approve: "Access Granted",
  reject: "Access Rejected",
  access: "Access",
  delete: "Deleted",
};

const actionColors: Record<string, string> = {
  view: "text-accent bg-accent/10",
  download: "text-primary bg-primary/10",
  upload: "text-success bg-success/10",
  approve: "text-success bg-success/10",
  reject: "text-destructive bg-destructive/10",
  access: "text-success bg-success/10",
  delete: "text-destructive bg-destructive/10",
};

export default function ActivityLogs() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");

  useEffect(() => {
    fetchLogs();
  }, [actionFilter]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (actionFilter !== "all") params.action = actionFilter;

      const response = await api.getActivityLogs(params);
      if (response.success && response.data) {
        setLogs(response.data);
      }
    } catch (error: any) {
      console.error("Error fetching activity logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Group logs by date
  const groupedLogs = filteredLogs.reduce((acc, log) => {
    const date = format(new Date(log.createdAt), "MMM d, yyyy");
    const today = format(new Date(), "MMM d, yyyy");
    const yesterday = format(
      new Date(Date.now() - 24 * 60 * 60 * 1000),
      "MMM d, yyyy"
    );

    let displayDate = date;
    if (date === today) displayDate = "Today";
    else if (date === yesterday) displayDate = "Yesterday";

    if (!acc[displayDate]) {
      acc[displayDate] = [];
    }
    acc[displayDate].push(log);
    return acc;
  }, {} as Record<string, ActivityLog[]>);

  if (loading) {
    return (
      <DashboardLayout
        userRole="patient"
        title="Activity Logs"
        subtitle="Loading..."
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
      title="Activity Logs"
      subtitle="Track all access and changes to your health records"
    >
      <div className="space-y-6">
        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by person or document..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="view">Views</SelectItem>
              <SelectItem value="download">Downloads</SelectItem>
              <SelectItem value="upload">Uploads</SelectItem>
              <SelectItem value="approve">Access Granted</SelectItem>
              <SelectItem value="reject">Access Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Timeline */}
        <div className="space-y-8">
          {Object.entries(groupedLogs).map(([date, dateLogs]) => (
            <div key={date}>
              <h3 className="mb-4 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Clock className="h-4 w-4" />
                {date}
              </h3>
              <div className="relative space-y-4 pl-6 before:absolute before:left-[11px] before:top-2 before:h-[calc(100%-16px)] before:w-px before:bg-border">
                {dateLogs.map((log, index) => {
                  const Icon = actionIcons[log.action] || Eye;
                  const label = actionLabels[log.action] || log.action;
                  const color = actionColors[log.action] || actionColors.view;
                  return (
                    <div
                      key={log._id}
                      className="relative flex gap-4 animate-fade-in"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      {/* Timeline dot */}
                      <div
                        className={cn(
                          "absolute -left-6 flex h-6 w-6 items-center justify-center rounded-full border-2 border-background",
                          color
                        )}
                      >
                        <Icon className="h-3 w-3" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 rounded-lg border border-border bg-card p-4 shadow-card transition-shadow hover:shadow-card-hover">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-foreground">
                                {label}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {log.description}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(log.createdAt), "h:mm a")}
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                          <User className="h-3 w-3" />
                          <span>{log.actor}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {filteredLogs.length === 0 && (
          <div className="stat-card text-center py-12">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="mt-4 text-foreground font-medium">No activity found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try adjusting your search or filters.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
