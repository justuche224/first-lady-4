import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import {
  sendForgotPasswordEmail,
  sendVerificationEmail,
} from "@/mailer";
import { roles } from "@/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    minPasswordLength: 8,
    sendResetPassword: async ({ user, url, token }, request) => {
      console.log("sendResetPassword", user, url, token, request);
      await sendForgotPasswordEmail(user.email, url);
    },
  },
  emailVerification: {
    enabled: false,
    sendOnSignUp: false,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      console.log("sendVerificationEmail", user, url);
      await sendVerificationEmail(user.email, url);
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        enum: roles,
      },
    },
  },
  logger: {
    level: "debug",
    log(level, message, ...args) {
      console.log(level, message, ...args);
    },
  },
});
