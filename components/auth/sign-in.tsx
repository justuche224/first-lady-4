"use client";

import Link from "next/link";
import { GL } from "@/components/gl";
import { Pill } from "@/components/pill";
import { Button } from "@/components/ui/button";
import { useState, useTransition } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "../ui/field";
import { Input } from "../ui/input";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export function SignIn() {
  const [hovering, setHovering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const router = useRouter();

  const handleSignIn = async () => {
    if (!form.email || !form.password) {
      toast.error("Please fill in all fields");
      return;
    }
    startTransition(async () => {
      try {
        await authClient.signIn.email(
          {
            email: form.email,
            password: form.password,
          },
          {
            onSuccess: async () => {
              toast.success("Logged in successfully");
              router.replace("/dashboard");
            },
            onError: async (ctx) => {
              if (ctx.error.status === 403) {
                toast.error("Please verify your email address", {
                  description:
                    "Please check your email for a verification link",
                });
                await authClient.sendVerificationEmail({
                  email: form.email,
                  callbackURL: "/dashboard",
                });
              } else {
                toast.error(ctx.error.message);
              }
            },
          }
        );
      } catch (error) {
        toast.error("An error occurred while signing in");
        console.error(error);
      }
    });
  };

  return (
    <div className="flex flex-col h-svh justify-between">
      <GL hovering={hovering} />

      <div className="pb-16 mt-auto text-center relative">
        <Pill className="mb-6">FAST & SECURE</Pill>
        <Card className="w-full max-w-md mx-auto bg-white/10 backdrop-blur-sm border-none">
          <CardHeader>
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleSignIn();
              }}
            >
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    disabled={isPending}
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                  />
                </Field>
                <Field>
                  <div className="flex items-center">
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <Link
                      href="/auth/forgot-password"
                      className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                    >
                      Forgot your password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      disabled={isPending}
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="********"
                      value={form.password}
                      onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                      }
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col items-center justify-center">
            <p className="text-sm text-foreground/60 text-center">
              &copy; {new Date().getFullYear()} Skal. All rights
              reserved <br />
            </p>
          </CardFooter>
        </Card>

          <Button
            className="mt-14 max-sm:hidden"
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
            onClick={handleSignIn}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Signing In
              </>
            ) : (
              <>[Sign In]</>
            )}
          </Button>
          <Button
            size="sm"
            className="mt-14 sm:hidden"
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
            onClick={handleSignIn}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Signing In
              </>
            ) : (
              <>[Sign In]</>
            )}
          </Button>
      </div>
    </div>
  );
}
