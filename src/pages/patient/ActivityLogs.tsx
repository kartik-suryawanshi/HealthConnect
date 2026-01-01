import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Eye, Download, Upload, Shield, Clock, User } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ActivityLog {
  id: string;
  action: "view" | "download" | "upload" | "access_grant" | "access_revoke";
  actor: string;
  actorType: "doctor" | "patient" | "system";
  target: string;
  timestamp: string;
  date: string;
  ipAddress?: string;
}

const actionIcons = {
  view: Eye,
  download: Download,
  upload: Upload,
  access_grant: Shield,
  access_revoke: Shield,
};

const actionLabels = {
  view: "Viewed",
  download: "Downloaded",
  upload: "Uploaded",
  access_grant: "Access Granted",
  access_revoke: "Access Revoked",
};

const actionColors = {
  view: "text-accent bg-accent/10",
  download: "text-primary bg-primary/10",
  upload: "text-success bg-success/10",
  access_grant: "text-success bg-success/10",
  access_revoke: "text-destructive bg-destructive/10",
};

const activityLogs: ActivityLog[] = [
  {
    id: "1",
    action: "view",
    actor: "Dr. Sarah Chen",
    actorType: "doctor",
    target: "Complete Blood Count (CBC)",
    timestamp: "10:45 AM",
    date: "Today",
  },
  {
    id: "2",
    action: "download",
    actor: "Dr. Sarah Chen",
    actorType: "doctor",
    target: "Blood Pressure Medication Prescription",
    timestamp: "10:42 AM",
    date: "Today",
  },
  {
    id: "3",
    action: "upload",
    actor: "You",
    actorType: "patient",
    target: "X-Ray Report",
    timestamp: "9:30 AM",
    date: "Today",
  },
  {
    id: "4",
    action: "access_grant",
    actor: "You",
    actorType: "patient",
    target: "Dr. Michael Lee - 30 day access",
    timestamp: "3:15 PM",
    date: "Yesterday",
  },
  {
    id: "5",
    action: "view",
    actor: "Dr. Michael Lee",
    actorType: "doctor",
    target: "Annual Physical Exam Report",
    timestamp: "2:30 PM",
    date: "Yesterday",
  },
  {
    id: "6",
    action: "view",
    actor: "Dr. Michael Lee",
    actorType: "doctor",
    target: "Lipid Panel Results",
    timestamp: "2:28 PM",
    date: "Yesterday",
  },
  {
    id: "7",
    action: "access_revoke",
    actor: "You",
    actorType: "patient",
    target: "Dr. James Wilson - Access terminated",
    timestamp: "11:00 AM",
    date: "Dec 28, 2024",
  },
  {
    id: "8",
    action: "upload",
    actor: "You",
    actorType: "patient",
    target: "MRI Brain Scan",
    timestamp: "4:45 PM",
    date: "Dec 27, 2024",
  },
];

export default function ActivityLogs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");

  const filteredLogs = activityLogs.filter((log) => {
    const matchesSearch =
      log.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.target.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = actionFilter === "all" || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  // Group logs by date
  const groupedLogs = filteredLogs.reduce((acc, log) => {
    if (!acc[log.date]) {
      acc[log.date] = [];
    }
    acc[log.date].push(log);
    return acc;
  }, {} as Record<string, ActivityLog[]>);

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
              <SelectItem value="access_grant">Access Granted</SelectItem>
              <SelectItem value="access_revoke">Access Revoked</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Timeline */}
        <div className="space-y-8">
          {Object.entries(groupedLogs).map(([date, logs]) => (
            <div key={date}>
              <h3 className="mb-4 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Clock className="h-4 w-4" />
                {date}
              </h3>
              <div className="relative space-y-4 pl-6 before:absolute before:left-[11px] before:top-2 before:h-[calc(100%-16px)] before:w-px before:bg-border">
                {logs.map((log, index) => {
                  const Icon = actionIcons[log.action];
                  return (
                    <div
                      key={log.id}
                      className="relative flex gap-4 animate-fade-in"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      {/* Timeline dot */}
                      <div
                        className={cn(
                          "absolute -left-6 flex h-6 w-6 items-center justify-center rounded-full border-2 border-background",
                          actionColors[log.action]
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
                                {actionLabels[log.action]}
                              </span>
                              <span
                                className={cn(
                                  "badge-status",
                                  log.actorType === "doctor"
                                    ? "bg-accent/10 text-accent"
                                    : "bg-muted text-muted-foreground"
                                )}
                              >
                                {log.actorType === "doctor" ? "Doctor" : "You"}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {log.target}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">
                              {log.timestamp}
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
