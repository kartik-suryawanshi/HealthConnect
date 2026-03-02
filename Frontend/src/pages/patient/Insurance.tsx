import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ShieldCheck, Plus, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import api from "@/services/api";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Insurance {
    _id: string;
    insuranceCompany: string;
    policyNumber: string;
    groupNumber?: string;
    validUpto: string;
    status: "Active" | "Inactive";
}

export default function InsurancePage() {
    const [insurances, setInsurances] = useState<Insurance[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [company, setCompany] = useState("");
    const [policyNumber, setPolicyNumber] = useState("");
    const [groupNumber, setGroupNumber] = useState("");
    const [validUpto, setValidUpto] = useState("");

    useEffect(() => {
        fetchInsurances();
    }, []);

    const fetchInsurances = async () => {
        try {
            setLoading(true);
            const response = await api.getMyInsurance();
            if (response.success && response.data) {
                setInsurances(response.data as Insurance[]);
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to fetch insurance details",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleAddInsurance = async () => {
        if (!company || !policyNumber || !validUpto) {
            toast({
                title: "Missing Information",
                description: "Please fill out all required fields.",
                variant: "destructive",
            });
            return;
        }

        try {
            setSubmitting(true);
            const response = await api.addInsurance({
                insuranceCompany: company,
                policyNumber,
                groupNumber,
                validUpto,
                status: "Active",
            });

            if (response.success) {
                toast({
                    title: "Insurance Added",
                    description: "Your insurance policy has been linked successfully.",
                });
                setDialogOpen(false);
                setCompany("");
                setPolicyNumber("");
                setGroupNumber("");
                setValidUpto("");
                fetchInsurances();
            }
        } catch (error: any) {
            toast({
                title: "Add Failed",
                description: error.message || "Failed to add insurance",
                variant: "destructive",
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <DashboardLayout
            userRole="patient"
            title="Insurance Details"
            subtitle="Manage your linked health insurance policies"
        >
            <div className="space-y-6">
                <div className="flex justify-between items-center bg-card p-6 border rounded-lg shadow-sm">
                    <div>
                        <h2 className="text-xl font-semibold flex items-center">
                            <ShieldCheck className="mr-2 h-6 w-6 text-primary" /> Active Coverages
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            Add your insurance details to authorize doctors to verify your coverage.
                            Only masked information is shared with doctors for emergency access, preventing data misuse.
                        </p>
                    </div>
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Insurance
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Link New Insurance</DialogTitle>
                                <DialogDescription>
                                    Enter your insurance policy details below.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 pt-4">
                                <div>
                                    <label className="text-sm font-medium">Provider Name</label>
                                    <Input
                                        placeholder="e.g. BlueCross, UnitedHealth"
                                        value={company}
                                        onChange={(e) => setCompany(e.target.value)}
                                        className="mt-1.5"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Policy Number</label>
                                    <Input
                                        placeholder="Policy number"
                                        value={policyNumber}
                                        onChange={(e) => setPolicyNumber(e.target.value)}
                                        className="mt-1.5"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Group Number (Optional)</label>
                                    <Input
                                        placeholder="Group number"
                                        value={groupNumber}
                                        onChange={(e) => setGroupNumber(e.target.value)}
                                        className="mt-1.5"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Valid Upto</label>
                                    <Input
                                        type="date"
                                        value={validUpto}
                                        onChange={(e) => setValidUpto(e.target.value)}
                                        className="mt-1.5"
                                    />
                                </div>
                                <DialogFooter className="mt-4">
                                    <DialogClose asChild>
                                        <Button variant="outline">Cancel</Button>
                                    </DialogClose>
                                    <Button onClick={handleAddInsurance} disabled={submitting}>
                                        {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                        Add Policy
                                    </Button>
                                </DialogFooter>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center min-h-[400px]">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="table-container">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Provider</TableHead>
                                    <TableHead>Policy Number</TableHead>
                                    <TableHead>Valid Upto</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {insurances.map((policy) => (
                                    <TableRow key={policy._id}>
                                        <TableCell className="font-medium text-primary">
                                            {policy.insuranceCompany}
                                        </TableCell>
                                        <TableCell>{policy.policyNumber}</TableCell>
                                        <TableCell>
                                            {format(new Date(policy.validUpto), "MMM d, yyyy")}
                                        </TableCell>
                                        <TableCell>
                                            <span
                                                className={cn(
                                                    "badge-status",
                                                    policy.status === "Active"
                                                        ? "bg-success/10 text-success"
                                                        : "bg-muted text-muted-foreground"
                                                )}
                                            >
                                                {policy.status}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        {insurances.length === 0 && (
                            <div className="text-center py-10 text-muted-foreground">
                                No insurance policies linked yet.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
