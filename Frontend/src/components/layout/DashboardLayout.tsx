import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface DashboardLayoutProps {
  children: ReactNode;
  userRole: "patient" | "doctor";
  title: string;
  subtitle?: string;
}

export function DashboardLayout({
  children,
  userRole,
  title,
  subtitle,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar userRole={userRole} />
      <div className="md:ml-64">
        <Header title={title} subtitle={subtitle} userRole={userRole} />
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
