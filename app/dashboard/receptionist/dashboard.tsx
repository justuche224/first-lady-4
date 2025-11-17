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
  UserPlus,
  UserCheck,
  Calendar,
  CalendarClock,
  ArrowRight,
  ClipboardList,
  Search,
} from "lucide-react";

interface ReceptionistDashboardProps {
  stats: {
    totalPatients: number;
    totalAppointments: number;
    todayAppointments: number;
    upcomingAppointments: number;
    scheduledByMe: number;
  };
}

const ReceptionistDashboard = ({ stats }: ReceptionistDashboardProps) => {
  const quickActions = [
    {
      title: "Register New Patient",
      description: "Create a new patient record in the system",
      icon: <UserPlus className="h-6 w-6" />,
      href: "/dashboard/receptionist/patients/new",
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950",
    },
    {
      title: "Search Patients",
      description: "Search and view patient records",
      icon: <Search className="h-6 w-6" />,
      href: "/dashboard/receptionist/patients",
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-950",
    },
    {
      title: "Schedule Appointment",
      description: "Book a new appointment for a patient",
      icon: <Calendar className="h-6 w-6" />,
      href: "/dashboard/receptionist/appointments/new",
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-950",
    },
    {
      title: "View Appointments",
      description: "View and manage all appointments",
      icon: <CalendarClock className="h-6 w-6" />,
      href: "/dashboard/receptionist/appointments",
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-950",
    },
  ];

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6 lg:p-8 container mx-auto max-w-7xl">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Receptionist Dashboard
        </h1>
        <p className="text-muted-foreground">
          Manage patients and appointments
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Patients
            </CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPatients}</div>
            <p className="text-xs text-muted-foreground">Registered patients</p>
          </CardContent>
        </Card>

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
            <CardTitle className="text-sm font-medium">
              Scheduled by Me
            </CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.scheduledByMe}</div>
            <p className="text-xs text-muted-foreground">
              Appointments I scheduled
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

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
            Overview of your key responsibilities as a medical receptionist
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-medium">Patient Management</h3>
              <p className="text-sm text-muted-foreground">
                Register new patients, search for existing patients, and update
                patient demographic and medical information. You can view and
                edit patient records including contact details, emergency
                contacts, allergies, and insurance information.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-medium">Appointment Management</h3>
              <p className="text-sm text-muted-foreground">
                Schedule new appointments for patients with doctors, view all
                appointments, and manage existing appointments. You can update
                appointment details, reschedule, or cancel appointments as
                needed.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReceptionistDashboard;
