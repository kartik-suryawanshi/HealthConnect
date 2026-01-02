import { Link } from "react-router-dom";
import { FileText, Eye, Upload, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityItem {
  id: string;
  type: "view" | "upload" | "access" | "revoke";
  description: string;
  actor: string;
  timestamp: string;
}

const activityIcons = {
  view: Eye,
  upload: Upload,
  access: Shield,
  revoke: FileText,
};

const activityColors = {
  view: "text-accent bg-accent/10",
  upload: "text-primary bg-primary/10",
  access: "text-success bg-success/10",
  revoke: "text-destructive bg-destructive/10",
};

interface RecentActivityProps {
  activities: ActivityItem[];
  viewAllHref?: string;
}

export function RecentActivity({ activities, viewAllHref }: RecentActivityProps) {
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="section-title mb-0">Recent Activity</h3>
        {viewAllHref && (
          <Link
            to={viewAllHref}
            className="text-sm font-medium text-primary hover:underline"
          >
            View All
          </Link>
        )}
      </div>
      <div className="space-y-4">
        {activities.map((activity, index) => {
          const Icon = activityIcons[activity.type];
          return (
            <div
              key={activity.id}
              className="flex items-start gap-4 animate-slide-in rounded-lg p-2 -mx-2 transition-colors hover:bg-muted/50"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                  activityColors[activity.type]
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {activity.description}
                </p>
                <p className="text-sm text-muted-foreground">
                  by {activity.actor}
                </p>
              </div>
              <p className="shrink-0 text-xs text-muted-foreground">
                {activity.timestamp}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
