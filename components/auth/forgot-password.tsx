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
import { FieldDescription, FieldGroup } from "../ui/field";
import { Input } from "../ui/input";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

export function ForgotPassword() {
  const [hovering, setHovering] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  const formSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    startTransition(async () => {
      await authClient.requestPasswordReset(
        {
          email: values.email,
          redirectTo: `${window.location.origin}/auth/reset-password`,
        },
        {
          onSuccess: async () => {
            setDone(true);
            toast.success("Reset password link sent successfully");
          },
          onError: (ctx) => {
            toast.error(ctx.error.message);
          },
        }
      );
    });
  };

  return (
    <div className="flex flex-col h-svh justify-between">
      <GL hovering={hovering} />
      <Done done={done} setDone={setDone} callbackURL="/auth/sign-in" />

      <div className="pb-16 mt-auto text-center relative">
        <Pill className="mb-6">FAST & SECURE</Pill>
        <Card className="w-full max-w-md mx-auto bg-white/10 backdrop-blur-sm border-none">
          <CardHeader>
            <CardTitle>Forgot Password</CardTitle>
            <CardDescription>
              Enter your email address and we&apos;ll send you a link to reset
              your password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
                <FieldGroup>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="m@example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                        <FormDescription>
                          If you have an account, we will send a link to your
                          email to reset your password.
                        </FormDescription>
                      </FormItem>
                    )}
                  />
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
          {isPending
            ? "Sending Reset Password Link..."
            : "[Send Reset Password Link]"}
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
          {isPending
            ? "Sending Reset Password Link..."
            : "[Send Reset Password Link]"}
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
          <DialogTitle>Reset password link sent successfully!</DialogTitle>
          <DialogDescription>
            <h1 className="text-lg font-semibold">
              A link has been sent to your email to reset your password.
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              Check your email for the reset password link. You might need to
              check your spam folder and mark it as not spam.
            </p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            onClick={() => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              router.replace(callbackURL as unknown as any);
            }}
          >
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
