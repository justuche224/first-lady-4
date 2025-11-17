import { serverAuth } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import {
  getAllPrescriptionsForAdmin,
  getDoctorsForAppointmentFilter,
  getPatientsForAppointmentFilter,
} from "@/actions/admin";
import PrescriptionsManagement from "./prescriptions-management";

const page = async () => {
  const session = await serverAuth();
  if (!session) {
    redirect("/auth/sign-in");
  }
  if (session.user.role !== "admin") {
    redirect("/dashboard");
  }

  const prescriptionsResult = await getAllPrescriptionsForAdmin();
  const doctorsResult = await getDoctorsForAppointmentFilter();
  const patientsResult = await getPatientsForAppointmentFilter();

  return (
    <PrescriptionsManagement
      initialPrescriptions={prescriptionsResult.data || []}
      doctors={doctorsResult.data || []}
      patients={patientsResult.data || []}
    />
  );
};

export default page;

