import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Stethoscope, Building2, Calendar, ShieldOff, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import api from "@/services/api";
import { format } from "date-fns";

interface SharedDoctor {
  requestId: string;
  doctor: {
    _id: string;
    name: string;
    hospital: string;
    specialty: string;
  };
  accessGrantedAt: string;
  expiresAt: string;
  conditions: string;
}

export default function SharedAccess() {
  const [loading, setLoading] = useState(true);
  const [sharedDoctors, setSharedDoctors] = useState<SharedDoctor[]>([]);

  useEffect(() => {
    fetchSharedAccess();
  }, []);

  const fetchSharedAccess = async () => {
    try {
      setLoading(true);
      const response = await api.getSharedAccess();
      if (response.success && response.data) {
        setSharedDoctors(response.data);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch shared access",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (requestId: string, doctorName: string) => {
    try {
      await api.revokeAccess(requestId);
      toast({
        title: "Access Revoked",
        description: `${doctorName} no longer has access to your records.`,
      });
      fetchSharedAccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to revoke access",
        variant: "destructive",
      });
    }
  };


  if (loading) {
    return (
      <DashboardLayout
        userRole="patient"
        title="Shared Access"
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
      title="Shared Access"
      subtitle="Manage doctors who have access to your health records"
    >
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Stethoscope className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">
                  {sharedDoctors.length}
                </p>
                <p className="text-sm text-muted-foreground">Active Access</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                <Building2 className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">
                  {new Set(sharedDoctors.map((d) => d.doctor.hospital)).size}
                </p>
                <p className="text-sm text-muted-foreground">Hospitals</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                <Calendar className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">
                  {sharedDoctors.filter((d) => {
                    const expiresAt = new Date(d.expiresAt);
                    const daysUntilExpiry = Math.ceil(
                      (expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                    );
                    return daysUntilExpiry > 0 && daysUntilExpiry <= 7;
                  }).length}
                </p>
                <p className="text-sm text-muted-foreground">Expiring Soon</p>
              </div>
            </div>
          </div>
        </div>

        {/* Shared Access Table */}
        {sharedDoctors.length === 0 ? (
          <div className="stat-card text-center py-12">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <ShieldOff className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="mt-4 text-foreground font-medium">
              No active access grants
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              When you approve access requests, they will appear here.
            </p>
          </div>
        ) : (
          <div className="table-container">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Hospital</TableHead>
                  <TableHead>Access Granted</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sharedDoctors.map((item, index) => {
                  const doctor = item.doctor;
                  return (
                    <TableRow
                      key={doctor._id}
                      className="animate-fade-in"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            <span className="text-sm font-medium text-primary">
                              {doctor.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {doctor.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {doctor.specialty}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-muted-foreground">
                          {doctor.hospital}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-muted-foreground">
                          {format(new Date(item.accessGrantedAt), "MMM d, yyyy")}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-muted-foreground">
                          {format(new Date(item.expiresAt), "MMM d, yyyy")}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <ShieldOff className="mr-2 h-4 w-4" />
                              Revoke
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Revoke Access</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to revoke {doctor.name}'s
                                access to your health records? They will no longer be
                                able to view your documents.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleRevoke(item.requestId, doctor.name)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Revoke Access
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
