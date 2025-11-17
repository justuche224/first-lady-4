'use client'

import { SignIn } from "@/components/auth/sign-in";
import { Leva } from "leva";

export default function SignInPage() {
  return (
    <>
      <SignIn />
      <Leva hidden />
    </>
  );
}
