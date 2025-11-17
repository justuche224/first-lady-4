import { serverAuth } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import ReceptionistDashboard from "./dashboard";
import { getReceptionistDashboardStats } from "@/actions/receptionist";

const page = async () => {
  const session = await serverAuth();
  if (!session) {
    redirect("/auth/sign-in");
  }
  if (session.user.role !== "receptionist") {
    redirect("/dashboard");
  }

  const stats = await getReceptionistDashboardStats();

  return <ReceptionistDashboard stats={stats} />;
};

export default page;
