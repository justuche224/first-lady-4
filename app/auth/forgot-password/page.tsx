import ForgotPasswordPage from "@/components/auth/forgot-password-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password | Skal",
  description: "Reset your password",
};

const page = () => {
  return <ForgotPasswordPage />;
};

export default page;
