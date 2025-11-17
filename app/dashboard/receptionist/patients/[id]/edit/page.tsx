import { serverAuth } from "@/lib/server-auth";
import { redirect, notFound } from "next/navigation";
import { getPatientById } from "@/actions/receptionist";
import PatientEditForm from "./patient-edit-form";

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

  return <PatientEditForm patient={patientResult.data} />;
};

export default page;
