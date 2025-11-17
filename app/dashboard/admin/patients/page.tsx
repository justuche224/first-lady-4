import { serverAuth } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import { getAllPatients } from "@/actions/admin";
import PatientsManagement from "./patients-management";

const page = async () => {
  const session = await serverAuth();
  if (!session) {
    redirect("/auth/sign-in");
  }
  if (session.user.role !== "admin") {
    redirect("/dashboard");
  }

  const patientsResult = await getAllPatients();

  return <PatientsManagement initialPatients={patientsResult.data || []} />;
};

export default page;
