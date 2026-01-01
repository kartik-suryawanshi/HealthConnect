import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Stethoscope, Building2, Clock, Check, X } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

interface AccessRequest {
  id: string;
  doctorName: string;
  hospital: string;
  specialty: string;
  reason: string;
  duration: string;
  requestDate: string;
  status: "pending" | "approved" | "rejected";
}

const accessRequests: AccessRequest[] = [
  {
    id: "1",
    doctorName: "Dr. Emily Watson",
    hospital: "City General Hospital",
    specialty: "Internal Medicine",
    reason: "Follow-up consultation for annual physical examination results",
    duration: "30 days",
    requestDate: "Dec 30, 2024",
    status: "pending",
  },
  {
    id: "2",
    doctorName: "Dr. James Miller",
    hospital: "Metro Health Center",
    specialty: "Cardiology",
    reason: "Review cardiac test results and medication history",
    duration: "14 days",
    requestDate: "Dec 28, 2024",
    status: "pending",
  },
  {
    id: "3",
    doctorName: "Dr. Sarah Chen",
    hospital: "University Medical Center",
    specialty: "Cardiology",
    reason: "Routine cardiac checkup and ECG review",
    duration: "7 days",
    requestDate: "Dec 20, 2024",
    status: "approved",
  },
];

export default function AccessRequests() {
  const [requests, setRequests] = useState(accessRequests);

  const handleApprove = (id: string, conditions?: string) => {
    setRequests((prev) =>
      prev.map((req) =>
        req.id === id ? { ...req, status: "approved" as const } : req
      )
    );
    toast({
      title: "Access Approved",
      description: conditions
        ? `Access granted with conditions: ${conditions}`
        : "The doctor now has access to your records.",
    });
  };

  const handleReject = (id: string) => {
    setRequests((prev) =>
      prev.map((req) =>
        req.id === id ? { ...req, status: "rejected" as const } : req
      )
    );
    toast({
      title: "Access Rejected",
      description: "The access request has been declined.",
    });
  };

  const pendingRequests = requests.filter((req) => req.status === "pending");
  const processedRequests = requests.filter((req) => req.status !== "pending");

  return (
    <DashboardLayout
      userRole="patient"
      title="Access Requests"
      subtitle="Review and manage doctor access requests to your health records"
    >
      <div className="space-y-8">
        {/* Pending Requests */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="section-title">
              Pending Requests ({pendingRequests.length})
            </h2>
          </div>

          {pendingRequests.length === 0 ? (
            <div className="stat-card text-center py-12">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Check className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="mt-4 text-foreground font-medium">All caught up!</p>
              <p className="mt-1 text-sm text-muted-foreground">
                No pending access requests at the moment.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {pendingRequests.map((request, index) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  index={index}
                />
              ))}
            </div>
          )}
        </section>

        {/* Recent Activity */}
        {processedRequests.length > 0 && (
          <section>
            <h2 className="section-title">Recent Activity</h2>
            <div className="space-y-3">
              {processedRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-card p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                      <Stethoscope className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {request.doctorName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {request.hospital}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`badge-status ${
                      request.status === "approved"
                        ? "badge-active"
                        : "badge-revoked"
                    }`}
                  >
                    {request.status === "approved" ? "Approved" : "Rejected"}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </DashboardLayout>
  );
}

interface RequestCardProps {
  request: AccessRequest;
  onApprove: (id: string, conditions?: string) => void;
  onReject: (id: string) => void;
  index: number;
}

function RequestCard({ request, onApprove, onReject, index }: RequestCardProps) {
  const [conditions, setConditions] = useState<string>("");

  return (
    <div
      className="stat-card animate-fade-in"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Stethoscope className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">
              {request.doctorName}
            </h3>
            <p className="text-sm text-muted-foreground">{request.specialty}</p>
          </div>
        </div>
        <span className="badge-status badge-pending">Pending</span>
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Building2 className="h-4 w-4" />
          <span>{request.hospital}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Requested: {request.duration} access</span>
        </div>
      </div>

      <div className="mt-4 rounded-lg bg-muted/50 p-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Reason for Access
        </p>
        <p className="mt-1 text-sm text-foreground">{request.reason}</p>
      </div>

      <div className="mt-4">
        <label className="text-xs font-medium text-muted-foreground">
          Approve with conditions (optional)
        </label>
        <Select value={conditions} onValueChange={setConditions}>
          <SelectTrigger className="mt-1.5">
            <SelectValue placeholder="No conditions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No conditions</SelectItem>
            <SelectItem value="lab-only">Lab results only</SelectItem>
            <SelectItem value="recent">Recent records only (30 days)</SelectItem>
            <SelectItem value="no-download">View only, no downloads</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mt-4 flex gap-3">
        <Button
          variant="success"
          className="flex-1"
          onClick={() =>
            onApprove(request.id, conditions !== "none" ? conditions : undefined)
          }
        >
          <Check className="mr-2 h-4 w-4" />
          Approve
        </Button>
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => onReject(request.id)}
        >
          <X className="mr-2 h-4 w-4" />
          Reject
        </Button>
      </div>
    </div>
  );
}
