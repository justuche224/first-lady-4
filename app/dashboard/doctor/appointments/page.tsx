import { serverAuth } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import {
  getDoctorAppointments,
  getDoctorPatientsForFilter,
} from "@/actions/doctor";
import DoctorAppointmentsManagement from "./appointments-management";

const page = async () => {
  const session = await serverAuth();
  if (!session) {
    redirect("/auth/sign-in");
  }
  if (session.user.role !== "doctor") {
    redirect("/dashboard");
  }

  const appointmentsResult = await getDoctorAppointments();
  const patientsResult = await getDoctorPatientsForFilter();

  return (
    <DoctorAppointmentsManagement
      initialAppointments={appointmentsResult.data || []}
      patients={patientsResult.data || []}
    />
  );
};

export default page;
