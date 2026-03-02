import { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "default" | "primary" | "accent";
  href?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = "default",
  href,
}: StatCardProps) {
  const content = (
    <>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
            {value}
          </p>
          {subtitle && (
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          )}
          {trend && (
            <p
              className={cn(
                "mt-2 text-sm font-medium",
                trend.isPositive ? "text-success" : "text-destructive"
              )}
            >
              {trend.isPositive ? "+" : "-"}
              {trend.value}% from last month
            </p>
          )}
        </div>
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-xl",
            variant === "default" && "bg-muted",
            variant === "primary" && "bg-primary/10",
            variant === "accent" && "bg-accent/10"
          )}
        >
          <Icon
            className={cn(
              "h-6 w-6",
              variant === "default" && "text-muted-foreground",
              variant === "primary" && "text-primary",
              variant === "accent" && "text-accent"
            )}
          />
        </div>
      </div>
    </>
  );

  if (href) {
    return (
      <Link
        to={href}
        className="stat-card animate-fade-in transition-all hover:border-primary/30 hover:shadow-md block"
      >
        {content}
      </Link>
    );
  }

  return <div className="stat-card animate-fade-in">{content}</div>;
}
