import { redirect } from "next/navigation";

const page = () => {
  return redirect("/auth/sign-in");
};

export default page;
