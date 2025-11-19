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
  FileText,
  Package2,
  Store,
  Users,
  Loader2,
} from "lucide-react";
import { Logo } from "./logo";
import type { Route } from "./nav-main";
import DashboardNavigation from "./nav-main";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { NormalButton } from "@/components/ui/button-normal";

const dashboardRoutes: Route[] = [
  {
    id: "dashboard",
    title: "Dashboard",
    icon: <Home className="size-4" />,
    link: "/dashboard/doctor",
  },
  {
    id: "appointments",
    title: "Appointments",
    icon: <Package2 className="size-4" />,
    link: "/dashboard/doctor/appointments",
  },
  {
    id: "medical-records",
    title: "Medical Records",
    icon: <FileText className="size-4" />,
    link: "/dashboard/doctor/medical-records",
  },
  {
    id: "patients",
    title: "Patients",
    icon: <Users className="size-4" />,
    link: "/dashboard/doctor/patients",
  },
  {
    id: "prescriptions",
    title: "Prescriptions",
    icon: <Store className="size-4" />,
    link: "/dashboard/doctor/prescriptions",
  }
];


export function DashboardSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const logout = async () => {
    setSigningOut(true);
    await authClient.signOut();
    router.push("/");
    setSigningOut(false);
  };

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
              Skal CRM
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
        <NormalButton onClick={logout} className="w-full">
          {signingOut ? <Loader2 className="size-4 animate-spin" /> : "Logout"}
          {signingOut && <span className="ml-2">Logging out...</span>}
        </NormalButton>
      </SidebarFooter>
    </Sidebar>
  );
}
