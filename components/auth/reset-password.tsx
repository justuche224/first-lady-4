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
} from "../ui/field";
import { Input } from "../ui/input";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Eye, EyeOff } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export function ResetPassword() {
  const [hovering, setHovering] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const invalidToken = searchParams.get("invalidToken") || undefined;
  const [error, setError] = useState<string | undefined>(
    invalidToken || undefined
  );
  const router = useRouter();

  const formSchema = z
    .object({
      password: z
        .string()
        .min(8, "Password must be at least 8 characters long")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/\d/, "Password must contain at least one number")
        .regex(
          /[@$!%*?&#]/,
          "Password must contain at least one special character (@$!%*?&#)"
        ),
      confirmPassword: z
        .string()
        .min(8, "Password must be at least 8 characters long"),
    })
    .refine((data) => data.password === data.confirmPassword, {
      path: ["confirmPassword"],
      message: "Passwords do not match",
    });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    startTransition(async () => {
      await authClient.resetPassword(
        {
          newPassword: values.password,
          token: token || undefined,
        },
        {
          onSuccess: async () => {
            toast.success("Password reset successfully");
            router.push("/auth/sign-in");
          },
          onError: (ctx) => {
            toast.error(ctx.error.message);
            setError(ctx.error.message);
          },
        }
      );
    });
  };

  return (
    <div className="flex flex-col h-svh justify-between">
      <GL hovering={hovering} />

      <div className="pb-16 mt-auto text-center relative">
        <Pill className="mb-6">FAST & SECURE</Pill>
        <Card className="w-full max-w-md mx-auto bg-white/10 backdrop-blur-sm border-none">
          <CardHeader>
            <CardTitle>Create New Password</CardTitle>
            <CardDescription>
              Enter your new password below to reset your password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
                <FieldGroup>
                  <Field>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <FormField
                          control={form.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="********"
                                    {...field}
                                    className="pr-10"
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setShowPassword(!showPassword)
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    aria-label={
                                      showPassword
                                        ? "Hide password"
                                        : "Show password"
                                    }
                                  >
                                    {showPassword ? (
                                      <EyeOff className="h-4 w-4" />
                                    ) : (
                                      <Eye className="h-4 w-4" />
                                    )}
                                  </button>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="flex-1">
                        <FormField
                          control={form.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm Password</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    type={
                                      showConfirmPassword ? "text" : "password"
                                    }
                                    placeholder="********"
                                    {...field}
                                    className="pr-10"
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setShowConfirmPassword(
                                        !showConfirmPassword
                                      )
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
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    <FieldDescription>
                      Must be at least 8 characters long with uppercase,
                      lowercase, number, and special character.
                    </FieldDescription>
                    {error && (
                      <FieldDescription className="text-destructive mt-2">
                        {error}
                      </FieldDescription>
                    )}
                  </Field>
                  <FieldDescription className="text-center">
                    Remember your password?{" "}
                    <Link href="/auth/sign-in">Sign in</Link>
                  </FieldDescription>
                </FieldGroup>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col items-center justify-center">
            <p className="text-sm text-foreground/60 text-center">
              &copy; {new Date().getFullYear()} Skal. All rights reserved <br />
            </p>
          </CardFooter>
        </Card>

        <Button
          className="mt-14 max-sm:hidden"
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          onClick={(e) => {
            e.preventDefault();
            form.handleSubmit(onSubmit)();
          }}
          disabled={isPending}
        >
          {isPending ? "[Resetting Password...]" : "[Reset Password]"}
        </Button>
        <Button
          size="sm"
          className="mt-14 sm:hidden"
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          onClick={(e) => {
            e.preventDefault();
            form.handleSubmit(onSubmit)();
          }}
          disabled={isPending}
        >
          {isPending ? "[Resetting Password...]" : "[Reset Password]"}
        </Button>
      </div>
    </div>
  );
}
