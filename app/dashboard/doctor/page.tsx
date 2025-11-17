import { serverAuth } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import DoctorDashboard from "./dashboard";
import { getDoctorDashboardStats } from "@/actions/doctor";

const page = async () => {
  const session = await serverAuth();
  if (!session) {
    redirect("/auth/sign-in");
  }
  if (session.user.role !== "doctor") {
    redirect("/dashboard");
  }

  const stats = await getDoctorDashboardStats();

  return <DoctorDashboard stats={stats} />;
};

export default page;
