import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { HealthTrendsChart } from "@/components/dashboard/HealthTrendsChart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Filter,
  FileText,
  FlaskConical,
  Pill,
  ScanLine,
  Download,
  Eye,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import api from "@/services/api";
import { format } from "date-fns";

interface HealthRecord {
  _id: string;
  name: string;
  type: "lab" | "prescription" | "scan" | "report";
  createdAt: string;
  patient: {
    _id: string;
    name: string;
    email: string;
  };
  fileSize?: number;
  fileName?: string;
}

interface Insurance {
  _id: string;
  insuranceCompany: string;
  maskedPolicyNumber: string;
  validUpto: string;
  status: string;
}

const typeIcons = {
  lab: FlaskConical,
  prescription: Pill,
  scan: ScanLine,
  report: FileText,
};

const typeLabels = {
  lab: "Lab Result",
  prescription: "Prescription",
  scan: "Medical Scan",
  report: "Medical Report",
};

export default function PatientRecordsView() {
  const [searchParams] = useSearchParams();
  const patientIdParam = searchParams.get("patient");

  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string>(patientIdParam || "all");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<HealthRecord | null>(null);
  const [patientInsurance, setPatientInsurance] = useState<Insurance[]>([]);
  const [patientMetrics, setPatientMetrics] = useState<any[]>([]);

  useEffect(() => {
    fetchAuthorizedPatients();
  }, []);

  useEffect(() => {
    if (patients.length > 0) {
      fetchRecords();
      if (selectedPatient !== "all") {
        fetchPatientInsurance();
        fetchPatientMetrics();
      } else {
        setPatientInsurance([]);
        setPatientMetrics([]);
      }
    }
  }, [selectedPatient, typeFilter]);

  const fetchAuthorizedPatients = async () => {
    try {
      const response = await api.getAuthorizedPatients();
      if (response.success && response.data) {
        setPatients(response.data as any);
        if (patientIdParam && (response.data as any[]).some((p: any) => p._id === patientIdParam)) {
          setSelectedPatient(patientIdParam);
        }
      }
    } catch (error) {
      console.error("Error fetching patients:", error);
    }
  };

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (typeFilter !== "all") params.type = typeFilter;
      if (searchQuery) params.search = searchQuery;

      const response = await api.getHealthRecords(params);
      if (response.success && response.data) {
        // Filter records based on selected patient
        let filteredRecords = response.data as any[];
        if (selectedPatient !== "all") {
          filteredRecords = filteredRecords.filter(
            (record: HealthRecord) => {
              const patientId = record.patient?._id || record.patient;
              return patientId === selectedPatient || patientId?.toString() === selectedPatient;
            }
          );
        }
        setRecords(filteredRecords as any);
      } else {
        setRecords([]);
      }
    } catch (error: any) {
      console.error("Error fetching records:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch patient records",
        variant: "destructive",
      });
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientInsurance = async () => {
    try {
      const response = await api.getPatientMaskedInsurance(selectedPatient);
      if (response.success && response.data) {
        setPatientInsurance(response.data as any);
      }
    } catch (error) {
      console.error("Error fetching insurance:", error);
      setPatientInsurance([]);
    }
  };

  const fetchPatientMetrics = async () => {
    try {
      const response = await api.getHealthMetrics(selectedPatient, 'all');
      if (response.success && response.data) {
        setPatientMetrics(response.data as any);
      }
    } catch (error) {
      console.error("Error fetching metrics:", error);
      setPatientMetrics([]);
    }
  };

  const handleSearch = () => {
    fetchRecords();
  };

  const filteredRecords = records.filter((record) => {
    const matchesSearch = record.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const formatFileSize = (bytes: number): string => {
    if (!bytes) return "0 B";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const handleView = (record: HealthRecord) => {
    setSelectedRecord(record);
    setViewDialogOpen(true);
  };

  const handleDownload = async (record: HealthRecord) => {
    try {
      await api.downloadHealthRecord(record._id);
      toast({
        title: "Download Complete",
        description: `${record.name} has been downloaded.`,
      });
    } catch (error: any) {
      toast({
        title: "Download Failed",
        description: error.message || "Failed to download document",
        variant: "destructive",
      });
    }
  };

  const currentPatient = patients.find((p) => p._id === selectedPatient);

  return (
    <DashboardLayout
      userRole="doctor"
      title="Patient Records"
      subtitle={
        currentPatient
          ? `Viewing records for ${currentPatient.name}`
          : "View and manage patient documents"
      }
    >
      <div className="space-y-6">
        {/* Patient Selector and Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 gap-3">
            <Select
              value={selectedPatient}
              onValueChange={setSelectedPatient}
            >
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select patient" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Patients</SelectItem>
                {patients.map((patient) => (
                  <SelectItem key={patient._id} value={patient._id}>
                    {patient.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search records..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
                className="pl-9"
              />
            </div>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="lab">Lab Results</SelectItem>
                <SelectItem value="prescription">Prescriptions</SelectItem>
                <SelectItem value="scan">Medical Scans</SelectItem>
                <SelectItem value="report">Reports</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {selectedPatient !== "all" && patientInsurance.length > 0 && (
          <div className="bg-destructive/10 border-l-4 border-destructive p-4 rounded-md mb-6">
            <h3 className="font-semibold flex items-center text-destructive">
              <ShieldAlert className="h-5 w-5 mr-2" />
              Emergency Insurance Information
            </h3>
            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              {patientInsurance.map(ins => (
                <div key={ins._id} className="text-sm bg-background p-3 rounded shadow-sm border">
                  <p><strong>Provider:</strong> {ins.insuranceCompany}</p>
                  <p><strong>Policy (Masked):</strong> <span className="font-mono">{ins.maskedPolicyNumber}</span></p>
                  <p><strong>Status:</strong> <span className={ins.status === "Active" ? "text-success" : "text-muted-foreground"}>{ins.status}</span></p>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Showing necessary insurance details to facilitate emergency care while protecting full billing information.
            </p>
          </div>
        )}

        {selectedPatient !== "all" && (
          <div className="mb-6">
            <HealthTrendsChart metrics={patientMetrics} title={`${currentPatient?.name}'s Health Trends`} />
          </div>
        )}

        {/* Records Table */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="table-container">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Upload Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record, index) => {
                  const Icon = typeIcons[record.type];
                  return (
                    <TableRow
                      key={record._id}
                      className="animate-fade-in"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                            <Icon className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <span className="font-medium">{record.name}</span>
                            {record.fileSize && (
                              <p className="text-xs text-muted-foreground">
                                {formatFileSize(record.fileSize)}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-muted-foreground">
                          {typeLabels[record.type]}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-muted-foreground">
                          {record.patient.name}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-muted-foreground">
                          {format(new Date(record.createdAt), "MMM d, yyyy")}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleView(record)}
                            title="View document"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDownload(record)}
                            title="Download document"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {!loading && filteredRecords.length === 0 && (
          <div className="stat-card text-center py-12">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="mt-4 text-foreground font-medium">No records found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {selectedPatient === "all"
                ? "No records available for any patient."
                : "No records found for this patient. Try selecting a different patient or adjusting your search."}
            </p>
          </div>
        )}
      </div>

      {/* View Document Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedRecord?.name}</DialogTitle>
            <DialogDescription>
              {selectedRecord && typeLabels[selectedRecord.type]} • Patient:{" "}
              {selectedRecord?.patient.name} • Uploaded on{" "}
              {selectedRecord && format(new Date(selectedRecord.createdAt), "MMM d, yyyy")}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <div className="aspect-[4/3] rounded-lg bg-muted flex items-center justify-center">
              <div className="text-center">
                {selectedRecord && (
                  <>
                    {(() => {
                      const Icon = typeIcons[selectedRecord.type];
                      return <Icon className="mx-auto h-16 w-16 text-muted-foreground" />;
                    })()}
                  </>
                )}
                <p className="mt-4 text-sm text-muted-foreground">
                  Document Preview
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedRecord?.fileSize && formatFileSize(selectedRecord.fileSize)}
                </p>
              </div>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => selectedRecord && handleDownload(selectedRecord)}
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <DialogClose asChild>
              <Button>Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
