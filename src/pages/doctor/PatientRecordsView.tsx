import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Search,
  Filter,
  FileText,
  FlaskConical,
  Pill,
  ScanLine,
  Download,
  Eye,
  Upload,
  ArrowLeft,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

interface PatientRecord {
  id: string;
  name: string;
  type: "lab" | "prescription" | "scan" | "report";
  uploadDate: string;
  uploadedBy: string;
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

const patientRecords: PatientRecord[] = [
  {
    id: "1",
    name: "Complete Blood Count (CBC)",
    type: "lab",
    uploadDate: "Dec 28, 2024",
    uploadedBy: "Patient",
  },
  {
    id: "2",
    name: "Blood Pressure Medication - Lisinopril",
    type: "prescription",
    uploadDate: "Dec 25, 2024",
    uploadedBy: "Dr. Sarah Chen",
  },
  {
    id: "3",
    name: "Chest X-Ray",
    type: "scan",
    uploadDate: "Dec 20, 2024",
    uploadedBy: "Patient",
  },
  {
    id: "4",
    name: "Annual Physical Examination Report",
    type: "report",
    uploadDate: "Dec 15, 2024",
    uploadedBy: "Dr. Michael Lee",
  },
  {
    id: "5",
    name: "Lipid Panel Results",
    type: "lab",
    uploadDate: "Dec 10, 2024",
    uploadedBy: "Patient",
  },
  {
    id: "6",
    name: "Echocardiogram",
    type: "scan",
    uploadDate: "Dec 5, 2024",
    uploadedBy: "Patient",
  },
];

const selectedPatient = {
  name: "John Smith",
  id: "P-12345",
  condition: "Hypertension",
  accessExpires: "Jan 20, 2025",
};

export default function PatientRecordsView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const filteredRecords = patientRecords.filter((record) => {
    const matchesSearch = record.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || record.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleUpload = () => {
    toast({
      title: "Document Uploaded",
      description: "The prescription has been added to the patient's records.",
    });
  };

  return (
    <DashboardLayout
      userRole="doctor"
      title="Patient Records"
      subtitle="View and manage patient health documents"
    >
      <div className="space-y-6">
        {/* Back Link & Patient Info */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/doctor/patients">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  {selectedPatient.name}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {selectedPatient.id} • {selectedPatient.condition}
                </p>
              </div>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Access expires: {selectedPatient.accessExpires}
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search records..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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

          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                Upload Document
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Prescription or Report</DialogTitle>
                <DialogDescription>
                  Add a new document to {selectedPatient.name}'s health records.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="rounded-lg border-2 border-dashed border-border p-6 text-center">
                  <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-sm font-medium text-foreground">
                    Drag and drop your file here
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    PDF, JPG, PNG up to 10MB
                  </p>
                  <Button variant="outline" size="sm" className="mt-3">
                    Browse Files
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="docType">Document Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="prescription">Prescription</SelectItem>
                      <SelectItem value="report">Medical Report</SelectItem>
                      <SelectItem value="referral">Referral Letter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any relevant notes about this document..."
                    rows={3}
                  />
                </div>
                <Button className="w-full" onClick={handleUpload}>
                  Upload Document
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Records Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRecords.map((record, index) => {
            const Icon = typeIcons[record.type];
            return (
              <div
                key={record.id}
                className="stat-card group cursor-pointer animate-fade-in"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      "flex h-12 w-12 shrink-0 items-center justify-center rounded-lg transition-colors",
                      record.type === "lab" && "bg-accent/10 text-accent",
                      record.type === "prescription" &&
                        "bg-primary/10 text-primary",
                      record.type === "scan" && "bg-warning/10 text-warning",
                      record.type === "report" && "bg-success/10 text-success"
                    )}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground line-clamp-2">
                      {record.name}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {typeLabels[record.type]}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{record.uploadDate}</span>
                  <span>by {record.uploadedBy}</span>
                </div>

                <div className="mt-4 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredRecords.length === 0 && (
          <div className="stat-card text-center py-12">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="mt-4 text-foreground font-medium">No records found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try adjusting your search or filters.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
