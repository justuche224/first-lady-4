import { serverAuth } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import {
  getDoctorPrescriptions,
  getDoctorPatientsForFilter,
} from "@/actions/doctor";
import DoctorPrescriptionsManagement from "./prescriptions-management";

const page = async () => {
  const session = await serverAuth();
  if (!session) {
    redirect("/auth/sign-in");
  }
  if (session.user.role !== "doctor") {
    redirect("/dashboard");
  }

  const prescriptionsResult = await getDoctorPrescriptions();
  const patientsResult = await getDoctorPatientsForFilter();

  return (
    <DoctorPrescriptionsManagement
      initialPrescriptions={prescriptionsResult.data || []}
      patients={patientsResult.data || []}
    />
  );
};

export default page;
