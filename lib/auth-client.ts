import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { roles } from "@/db/schema";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL!,
  plugins: [
    inferAdditionalFields({
      user: {
        role: {
          type: "string",
          enum: roles,
        },
      },
    }),
  ],
});
