"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Home,
  Stethoscope,
  Calendar,
  FileText,
  Users,
  Pill,
  UserCheck,
} from "lucide-react";
import { Logo } from "./logo";
import type { Route } from "./nav-main";
import DashboardNavigation from "./nav-main";
import { TeamSwitcher } from "./team-switcher";

const dashboardRoutes: Route[] = [
  {
    id: "dashboard",
    title: "Dashboard",
    icon: <Home className="size-4" />,
    link: "/dashboard/admin",
  },
  {
    id: "doctors",
    title: "Doctors",
    icon: <Stethoscope className="size-4" />,
    link: "/dashboard/admin/doctors",
  },
  {
    id: "receptionists",
    title: "Receptionists",
    icon: <Users className="size-4" />,
    link: "/dashboard/admin/receptionists",
  },
  {
    id: "patients",
    title: "Patients",
    icon: <UserCheck className="size-4" />,
    link: "/dashboard/admin/patients",
  },
  {
    id: "appointments",
    title: "Appointments",
    icon: <Calendar className="size-4" />,
    link: "/dashboard/admin/appointments",
  },
  {
    id: "medical-records",
    title: "Medical Records",
    icon: <FileText className="size-4" />,
    link: "/dashboard/admin/medical-records",
  },
  {
    id: "prescriptions",
    title: "Prescriptions",
    icon: <Pill className="size-4" />,
    link: "/dashboard/admin/prescriptions",
  },
];

const teams = [
  { id: "1", name: "Alpha Inc.", logo: Logo, plan: "Free" },
  { id: "2", name: "Beta Corp.", logo: Logo, plan: "Free" },
  { id: "3", name: "Gamma Tech", logo: Logo, plan: "Free" },
];

export function DashboardSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar variant="floating" collapsible="icon" className="bg-background">
      <SidebarHeader
        className={cn(
          "flex md:pt-3.5",
          isCollapsed
            ? "flex-row items-center justify-between gap-y-4 md:flex-col md:items-start md:justify-start"
            : "flex-row items-center justify-between"
        )}
      >
        <a href="#" className="flex items-center gap-2">
          <Logo className="h-8 w-8" />
          {!isCollapsed && (
            <span className="font-semibold text-black dark:text-white">
              Acme
            </span>
          )}
        </a>

        <motion.div
          key={isCollapsed ? "header-collapsed" : "header-expanded"}
          className={cn(
            "flex items-center gap-2",
            isCollapsed ? "flex-row md:flex-col-reverse" : "flex-row"
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <SidebarTrigger />
        </motion.div>
      </SidebarHeader>
      <SidebarContent className="gap-4 px-2 py-4">
        <DashboardNavigation routes={dashboardRoutes} />
      </SidebarContent>
      <SidebarFooter className="px-2">
        <TeamSwitcher teams={teams} />
      </SidebarFooter>
    </Sidebar>
  );
}
