import { serverAuth } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import {
  getAllAppointments,
  getDoctorsForAppointment,
} from "@/actions/receptionist";
import { getAllPatients } from "@/actions/receptionist";
import AppointmentsManagement from "./appointments-management";

const page = async () => {
  const session = await serverAuth();
  if (!session) {
    redirect("/auth/sign-in");
  }
  if (session.user.role !== "receptionist") {
    redirect("/dashboard");
  }

  const appointmentsResult = await getAllAppointments();
  const doctorsResult = await getDoctorsForAppointment();
  const patientsResult = await getAllPatients();

  return (
    <AppointmentsManagement
      initialAppointments={appointmentsResult.data || []}
      doctors={doctorsResult.data || []}
      patients={patientsResult.data || []}
    />
  );
};

export default page;
