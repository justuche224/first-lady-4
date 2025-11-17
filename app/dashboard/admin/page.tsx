import { serverAuth } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import AdminDashboard from "./dashboard";
import { getAdminDashboardStats } from "@/actions/admin";

const page = async () => {
  const session = await serverAuth();
  if (!session) {
    redirect("/auth/sign-in");
  }
  if (session.user.role !== "admin") {
    redirect("/dashboard");
  }

  const stats = await getAdminDashboardStats();

  return <AdminDashboard stats={stats} />;
};

export default page;
