import { serverAuth } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import { getDoctorPatients } from "@/actions/doctor";
import DoctorPatientsManagement from "./patients-management";

const page = async () => {
  const session = await serverAuth();
  if (!session) {
    redirect("/auth/sign-in");
  }
  if (session.user.role !== "doctor") {
    redirect("/dashboard");
  }

  const patientsResult = await getDoctorPatients();

  return (
    <DoctorPatientsManagement initialPatients={patientsResult.data || []} />
  );
};

export default page;
