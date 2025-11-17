"use client";

import { ForgotPassword } from "@/components/auth/forgot-password";
import { Leva } from "leva";

export default function ForgotPasswordPage() {
  return (
    <>
      <ForgotPassword />
      <Leva hidden />
    </>
  );
}
