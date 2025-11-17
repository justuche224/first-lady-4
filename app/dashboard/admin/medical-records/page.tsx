import { serverAuth } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import {
  getAllMedicalRecordsForAdmin,
  getDoctorsForAppointmentFilter,
  getPatientsForAppointmentFilter,
} from "@/actions/admin";
import MedicalRecordsManagement from "./medical-records-management";

const page = async () => {
  const session = await serverAuth();
  if (!session) {
    redirect("/auth/sign-in");
  }
  if (session.user.role !== "admin") {
    redirect("/dashboard");
  }

  const recordsResult = await getAllMedicalRecordsForAdmin();
  const doctorsResult = await getDoctorsForAppointmentFilter();
  const patientsResult = await getPatientsForAppointmentFilter();

  return (
    <MedicalRecordsManagement
      initialRecords={recordsResult.data || []}
      doctors={doctorsResult.data || []}
      patients={patientsResult.data || []}
    />
  );
};

export default page;

