import { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface QuickAction {
  icon: LucideIcon;
  label: string;
  description: string;
  path: string;
  variant?: "default" | "primary" | "accent";
}

interface QuickActionsProps {
  actions: QuickAction[];
}

export function QuickActions({ actions }: QuickActionsProps) {
  return (
    <div className="stat-card">
      <h3 className="section-title">Quick Actions</h3>
      <div className="grid gap-3">
        {actions.map((action, index) => (
          <Link
            key={action.path}
            to={action.path}
            className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-card-hover animate-slide-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg",
                action.variant === "primary" && "bg-primary/10",
                action.variant === "accent" && "bg-accent/10",
                !action.variant && "bg-muted"
              )}
            >
              <action.icon
                className={cn(
                  "h-5 w-5",
                  action.variant === "primary" && "text-primary",
                  action.variant === "accent" && "text-accent",
                  !action.variant && "text-muted-foreground"
                )}
              />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {action.label}
              </p>
              <p className="text-sm text-muted-foreground">
                {action.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
