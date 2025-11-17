import SignInPage from "@/components/auth/sign-in-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | Skal",
  description: "Sign in to your account to continue",
};

const page = () => {
  return <SignInPage />;
};

export default page;
