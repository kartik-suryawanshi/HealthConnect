import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, FolderOpen, Calendar, User } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

interface AuthorizedPatient {
  id: string;
  name: string;
  patientId: string;
  accessGranted: string;
  accessExpires: string;
  recordsCount: number;
  lastAccessed: string;
  condition: string;
}

const authorizedPatients: AuthorizedPatient[] = [
  {
    id: "1",
    name: "John Smith",
    patientId: "P-12345",
    accessGranted: "Dec 20, 2024",
    accessExpires: "Jan 20, 2025",
    recordsCount: 24,
    lastAccessed: "2 hours ago",
    condition: "Hypertension",
  },
  {
    id: "2",
    name: "Mary Johnson",
    patientId: "P-23456",
    accessGranted: "Dec 18, 2024",
    accessExpires: "Jan 18, 2025",
    recordsCount: 15,
    lastAccessed: "Yesterday",
    condition: "Diabetes Type 2",
  },
  {
    id: "3",
    name: "Robert Davis",
    patientId: "P-34567",
    accessGranted: "Dec 15, 2024",
    accessExpires: "Jan 15, 2025",
    recordsCount: 8,
    lastAccessed: "3 days ago",
    condition: "Cardiac Monitoring",
  },
  {
    id: "4",
    name: "Emily Wilson",
    patientId: "P-45678",
    accessGranted: "Dec 10, 2024",
    accessExpires: "Jan 10, 2025",
    recordsCount: 32,
    lastAccessed: "1 week ago",
    condition: "Annual Checkup",
  },
  {
    id: "5",
    name: "James Anderson",
    patientId: "P-56789",
    accessGranted: "Dec 5, 2024",
    accessExpires: "Jan 5, 2025",
    recordsCount: 12,
    lastAccessed: "2 weeks ago",
    condition: "Post-Surgery Follow-up",
  },
];

export default function AuthorizedPatients() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPatients = authorizedPatients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.condition.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout
      userRole="doctor"
      title="Authorized Patients"
      subtitle="Patients who have granted you access to their records"
    >
      <div className="space-y-6">
        {/* Summary Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">
                  {authorizedPatients.length}
                </p>
                <p className="text-sm text-muted-foreground">Total Patients</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                <FolderOpen className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">91</p>
                <p className="text-sm text-muted-foreground">
                  Total Records Access
                </p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                <Calendar className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">2</p>
                <p className="text-sm text-muted-foreground">Expiring Soon</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search patients by name, ID, or condition..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Patients Table */}
        <div className="table-container">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>Access Period</TableHead>
                <TableHead>Records</TableHead>
                <TableHead>Last Accessed</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.map((patient, index) => (
                <TableRow
                  key={patient.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <span className="text-sm font-medium text-primary">
                          {patient.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {patient.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {patient.patientId}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground">
                      {patient.condition}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p className="text-foreground">{patient.accessGranted}</p>
                      <p className="text-muted-foreground">
                        to {patient.accessExpires}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground">
                      {patient.recordsCount} records
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground">
                      {patient.lastAccessed}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild size="sm">
                      <Link to={`/doctor/records?patient=${patient.id}`}>
                        <FolderOpen className="mr-2 h-4 w-4" />
                        View Records
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredPatients.length === 0 && (
          <div className="stat-card text-center py-12">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="mt-4 text-foreground font-medium">No patients found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try adjusting your search query.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
