import { serverAuth } from "@/lib/server-auth";
import { redirect, notFound } from "next/navigation";
import { getDoctorPatientById } from "@/actions/doctor";
import DoctorPatientDetail from "./patient-detail";

interface PageProps {
  params: Promise<{ id: string }>;
}

const page = async ({ params }: PageProps) => {
  const session = await serverAuth();
  if (!session) {
    redirect("/auth/sign-in");
  }
  if (session.user.role !== "doctor") {
    redirect("/dashboard");
  }

  const { id } = await params;
  const patientId = parseInt(id);

  if (isNaN(patientId)) {
    notFound();
  }

  const patientResult = await getDoctorPatientById(patientId);

  if (!patientResult.success || !patientResult.data) {
    notFound();
  }

  return <DoctorPatientDetail patientData={patientResult.data} />;
};

export default page;
