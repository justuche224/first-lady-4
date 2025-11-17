import { serverAuth } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import { getMedicalRecordsForPrescription } from "@/actions/doctor";
import CreatePrescriptionForm from "./create-prescription-form";

const page = async () => {
  const session = await serverAuth();
  if (!session) {
    redirect("/auth/sign-in");
  }
  if (session.user.role !== "doctor") {
    redirect("/dashboard");
  }

  const medicalRecordsResult = await getMedicalRecordsForPrescription();

  return (
    <CreatePrescriptionForm medicalRecords={medicalRecordsResult.data || []} />
  );
};

export default page;
