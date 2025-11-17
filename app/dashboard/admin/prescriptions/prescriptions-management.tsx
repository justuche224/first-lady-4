"use client";

import { useState, useTransition } from "react";
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
import { Pill, Filter, Eye } from "lucide-react";
import { getAllPrescriptionsForAdmin } from "@/actions/admin";
import Link from "next/link";

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
  doctorName: string | null;
  doctorSpecialty: string | null;
}

interface Doctor {
  id: number;
  name: string;
  specialty: string;
}

interface Patient {
  id: number;
  name: string;
  email: string;
}

interface PrescriptionsManagementProps {
  initialPrescriptions: Prescription[];
  doctors: Doctor[];
  patients: Patient[];
}

export default function PrescriptionsManagement({
  initialPrescriptions,
  doctors,
  patients,
}: PrescriptionsManagementProps) {
  const [prescriptions, setPrescriptions] =
    useState<Prescription[]>(initialPrescriptions);
  const [filters, setFilters] = useState<{
    dateFrom?: string;
    dateTo?: string;
    doctorId?: number;
    patientId?: number;
    isActive?: boolean;
  }>({});
  const [isPending, startTransition] = useTransition();

  const handleFilter = () => {
    startTransition(async () => {
      const result = await getAllPrescriptionsForAdmin({
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
        doctorId: filters.doctorId,
        patientId: filters.patientId,
        isActive: filters.isActive,
      });
      if (result.success) {
        setPrescriptions(result.data);
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
      const result = await getAllPrescriptionsForAdmin();
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
            Prescriptions
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            View all prescriptions across the system (read-only)
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Prescriptions</CardTitle>
          <CardDescription>
            View and filter all medication prescriptions in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 mb-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filters:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
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
                  value={filters.doctorId?.toString() || "all"}
                  onValueChange={(value) =>
                    setFilters({
                      ...filters,
                      doctorId: value === "all" ? undefined : parseInt(value),
                    })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Doctors" />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    <SelectItem value="all">All Doctors</SelectItem>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id.toString()}>
                        {doctor.name} ({doctor.specialty})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                      <SelectItem key={patient.id} value={patient.id.toString()}>
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
                  filters.doctorId ||
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
                    <TableHead className="min-w-[150px]">Doctor</TableHead>
                    <TableHead className="min-w-[150px]">Medication</TableHead>
                    <TableHead className="min-w-[100px] hidden md:table-cell">
                      Dosage
                    </TableHead>
                    <TableHead className="min-w-[100px] hidden lg:table-cell">
                      Frequency
                    </TableHead>
                    <TableHead className="min-w-[100px] hidden lg:table-cell">
                      Duration
                    </TableHead>
                    <TableHead className="min-w-[100px]">Status</TableHead>
                    <TableHead className="text-right min-w-[120px]">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prescriptions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
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
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {formatDate(prescription.prescribedDate)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {prescription.patientName}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {prescription.patientEmail}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {prescription.doctorName}
                            </span>
                            {prescription.doctorSpecialty && (
                              <span className="text-xs text-muted-foreground">
                                {prescription.doctorSpecialty}
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
                        <TableCell className="hidden lg:table-cell">
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
                          <Link
                            href={`/dashboard/admin/patients/${prescription.patientId}`}
                          >
                            <NormalButton
                              variant="outline"
                              size="sm"
                              className="w-full sm:w-auto"
                            >
                              <Eye className="h-4 w-4 sm:mr-2" />
                              <span className="hidden sm:inline">
                                View Patient
                              </span>
                            </NormalButton>
                          </Link>
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

