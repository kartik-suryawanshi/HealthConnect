import { useState, useRef } from "react";
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
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  Trash2,
  Share2,
  Check,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface HealthRecord {
  id: string;
  name: string;
  type: "lab" | "prescription" | "scan" | "report";
  uploadDate: string;
  accessStatus: "private" | "shared";
  sharedWith?: number;
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

const initialRecords: HealthRecord[] = [
  {
    id: "1",
    name: "Complete Blood Count (CBC)",
    type: "lab",
    uploadDate: "Dec 28, 2024",
    accessStatus: "shared",
    sharedWith: 2,
    fileSize: "245 KB",
  },
  {
    id: "2",
    name: "Blood Pressure Medication",
    type: "prescription",
    uploadDate: "Dec 25, 2024",
    accessStatus: "shared",
    sharedWith: 1,
    fileSize: "128 KB",
  },
  {
    id: "3",
    name: "Chest X-Ray",
    type: "scan",
    uploadDate: "Dec 20, 2024",
    accessStatus: "private",
    fileSize: "2.4 MB",
  },
  {
    id: "4",
    name: "Annual Physical Exam",
    type: "report",
    uploadDate: "Dec 15, 2024",
    accessStatus: "shared",
    sharedWith: 3,
    fileSize: "512 KB",
  },
  {
    id: "5",
    name: "Lipid Panel",
    type: "lab",
    uploadDate: "Dec 10, 2024",
    accessStatus: "private",
    fileSize: "180 KB",
  },
  {
    id: "6",
    name: "MRI Brain Scan",
    type: "scan",
    uploadDate: "Dec 5, 2024",
    accessStatus: "shared",
    sharedWith: 1,
    fileSize: "8.2 MB",
  },
];

export default function HealthRecords() {
  const [records, setRecords] = useState<HealthRecord[]>(initialRecords);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<HealthRecord | null>(null);
  const [uploadType, setUploadType] = useState<string>("");
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

  const handleUpload = () => {
    if (!selectedFile || !uploadType) {
      toast({
        title: "Missing Information",
        description: "Please select a file and document type.",
        variant: "destructive",
      });
      return;
    }

    const newRecord: HealthRecord = {
      id: Date.now().toString(),
      name: selectedFile.name.replace(/\.[^/.]+$/, ""),
      type: uploadType as HealthRecord["type"],
      uploadDate: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      accessStatus: "private",
      fileSize: formatFileSize(selectedFile.size),
    };

    setRecords((prev) => [newRecord, ...prev]);
    setUploadDialogOpen(false);
    setSelectedFile(null);
    setUploadType("");

    toast({
      title: "Document Uploaded",
      description: `${newRecord.name} has been added to your health records.`,
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const handleView = (record: HealthRecord) => {
    setSelectedRecord(record);
    setViewDialogOpen(true);
    toast({
      title: "Opening Document",
      description: `Viewing ${record.name}`,
    });
  };

  const handleDownload = (record: HealthRecord) => {
    toast({
      title: "Download Started",
      description: `Downloading ${record.name} (${record.fileSize})`,
    });
    // Simulate download delay
    setTimeout(() => {
      toast({
        title: "Download Complete",
        description: `${record.name} has been downloaded.`,
      });
    }, 1500);
  };

  const handleDelete = () => {
    if (selectedRecord) {
      setRecords((prev) => prev.filter((r) => r.id !== selectedRecord.id));
      setDeleteDialogOpen(false);
      toast({
        title: "Document Deleted",
        description: `${selectedRecord.name} has been removed from your records.`,
      });
      setSelectedRecord(null);
    }
  };

  const handleToggleShare = (record: HealthRecord) => {
    setRecords((prev) =>
      prev.map((r) =>
        r.id === record.id
          ? {
              ...r,
              accessStatus: r.accessStatus === "private" ? "shared" : "private",
              sharedWith: r.accessStatus === "private" ? 1 : undefined,
            }
          : r
      )
    );
    toast({
      title: record.accessStatus === "private" ? "Document Shared" : "Sharing Disabled",
      description:
        record.accessStatus === "private"
          ? `${record.name} can now be accessed by authorized doctors.`
          : `${record.name} is now private.`,
    });
  };

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

          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
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
                <div
                  className={cn(
                    "rounded-lg border-2 border-dashed p-8 text-center transition-colors cursor-pointer",
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
                      <Check className="mx-auto h-10 w-10 text-success" />
                      <p className="mt-2 text-sm font-medium text-foreground">
                        {selectedFile.name}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatFileSize(selectedFile.size)}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4"
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
                    </>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">
                    Document Type
                  </label>
                  <Select value={uploadType} onValueChange={setUploadType}>
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
                        <div>
                          <span className="font-medium">{record.name}</span>
                          {record.fileSize && (
                            <p className="text-xs text-muted-foreground">
                              {record.fileSize}
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
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleView(record)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownload(record)}>
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleShare(record)}>
                              <Share2 className="mr-2 h-4 w-4" />
                              {record.accessStatus === "private"
                                ? "Enable Sharing"
                                : "Disable Sharing"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => {
                                setSelectedRecord(record);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {filteredRecords.length === 0 && (
          <div className="stat-card text-center py-12">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="mt-4 text-foreground font-medium">No records found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try adjusting your search or upload a new document.
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
              {selectedRecord?.uploadDate}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedRecord?.name}"? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
