import { serverAuth } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import { getAppointmentsForMedicalRecord } from "@/actions/doctor";
import CreateMedicalRecordForm from "./create-medical-record-form";

const page = async () => {
  const session = await serverAuth();
  if (!session) {
    redirect("/auth/sign-in");
  }
  if (session.user.role !== "doctor") {
    redirect("/dashboard");
  }

  const appointmentsResult = await getAppointmentsForMedicalRecord();

  return (
    <CreateMedicalRecordForm appointments={appointmentsResult.data || []} />
  );
};

export default page;
