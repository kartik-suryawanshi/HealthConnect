import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Send, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface PendingRequest {
  id: string;
  patientName: string;
  patientId: string;
  reason: string;
  duration: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
}

const initialRequests: PendingRequest[] = [
  {
    id: "1",
    patientName: "Jane Doe",
    patientId: "P-67890",
    reason: "Follow-up consultation for diabetes management",
    duration: "30 days",
    status: "pending",
    submittedAt: "2 days ago",
  },
  {
    id: "2",
    patientName: "Michael Brown",
    patientId: "P-11223",
    reason: "Pre-operative assessment review",
    duration: "14 days",
    status: "pending",
    submittedAt: "3 days ago",
  },
  {
    id: "3",
    patientName: "Emily Carter",
    patientId: "P-44556",
    reason: "Review of recent lab results",
    duration: "7 days",
    status: "approved",
    submittedAt: "5 days ago",
  },
];

const statusConfig = {
  pending: {
    icon: Clock,
    label: "Pending",
    className: "badge-pending",
  },
  approved: {
    icon: CheckCircle,
    label: "Approved",
    className: "badge-active",
  },
  rejected: {
    icon: XCircle,
    label: "Rejected",
    className: "badge-revoked",
  },
};

export default function RequestAccess() {
  const [requests, setRequests] = useState(initialRequests);
  const [formData, setFormData] = useState({
    patientId: "",
    reason: "",
    duration: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.patientId || !formData.reason || !formData.duration) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const newRequest: PendingRequest = {
      id: Date.now().toString(),
      patientName: "New Patient",
      patientId: formData.patientId,
      reason: formData.reason,
      duration: formData.duration,
      status: "pending",
      submittedAt: "Just now",
    };

    setRequests((prev) => [newRequest, ...prev]);
    setFormData({ patientId: "", reason: "", duration: "" });

    toast({
      title: "Request Submitted",
      description: "Your access request has been sent to the patient.",
    });
  };

  return (
    <DashboardLayout
      userRole="doctor"
      title="Request Patient Access"
      subtitle="Submit requests to access patient health records"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Request Form */}
        <div className="stat-card">
          <h3 className="section-title">New Access Request</h3>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="patientId">Patient ID or Email</Label>
              <Input
                id="patientId"
                placeholder="Enter patient ID (e.g., P-12345) or email"
                value={formData.patientId}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, patientId: e.target.value }))
                }
              />
              <p className="text-xs text-muted-foreground">
                The patient will receive a notification to approve or deny your
                request.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Access</Label>
              <Textarea
                id="reason"
                placeholder="Explain why you need access to this patient's records..."
                rows={4}
                value={formData.reason}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, reason: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Requested Duration</Label>
              <Select
                value={formData.duration}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, duration: value }))
                }
              >
                <SelectTrigger id="duration">
                  <SelectValue placeholder="Select access duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7 days">7 days</SelectItem>
                  <SelectItem value="14 days">14 days</SelectItem>
                  <SelectItem value="30 days">30 days</SelectItem>
                  <SelectItem value="90 days">90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-lg bg-muted/50 p-4">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 shrink-0 text-muted-foreground" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">Patient Consent Required</p>
                  <p className="mt-1">
                    Access will only be granted after the patient approves your
                    request. They can choose to grant full or limited access.
                  </p>
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full">
              <Send className="mr-2 h-4 w-4" />
              Submit Request
            </Button>
          </form>
        </div>

        {/* Pending Requests */}
        <div className="stat-card">
          <h3 className="section-title">Your Requests</h3>
          <div className="space-y-4">
            {requests.map((request, index) => {
              const status = statusConfig[request.status];
              const StatusIcon = status.icon;
              return (
                <div
                  key={request.id}
                  className="rounded-lg border border-border bg-card p-4 animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <span className="text-sm font-medium text-primary">
                          {request.patientName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {request.patientName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {request.patientId}
                        </p>
                      </div>
                    </div>
                    <span className={cn("badge-status", status.className)}>
                      <StatusIcon className="mr-1 h-3 w-3" />
                      {status.label}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                    {request.reason}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Duration: {request.duration}</span>
                    <span>Submitted {request.submittedAt}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
