import { serverAuth } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import { getAllPatients } from "@/actions/receptionist";
import PatientsManagement from "./patients-management";

const page = async () => {
  const session = await serverAuth();
  if (!session) {
    redirect("/auth/sign-in");
  }
  if (session.user.role !== "receptionist") {
    redirect("/dashboard");
  }

  const patientsResult = await getAllPatients();

  return <PatientsManagement initialPatients={patientsResult.data || []} />;
};

export default page;
