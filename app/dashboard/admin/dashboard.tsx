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
  Users,
  UserCheck,
  Stethoscope,
  Calendar,
  FileText,
  Pill,
  Activity,
  ArrowRight,
  Shield,
  UserPlus,
} from "lucide-react";

interface AdminDashboardProps {
  stats: {
    totalStaff: number;
    totalDoctors: number;
    totalReceptionists: number;
    totalPatients: number;
    totalAppointments: number;
    activeUsers: number;
    inactiveUsers: number;
  };
}

const AdminDashboard = ({ stats }: AdminDashboardProps) => {
  const quickActions = [
    {
      title: "Manage Doctors",
      description: "Create, edit, and manage doctor accounts",
      icon: <Stethoscope className="h-6 w-6" />,
      href: "/dashboard/admin/doctors",
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950",
    },
    {
      title: "Manage Receptionists",
      description: "Create, edit, and manage receptionist accounts",
      icon: <Users className="h-6 w-6" />,
      href: "/dashboard/admin/receptionists",
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-950",
    },
    {
      title: "View Patients",
      description: "View all patient records (read-only)",
      icon: <UserCheck className="h-6 w-6" />,
      href: "/dashboard/admin/patients",
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-950",
    },
    {
      title: "View Appointments",
      description: "View all appointments across the system",
      icon: <Calendar className="h-6 w-6" />,
      href: "/dashboard/admin/appointments",
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-950",
    },
    {
      title: "View Medical Records",
      description: "View all patient medical records",
      icon: <FileText className="h-6 w-6" />,
      href: "/dashboard/admin/medical-records",
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-50 dark:bg-red-950",
    },
    {
      title: "View Prescriptions",
      description: "View all medication prescriptions",
      icon: <Pill className="h-6 w-6" />,
      href: "/dashboard/admin/prescriptions",
      color: "text-teal-600 dark:text-teal-400",
      bgColor: "bg-teal-50 dark:bg-teal-950",
    },
  ];

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6 lg:p-8 container mx-auto max-w-7xl">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage staff accounts and monitor system activity
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStaff}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalDoctors} doctors, {stats.totalReceptionists}{" "}
              receptionists
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Patients
            </CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPatients}</div>
            <p className="text-xs text-muted-foreground">
              Registered patients in system
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Appointments
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAppointments}</div>
            <p className="text-xs text-muted-foreground">
              All scheduled appointments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.inactiveUsers} inactive accounts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">
            Quick Actions
          </h2>
          {/* @ts-expect-error Route will be created */}
          <Link href={"/dashboard/admin/users/new"}>
            <NormalButton size="sm" variant="outline">
              <UserPlus className="h-4 w-4" />
              Create User
            </NormalButton>
          </Link>
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
                    <span>View Details</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </NormalButton>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* System Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <CardTitle>System Overview</CardTitle>
          </div>
          <CardDescription>
            Administrative controls and system information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-medium">User Management</h3>
              <p className="text-sm text-muted-foreground">
                Create and manage staff accounts (doctors and receptionists).
                Enable or disable user accounts to control system access.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-medium">Data Access</h3>
              <p className="text-sm text-muted-foreground">
                View all patient records, appointments, medical records, and
                prescriptions. All data access is read-only for administrators.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
