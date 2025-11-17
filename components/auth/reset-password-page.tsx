"use client";

import { ResetPassword } from "@/components/auth/reset-password";
import { Leva } from "leva";
import { Suspense } from "react";

export default function ResetPasswordPage() {
  return (
    <>
      <Suspense fallback={null}>
        <ResetPassword />
      </Suspense>
      <Leva hidden />
    </>
  );
}
