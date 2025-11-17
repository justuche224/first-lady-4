"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { NormalButton } from "@/components/ui/button-normal";
import {
  UserCheck,
  Calendar,
  CalendarClock,
  FileText,
  Pill,
  ClipboardList,
  Search,
  ArrowRight,
  Stethoscope,
} from "lucide-react";

interface DoctorDashboardProps {
  stats: {
    todayAppointments: number;
    upcomingAppointments: number;
    totalPatientsSeen: number;
    totalMedicalRecords: number;
    totalPrescriptions: number;
    activePrescriptions: number;
  };
}

const DoctorDashboard = ({ stats }: DoctorDashboardProps) => {
  const quickActions = [
    {
      title: "Search Patients",
      description: "Search and view complete patient records",
      icon: <Search className="h-6 w-6" />,
      href: "/dashboard/doctor/patients",
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950",
    },
    {
      title: "View Appointments",
      description: "View your daily and upcoming appointments",
      icon: <Calendar className="h-6 w-6" />,
      href: "/dashboard/doctor/appointments",
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-950",
    },
    {
      title: "Create Medical Record",
      description: "Create medical records for completed appointments",
      icon: <FileText className="h-6 w-6" />,
      href: "/dashboard/doctor/medical-records/new",
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-950",
    },
    {
      title: "View Medical Records",
      description: "View all patient medical records and history",
      icon: <ClipboardList className="h-6 w-6" />,
      href: "/dashboard/doctor/medical-records",
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-950",
    },
    {
      title: "Prescribe Medication",
      description: "Add new prescriptions for patients",
      icon: <Pill className="h-6 w-6" />,
      href: "/dashboard/doctor/prescriptions/new",
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-50 dark:bg-red-950",
    },
    {
      title: "View Prescriptions",
      description: "View all prescriptions and manage active ones",
      icon: <Stethoscope className="h-6 w-6" />,
      href: "/dashboard/doctor/prescriptions",
      color: "text-teal-600 dark:text-teal-400",
      bgColor: "bg-teal-50 dark:bg-teal-950",
    },
  ];

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6 lg:p-8 container mx-auto max-w-7xl">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Doctor Dashboard
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Manage patient care, medical records, and prescriptions
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Today&apos;s Appointments
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayAppointments}</div>
            <p className="text-xs text-muted-foreground">
              Appointments scheduled for today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Upcoming Appointments
            </CardTitle>
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.upcomingAppointments}
            </div>
            <p className="text-xs text-muted-foreground">
              Future appointments scheduled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Patients Seen</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPatientsSeen}</div>
            <p className="text-xs text-muted-foreground">
              Unique patients you&apos;ve treated
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Medical Records
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalMedicalRecords}
            </div>
            <p className="text-xs text-muted-foreground">
              Medical records created
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Prescriptions
            </CardTitle>
            <Pill className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPrescriptions}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activePrescriptions} currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Prescriptions
            </CardTitle>
            <Stethoscope className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.activePrescriptions}
            </div>
            <p className="text-xs text-muted-foreground">
              Prescriptions currently active
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">
            Quick Actions
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                action.href as unknown as any
              }
            >
              <Card className="transition-all hover:shadow-md hover:border-primary/50 cursor-pointer h-full">
                <CardHeader>
                  <div
                    className={`inline-flex items-center justify-center rounded-lg p-3 w-fit ${action.bgColor}`}
                  >
                    <div className={action.color}>{action.icon}</div>
                  </div>
                  <CardTitle className="mt-4">{action.title}</CardTitle>
                  <CardDescription>{action.description}</CardDescription>
                </CardHeader>
                <CardFooter>
                  <NormalButton
                    variant="ghost"
                    size="sm"
                    className="w-full justify-between group"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </NormalButton>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Responsibilities</CardTitle>
          <CardDescription>
            Overview of your key responsibilities as a doctor
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-medium">Patient Management</h3>
              <p className="text-sm text-muted-foreground">
                Search and view complete patient records including medical
                history, allergies, and insurance information. Access all past
                medical records, appointments, and prescriptions.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-medium">Medical Records</h3>
              <p className="text-sm text-muted-foreground">
                Create medical records when appointments are completed. Enter
                symptoms, diagnosis, notes, and follow-up requirements. Update
                existing records as needed.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-medium">Prescriptions</h3>
              <p className="text-sm text-muted-foreground">
                Prescribe medications for patients with detailed dosage,
                frequency, and duration information. Manage active prescriptions
                and mark them inactive when no longer needed.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorDashboard;
