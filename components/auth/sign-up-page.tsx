'use client'

import { SignUp } from "@/components/auth/sign-up";
import { Leva } from "leva";

export default function SignUpPage() {
  return (
    <>
      <SignUp />
      <Leva hidden />
    </>
  );
}
