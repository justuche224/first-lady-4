"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { NormalButton } from "@/components/ui/button-normal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pill, Filter, Eye, Plus, CheckCircle2, XCircle } from "lucide-react";
import {
  getDoctorPrescriptions,
  togglePrescriptionStatus,
} from "@/actions/doctor";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Prescription {
  id: number;
  medicalRecordId: number;
  patientId: number;
  doctorId: number;
  medicationName: string | null;
  dosage: string | null;
  frequency: string | null;
  duration: string | null;
  instructions: string | null;
  prescribedDate: Date | string | null;
  isActive: boolean | null;
  createdAt: Date | string | null;
  updatedAt: Date | string | null;
  patientName: string | null;
  patientEmail: string | null;
}

interface Patient {
  id: number;
  name: string;
  email: string;
}

interface DoctorPrescriptionsManagementProps {
  initialPrescriptions: Prescription[];
  patients: Patient[];
}

export default function DoctorPrescriptionsManagement({
  initialPrescriptions,
  patients,
}: DoctorPrescriptionsManagementProps) {
  const router = useRouter();
  const [prescriptions, setPrescriptions] =
    useState<Prescription[]>(initialPrescriptions);
  const [filters, setFilters] = useState<{
    dateFrom?: string;
    dateTo?: string;
    patientId?: number;
    isActive?: boolean;
  }>({});
  const [isPending, startTransition] = useTransition();

  const handleFilter = () => {
    startTransition(async () => {
      const result = await getDoctorPrescriptions({
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
        patientId: filters.patientId,
        isActive: filters.isActive,
      });
      if (result.success) {
        setPrescriptions(result.data);
      }
    });
  };

  const handleStatusToggle = async (
    prescriptionId: number,
    currentStatus: boolean | null
  ) => {
    const newStatus = !currentStatus;
    startTransition(async () => {
      const result = await togglePrescriptionStatus(prescriptionId, newStatus);
      if (result.success) {
        toast.success(
          `Prescription ${newStatus ? "activated" : "deactivated"}`
        );
        router.refresh();
        // Refresh prescriptions list
        const refreshResult = await getDoctorPrescriptions(filters);
        if (refreshResult.success) {
          setPrescriptions(refreshResult.data);
        }
      } else {
        toast.error(result.error || "Failed to update prescription status");
      }
    });
  };

  const formatDate = (date: Date | string | null): string => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const clearFilters = () => {
    setFilters({});
    startTransition(async () => {
      const result = await getDoctorPrescriptions();
      if (result.success) {
        setPrescriptions(result.data);
      }
    });
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6 lg:p-8 container mx-auto max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            My Prescriptions
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            View and manage medications you have prescribed to patients
          </p>
        </div>
        <Link href="/dashboard/doctor/prescriptions/new">
          <NormalButton>
            <Plus className="h-4 w-4" />
            Prescribe Medication
          </NormalButton>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Prescriptions</CardTitle>
          <CardDescription>
            View all prescriptions you have created for patients
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 mb-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filters:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <Input
                  type="date"
                  placeholder="From Date"
                  value={filters.dateFrom || ""}
                  onChange={(e) =>
                    setFilters({ ...filters, dateFrom: e.target.value })
                  }
                  className="w-full"
                />
                <Input
                  type="date"
                  placeholder="To Date"
                  value={filters.dateTo || ""}
                  onChange={(e) =>
                    setFilters({ ...filters, dateTo: e.target.value })
                  }
                  className="w-full"
                />
                <Select
                  value={filters.patientId?.toString() || "all"}
                  onValueChange={(value) =>
                    setFilters({
                      ...filters,
                      patientId: value === "all" ? undefined : parseInt(value),
                    })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Patients" />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    <SelectItem value="all">All Patients</SelectItem>
                    {patients.map((patient) => (
                      <SelectItem
                        key={patient.id}
                        value={patient.id.toString()}
                      >
                        {patient.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={
                    filters.isActive === undefined
                      ? "all"
                      : filters.isActive
                      ? "active"
                      : "inactive"
                  }
                  onValueChange={(value) =>
                    setFilters({
                      ...filters,
                      isActive:
                        value === "all"
                          ? undefined
                          : value === "active"
                          ? true
                          : false,
                    })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-wrap gap-2">
                <NormalButton
                  onClick={handleFilter}
                  disabled={isPending}
                  className="w-full sm:w-auto"
                >
                  Apply Filters
                </NormalButton>
                {(filters.dateFrom ||
                  filters.dateTo ||
                  filters.patientId ||
                  filters.isActive !== undefined) && (
                  <NormalButton
                    variant="outline"
                    onClick={clearFilters}
                    disabled={isPending}
                    className="w-full sm:w-auto"
                  >
                    Clear
                  </NormalButton>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-md border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[140px]">
                      Prescribed Date
                    </TableHead>
                    <TableHead className="min-w-[150px]">Patient</TableHead>
                    <TableHead className="min-w-[200px]">Medication</TableHead>
                    <TableHead className="min-w-[100px] hidden md:table-cell">
                      Dosage
                    </TableHead>
                    <TableHead className="min-w-[120px] hidden lg:table-cell">
                      Frequency
                    </TableHead>
                    <TableHead className="min-w-[100px] hidden xl:table-cell">
                      Duration
                    </TableHead>
                    <TableHead className="min-w-[100px]">Status</TableHead>
                    <TableHead className="text-right min-w-[200px]">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prescriptions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <Pill className="h-8 w-8 text-muted-foreground" />
                          <p className="text-muted-foreground">
                            No prescriptions found
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    prescriptions.map((prescription) => (
                      <TableRow key={prescription.id}>
                        <TableCell>
                          {formatDate(prescription.prescribedDate)}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <Link
                              href={`/dashboard/doctor/patients/${prescription.patientId}`}
                              className="font-medium hover:underline"
                            >
                              {prescription.patientName || "—"}
                            </Link>
                            {prescription.patientEmail && (
                              <span className="text-sm text-muted-foreground">
                                {prescription.patientEmail}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {prescription.medicationName || "—"}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {prescription.dosage || "—"}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {prescription.frequency || "—"}
                        </TableCell>
                        <TableCell className="hidden xl:table-cell">
                          {prescription.duration || "—"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              prescription.isActive ? "default" : "secondary"
                            }
                          >
                            {prescription.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/dashboard/doctor/patients/${prescription.patientId}`}
                            >
                              <NormalButton variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </NormalButton>
                            </Link>
                            <NormalButton
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleStatusToggle(
                                  prescription.id,
                                  prescription.isActive
                                )
                              }
                              disabled={isPending}
                              title={
                                prescription.isActive
                                  ? "Deactivate Prescription"
                                  : "Activate Prescription"
                              }
                            >
                              {prescription.isActive ? (
                                <XCircle className="h-4 w-4 text-red-600" />
                              ) : (
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                              )}
                            </NormalButton>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
