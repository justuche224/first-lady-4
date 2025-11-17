import { serverAuth } from "@/lib/server-auth";
import { redirect, notFound } from "next/navigation";
import { getPatientById } from "@/actions/receptionist";
import PatientDetail from "./patient-detail";

interface PageProps {
  params: Promise<{ id: string }>;
}

const page = async ({ params }: PageProps) => {
  const session = await serverAuth();
  if (!session) {
    redirect("/auth/sign-in");
  }
  if (session.user.role !== "receptionist") {
    redirect("/dashboard");
  }

  const { id } = await params;
  const patientId = parseInt(id);

  if (isNaN(patientId)) {
    notFound();
  }

  const patientResult = await getPatientById(patientId);

  if (!patientResult.success || !patientResult.data) {
    notFound();
  }

  return <PatientDetail patient={patientResult.data} />;
};

export default page;
