import { serverAuth } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import { getAllDoctors, getDepartments } from "@/actions/admin";
import DoctorsManagement from "./doctors-management";

const page = async () => {
  const session = await serverAuth();
  if (!session) {
    redirect("/auth/sign-in");
  }
  if (session.user.role !== "admin") {
    redirect("/dashboard");
  }

  const doctorsResult = await getAllDoctors();
  const departmentsResult = await getDepartments();

  return (
    <DoctorsManagement
      initialDoctors={doctorsResult.data || []}
      departments={departmentsResult.data || []}
    />
  );
};

export default page;
