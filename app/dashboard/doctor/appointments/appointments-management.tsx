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
import {
  Calendar,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  getDoctorAppointments,
  updateAppointmentStatus,
} from "@/actions/doctor";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Appointment {
  id: number;
  patientId: number;
  doctorId: number;
  appointmentDate: Date | string | null;
  appointmentTime: string | null;
  duration: number | null;
  type: string | null;
  status: string | null;
  reason: string | null;
  scheduledBy: string | null;
  cancelledBy: string | null;
  cancelReason: string | null;
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

interface DoctorAppointmentsManagementProps {
  initialAppointments: Appointment[];
  patients: Patient[];
}

export default function DoctorAppointmentsManagement({
  initialAppointments,
  patients,
}: DoctorAppointmentsManagementProps) {
  const router = useRouter();
  const [appointments, setAppointments] =
    useState<Appointment[]>(initialAppointments);
  const [filters, setFilters] = useState<{
    dateFrom?: string;
    dateTo?: string;
    patientId?: number;
    status?: string;
  }>({});
  const [isPending, startTransition] = useTransition();

  const handleFilter = () => {
    startTransition(async () => {
      const result = await getDoctorAppointments({
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
        patientId: filters.patientId,
        status: filters.status as
          | "scheduled"
          | "confirmed"
          | "completed"
          | "cancelled"
          | "no_show"
          | undefined,
      });
      if (result.success) {
        setAppointments(result.data);
      }
    });
  };

  const handleStatusUpdate = async (
    appointmentId: number,
    status: "completed" | "cancelled" | "no_show" | "confirmed"
  ) => {
    startTransition(async () => {
      const result = await updateAppointmentStatus(appointmentId, status);
      if (result.success) {
        toast.success(`Appointment marked as ${status}`);
        router.refresh();
        // Refresh appointments list
        const refreshResult = await getDoctorAppointments(filters);
        if (refreshResult.success) {
          setAppointments(refreshResult.data);
        }
      } else {
        toast.error(result.error || "Failed to update appointment status");
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

  const formatDateTime = (date: Date | string | null, time: string | null): string => {
    if (!date) return "—";
    const dateStr = formatDate(date);
    return time ? `${dateStr} at ${time}` : dateStr;
  };

  const clearFilters = () => {
    setFilters({});
    startTransition(async () => {
      const result = await getDoctorAppointments();
      if (result.success) {
        setAppointments(result.data);
      }
    });
  };

  const getStatusBadgeVariant = (status: string | null) => {
    switch (status) {
      case "completed":
        return "default";
      case "cancelled":
        return "destructive";
      case "no_show":
        return "destructive";
      case "confirmed":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6 lg:p-8 container mx-auto max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            My Appointments
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            View and manage your appointment schedule
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Appointment Schedule</CardTitle>
          <CardDescription>
            View and manage your patient appointments
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
                  value={filters.status || "all"}
                  onValueChange={(value) =>
                    setFilters({
                      ...filters,
                      status: value === "all" ? undefined : value,
                    })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="no_show">No Show</SelectItem>
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
                  filters.status) && (
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
                    <TableHead className="min-w-[140px]">Date & Time</TableHead>
                    <TableHead className="min-w-[150px]">Patient</TableHead>
                    <TableHead className="min-w-[100px] hidden md:table-cell">
                      Type
                    </TableHead>
                    <TableHead className="min-w-[80px] hidden lg:table-cell">
                      Duration
                    </TableHead>
                    <TableHead className="min-w-[100px]">Status</TableHead>
                    <TableHead className="min-w-[150px] hidden xl:table-cell">
                      Reason
                    </TableHead>
                    <TableHead className="text-right min-w-[200px]">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <Calendar className="h-8 w-8 text-muted-foreground" />
                          <p className="text-muted-foreground">
                            No appointments found
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    appointments.map((appointment) => (
                      <TableRow key={appointment.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {formatDate(appointment.appointmentDate)}
                            </span>
                            {appointment.appointmentTime && (
                              <span className="text-sm text-muted-foreground">
                                {appointment.appointmentTime}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <Link
                              href={`/dashboard/doctor/patients/${appointment.patientId}`}
                              className="font-medium hover:underline"
                            >
                              {appointment.patientName || "—"}
                            </Link>
                            {appointment.patientEmail && (
                              <span className="text-sm text-muted-foreground">
                                {appointment.patientEmail}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {appointment.type || "—"}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {appointment.duration ? `${appointment.duration} min` : "—"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(appointment.status)}>
                            {appointment.status || "—"}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden xl:table-cell">
                          {appointment.reason || "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/dashboard/doctor/patients/${appointment.patientId}`}
                            >
                              <NormalButton variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </NormalButton>
                            </Link>
                            {appointment.status === "scheduled" ||
                            appointment.status === "confirmed" ? (
                              <div className="flex gap-1">
                                <NormalButton
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleStatusUpdate(
                                      appointment.id,
                                      "completed"
                                    )
                                  }
                                  disabled={isPending}
                                  title="Mark as Completed"
                                >
                                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                                </NormalButton>
                                <NormalButton
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleStatusUpdate(
                                      appointment.id,
                                      "no_show"
                                    )
                                  }
                                  disabled={isPending}
                                  title="Mark as No Show"
                                >
                                  <XCircle className="h-4 w-4 text-red-600" />
                                </NormalButton>
                              </div>
                            ) : null}
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

