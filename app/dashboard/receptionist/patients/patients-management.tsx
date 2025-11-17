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
import { NormalButton } from "@/components/ui/button-normal";
import { Search, UserCheck, Eye, UserPlus, Edit } from "lucide-react";
import { getAllPatients } from "@/actions/receptionist";

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

interface PatientsManagementProps {
  initialPatients: Patient[];
}

export default function PatientsManagement({
  initialPatients,
}: PatientsManagementProps) {
  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [searchQuery, setSearchQuery] = useState("");
  const [, startTransition] = useTransition();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    startTransition(async () => {
      const result = await getAllPatients(query || undefined);
      if (result.success) {
        setPatients(result.data);
      }
    });
  };

  const calculateAge = (dateOfBirth: Date | string | null): string => {
    if (!dateOfBirth) return "—";
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

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6 lg:p-8 container mx-auto max-w-7xl">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Patients</h1>
          <p className="text-muted-foreground">
            Search and manage patient records
          </p>
        </div>
        <Link href="/dashboard/receptionist/patients/new">
          <NormalButton>
            <UserPlus className="h-4 w-4" />
            Register New Patient
          </NormalButton>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Patient Records</CardTitle>
          <CardDescription>
            Search patients by name, email, phone, or patient ID
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, phone, or ID..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Blood Type</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <UserCheck className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          No patients found
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  patients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          #{patient.id}
                        </code>
                      </TableCell>
                      <TableCell className="font-medium">
                        {patient.name}
                      </TableCell>
                      <TableCell>{patient.email}</TableCell>
                      <TableCell>{patient.phone || "—"}</TableCell>
                      <TableCell>{calculateAge(patient.dateOfBirth)}</TableCell>
                      <TableCell>{patient.gender || "—"}</TableCell>
                      <TableCell>{patient.bloodType || "—"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/dashboard/receptionist/patients/${patient.id}`}
                          >
                            <NormalButton variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                              View
                            </NormalButton>
                          </Link>
                          <Link
                            href={`/dashboard/receptionist/patients/${patient.id}/edit`}
                          >
                            <NormalButton variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                              Edit
                            </NormalButton>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
