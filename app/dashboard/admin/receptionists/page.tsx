import { serverAuth } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import { getAllReceptionists } from "@/actions/admin";
import ReceptionistsManagement from "./receptionists-management";

const page = async () => {
  const session = await serverAuth();
  if (!session) {
    redirect("/auth/sign-in");
  }
  if (session.user.role !== "admin") {
    redirect("/dashboard");
  }

  const receptionistsResult = await getAllReceptionists();

  return (
    <ReceptionistsManagement
      initialReceptionists={receptionistsResult.data || []}
    />
  );
};

export default page;

