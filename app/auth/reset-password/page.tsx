import ResetPasswordPage from "@/components/auth/reset-password-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password | Skal",
  description: "Reset your password",
};

const page = () => {
  return <ResetPasswordPage />;
};

export default page;
