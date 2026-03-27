import { useState } from "react";
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
import { Send, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import api from "@/services/api";

interface RequestAccessFormProps {
  onSuccess?: () => void;
}

export function RequestAccessForm({ onSuccess }: RequestAccessFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    patientId: "",
    reason: "",
    duration: "",
    conditions: "none",
  });

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
        if (onSuccess) onSuccess();
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="patientId">Patient ID</Label>
        <Input
          id="patientId"
          placeholder="e.g., P-12345"
          value={formData.patientId}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, patientId: e.target.value.toUpperCase() }))
          }
          disabled={submitting}
          className="uppercase"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="reason">Reason for Access</Label>
        <Textarea
          id="reason"
          placeholder="Explain why you need access..."
          rows={2}
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
            <SelectValue placeholder="Select duration" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7 days">7 days</SelectItem>
            <SelectItem value="14 days">14 days</SelectItem>
            <SelectItem value="30 days">30 days</SelectItem>
            <SelectItem value="90 days">90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg bg-muted/50 p-3 text-sm">
        <div className="flex gap-2 text-muted-foreground">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <p>Access requires patient consent.</p>
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
  );
}
