import { serverAuth } from "@/lib/server-auth";
import { redirect } from "next/navigation";

const page = async () => {
  const session = await serverAuth();
  if (!session) {
    redirect("/auth/sign-in");
  }
  if (session.user.role === "admin") {
    return redirect("/dashboard/admin");
  }
  if (session.user.role === "doctor") {
    return redirect("/dashboard/doctor");
  }
  if (session.user.role === "receptionist") {
    return redirect("/dashboard/receptionist");
  }
  return redirect("/");
};

export default page;
