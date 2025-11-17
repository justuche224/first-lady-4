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
import { FileText, Filter, Eye, Plus } from "lucide-react";
import { getDoctorMedicalRecords } from "@/actions/doctor";

interface MedicalRecord {
  id: number;
  appointmentId: number;
  patientId: number;
  doctorId: number;
  visitDate: Date | string | null;
  symptoms: string | null;
  diagnosis: string | null;
  notes: string | null;
  followUpRequired: boolean | null;
  followUpDate: Date | string | null;
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

interface DoctorMedicalRecordsManagementProps {
  initialRecords: MedicalRecord[];
  patients: Patient[];
}

export default function DoctorMedicalRecordsManagement({
  initialRecords,
  patients,
}: DoctorMedicalRecordsManagementProps) {
  const [records, setRecords] = useState<MedicalRecord[]>(initialRecords);
  const [filters, setFilters] = useState<{
    dateFrom?: string;
    dateTo?: string;
    patientId?: number;
  }>({});
  const [isPending, startTransition] = useTransition();

  const handleFilter = () => {
    startTransition(async () => {
      const result = await getDoctorMedicalRecords({
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
        patientId: filters.patientId,
      });
      if (result.success) {
        setRecords(result.data);
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

  const formatDateTime = (date: Date | string | null): string => {
    if (!date) return "—";
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const clearFilters = () => {
    setFilters({});
    startTransition(async () => {
      const result = await getDoctorMedicalRecords();
      if (result.success) {
        setRecords(result.data);
      }
    });
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6 lg:p-8 container mx-auto max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Medical Records
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            View and manage patient medical records you have created
          </p>
        </div>
        <Link href="/dashboard/doctor/medical-records/new">
          <NormalButton>
            <Plus className="h-4 w-4" />
            Create Medical Record
          </NormalButton>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Medical Records</CardTitle>
          <CardDescription>
            View all medical records you have created for patients
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 mb-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filters:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
              </div>
              <div className="flex flex-wrap gap-2">
                <NormalButton
                  onClick={handleFilter}
                  disabled={isPending}
                  className="w-full sm:w-auto"
                >
                  Apply Filters
                </NormalButton>
                {(filters.dateFrom || filters.dateTo || filters.patientId) && (
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
                    <TableHead className="min-w-[140px]">Visit Date</TableHead>
                    <TableHead className="min-w-[150px]">Patient</TableHead>
                    <TableHead className="min-w-[200px] hidden md:table-cell">
                      Symptoms
                    </TableHead>
                    <TableHead className="min-w-[200px] hidden lg:table-cell">
                      Diagnosis
                    </TableHead>
                    <TableHead className="min-w-[100px]">Follow-up</TableHead>
                    <TableHead className="text-right min-w-[120px]">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <FileText className="h-8 w-8 text-muted-foreground" />
                          <p className="text-muted-foreground">
                            No medical records found
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    records.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {formatDate(record.visitDate)}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {formatDateTime(record.visitDate)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <Link
                              href={`/dashboard/doctor/patients/${record.patientId}`}
                              className="font-medium hover:underline"
                            >
                              {record.patientName || "—"}
                            </Link>
                            {record.patientEmail && (
                              <span className="text-sm text-muted-foreground">
                                {record.patientEmail}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="max-w-[200px] truncate">
                            {record.symptoms || "—"}
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="max-w-[200px] truncate">
                            {record.diagnosis || "—"}
                          </div>
                        </TableCell>
                        <TableCell>
                          {record.followUpRequired ? (
                            <div className="flex flex-col">
                              <Badge variant="outline">Required</Badge>
                              {record.followUpDate && (
                                <span className="text-xs text-muted-foreground mt-1">
                                  {formatDate(record.followUpDate)}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Link
                            href={`/dashboard/doctor/patients/${record.patientId}`}
                          >
                            <NormalButton variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
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
