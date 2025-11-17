import { serverAuth } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import {
  getAllAppointmentsForAdmin,
  getDoctorsForAppointmentFilter,
  getPatientsForAppointmentFilter,
} from "@/actions/admin";
import AppointmentsManagement from "./appointments-management";

const page = async () => {
  const session = await serverAuth();
  if (!session) {
    redirect("/auth/sign-in");
  }
  if (session.user.role !== "admin") {
    redirect("/dashboard");
  }

  const appointmentsResult = await getAllAppointmentsForAdmin();
  const doctorsResult = await getDoctorsForAppointmentFilter();
  const patientsResult = await getPatientsForAppointmentFilter();

  return (
    <AppointmentsManagement
      initialAppointments={appointmentsResult.data || []}
      doctors={doctorsResult.data || []}
      patients={patientsResult.data || []}
    />
  );
};

export default page;
