"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  User,
  Calendar,
  FileText,
  Pill,
  Phone,
  Mail,
  MapPin,
  Heart,
  AlertTriangle,
  CreditCard,
  Stethoscope,
} from "lucide-react";
import { NormalButton } from "@/components/ui/button-normal";

interface Patient {
  id: number;
  name: string;
  email: string;
  dateOfBirth: Date | null;
  gender: string | null;
  phone: string | null;
  address: string | null;
  emergencyContact: string | null;
  emergencyPhone: string | null;
  bloodType: string | null;
  allergies: string | null;
  medicalHistory: string | null;
  insuranceProvider: string | null;
  insuranceNumber: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

interface MedicalRecord {
  id: number;
  appointmentId: number;
  visitDate: Date | null;
  symptoms: string | null;
  diagnosis: string | null;
  notes: string | null;
  followUpRequired: boolean | null;
  followUpDate: Date | null;
  createdAt: Date | null;
  doctorName: string | null;
  doctorEmail: string | null;
  doctorSpecialty: string | null;
}

interface Prescription {
  id: number;
  medicalRecordId: number;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string | null;
  prescribedDate: Date | null;
  isActive: boolean;
  createdAt: Date | null;
  doctorName: string | null;
  doctorEmail: string | null;
}

interface Appointment {
  id: number;
  appointmentDate: Date | null;
  appointmentTime: string | null;
  type: string | null;
  status: string | null;
  reason: string | null;
  createdAt: Date | null;
  doctorName: string | null;
  doctorSpecialty: string | null;
}

interface PatientDetailProps {
  patientData: {
    patient: Patient;
    medicalRecords: MedicalRecord[];
    prescriptions: Prescription[];
    appointments: Appointment[];
  };
}

export default function PatientDetail({ patientData }: PatientDetailProps) {
  const { patient, medicalRecords, prescriptions, appointments } = patientData;

  const calculateAge = (dateOfBirth: Date | null): string => {
    if (!dateOfBirth) return "N/A";
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return `${age} years`;
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (date: Date | null): string => {
    if (!date) return "—";
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const activePrescriptions = prescriptions.filter((p) => p.isActive);
  const inactivePrescriptions = prescriptions.filter((p) => !p.isActive);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6 lg:p-8 container mx-auto max-w-7xl">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/admin/patients">
          <NormalButton variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4" />
            Back to Patients
          </NormalButton>
        </Link>
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">{patient.name}</h1>
          <p className="text-muted-foreground">Patient ID: #{patient.id}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Medical Records
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{medicalRecords.length}</div>
            <p className="text-xs text-muted-foreground">Total records</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Prescriptions
            </CardTitle>
            <Pill className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activePrescriptions.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {inactivePrescriptions.length} inactive
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appointments.length}</div>
            <p className="text-xs text-muted-foreground">Total appointments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Age</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {calculateAge(patient.dateOfBirth)}
            </div>
            <p className="text-xs text-muted-foreground">
              {patient.gender || "Gender not specified"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="records">Medical Records</TabsTrigger>
          <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Patient demographics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">
                      {patient.email}
                    </p>
                  </div>
                </div>
                {patient.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Phone</p>
                      <p className="text-sm text-muted-foreground">
                        {patient.phone}
                      </p>
                    </div>
                  </div>
                )}
                {patient.address && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Address</p>
                      <p className="text-sm text-muted-foreground">
                        {patient.address}
                      </p>
                    </div>
                  </div>
                )}
                {patient.dateOfBirth && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Date of Birth</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(patient.dateOfBirth)} (
                        {calculateAge(patient.dateOfBirth)})
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Medical Information</CardTitle>
                <CardDescription>Health and medical details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {patient.bloodType && (
                  <div className="flex items-center gap-3">
                    <Heart className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Blood Type</p>
                      <p className="text-sm text-muted-foreground">
                        {patient.bloodType}
                      </p>
                    </div>
                  </div>
                )}
                {patient.allergies && (
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Allergies</p>
                      <p className="text-sm text-muted-foreground">
                        {patient.allergies}
                      </p>
                    </div>
                  </div>
                )}
                {patient.medicalHistory && (
                  <div className="flex items-start gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-sm font-medium">Medical History</p>
                      <p className="text-sm text-muted-foreground">
                        {patient.medicalHistory}
                      </p>
                    </div>
                  </div>
                )}
                {(patient.emergencyContact || patient.emergencyPhone) && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Emergency Contact</p>
                      <p className="text-sm text-muted-foreground">
                        {patient.emergencyContact || "—"}
                        {patient.emergencyPhone &&
                          ` - ${patient.emergencyPhone}`}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {(patient.insuranceProvider || patient.insuranceNumber) && (
              <Card>
                <CardHeader>
                  <CardTitle>Insurance Information</CardTitle>
                  <CardDescription>Insurance provider details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {patient.insuranceProvider && (
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Provider</p>
                        <p className="text-sm text-muted-foreground">
                          {patient.insuranceProvider}
                        </p>
                      </div>
                    </div>
                  )}
                  {patient.insuranceNumber && (
                    <div>
                      <p className="text-sm font-medium">Policy Number</p>
                      <p className="text-sm text-muted-foreground">
                        {patient.insuranceNumber}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="records" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Medical Records</CardTitle>
              <CardDescription>
                Complete medical history and visit records
              </CardDescription>
            </CardHeader>
            <CardContent>
              {medicalRecords.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No medical records found
                </div>
              ) : (
                <div className="space-y-6">
                  {medicalRecords.map((record) => (
                    <Card key={record.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">
                              {formatDateTime(record.visitDate)}
                            </CardTitle>
                            <CardDescription>
                              <div className="flex items-center gap-2 mt-1">
                                <Stethoscope className="h-3 w-3" />
                                {record.doctorName} ({record.doctorSpecialty})
                              </div>
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {record.symptoms && (
                          <div>
                            <p className="text-sm font-medium">Symptoms</p>
                            <p className="text-sm text-muted-foreground">
                              {record.symptoms}
                            </p>
                          </div>
                        )}
                        {record.diagnosis && (
                          <div>
                            <p className="text-sm font-medium">Diagnosis</p>
                            <p className="text-sm text-muted-foreground">
                              {record.diagnosis}
                            </p>
                          </div>
                        )}
                        {record.notes && (
                          <div>
                            <p className="text-sm font-medium">Notes</p>
                            <p className="text-sm text-muted-foreground">
                              {record.notes}
                            </p>
                          </div>
                        )}
                        {record.followUpRequired && (
                          <div>
                            <Badge variant="outline">Follow-up Required</Badge>
                            {record.followUpDate && (
                              <p className="text-sm text-muted-foreground mt-1">
                                Follow-up date:{" "}
                                {formatDate(record.followUpDate)}
                              </p>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prescriptions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Prescriptions</CardTitle>
              <CardDescription>
                Current and past medication prescriptions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {prescriptions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No prescriptions found
                </div>
              ) : (
                <div className="space-y-4">
                  {activePrescriptions.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">
                        Active Prescriptions
                      </h3>
                      <div className="space-y-3">
                        {activePrescriptions.map((prescription) => (
                          <Card key={prescription.id}>
                            <CardContent className="pt-4">
                              <div className="flex items-start justify-between">
                                <div className="space-y-2 flex-1">
                                  <div className="flex items-center gap-2">
                                    <Pill className="h-4 w-4" />
                                    <span className="font-semibold">
                                      {prescription.medicationName}
                                    </span>
                                    <Badge>Active</Badge>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                      <span className="text-muted-foreground">
                                        Dosage:{" "}
                                      </span>
                                      {prescription.dosage}
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">
                                        Frequency:{" "}
                                      </span>
                                      {prescription.frequency}
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">
                                        Duration:{" "}
                                      </span>
                                      {prescription.duration}
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">
                                        Prescribed:{" "}
                                      </span>
                                      {formatDate(prescription.prescribedDate)}
                                    </div>
                                  </div>
                                  {prescription.instructions && (
                                    <div>
                                      <p className="text-sm font-medium">
                                        Instructions
                                      </p>
                                      <p className="text-sm text-muted-foreground">
                                        {prescription.instructions}
                                      </p>
                                    </div>
                                  )}
                                  <p className="text-xs text-muted-foreground">
                                    Prescribed by: {prescription.doctorName}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {inactivePrescriptions.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">
                        Past Prescriptions
                      </h3>
                      <div className="space-y-3">
                        {inactivePrescriptions.map((prescription) => (
                          <Card key={prescription.id}>
                            <CardContent className="pt-4">
                              <div className="flex items-start justify-between">
                                <div className="space-y-2 flex-1">
                                  <div className="flex items-center gap-2">
                                    <Pill className="h-4 w-4" />
                                    <span className="font-semibold">
                                      {prescription.medicationName}
                                    </span>
                                    <Badge variant="secondary">Inactive</Badge>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                      <span className="text-muted-foreground">
                                        Dosage:{" "}
                                      </span>
                                      {prescription.dosage}
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">
                                        Frequency:{" "}
                                      </span>
                                      {prescription.frequency}
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">
                                        Duration:{" "}
                                      </span>
                                      {prescription.duration}
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">
                                        Prescribed:{" "}
                                      </span>
                                      {formatDate(prescription.prescribedDate)}
                                    </div>
                                  </div>
                                  {prescription.instructions && (
                                    <div>
                                      <p className="text-sm font-medium">
                                        Instructions
                                      </p>
                                      <p className="text-sm text-muted-foreground">
                                        {prescription.instructions}
                                      </p>
                                    </div>
                                  )}
                                  <p className="text-xs text-muted-foreground">
                                    Prescribed by: {prescription.doctorName}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appointments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Appointments</CardTitle>
              <CardDescription>
                Appointment history and scheduled visits
              </CardDescription>
            </CardHeader>
            <CardContent>
              {appointments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No appointments found
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Doctor</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Reason</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {appointments.map((appointment) => (
                        <TableRow key={appointment.id}>
                          <TableCell>
                            {appointment.appointmentDate &&
                              formatDate(appointment.appointmentDate)}
                            {appointment.appointmentTime && (
                              <span className="text-muted-foreground ml-2">
                                {appointment.appointmentTime}
                              </span>
                            )}
                          </TableCell>
                          <TableCell>{appointment.type || "—"}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {appointment.doctorName}
                              </div>
                              {appointment.doctorSpecialty && (
                                <div className="text-xs text-muted-foreground">
                                  {appointment.doctorSpecialty}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                appointment.status === "completed"
                                  ? "default"
                                  : appointment.status === "cancelled"
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {appointment.status || "—"}
                            </Badge>
                          </TableCell>
                          <TableCell>{appointment.reason || "—"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
