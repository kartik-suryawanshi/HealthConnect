import { useState, useEffect } from "react";
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
import { Search, FolderOpen, Calendar, User, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import api from "@/services/api";
import { format, formatDistanceToNow } from "date-fns";

interface AuthorizedPatient {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
}

export default function AuthorizedPatients() {
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<AuthorizedPatient[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [accessRequests, setAccessRequests] = useState<any[]>([]);

  useEffect(() => {
    fetchAuthorizedPatients();
  }, []);

  const fetchAuthorizedPatients = async () => {
    try {
      setLoading(true);
      const response = await api.getAuthorizedPatients();
      if (response.success && response.data) {
        setPatients(response.data);
      }

      // Also fetch access requests to get access period info
      const requestsResponse = await api.getAccessRequests("approved");
      if (requestsResponse.success && requestsResponse.data) {
        setAccessRequests(requestsResponse.data);
      }
    } catch (error: any) {
      console.error("Error fetching authorized patients:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPatientAccessInfo = (patientId: string) => {
    const request = accessRequests.find(
      (req) => req.patient._id === patientId || req.patient?._id === patientId
    );
    return request;
  };

  const getPatientRecordsCount = async (patientId: string) => {
    try {
      const response = await api.getHealthRecords();
      if (response.success && response.data) {
        return response.data.filter((record: any) =>
          record.patient._id === patientId || record.patient?._id === patientId
        ).length;
      }
    } catch (error) {
      return 0;
    }
    return 0;
  };

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <DashboardLayout
        userRole="doctor"
        title="Authorized Patients"
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
                  {patients.length}
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
                <p className="text-2xl font-semibold text-foreground">
                  {patients.length > 0 ? "Active" : "0"}
                </p>
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
                <p className="text-2xl font-semibold text-foreground">
                  {accessRequests.filter((req) => {
                    if (!req.expiresAt) return false;
                    const expiresAt = new Date(req.expiresAt);
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

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search patients by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Patients Table */}
        {filteredPatients.length === 0 ? (
          <div className="stat-card text-center py-12">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="mt-4 text-foreground font-medium">No patients found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {searchQuery
                ? "Try adjusting your search query."
                : "No authorized patients yet. Request access to patient records to get started."}
            </p>
          </div>
        ) : (
          <div className="table-container">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Access Period</TableHead>
                  <TableHead>Last Accessed</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.map((patient, index) => {
                  const accessInfo = getPatientAccessInfo(patient._id);
                  return (
                    <TableRow
                      key={patient._id}
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
                              {patient.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {accessInfo ? (
                          <div className="text-sm">
                            <p className="text-foreground">
                              {format(new Date(accessInfo.approvedAt), "MMM d, yyyy")}
                            </p>
                            <p className="text-muted-foreground">
                              to {accessInfo.expiresAt ? format(new Date(accessInfo.expiresAt), "MMM d, yyyy") : "N/A"}
                            </p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-muted-foreground">
                          {accessInfo?.createdAt
                            ? formatDistanceToNow(new Date(accessInfo.createdAt), { addSuffix: true })
                            : "Never"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild size="sm">
                          <Link to={`/doctor/records?patient=${patient._id}`}>
                            <FolderOpen className="mr-2 h-4 w-4" />
                            View Records
                          </Link>
                        </Button>
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
