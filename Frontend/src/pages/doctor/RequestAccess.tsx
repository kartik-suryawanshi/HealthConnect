import { useState, useEffect } from "react";
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
import { Send, Clock, CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import api from "@/services/api";
import { formatDistanceToNow } from "date-fns";

interface AccessRequest {
  _id: string;
  patient: {
    name: string;
    email: string;
  };
  reason: string;
  duration: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

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
  expired: {
    icon: AlertCircle,
    label: "Expired",
    className: "badge-muted",
  },
};

export default function RequestAccess() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    patientId: "",
    reason: "",
    duration: "",
    conditions: "none",
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await api.getAccessRequests();
      if (response.success && response.data) {
        setRequests(response.data as AccessRequest[]);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch access requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.patientId || !formData.reason || !formData.duration) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      const response = await api.createAccessRequest({
        patientId: formData.patientId,
        reason: formData.reason,
        duration: formData.duration,
        conditions: formData.conditions,
      });

      if (response.success) {
        toast({
          title: "Request Submitted",
          description: "Your access request has been sent to the patient.",
        });
        setFormData({ patientId: "", reason: "", duration: "", conditions: "none" });
        fetchRequests();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit request",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout
        userRole="doctor"
        title="Request Patient Access"
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
      title="Request Patient Access"
      subtitle="Submit requests to access patient health records"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Request Form */}
        <div className="stat-card">
          <h3 className="section-title">New Access Request</h3>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="patientId">Patient ID</Label>
              <Input
                id="patientId"
                placeholder="Enter patient ID (e.g., P-12345)"
                value={formData.patientId}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, patientId: e.target.value.toUpperCase() }))
                }
                disabled={submitting}
                className="uppercase"
              />
              <p className="text-xs text-muted-foreground">
                Enter the patient's unique ID (format: P-XXXXX). The patient will receive a notification to approve or deny your request.
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
                disabled={submitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Requested Duration</Label>
              <Select
                value={formData.duration}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, duration: value }))
                }
                disabled={submitting}
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

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit Request
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Pending Requests */}
        <div className="stat-card">
          <h3 className="section-title">Your Requests</h3>
          <div className="space-y-4">
            {requests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">No requests yet</p>
                <p className="text-xs mt-1">Submit your first request to get started</p>
              </div>
            ) : (
              requests.map((request, index) => {
                const status = statusConfig[request.status] || {
                  icon: AlertCircle,
                  label: request.status.charAt(0).toUpperCase() + request.status.slice(1),
                  className: "badge-muted"
                };
                const StatusIcon = status.icon;
                return (
                  <div
                    key={request._id}
                    className="rounded-lg border border-border bg-card p-4 animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <span className="text-sm font-medium text-primary">
                            {request.patient.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {request.patient.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {request.patient.email}
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
                      <span>Submitted {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
