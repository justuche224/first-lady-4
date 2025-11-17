import { serverAuth } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import PatientRegistrationForm from "./patient-registration-form";

const page = async () => {
  const session = await serverAuth();
  if (!session) {
    redirect("/auth/sign-in");
  }
  if (session.user.role !== "receptionist") {
    redirect("/dashboard");
  }

  return <PatientRegistrationForm />;
};

export default page;
