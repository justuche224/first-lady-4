import { serverAuth } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import {
  getDoctorMedicalRecords,
  getDoctorPatientsForFilter,
} from "@/actions/doctor";
import DoctorMedicalRecordsManagement from "./medical-records-management";

const page = async () => {
  const session = await serverAuth();
  if (!session) {
    redirect("/auth/sign-in");
  }
  if (session.user.role !== "doctor") {
    redirect("/dashboard");
  }

  const recordsResult = await getDoctorMedicalRecords();
  const patientsResult = await getDoctorPatientsForFilter();

  return (
    <DoctorMedicalRecordsManagement
      initialRecords={recordsResult.data || []}
      patients={patientsResult.data || []}
    />
  );
};

export default page;
