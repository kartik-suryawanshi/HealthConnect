import { useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Upload,
  Search,
  FileText,
  FlaskConical,
  Pill,
  ScanLine,
  Download,
  Eye,
  MoreHorizontal,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface HealthRecord {
  id: string;
  name: string;
  type: "lab" | "prescription" | "scan" | "report";
  uploadDate: string;
  accessStatus: "private" | "shared";
  sharedWith?: number;
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

const records: HealthRecord[] = [
  {
    id: "1",
    name: "Complete Blood Count (CBC)",
    type: "lab",
    uploadDate: "Dec 28, 2024",
    accessStatus: "shared",
    sharedWith: 2,
  },
  {
    id: "2",
    name: "Blood Pressure Medication",
    type: "prescription",
    uploadDate: "Dec 25, 2024",
    accessStatus: "shared",
    sharedWith: 1,
  },
  {
    id: "3",
    name: "Chest X-Ray",
    type: "scan",
    uploadDate: "Dec 20, 2024",
    accessStatus: "private",
  },
  {
    id: "4",
    name: "Annual Physical Exam",
    type: "report",
    uploadDate: "Dec 15, 2024",
    accessStatus: "shared",
    sharedWith: 3,
  },
  {
    id: "5",
    name: "Lipid Panel",
    type: "lab",
    uploadDate: "Dec 10, 2024",
    accessStatus: "private",
  },
  {
    id: "6",
    name: "MRI Brain Scan",
    type: "scan",
    uploadDate: "Dec 5, 2024",
    accessStatus: "shared",
    sharedWith: 1,
  },
];

export default function HealthRecords() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const filteredRecords = records.filter((record) => {
    const matchesSearch = record.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || record.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <DashboardLayout
      userRole="patient"
      title="Health Records"
      subtitle="Manage and organize your medical documents"
    >
      <div className="space-y-6">
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
                <DialogTitle>Upload Health Record</DialogTitle>
                <DialogDescription>
                  Add a new document to your health records. All uploads are
                  encrypted and secure.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="rounded-lg border-2 border-dashed border-border p-8 text-center">
                  <Upload className="mx-auto h-10 w-10 text-muted-foreground" />
                  <p className="mt-2 text-sm font-medium text-foreground">
                    Drag and drop your file here
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    PDF, JPG, PNG up to 10MB
                  </p>
                  <Button variant="outline" className="mt-4">
                    Browse Files
                  </Button>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">
                    Document Type
                  </label>
                  <Select>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lab">Lab Result</SelectItem>
                      <SelectItem value="prescription">Prescription</SelectItem>
                      <SelectItem value="scan">Medical Scan</SelectItem>
                      <SelectItem value="report">Medical Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full">Upload Document</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Records Table */}
        <div className="table-container">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Upload Date</TableHead>
                <TableHead>Access Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((record, index) => {
                const Icon = typeIcons[record.type];
                return (
                  <TableRow
                    key={record.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                          <Icon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <span className="font-medium">{record.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground">
                        {typeLabels[record.type]}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground">
                        {record.uploadDate}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "badge-status",
                          record.accessStatus === "shared"
                            ? "badge-active"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {record.accessStatus === "shared"
                          ? `Shared with ${record.sharedWith}`
                          : "Private"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
}
