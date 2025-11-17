"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { NormalButton } from "@/components/ui/button-normal";
import {
  ArrowLeft,
  User,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Heart,
  AlertTriangle,
  CreditCard,
  Edit,
} from "lucide-react";

interface Patient {
  id: number;
  name: string;
  email: string;
  dateOfBirth: Date | string | null;
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
  createdAt: Date | string | null;
  updatedAt: Date | string | null;
}

interface PatientDetailProps {
  patient: Patient;
}

export default function PatientDetail({ patient }: PatientDetailProps) {
  const calculateAge = (dateOfBirth: Date | string | null): string => {
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

  const formatDate = (date: Date | string | null): string => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6 lg:p-8 container mx-auto max-w-7xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/receptionist/patients">
            <NormalButton variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4" />
              Back to Patients
            </NormalButton>
          </Link>
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold tracking-tight">
              {patient.name}
            </h1>
            <p className="text-muted-foreground">Patient ID: #{patient.id}</p>
          </div>
        </div>
        <Link href={`/dashboard/receptionist/patients/${patient.id}/edit`}>
          <NormalButton>
            <Edit className="h-4 w-4" />
            Edit Patient
          </NormalButton>
        </Link>
      </div>

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
                <p className="text-sm text-muted-foreground">{patient.email}</p>
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
            {patient.gender && (
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Gender</p>
                  <p className="text-sm text-muted-foreground">
                    {patient.gender}
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
                <User className="h-4 w-4 text-muted-foreground mt-1" />
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
                    {patient.emergencyPhone && ` - ${patient.emergencyPhone}`}
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

        <Card>
          <CardHeader>
            <CardTitle>Registration Information</CardTitle>
            <CardDescription>Account and record details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {patient.createdAt && (
              <div>
                <p className="text-sm font-medium">Registered On</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(patient.createdAt)}
                </p>
              </div>
            )}
            {patient.updatedAt && (
              <div>
                <p className="text-sm font-medium">Last Updated</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(patient.updatedAt)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
