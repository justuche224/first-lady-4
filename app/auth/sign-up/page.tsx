import SignUpPage from "@/components/auth/sign-up-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up | Skal",
  description: "Create a new account",
};

const page = () => {
  return <SignUpPage />;
};

export default page;
