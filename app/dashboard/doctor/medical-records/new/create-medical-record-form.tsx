"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NormalButton } from "@/components/ui/button-normal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Save } from "lucide-react";
import {
  createMedicalRecord,
  type CreateMedicalRecordData,
} from "@/actions/doctor";
import { toast } from "sonner";

interface Appointment {
  id: number;
  patientId: number;
  appointmentDate: Date | string | null;
  appointmentTime: string | null;
  type: string | null;
  reason: string | null;
  status: string | null;
  patientName: string | null;
  patientEmail: string | null;
}

interface CreateMedicalRecordFormProps {
  appointments: Appointment[];
}

export default function CreateMedicalRecordForm({
  appointments,
}: CreateMedicalRecordFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState<CreateMedicalRecordData>({
    appointmentId: 0,
    symptoms: "",
    diagnosis: "",
    notes: "",
    followUpRequired: false,
    followUpDate: "",
  });

  const selectedAppointment = appointments.find(
    (apt) => apt.id === formData.appointmentId
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.appointmentId) {
      toast.error("Please select an appointment");
      return;
    }

    startTransition(async () => {
      const result = await createMedicalRecord({
        appointmentId: formData.appointmentId,
        symptoms: formData.symptoms || null,
        diagnosis: formData.diagnosis || null,
        notes: formData.notes || null,
        followUpRequired: formData.followUpRequired || false,
        followUpDate: formData.followUpDate || null,
      });

      if (result.success) {
        toast.success("Medical record created successfully");
        router.push("/dashboard/doctor/medical-records");
      } else {
        toast.error(result.error || "Failed to create medical record");
      }
    });
  };

  const formatDate = (date: Date | string | null): string => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6 lg:p-8 container mx-auto max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/doctor/medical-records">
          <NormalButton variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4" />
            Back to Medical Records
          </NormalButton>
        </Link>
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Create Medical Record
          </h1>
          <p className="text-muted-foreground">
            Create a new medical record for a completed appointment
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Medical Record Information</CardTitle>
          <CardDescription>
            Enter visit details and medical information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="appointmentId">
                  Select Appointment *
                </FieldLabel>
                <FieldDescription>
                  Choose a completed appointment to create a medical record for
                </FieldDescription>
                <Select
                  value={formData.appointmentId?.toString() || ""}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      appointmentId: parseInt(value),
                    })
                  }
                  required
                >
                  <SelectTrigger id="appointmentId">
                    <SelectValue placeholder="Select an appointment" />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    {appointments.length === 0 ? (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">
                        No completed appointments available
                      </div>
                    ) : (
                      appointments.map((appointment) => (
                        <SelectItem
                          key={appointment.id}
                          value={appointment.id.toString()}
                        >
                          {formatDate(appointment.appointmentDate)} -{" "}
                          {appointment.patientName} ({appointment.type})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </Field>

              {selectedAppointment && (
                <Card className="bg-muted/50">
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-muted-foreground">
                          Patient
                        </p>
                        <p className="mt-1">
                          {selectedAppointment.patientName}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-muted-foreground">
                          Appointment Date
                        </p>
                        <p className="mt-1">
                          {formatDate(selectedAppointment.appointmentDate)}
                          {selectedAppointment.appointmentTime &&
                            ` at ${selectedAppointment.appointmentTime}`}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-muted-foreground">
                          Type
                        </p>
                        <p className="mt-1">
                          {selectedAppointment.type || "—"}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-muted-foreground">
                          Reason
                        </p>
                        <p className="mt-1">
                          {selectedAppointment.reason || "—"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Field>
                <FieldLabel htmlFor="symptoms">Symptoms</FieldLabel>
                <FieldDescription>
                  Symptoms reported by the patient during the visit
                </FieldDescription>
                <Textarea
                  id="symptoms"
                  placeholder="Enter patient symptoms..."
                  value={formData.symptoms || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, symptoms: e.target.value })
                  }
                  disabled={isPending}
                  rows={4}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="diagnosis">Diagnosis</FieldLabel>
                <FieldDescription>
                  Medical diagnosis based on examination and symptoms
                </FieldDescription>
                <Textarea
                  id="diagnosis"
                  placeholder="Enter diagnosis..."
                  value={formData.diagnosis || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, diagnosis: e.target.value })
                  }
                  disabled={isPending}
                  rows={4}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="notes">Doctor&apos;s Notes</FieldLabel>
                <FieldDescription>
                  Additional observations and notes from the visit
                </FieldDescription>
                <Textarea
                  id="notes"
                  placeholder="Enter additional notes..."
                  value={formData.notes || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  disabled={isPending}
                  rows={4}
                />
              </Field>

              <Field>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="followUpRequired"
                    checked={formData.followUpRequired || false}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        followUpRequired: checked === true,
                      })
                    }
                    disabled={isPending}
                  />
                  <FieldLabel
                    htmlFor="followUpRequired"
                    className="cursor-pointer"
                  >
                    Follow-up Required
                  </FieldLabel>
                </div>
                <FieldDescription>
                  Check if the patient needs a follow-up appointment
                </FieldDescription>
              </Field>

              {formData.followUpRequired && (
                <Field>
                  <FieldLabel htmlFor="followUpDate">Follow-up Date</FieldLabel>
                  <FieldDescription>
                    Recommended date for the follow-up appointment
                  </FieldDescription>
                  <Input
                    id="followUpDate"
                    type="date"
                    value={formData.followUpDate || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, followUpDate: e.target.value })
                    }
                    disabled={isPending}
                  />
                </Field>
              )}

              <div className="flex gap-4 pt-4">
                <NormalButton type="submit" disabled={isPending}>
                  <Save className="h-4 w-4" />
                  Create Medical Record
                </NormalButton>
                <Link href="/dashboard/doctor/medical-records">
                  <NormalButton
                    type="button"
                    variant="outline"
                    disabled={isPending}
                  >
                    Cancel
                  </NormalButton>
                </Link>
              </div>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
