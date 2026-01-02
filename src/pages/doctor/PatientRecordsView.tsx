import { useState, useRef } from "react";
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
  DialogFooter,
  DialogClose,
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
  Check,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

interface PatientRecord {
  id: string;
  name: string;
  type: "lab" | "prescription" | "scan" | "report";
  uploadDate: string;
  uploadedBy: string;
  fileSize?: string;
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

const initialPatientRecords: PatientRecord[] = [
  {
    id: "1",
    name: "Complete Blood Count (CBC)",
    type: "lab",
    uploadDate: "Dec 28, 2024",
    uploadedBy: "Patient",
    fileSize: "245 KB",
  },
  {
    id: "2",
    name: "Blood Pressure Medication - Lisinopril",
    type: "prescription",
    uploadDate: "Dec 25, 2024",
    uploadedBy: "Dr. Sarah Chen",
    fileSize: "128 KB",
  },
  {
    id: "3",
    name: "Chest X-Ray",
    type: "scan",
    uploadDate: "Dec 20, 2024",
    uploadedBy: "Patient",
    fileSize: "2.4 MB",
  },
  {
    id: "4",
    name: "Annual Physical Examination Report",
    type: "report",
    uploadDate: "Dec 15, 2024",
    uploadedBy: "Dr. Michael Lee",
    fileSize: "512 KB",
  },
  {
    id: "5",
    name: "Lipid Panel Results",
    type: "lab",
    uploadDate: "Dec 10, 2024",
    uploadedBy: "Patient",
    fileSize: "180 KB",
  },
  {
    id: "6",
    name: "Echocardiogram",
    type: "scan",
    uploadDate: "Dec 5, 2024",
    uploadedBy: "Patient",
    fileSize: "8.2 MB",
  },
];

const patients = [
  {
    id: "1",
    name: "John Smith",
    patientId: "P-12345",
    condition: "Hypertension",
    accessExpires: "Jan 20, 2025",
  },
  {
    id: "2",
    name: "Mary Johnson",
    patientId: "P-23456",
    condition: "Diabetes Type 2",
    accessExpires: "Jan 18, 2025",
  },
  {
    id: "3",
    name: "Robert Davis",
    patientId: "P-34567",
    condition: "Cardiac Monitoring",
    accessExpires: "Jan 15, 2025",
  },
];

export default function PatientRecordsView() {
  const [searchParams] = useSearchParams();
  const patientIdParam = searchParams.get("patient") || "1";
  const selectedPatient = patients.find((p) => p.id === patientIdParam) || patients[0];

  const [records, setRecords] = useState<PatientRecord[]>(initialPatientRecords);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<PatientRecord | null>(null);
  const [uploadType, setUploadType] = useState<string>("");
  const [uploadNotes, setUploadNotes] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredRecords = records.filter((record) => {
    const matchesSearch = record.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || record.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const handleUpload = () => {
    if (!selectedFile || !uploadType) {
      toast({
        title: "Missing Information",
        description: "Please select a file and document type.",
        variant: "destructive",
      });
      return;
    }

    const newRecord: PatientRecord = {
      id: Date.now().toString(),
      name: selectedFile.name.replace(/\.[^/.]+$/, ""),
      type: uploadType as PatientRecord["type"],
      uploadDate: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      uploadedBy: "Dr. Chen",
      fileSize: formatFileSize(selectedFile.size),
    };

    setRecords((prev) => [newRecord, ...prev]);
    setUploadDialogOpen(false);
    setSelectedFile(null);
    setUploadType("");
    setUploadNotes("");

    toast({
      title: "Document Uploaded",
      description: `${newRecord.name} has been added to ${selectedPatient.name}'s records.`,
    });
  };

  const handleView = (record: PatientRecord) => {
    setSelectedRecord(record);
    setViewDialogOpen(true);
    toast({
      title: "Opening Document",
      description: `Viewing ${record.name}`,
    });
  };

  const handleDownload = (record: PatientRecord) => {
    toast({
      title: "Download Started",
      description: `Downloading ${record.name} (${record.fileSize})`,
    });
    setTimeout(() => {
      toast({
        title: "Download Complete",
        description: `${record.name} has been downloaded.`,
      });
    }, 1500);
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
                  {selectedPatient.patientId} • {selectedPatient.condition}
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

          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
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
                <div
                  className={cn(
                    "rounded-lg border-2 border-dashed p-6 text-center transition-colors cursor-pointer",
                    isDragging
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50",
                    selectedFile && "border-success bg-success/5"
                  )}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                  />
                  {selectedFile ? (
                    <>
                      <Check className="mx-auto h-8 w-8 text-success" />
                      <p className="mt-2 text-sm font-medium text-foreground">
                        {selectedFile.name}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatFileSize(selectedFile.size)}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                        }}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Remove
                      </Button>
                    </>
                  ) : (
                    <>
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
                    </>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="docType">Document Type</Label>
                  <Select value={uploadType} onValueChange={setUploadType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="prescription">Prescription</SelectItem>
                      <SelectItem value="report">Medical Report</SelectItem>
                      <SelectItem value="lab">Lab Results</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any relevant notes about this document..."
                    rows={3}
                    value={uploadNotes}
                    onChange={(e) => setUploadNotes(e.target.value)}
                  />
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button onClick={handleUpload} disabled={!selectedFile || !uploadType}>
                    Upload Document
                  </Button>
                </DialogFooter>
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

                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleView(record)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleDownload(record)}
                  >
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

      {/* View Document Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedRecord?.name}</DialogTitle>
            <DialogDescription>
              {selectedRecord && typeLabels[selectedRecord.type]} • Uploaded on{" "}
              {selectedRecord?.uploadDate} by {selectedRecord?.uploadedBy}
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
                  {selectedRecord?.fileSize}
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
