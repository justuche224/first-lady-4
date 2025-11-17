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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Plus, Edit, X, Filter } from "lucide-react";
import {
  getAllAppointments,
  createAppointment,
  updateAppointment,
  cancelAppointment,
  type CreateAppointmentData,
  type UpdateAppointmentData,
  type CancelAppointmentData,
} from "@/actions/receptionist";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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

interface AppointmentsManagementProps {
  initialAppointments: Appointment[];
  doctors: Doctor[];
  patients: Patient[];
}

export default function AppointmentsManagement({
  initialAppointments,
  doctors,
  patients,
}: AppointmentsManagementProps) {
  const [appointments, setAppointments] =
    useState<Appointment[]>(initialAppointments);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [filters, setFilters] = useState<{
    dateFrom?: string;
    dateTo?: string;
    doctorId?: number;
    patientId?: number;
    status?: string;
  }>({});
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleFilter = () => {
    startTransition(async () => {
      const result = await getAllAppointments({
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
        doctorId: filters.doctorId,
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

  const handleCreateAppointment = async (data: CreateAppointmentData) => {
    startTransition(async () => {
      const result = await createAppointment(data);
      if (result.success) {
        toast.success("Appointment scheduled successfully");
        setIsCreateOpen(false);
        router.refresh();
        const updatedResult = await getAllAppointments({
          ...filters,
          status: filters.status as
            | "scheduled"
            | "confirmed"
            | "completed"
            | "cancelled"
            | "no_show"
            | undefined,
        });
        if (updatedResult.success) {
          setAppointments(updatedResult.data);
        }
      } else {
        toast.error(result.error || "Failed to schedule appointment");
      }
    });
  };

  const handleUpdateAppointment = async (data: UpdateAppointmentData) => {
    startTransition(async () => {
      const result = await updateAppointment(data);
      if (result.success) {
        toast.success("Appointment updated successfully");
        router.refresh();
        const updatedResult = await getAllAppointments({
          ...filters,
          status: filters.status as
            | "scheduled"
            | "confirmed"
            | "completed"
            | "cancelled"
            | "no_show"
            | undefined,
        });
        if (updatedResult.success) {
          setAppointments(updatedResult.data);
        }
      } else {
        toast.error(result.error || "Failed to update appointment");
      }
    });
  };

  const handleCancelAppointment = async (data: CancelAppointmentData) => {
    startTransition(async () => {
      const result = await cancelAppointment(data);
      if (result.success) {
        toast.success("Appointment cancelled successfully");
        router.refresh();
        const updatedResult = await getAllAppointments({
          ...filters,
          status: filters.status as
            | "scheduled"
            | "confirmed"
            | "completed"
            | "cancelled"
            | "no_show"
            | undefined,
        });
        if (updatedResult.success) {
          setAppointments(updatedResult.data);
        }
      } else {
        toast.error(result.error || "Failed to cancel appointment");
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
      const result = await getAllAppointments();
      if (result.success) {
        setAppointments(result.data);
      }
    });
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6 lg:p-8 container mx-auto max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Appointments
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Schedule and manage patient appointments
          </p>
        </div>
        <div className="w-full sm:w-auto">
          <CreateAppointmentDialog
            doctors={doctors}
            patients={patients}
            open={isCreateOpen}
            onOpenChange={setIsCreateOpen}
            onCreate={handleCreateAppointment}
            isPending={isPending}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Appointment List</CardTitle>
          <CardDescription>
            View and manage all scheduled appointments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 mb-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filters:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
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
                  filters.doctorId ||
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
                    <TableHead className="min-w-[150px]">Doctor</TableHead>
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
                    <TableHead className="text-right min-w-[140px]">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
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
                            <span className="text-sm text-muted-foreground">
                              {appointment.appointmentTime}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {appointment.patientName}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {appointment.patientEmail}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {appointment.doctorName}
                            </span>
                            {appointment.doctorSpecialty && (
                              <span className="text-xs text-muted-foreground">
                                {appointment.doctorSpecialty}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {appointment.type || "—"}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {appointment.duration
                            ? `${appointment.duration} min`
                            : "—"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              appointment.status === "completed"
                                ? "default"
                                : appointment.status === "cancelled"
                                ? "destructive"
                                : appointment.status === "confirmed"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {appointment.status || "—"}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden xl:table-cell max-w-xs truncate">
                          {appointment.reason || "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2 flex-wrap">
                            {appointment.status !== "cancelled" &&
                              appointment.status !== "completed" && (
                                <>
                                  <EditAppointmentDialog
                                    appointment={appointment}
                                    onUpdate={handleUpdateAppointment}
                                    isPending={isPending}
                                  />
                                  <CancelAppointmentDialog
                                    appointment={appointment}
                                    onCancel={handleCancelAppointment}
                                    isPending={isPending}
                                  />
                                </>
                              )}
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

function CreateAppointmentDialog({
  doctors,
  patients,
  open,
  onOpenChange,
  onCreate,
  isPending,
}: {
  doctors: Doctor[];
  patients: Patient[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (data: CreateAppointmentData) => void;
  isPending: boolean;
}) {
  const [formData, setFormData] = useState<CreateAppointmentData>({
    patientId: 0,
    doctorId: 0,
    appointmentDate: "",
    appointmentTime: "",
    duration: 30,
    type: "",
    reason: null,
    status: "scheduled",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.patientId ||
      !formData.doctorId ||
      !formData.appointmentDate ||
      !formData.appointmentTime ||
      !formData.type
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    onCreate(formData);
    setFormData({
      patientId: 0,
      doctorId: 0,
      appointmentDate: "",
      appointmentTime: "",
      duration: 30,
      type: "",
      reason: null,
      status: "scheduled",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <NormalButton>
          <Plus className="h-4 w-4" />
          Schedule Appointment
        </NormalButton>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Schedule New Appointment</DialogTitle>
          <DialogDescription>
            Create a new appointment for a patient with a doctor
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="patient">
                Patient <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.patientId.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, patientId: parseInt(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select patient" />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id.toString()}>
                      {patient.name} ({patient.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="doctor">
                Doctor <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.doctorId.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, doctorId: parseInt(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select doctor" />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id.toString()}>
                      {doctor.name} ({doctor.specialty})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="appointmentDate">
                Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="appointmentDate"
                type="date"
                value={formData.appointmentDate}
                onChange={(e) =>
                  setFormData({ ...formData, appointmentDate: e.target.value })
                }
                required
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="appointmentTime">
                Time <span className="text-destructive">*</span>
              </Label>
              <Input
                id="appointmentTime"
                type="time"
                value={formData.appointmentTime}
                onChange={(e) =>
                  setFormData({ ...formData, appointmentTime: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">
                Type <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  <SelectItem value="consultation">Consultation</SelectItem>
                  <SelectItem value="follow-up">Follow-up</SelectItem>
                  <SelectItem value="checkup">Checkup</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                min="15"
                step="15"
                value={formData.duration || 30}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    duration: parseInt(e.target.value) || 30,
                  })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: "scheduled" | "confirmed") =>
                setFormData({ ...formData, status: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background">
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Visit</Label>
            <Textarea
              id="reason"
              value={formData.reason || ""}
              onChange={(e) =>
                setFormData({ ...formData, reason: e.target.value || null })
              }
              rows={3}
              placeholder="Enter reason for visit..."
            />
          </div>

          <DialogFooter>
            <NormalButton
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </NormalButton>
            <NormalButton type="submit" disabled={isPending}>
              {isPending ? "Scheduling..." : "Schedule Appointment"}
            </NormalButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditAppointmentDialog({
  appointment,
  onUpdate,
  isPending,
}: {
  appointment: Appointment;
  onUpdate: (data: UpdateAppointmentData) => void;
  isPending: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<UpdateAppointmentData>({
    id: appointment.id,
    appointmentDate:
      appointment.appointmentDate instanceof Date
        ? appointment.appointmentDate.toISOString().split("T")[0]
        : appointment.appointmentDate
        ? new Date(appointment.appointmentDate).toISOString().split("T")[0]
        : "",
    appointmentTime: appointment.appointmentTime || "",
    duration: appointment.duration || 30,
    type: appointment.type || "",
    reason: appointment.reason,
    status: appointment.status as
      | "scheduled"
      | "confirmed"
      | "completed"
      | "cancelled"
      | "no_show"
      | undefined,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.appointmentDate ||
      !formData.appointmentTime ||
      !formData.type
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    onUpdate(formData);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <NormalButton variant="outline" size="sm" className="w-full sm:w-auto">
          <Edit className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Edit</span>
        </NormalButton>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Appointment</DialogTitle>
          <DialogDescription>
            Update appointment details and information
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-date">
                Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-date"
                type="date"
                value={formData.appointmentDate || ""}
                onChange={(e) =>
                  setFormData({ ...formData, appointmentDate: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-time">
                Time <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-time"
                type="time"
                value={formData.appointmentTime || ""}
                onChange={(e) =>
                  setFormData({ ...formData, appointmentTime: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-type">
                Type <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.type || ""}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  <SelectItem value="consultation">Consultation</SelectItem>
                  <SelectItem value="follow-up">Follow-up</SelectItem>
                  <SelectItem value="checkup">Checkup</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-duration">Duration (minutes)</Label>
              <Input
                id="edit-duration"
                type="number"
                min="15"
                step="15"
                value={formData.duration || 30}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    duration: parseInt(e.target.value) || 30,
                  })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-status">Status</Label>
            <Select
              value={formData.status || ""}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  status: value as
                    | "scheduled"
                    | "confirmed"
                    | "completed"
                    | "cancelled"
                    | "no_show"
                    | undefined,
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background">
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="no_show">No Show</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-reason">Reason for Visit</Label>
            <Textarea
              id="edit-reason"
              value={formData.reason || ""}
              onChange={(e) =>
                setFormData({ ...formData, reason: e.target.value || null })
              }
              rows={3}
            />
          </div>

          <DialogFooter>
            <NormalButton
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </NormalButton>
            <NormalButton type="submit" disabled={isPending}>
              {isPending ? "Updating..." : "Update Appointment"}
            </NormalButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CancelAppointmentDialog({
  appointment,
  onCancel,
  isPending,
}: {
  appointment: Appointment;
  onCancel: (data: CancelAppointmentData) => void;
  isPending: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const handleCancel = () => {
    if (!cancelReason.trim()) {
      toast.error("Please provide a cancellation reason");
      return;
    }

    onCancel({
      id: appointment.id,
      cancelReason: cancelReason.trim(),
    });
    setCancelReason("");
    setOpen(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <NormalButton variant="outline" size="sm" className="w-full sm:w-auto">
          <X className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Cancel</span>
        </NormalButton>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel Appointment</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to cancel this appointment? This action cannot
            be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="cancel-reason">
              Cancellation Reason <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="cancel-reason"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
              placeholder="Enter reason for cancellation..."
              required
            />
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleCancel}
            disabled={isPending || !cancelReason.trim()}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? "Cancelling..." : "Cancel Appointment"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
