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
import { ArrowLeft, Save } from "lucide-react";
import {
  createPrescription,
  type CreatePrescriptionData,
} from "@/actions/doctor";
import { toast } from "sonner";

interface MedicalRecord {
  id: number;
  appointmentId: number;
  patientId: number;
  visitDate: Date | string | null;
  diagnosis: string | null;
  patientName: string | null;
  patientEmail: string | null;
}

interface CreatePrescriptionFormProps {
  medicalRecords: MedicalRecord[];
}

export default function CreatePrescriptionForm({
  medicalRecords,
}: CreatePrescriptionFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState<CreatePrescriptionData>({
    medicalRecordId: 0,
    medicationName: "",
    dosage: "",
    frequency: "",
    duration: "",
    instructions: "",
  });

  const selectedMedicalRecord = medicalRecords.find(
    (record) => record.id === formData.medicalRecordId
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.medicalRecordId) {
      toast.error("Please select a medical record");
      return;
    }

    if (
      !formData.medicationName ||
      !formData.dosage ||
      !formData.frequency ||
      !formData.duration
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    startTransition(async () => {
      const result = await createPrescription({
        medicalRecordId: formData.medicalRecordId,
        medicationName: formData.medicationName,
        dosage: formData.dosage,
        frequency: formData.frequency,
        duration: formData.duration,
        instructions: formData.instructions || null,
      });

      if (result.success) {
        toast.success("Prescription created successfully");
        router.push("/dashboard/doctor/prescriptions");
      } else {
        toast.error(result.error || "Failed to create prescription");
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

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6 lg:p-8 container mx-auto max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/doctor/prescriptions">
          <NormalButton variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4" />
            Back to Prescriptions
          </NormalButton>
        </Link>
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Prescribe Medication
          </h1>
          <p className="text-muted-foreground">
            Create a new prescription linked to a medical record
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Prescription Information</CardTitle>
          <CardDescription>
            Enter medication details and prescription information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="medicalRecordId">
                  Select Medical Record *
                </FieldLabel>
                <FieldDescription>
                  Choose a medical record to link this prescription to
                </FieldDescription>
                <Select
                  value={formData.medicalRecordId?.toString() || ""}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      medicalRecordId: parseInt(value),
                    })
                  }
                  required
                >
                  <SelectTrigger id="medicalRecordId">
                    <SelectValue placeholder="Select a medical record" />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    {medicalRecords.length === 0 ? (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">
                        No medical records available
                      </div>
                    ) : (
                      medicalRecords.map((record) => (
                        <SelectItem
                          key={record.id}
                          value={record.id.toString()}
                        >
                          {formatDate(record.visitDate)} - {record.patientName}
                          {record.diagnosis && ` (${record.diagnosis})`}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </Field>

              {selectedMedicalRecord && (
                <Card className="bg-muted/50">
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-muted-foreground">
                          Patient
                        </p>
                        <p className="mt-1">
                          {selectedMedicalRecord.patientName}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-muted-foreground">
                          Visit Date
                        </p>
                        <p className="mt-1">
                          {formatDateTime(selectedMedicalRecord.visitDate)}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="font-medium text-muted-foreground">
                          Diagnosis
                        </p>
                        <p className="mt-1">
                          {selectedMedicalRecord.diagnosis || "—"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Field>
                <FieldLabel htmlFor="medicationName">
                  Medication Name *
                </FieldLabel>
                <FieldDescription>
                  Name of the medication to be prescribed
                </FieldDescription>
                <Input
                  id="medicationName"
                  placeholder="e.g., Amoxicillin, Paracetamol"
                  value={formData.medicationName}
                  onChange={(e) =>
                    setFormData({ ...formData, medicationName: e.target.value })
                  }
                  disabled={isPending}
                  required
                />
              </Field>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field>
                  <FieldLabel htmlFor="dosage">Dosage *</FieldLabel>
                  <FieldDescription>
                    e.g., &quot;500mg&quot;, &quot;2 tablets&quot;
                  </FieldDescription>
                  <Input
                    id="dosage"
                    placeholder="500mg"
                    value={formData.dosage}
                    onChange={(e) =>
                      setFormData({ ...formData, dosage: e.target.value })
                    }
                    disabled={isPending}
                    required
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="frequency">Frequency *</FieldLabel>
                  <FieldDescription>
                    e.g., &quot;twice daily&quot;, &quot;once a day&quot;
                  </FieldDescription>
                  <Input
                    id="frequency"
                    placeholder="twice daily"
                    value={formData.frequency}
                    onChange={(e) =>
                      setFormData({ ...formData, frequency: e.target.value })
                    }
                    disabled={isPending}
                    required
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="duration">Duration *</FieldLabel>
                  <FieldDescription>
                    e.g., &quot;7 days&quot;, &quot;2 weeks&quot;
                  </FieldDescription>
                  <Input
                    id="duration"
                    placeholder="7 days"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({ ...formData, duration: e.target.value })
                    }
                    disabled={isPending}
                    required
                  />
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="instructions">Instructions</FieldLabel>
                <FieldDescription>
                  Additional instructions for taking the medication
                </FieldDescription>
                <Textarea
                  id="instructions"
                  placeholder="Enter additional instructions..."
                  value={formData.instructions || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, instructions: e.target.value })
                  }
                  disabled={isPending}
                  rows={4}
                />
              </Field>

              <div className="flex gap-4 pt-4">
                <NormalButton type="submit" disabled={isPending}>
                  <Save className="h-4 w-4" />
                  Create Prescription
                </NormalButton>
                <Link href="/dashboard/doctor/prescriptions">
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
