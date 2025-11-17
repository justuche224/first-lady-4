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
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "../ui/field";
import { Input } from "../ui/input";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function SignUp() {
  const [hovering, setHovering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSignIn = async () => {
    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    startTransition(async () => {
      try {
        await authClient.signUp.email(
          {
            name: form.name,
            email: form.email,
            password: form.password,
            role: "ram"
          },
          {
            onSuccess: async () => {
              toast.success("Account created successfully");
              setDone(true);
            },
            onError: async (ctx) => {
              if (ctx.error.status === 403) {
                toast.error("Please verify your email address", {
                  description:
                    "Please check your email for a verification link",
                });
                await authClient.sendVerificationEmail({
                  email: form.email,
                  callbackURL: "/auth/sign-in",
                });
              } else {
                toast.error(
                  ctx.error.message || "An error occurred while signing up"
                );
              }
            },
          }
        );
      } catch (error) {
        toast.error("An error occurred while signing up");
        console.error(error);
      }
    });
  };

  return (
    <div className="flex flex-col h-svh justify-between">
      <Done done={done} setDone={setDone} callbackURL={"/auth/sign-in"} />
      <GL hovering={hovering} />

      <div className="pb-16 mt-auto text-center relative">
        <Pill className="mb-6">FAST & SECURE</Pill>
        <Card className="w-full max-w-md mx-auto bg-white/10 backdrop-blur-sm border-none">
          <CardHeader>
            <CardTitle>Create an Account</CardTitle>
            <CardDescription>Sign up for a new account</CardDescription>
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
                  <FieldLabel htmlFor="name">Full Name</FieldLabel>
                  <Input
                    disabled={isPending}
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </Field>
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
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <FieldLabel htmlFor="password">Password</FieldLabel>
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
                    </div>
                    <div className="flex-1">
                      <FieldLabel htmlFor="confirmPassword">
                        Confirm Password
                      </FieldLabel>
                      <div className="relative">
                        <Input
                          disabled={isPending}
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          required
                          placeholder="********"
                          value={form.confirmPassword}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              confirmPassword: e.target.value,
                            })
                          }
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          aria-label={
                            showConfirmPassword
                              ? "Hide password"
                              : "Show password"
                          }
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </Field>
                <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                  Or
                </FieldSeparator>
                <FieldDescription className="text-center">
                  Already have an account?{" "}
                  <Link href="/auth/sign-in">Sign in</Link>
                </FieldDescription>
              </FieldGroup>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col items-center justify-center">
            <p className="text-sm text-foreground/60 text-center">
              &copy; {new Date().getFullYear()} Skal. All rights reserved <br />
              <Link
                className="text-primary hover:text-primary/80"
                href="/privacy"
              >
                Privacy Policy
              </Link>{" "}
              |{" "}
              <Link
                className="text-primary hover:text-primary/80"
                href="/terms"
              >
                Terms of Service
              </Link>
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
              <Loader2 className="w-4 h-4 animate-spin" /> Signing Up
            </>
          ) : (
            <>[Sign Up]</>
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
              <Loader2 className="w-4 h-4 animate-spin" /> Signing Up
            </>
          ) : (
            <>[Sign Up]</>
          )}
        </Button>
      </div>
    </div>
  );
}

const Done = ({
  done,
  setDone,
  callbackURL,
}: {
  done: boolean;
  setDone: (done: boolean) => void;
  callbackURL: string;
}) => {
  const router = useRouter();
  return (
    <Dialog open={done} onOpenChange={setDone}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Account created successfully!</DialogTitle>
          <DialogDescription>
            <h1 className="text-lg font-semibold">
              A link has been sent to your email to verify your account.
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              Check your email for the verification link. you might need to
              check your spam folder and mark it as not spam.
            </p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            onClick={() => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              router.push(callbackURL as unknown as any);
            }}
          >
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
