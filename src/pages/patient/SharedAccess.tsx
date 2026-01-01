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
import { Stethoscope, Building2, Calendar, ShieldOff } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

interface SharedDoctor {
  id: string;
  doctorName: string;
  hospital: string;
  specialty: string;
  accessGranted: string;
  accessExpires: string;
  recordsAccessed: number;
}

const initialSharedDoctors: SharedDoctor[] = [
  {
    id: "1",
    doctorName: "Dr. Sarah Chen",
    hospital: "University Medical Center",
    specialty: "Cardiology",
    accessGranted: "Dec 20, 2024",
    accessExpires: "Jan 20, 2025",
    recordsAccessed: 5,
  },
  {
    id: "2",
    doctorName: "Dr. Michael Lee",
    hospital: "City General Hospital",
    specialty: "General Practice",
    accessGranted: "Dec 15, 2024",
    accessExpires: "Jan 15, 2025",
    recordsAccessed: 3,
  },
  {
    id: "3",
    doctorName: "Dr. Rachel Kim",
    hospital: "Metro Health Center",
    specialty: "Endocrinology",
    accessGranted: "Dec 10, 2024",
    accessExpires: "Jan 10, 2025",
    recordsAccessed: 2,
  },
];

export default function SharedAccess() {
  const [sharedDoctors, setSharedDoctors] = useState(initialSharedDoctors);

  const handleRevoke = (id: string, doctorName: string) => {
    setSharedDoctors((prev) => prev.filter((doc) => doc.id !== id));
    toast({
      title: "Access Revoked",
      description: `${doctorName} no longer has access to your records.`,
    });
  };

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
                <p className="text-2xl font-semibold text-foreground">3</p>
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
                <p className="text-2xl font-semibold text-foreground">1</p>
                <p className="text-sm text-muted-foreground">Expiring Soon</p>
              </div>
            </div>
          </div>
        </div>

        {/* Shared Access Table */}
        <div className="table-container">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Doctor</TableHead>
                <TableHead>Hospital</TableHead>
                <TableHead>Access Granted</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Records Accessed</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sharedDoctors.map((doctor, index) => (
                <TableRow
                  key={doctor.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <span className="text-sm font-medium text-primary">
                          {doctor.doctorName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {doctor.doctorName}
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
                      {doctor.accessGranted}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground">
                      {doctor.accessExpires}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground">
                      {doctor.recordsAccessed} records
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
                            Are you sure you want to revoke {doctor.doctorName}'s
                            access to your health records? They will no longer be
                            able to view your documents.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() =>
                              handleRevoke(doctor.id, doctor.doctorName)
                            }
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Revoke Access
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {sharedDoctors.length === 0 && (
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
        )}
      </div>
    </DashboardLayout>
  );
}
